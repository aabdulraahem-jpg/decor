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
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // التسجيل بالبريد + كلمة السر
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  // تسجيل الدخول بالبريد + كلمة السر
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
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
