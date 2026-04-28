import { Controller, Get, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { DesignsService } from './designs.service';

@Controller('share')
export class ShareController {
  constructor(private readonly svc: DesignsService) {}

  @Get(':slug')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  view(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }
}
