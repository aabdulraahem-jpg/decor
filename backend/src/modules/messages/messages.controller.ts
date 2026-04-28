import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { MessagesService } from './messages.service';

function clientIp(req: Request): string | undefined {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.ip ?? req.socket?.remoteAddress ?? undefined;
}

@Controller('messages')
export class MessagesController {
  constructor(private readonly svc: MessagesService) {}

  // ── Public submit ────────────────────────────────────────────
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  submit(
    @Body() body: { name: string; email: string; phone?: string; subject?: string; kind?: string; message: string },
    @Req() req: Request,
  ) {
    const ua = req.headers['user-agent'];
    return this.svc.submit(body, clientIp(req), typeof ua === 'string' ? ua : undefined);
  }

  // ── Admin endpoints ──────────────────────────────────────────
  @Get('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  list(@Query('status') status?: string, @Query('kind') kind?: string) {
    return this.svc.list({ status, kind });
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  stats() {
    return this.svc.stats();
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() body: { status?: string; adminNote?: string }) {
    return this.svc.update(id, body);
  }
}
