import { Module } from '@nestjs/common';
import { DesignsController } from './designs.controller';
import { DesignsService } from './designs.service';
import { OpenAiService } from './openai.service';

@Module({
  controllers: [DesignsController],
  providers: [DesignsService, OpenAiService],
})
export class DesignsModule {}
