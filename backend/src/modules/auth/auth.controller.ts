import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';

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
  constructor(private readonly auth: AuthService) {}

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

  // ── Phone verification (WhatsApp OTP) ──────────────────────────────────
  // يطلب رمز تحقق عبر واتساب — يُمنح المستخدم +5 نقاط بعد التحقق
  @Post('phone/start')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  phoneStart(@Body() body: { phoneNumber: string }, @Req() req: Request) {
    return this.auth.phoneStart(body.phoneNumber, clientIp(req));
  }

  @Post('phone/verify')
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  phoneVerify(@Body() body: { phoneNumber: string; code: string }, @Req() req: Request) {
    const u = (req as Request & { user?: { id: string } }).user;
    if (!u) throw new Error('unauthorized');
    return this.auth.phoneVerify(u.id, body.phoneNumber, body.code);
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

  // GET /auth/google/callback
  // TODO: استبدال بـ findOrCreateOAuthUser ثم إصدار توكنز
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request) {
    return {
      todo: 'implement OAuth user provisioning + token issuance',
      profile: req.user,
    };
  }

  // ────── Apple Sign In ──────

  @Post('apple')
  @UseGuards(AuthGuard('apple'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  appleAuth(): void {}

  // TODO: مماثل لـ Google
  @Post('apple/callback')
  @UseGuards(AuthGuard('apple'))
  appleCallback(@Req() req: Request) {
    return {
      todo: 'implement OAuth user provisioning + token issuance',
      profile: req.user,
    };
  }
}
