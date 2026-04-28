import { Module } from '@nestjs/common';
import { DesignsController } from './designs.controller';
import { ShareController } from './share.controller';
import { DesignsService } from './designs.service';
import { OpenAiService } from './openai.service';
import { SketchService } from './sketch.service';
import { SamplesModule } from '../samples/samples.module';

@Module({
  imports: [SamplesModule],
  controllers: [DesignsController, ShareController],
  providers: [DesignsService, OpenAiService, SketchService],
})
export class DesignsModule {}
