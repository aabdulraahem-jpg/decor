import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { PackagesModule } from './modules/packages/packages.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { DesignsModule } from './modules/designs/designs.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { AdminModule } from './modules/admin/admin.module';
import { SamplesModule } from './modules/samples/samples.module';
import { StorageModule } from './modules/storage/storage.module';
import { PaletteModule } from './modules/palette/palette.module';
import { SiteModule } from './modules/site/site.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '.env.local'],
    }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
    PackagesModule,
    PaymentsModule,
    ProjectsModule,
    DesignsModule,
    CatalogModule,
    AdminModule,
    StorageModule,
    SamplesModule,
    PaletteModule,
    SiteModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
