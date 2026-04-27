import { Module } from '@nestjs/common';
import { DesignsController } from './designs.controller';
import { DesignsService } from './designs.service';
import { OpenAiService } from './openai.service';
import { SamplesModule } from '../samples/samples.module';

@Module({
  imports: [SamplesModule],
  controllers: [DesignsController],
  providers: [DesignsService, OpenAiService],
})
export class DesignsModule {}
