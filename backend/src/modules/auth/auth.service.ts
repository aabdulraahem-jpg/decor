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

  async register(dto: RegisterDto, ip?: string) {
    await this.turnstile.verify(dto.captchaToken, ip);

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        phoneNumber: dto.phoneNumber,
        authProvider: 'LOCAL',
        passwordHash,
      },
      select: { id: true, email: true, name: true, role: true, pointsBalance: true },
    });

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, ...tokens };
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
}
