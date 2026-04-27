import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const port = Number(config.get<string>('PORT')) || 4000;

  // نثق بـ nginx (loopback) كـ proxy واحد — مهم لـ X-Forwarded-For و rate limiting
  app.set('trust proxy', 'loopback');

  // Security headers
  app.use(helmet());
  app.use(cookieParser());

  // CORS — السماح للنطاقات المعرّفة فقط
  const corsOrigins = (config.get<string>('CORS_ORIGINS') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Validation Pipe (class-validator) عالمي
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // البادئة العامة لكل المسارات: /api/v1
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'health/db'],
  });

  await app.listen(port, '0.0.0.0');
  Logger.log(`🚀 Sufuf API listening on http://0.0.0.0:${port}`, 'Bootstrap');
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
