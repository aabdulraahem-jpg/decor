import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CustomElementsService } from './custom-elements.service';

@Controller('custom-elements')
export class CustomElementsController {
  constructor(private readonly svc: CustomElementsService) {}

  // Public — used by the studio to merge into the catalog
  @Get('public')
  list() { return this.svc.listPublic(); }

  // Admin
  @Get('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  listAdmin() { return this.svc.listAdmin(); }

  @Post('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() body: Record<string, unknown>) { return this.svc.create(body as never); }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.svc.update(id, body as never);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
