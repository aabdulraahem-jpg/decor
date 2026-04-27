import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SampleKind } from '@prisma/client';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { StorageService, ImageBucket } from '../storage/storage.service';
import { SamplesService } from './samples.service';
import { DescribeService } from './describe.service';
import {
  CreateCategoryDto,
  CreateSampleDto,
  UpdateCategoryDto,
  UpdateSampleDto,
  DescribeDto,
} from './dto/sample.dto';

function parseKind(v?: string): SampleKind | undefined {
  if (v === 'STYLE') return SampleKind.STYLE;
  if (v === 'SAMPLE') return SampleKind.SAMPLE;
  return undefined;
}

@Controller('samples')
export class SamplesController {
  constructor(
    private readonly samples: SamplesService,
    private readonly storage: StorageService,
    private readonly describe: DescribeService,
  ) {}

  // ── Public (mobile + web user flow) ──

  @Get('categories')
  publicCategories(@Query('kind') kind?: string) {
    return this.samples.listCategoriesPublic(parseKind(kind));
  }

  @Get()
  publicList(@Query('categoryId') categoryId?: string, @Query('kind') kind?: string) {
    return this.samples.listSamplesPublic(categoryId, parseKind(kind));
  }

  // ── Admin ──

  @Get('admin/categories')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminCategories() {
    return this.samples.listCategoriesAdmin();
  }

  @Post('admin/categories')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.samples.createCategory(dto);
  }

  @Patch('admin/categories/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.samples.updateCategory(id, dto);
  }

  @Delete('admin/categories/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deleteCategory(@Param('id') id: string) {
    return this.samples.deleteCategory(id);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  adminList(@Query('categoryId') categoryId?: string) {
    return this.samples.listSamplesAdmin(categoryId);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, AdminGuard)
  createSample(@Body() dto: CreateSampleDto) {
    return this.samples.createSample(dto);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateSample(@Param('id') id: string, @Body() dto: UpdateSampleDto) {
    return this.samples.updateSample(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  deleteSample(@Param('id') id: string) {
    return this.samples.deleteSample(id);
  }

  // ── Image uploads (admin) ──
  // POST /samples/admin/upload?bucket=samples → multipart with field 'file' → returns { url }
  @Post('admin/upload')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('bucket') bucket: ImageBucket = 'samples',
  ): Promise<{ url: string }> {
    const allowed: ImageBucket[] = ['samples', 'categories'];
    const target = allowed.includes(bucket) ? bucket : 'samples';
    const url = await this.storage.saveAsWebp(file, target);
    return { url };
  }

  // ── User-scoped reference image upload (any authenticated user) ──
  // POST /samples/reference → multipart 'file' → returns { url }
  @Post('reference')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadReference(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
    const url = await this.storage.saveAsWebp(file, 'references', { quality: 80 });
    return { url };
  }

  // ── Admin: AI describe (vision) ──
  // POST /samples/admin/describe → { imageUrl?, textLabel?, categoryHint? } → { description }
  @Post('admin/describe')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async aiDescribe(@Body() dto: DescribeDto): Promise<{ description: string }> {
    const description = await this.describe.describe(dto);
    return { description };
  }
}
