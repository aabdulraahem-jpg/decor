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
import { SecurityService } from './security.service';
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
    private readonly security: SecurityService,
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
    // 1. Honeypot — humans never fill `website`. If it has any value, the
    // request is from a bot. We pretend success but don't create the user
    // and we record the IP/fingerprint to block future requests.
    if (dto.website && dto.website.trim().length > 0) {
      this.logger.warn(`Honeypot triggered from ip=${ip}`);
      const fp = this.computeFingerprint(ip, userAgent, dto.deviceId);
      await this.recordAbuse('ip', ip ?? 'unknown', 'honeypot');
      if (fp) await this.recordAbuse('fingerprint', fp, 'honeypot');
      // Throw to prevent timing oracles
      throw new UnauthorizedException('Registration failed');
    }

    // 2. Pre-check: blocked IP / fingerprint / device
    if (ip && (await this.isAbusive('ip', ip))) {
      throw new ConflictException('Blocked.');
    }

    await this.turnstile.verify(dto.captchaToken, ip);

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    // 3. Device + browser fingerprints
    const fp = this.computeFingerprint(ip, userAgent, dto.deviceId);
    if (fp && (await this.prisma.user.findFirst({ where: { deviceFingerprint: fp } }))) {
      throw new ConflictException('تم التسجيل من هذا الجهاز مسبقاً. سجّل الدخول بحسابك الأصلي.');
    }
    const browserFp = dto.visitorId ? this.security.hashBrowserFingerprint(dto.visitorId) : null;
    if (browserFp && (await this.prisma.user.findFirst({ where: { browserFingerprint: browserFp } }))) {
      throw new ConflictException('هذه البصمة الرقمية للمتصفح مرتبطة بحساب موجود.');
    }
    const sdi = dto.signedDeviceId ? this.security.hashSignedDeviceId(dto.signedDeviceId) : null;
    if (sdi && (await this.prisma.user.findFirst({ where: { signedDeviceId: sdi } }))) {
      throw new ConflictException('بصمة الجهاز الموقّعة تنتمي لحساب موجود.');
    }

    // 4. IP rate limit (≤2 / 7 days per IP)
    if (ip) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recent = await this.prisma.user.count({ where: { signupIp: ip, createdAt: { gte: sevenDaysAgo } } });
      if (recent >= 2) {
        this.logger.warn(`Blocked signup: too many from ip=${ip} (${recent})`);
        throw new ConflictException('عدد كبير من التسجيلات من هذه الشبكة مؤخراً. تواصل معنا للمساعدة.');
      }
    }

    const ipCountry = this.security.ipCountry(ip);
    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        authProvider: 'LOCAL',
        passwordHash,
        signupIp: ip ?? null,
        signupCountry: ipCountry,
        deviceFingerprint: fp ?? null,
        browserFingerprint: browserFp,
        signedDeviceId: sdi,
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

  /** Persist an abuse signal so future signup attempts are blocked fast. */
  async recordAbuse(kind: string, value: string, reason: string): Promise<void> {
    await this.prisma.abuseFlag.upsert({
      where: { kind_value: { kind, value } },
      create: { kind, value, reason },
      update: { reason },
    }).catch(() => undefined);
  }

  async isAbusive(kind: string, value: string): Promise<boolean> {
    const f = await this.prisma.abuseFlag.findUnique({ where: { kind_value: { kind, value } } });
    return !!f;
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

  // ── Google OAuth user provisioning ────────────────────────────────────

  async findOrCreateGoogleUser(profile: { providerId: string; email?: string; name?: string }, ip?: string) {
    if (!profile.email) throw new UnauthorizedException('Google account has no email');
    const email = profile.email.toLowerCase();

    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: profile.providerId }, { email }] },
    });

    if (user) {
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.providerId, authProvider: 'GOOGLE', emailVerified: true },
        });
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date(), lastLoginIp: ip ?? null, failedLoginAttempts: 0, lockedUntil: null },
      });
    } else {
      user = await this.prisma.user.create({
        data: {
          email,
          name: profile.name ?? null,
          googleId: profile.providerId,
          authProvider: 'GOOGLE',
          emailVerified: true,
          signupIp: ip ?? null,
          signupCountry: this.security.ipCountry(ip),
          lastLoginAt: new Date(),
          lastLoginIp: ip ?? null,
        },
      });
    }
    return user;
  }

  /** Issues a short-lived single-use ticket carrying real tokens, exchanged by the web. */
  async issueOAuthTicket(userId: string, email: string, role: string): Promise<string> {
    const tokens = await this.generateTokens({ sub: userId, email, role });
    const payload = { ...tokens, user: { id: userId, email, role } };
    return this.jwt.signAsync(
      { kind: 'oauth-ticket', p: payload },
      { expiresIn: '60s' },
    );
  }

  async redeemOAuthTicket(ticket: string) {
    let decoded: { kind?: string; p?: { accessToken: string; refreshToken: string; expiresIn: number; user: { id: string; email: string; role: string } } };
    try {
      decoded = await this.jwt.verifyAsync(ticket);
    } catch {
      throw new UnauthorizedException('Invalid or expired ticket');
    }
    if (decoded?.kind !== 'oauth-ticket' || !decoded.p) {
      throw new UnauthorizedException('Invalid ticket');
    }
    const u = await this.prisma.user.findUnique({
      where: { id: decoded.p.user.id },
      select: { id: true, email: true, name: true, role: true, pointsBalance: true },
    });
    if (!u) throw new UnauthorizedException('User not found');
    return {
      accessToken: decoded.p.accessToken,
      refreshToken: decoded.p.refreshToken,
      expiresIn: decoded.p.expiresIn,
      user: u,
    };
  }

  // ── Email availability ────────────────────────────────────────────────

  async checkEmailAvailable(email: string): Promise<{ available: boolean }> {
    const u = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    return { available: !u };
  }
}
