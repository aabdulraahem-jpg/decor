import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  // فحص حالة عام — يستخدم لـ uptime monitoring
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'sufuf-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  // فحص اتصال قاعدة البيانات
  @Get('db')
  async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'mysql',
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return {
        status: 'error',
        database: 'mysql',
        message: (err as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
