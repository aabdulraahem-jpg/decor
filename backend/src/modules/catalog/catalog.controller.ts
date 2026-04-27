import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly svc: CatalogService) {}

  @Get()
  getAll() {
    return this.svc.getAll();
  }

  @Get('furniture')
  getFurniture(@Query('category') category?: string) {
    return this.svc.getFurniture(category);
  }

  @Get('styles')
  getStyles(@Query('category') category?: string) {
    return this.svc.getDecorElements(category);
  }

  @Get('walls')
  getWalls(@Query('category') category?: string) {
    return this.svc.getWallOptions(category);
  }

  @Get('tiles')
  getTiles(@Query('category') category?: string) {
    return this.svc.getTileOptions(category);
  }

  @Get('colors')
  getColors() {
    return this.svc.getColorPalettes();
  }
}
