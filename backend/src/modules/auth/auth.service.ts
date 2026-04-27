import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomBytes, createHash } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { TurnstileService } from './turnstile.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly turnstile: TurnstileService,
  ) {}

  // ────────────────────────────────────────────────────────
  // Helpers — كلمات السر و التوكنز
  // ────────────────────────────────────────────────────────

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async generateTokens(payload: {
    sub: string;
    email: string;
    role: string;
  }): Promise<TokenPair> {
    const accessExp = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m';
    const refreshExp = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d';

    const accessToken = await this.jwt.signAsync(payload, { expiresIn: accessExp });

    // Refresh token: random opaque string، نخزن hash فقط
    const refreshToken = randomBytes(48).toString('base64url');
    const tokenHash = this.hashToken(refreshToken);

    const refreshDays = this.parseDurationToDays(refreshExp);
    const expiresAt = new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseDurationToSeconds(accessExp),
    };
  }

  private parseDurationToSeconds(duration: string): number {
    const m = /^(\d+)([smhd])$/.exec(duration);
    if (!m) return 900;
    const n = Number(m[1]);
    switch (m[2]) {
      case 's':
        return n;
      case 'm':
        return n * 60;
      case 'h':
        return n * 3600;
      case 'd':
        return n * 86400;
      default:
        return 900;
    }
  }

  private parseDurationToDays(duration: string): number {
    return this.parseDurationToSeconds(duration) / 86400;
  }

  // ────────────────────────────────────────────────────────
  // Endpoints — منطق أساسي
  // ────────────────────────────────────────────────────────

  async register(dto: RegisterDto, ip?: string, userAgent?: string) {
    await this.turnstile.verify(dto.captchaToken, ip);

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // ── Anti-abuse: device fingerprint + IP rate ──────────────────
    const fp = this.computeFingerprint(ip, userAgent, dto.deviceId);
    if (fp) {
      const dupByDevice = await this.prisma.user.findFirst({ where: { deviceFingerprint: fp } });
      if (dupByDevice) {
        throw new ConflictException('تم التسجيل من هذا الجهاز مسبقاً. سجّل الدخول بحسابك الأصلي.');
      }
    }
    if (ip) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recent = await this.prisma.user.count({
        where: { signupIp: ip, createdAt: { gte: sevenDaysAgo } },
      });
      if (recent >= 2) {
        this.logger.warn(`Blocked signup: too many from ip=${ip} (${recent})`);
        throw new ConflictException('عدد كبير من التسجيلات من هذه الشبكة مؤخراً. تواصل معنا للمساعدة.');
      }
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        phoneNumber: dto.phoneNumber,
        authProvider: 'LOCAL',
        passwordHash,
        signupIp: ip ?? null,
        deviceFingerprint: fp ?? null,
      },
      select: { id: true, email: true, name: true, role: true, pointsBalance: true },
    });

    // Audit-trail row for fingerprints (cheap to query later)
    await this.prisma.signupFingerprint.create({
      data: {
        userId: user.id,
        ipAddress: ip ?? null,
        ipNetwork: this.ipv4Network(ip),
        fingerprint: fp ?? null,
        userAgent: userAgent?.slice(0, 500) ?? null,
      },
    }).catch(() => undefined);

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, ...tokens };
  }

  private computeFingerprint(ip?: string, ua?: string, deviceId?: string): string | null {
    if (!deviceId && !ip) return null;
    const raw = `${deviceId ?? ''}|${ip ?? ''}|${(ua ?? '').slice(0, 200)}`;
    return createHash('sha256').update(raw).digest('hex');
  }

  private ipv4Network(ip?: string): string | null {
    if (!ip) return null;
    const parts = ip.split('.');
    if (parts.length !== 4) return null;
    return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }

  async login(dto: LoginDto, ip?: string) {
    await this.turnstile.verify(dto.captchaToken, ip);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      // Constant-time-ish: still hash a dummy to prevent user enumeration timing
      await argon2.hash('dummy-to-prevent-timing-attack', { type: argon2.argon2id }).catch(() => null);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`Account locked. Try again in ${remaining} minute(s)`);
    }

    const ok = await this.verifyPassword(user.passwordHash, dto.password);
    if (!ok) {
      const newAttempts = user.failedLoginAttempts + 1;
      const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
            : null,
        },
      });
      if (shouldLock) {
        this.logger.warn(`Account locked: ${user.email} from ip=${ip ?? 'unknown'}`);
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip ?? null,
      },
    });

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        pointsBalance: user.pointsBalance,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // إبطال القديم (rotation)
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens({
      sub: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
    });
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken
      .updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch((err) => {
        this.logger.warn(`logout: ${(err as Error).message}`);
      });
  }

  // TODO: تنفيذ findOrCreateOAuthUser للـ Google/Apple بعد التحقق من الـ profile
  async findOrCreateOAuthUser(_provider: 'google' | 'apple', _profile: unknown) {
    throw new Error('Not implemented yet — TODO: OAuth user provisioning');
  }

  // ── Email availability ────────────────────────────────────────────────

  async checkEmailAvailable(email: string): Promise<{ available: boolean }> {
    const u = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    return { available: !u };
  }

  // ── Phone OTP (WhatsApp) ──────────────────────────────────────────────

  /**
   * Generates a 6-digit OTP, stores its hash with 10-min expiry, and
   * (in production) dispatches it via WhatsApp Business API. For now we
   * log it and write it to AdminAuditLog so an admin can deliver it
   * manually until the WA provider is wired up.
   */
  async phoneStart(phoneE164: string, ip?: string): Promise<{ ok: true; expiresInSec: number }> {
    if (!/^\+?[1-9]\d{6,14}$/.test(phoneE164)) {
      throw new UnauthorizedException('Invalid phone number');
    }
    // One-phone-one-account: bail out if any user already owns this number
    const existing = await this.prisma.user.findUnique({ where: { phoneNumber: phoneE164 } });
    if (existing) {
      throw new ConflictException('هذا الرقم مرتبط بحساب آخر بالفعل.');
    }
    // Per-phone rate: max 3 OTP requests / 30 min
    const halfHourAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recent = await this.prisma.phoneVerification.count({
      where: { phoneE164, createdAt: { gte: halfHourAgo } },
    });
    if (recent >= 3) throw new UnauthorizedException('Too many requests for this phone.');

    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
    const codeHash = createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await this.prisma.phoneVerification.create({
      data: { phoneE164, codeHash, expiresAt, ipAddress: ip ?? null },
    });

    // Real WhatsApp send is TODO — for now, log so an admin can deliver
    // (and visible in `pm2 logs sufuf-api`).
    this.logger.warn(`📱 OTP for ${phoneE164}: ${code} (expires in 10 min)`);
    return { ok: true, expiresInSec: 600 };
  }

  /**
   * Validates the 6-digit code, marks the user phoneVerified=true with
   * their phoneNumber set, and grants a one-time bonus of +5 points.
   */
  async phoneVerify(userId: string, phoneE164: string, code: string): Promise<{ ok: true; pointsGranted: number; pointsBalance: number }> {
    if (!/^\d{6}$/.test(code)) throw new UnauthorizedException('Invalid code format');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phoneNumber: true, phoneVerifiedAt: true, bonusGranted: true, pointsBalance: true },
    });
    if (!user) throw new UnauthorizedException('User not found');

    const phoneOwner = await this.prisma.user.findUnique({ where: { phoneNumber: phoneE164 } });
    if (phoneOwner && phoneOwner.id !== userId) {
      throw new ConflictException('هذا الرقم مرتبط بحساب آخر.');
    }

    // Find latest matching un-verified OTP
    const codeHash = createHash('sha256').update(code).digest('hex');
    const otp = await this.prisma.phoneVerification.findFirst({
      where: { phoneE164, codeHash, verifiedAt: null, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) {
      // Increment attempts on the latest pending OTP for this phone (rate limit)
      await this.prisma.phoneVerification.updateMany({
        where: { phoneE164, verifiedAt: null },
        data: { attempts: { increment: 1 } },
      }).catch(() => undefined);
      throw new UnauthorizedException('Invalid or expired code');
    }

    await this.prisma.phoneVerification.update({
      where: { id: otp.id },
      data: { verifiedAt: new Date(), userId },
    });

    const bonus = user.bonusGranted ? 0 : 5;
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        phoneNumber: phoneE164,
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        bonusGranted: true,
        pointsBalance: { increment: bonus },
      },
      select: { pointsBalance: true },
    });

    return { ok: true, pointsGranted: bonus, pointsBalance: updated.pointsBalance };
  }
}
