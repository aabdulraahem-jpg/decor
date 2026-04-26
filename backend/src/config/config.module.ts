// ConfigModule مُسجّل عالمياً في AppModule.
// هذا الملف موجود كنقطة توسعة مستقبلية (validation schema، نقاط dynamic config، إلخ).
// إذا لم تستعمله، يمكن إزالته بأمان.

import { Module } from '@nestjs/common';

@Module({})
export class AppConfigModule {}
