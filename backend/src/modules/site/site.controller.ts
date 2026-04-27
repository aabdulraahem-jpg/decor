import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { SiteService } from './site.service';

@Controller('site')
export class SiteController {
  constructor(private readonly site: SiteService) {}

  // Public
  @Get('content')
  publicContent() { return this.site.getContent(); }

  @Get('showcase')
  publicShowcase() { return this.site.listShowcasePublic(); }

  // Admin
  @Get('admin/content')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminGetContent() { return this.site.getContent(); }

  @Put('admin/content')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminUpdateContent(@Body() body: Record<string, string | null>) {
    return this.site.updateContent(body);
  }

  @Get('admin/showcase')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminListShowcase() { return this.site.listShowcaseAdmin(); }

  @Post('admin/showcase')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminCreateShowcase(@Body() body: { title: string; imageUrl: string; description?: string; badge?: string; sortOrder?: number; isActive?: boolean }) {
    return this.site.createShowcase(body);
  }

  @Patch('admin/showcase/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminUpdateShowcase(@Param('id') id: string, @Body() body: Partial<{ title: string; imageUrl: string; description: string; badge: string; sortOrder: number; isActive: boolean }>) {
    return this.site.updateShowcase(id, body);
  }

  @Delete('admin/showcase/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminDeleteShowcase(@Param('id') id: string) {
    return this.site.deleteShowcase(id);
  }
}
