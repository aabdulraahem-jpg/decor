import { Module } from '@nestjs/common';
import { CustomElementsController } from './custom-elements.controller';
import { CustomElementsService } from './custom-elements.service';

@Module({
  controllers: [CustomElementsController],
  providers: [CustomElementsService],
})
export class CustomElementsModule {}
