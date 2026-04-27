import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { PaletteService, ColorDto, SpaceTypeDto } from './palette.service';

@Controller('palette')
export class PaletteController {
  constructor(private readonly palette: PaletteService) {}

  // ── Public reads ─────────────────────────────────────────

  @Get('colors')
  publicColors() {
    return this.palette.listColorsPublic();
  }

  @Get('spaces')
  publicSpaces() {
    return this.palette.listSpacesPublic();
  }

  // ── Admin: Colors ────────────────────────────────────────

  @Get('admin/colors')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminColors() {
    return this.palette.listColorsAdmin();
  }

  @Post('admin/colors')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createColor(@Body() dto: ColorDto & { code: string; name: string; hex: string }) {
    return this.palette.createColor(dto);
  }

  @Patch('admin/colors/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateColor(@Param('id') id: string, @Body() dto: ColorDto) {
    return this.palette.updateColor(id, dto);
  }

  @Delete('admin/colors/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deleteColor(@Param('id') id: string) {
    return this.palette.deleteColor(id);
  }

  // ── Admin: Space Types ───────────────────────────────────

  @Get('admin/spaces')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminSpaces() {
    return this.palette.listSpacesAdmin();
  }

  @Post('admin/spaces')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createSpace(@Body() dto: SpaceTypeDto & { slug: string; name: string }) {
    return this.palette.createSpace(dto);
  }

  @Patch('admin/spaces/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateSpace(@Param('id') id: string, @Body() dto: SpaceTypeDto) {
    return this.palette.updateSpace(id, dto);
  }

  @Delete('admin/spaces/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deleteSpace(@Param('id') id: string) {
    return this.palette.deleteSpace(id);
  }
}
