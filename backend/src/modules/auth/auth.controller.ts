import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';

function clientIp(req: Request): string | undefined {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.ip ?? req.socket?.remoteAddress ?? undefined;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  // التسجيل بالبريد + كلمة السر — 3 محاولات/دقيقة لكل IP
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    const ua = req.headers['user-agent'];
    return this.auth.register(dto, clientIp(req), typeof ua === 'string' ? ua : undefined);
  }

  // فحص توفّر البريد قبل الإرسال (لإظهار رسالة فورية بدون كشف وجود الحساب لمحاولات brute force)
  @Post('check-email')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async checkEmail(@Body() body: { email: string }): Promise<{ available: boolean }> {
    const isEmail = typeof body.email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email);
    if (!isEmail) return { available: false };
    return this.auth.checkEmailAvailable(body.email);
  }

  // تسجيل الدخول — 5 محاولات/دقيقة لكل IP
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, clientIp(req));
  }

  // تجديد التوكن
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  // تسجيل الخروج (إبطال refresh token)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }

  // ────── Google OAuth ──────

  // GET /auth/google — يبدأ تدفق Google OAuth (redirect)
  @Get('google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  googleAuth(): void {}

  // GET /auth/google/callback — يصدر ticket قصير الأجل ويعيد توجيه للمتصفح
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const profile = req.user as { providerId: string; email?: string; name?: string } | undefined;
    const webBase = this.config.get<string>('WEB_BASE_URL') ?? 'https://sufuf.pro';
    if (!profile) {
      res.redirect(`${webBase}/login?error=oauth_failed`);
      return;
    }
    try {
      const user = await this.auth.findOrCreateGoogleUser(profile, clientIp(req));
      const ticket = await this.auth.issueOAuthTicket(user.id, user.email, user.role);
      res.redirect(`${webBase}/api/auth/google-finish?ticket=${encodeURIComponent(ticket)}`);
    } catch {
      res.redirect(`${webBase}/login?error=oauth_failed`);
    }
  }

  // POST /auth/oauth-redeem — يستبدل ticket لطلب التوكنز الفعلية (يُستدعى من server-side route)
  @Post('oauth-redeem')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async oauthRedeem(@Body() body: { ticket: string }) {
    return this.auth.redeemOAuthTicket(body.ticket);
  }
}
