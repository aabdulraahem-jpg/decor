import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ApsService } from './aps.service';
import { PackagesModule } from '../packages/packages.module';

@Module({
  imports: [PackagesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ApsService],
})
export class PaymentsModule {}
