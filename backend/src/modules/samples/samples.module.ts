import { Module } from '@nestjs/common';
import { SamplesController } from './samples.controller';
import { SamplesService } from './samples.service';
import { DescribeService } from './describe.service';

@Module({
  controllers: [SamplesController],
  providers: [SamplesService, DescribeService],
  exports: [SamplesService],
})
export class SamplesModule {}
