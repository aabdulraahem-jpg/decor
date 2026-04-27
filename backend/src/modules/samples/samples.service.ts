import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Sample, SampleCategory, SampleKind } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  CreateCategoryDto,
  CreateSampleDto,
  UpdateCategoryDto,
  UpdateSampleDto,
} from './dto/sample.dto';

// Fields hidden from non-admin users (valueSar excluded)
const PUBLIC_SAMPLE_SELECT = {
  id: true,
  categoryId: true,
  name: true,
  description: true,
  imageUrl: true,
  aiPrompt: true,
  colorMode: true,
  presetColorIds: true,
  widthCm: true,
  heightCm: true,
  thicknessMm: true,
  modelNumber: true,
  sortOrder: true,
  isActive: true,
} satisfies Prisma.SampleSelect;

@Injectable()
export class SamplesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // ── Categories (admin) ─────────────────────────────────────────────

  listCategoriesAdmin(): Promise<SampleCategory[]> {
    return this.prisma.sampleCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  createCategory(dto: CreateCategoryDto) {
    return this.prisma.sampleCategory.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.assertCategoryExists(id);
    return this.prisma.sampleCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    const cat = await this.assertCategoryExists(id);
    if (cat.imageUrl) await this.storage.delete(cat.imageUrl);
    // Cascading delete will remove samples; their image files leak unless we wipe.
    const samples = await this.prisma.sample.findMany({
      where: { categoryId: id },
      select: { imageUrl: true },
    });
    await Promise.all(samples.map((s) => this.storage.delete(s.imageUrl)));
    return this.prisma.sampleCategory.delete({ where: { id } });
  }

  // ── Samples (admin) ────────────────────────────────────────────────

  listSamplesAdmin(categoryId?: string): Promise<Sample[]> {
    return this.prisma.sample.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createSample(dto: CreateSampleDto) {
    await this.assertCategoryExists(dto.categoryId);
    const { presetColorIds, ...rest } = dto;
    return this.prisma.sample.create({
      data: {
        ...rest,
        widthCm: dto.widthCm !== undefined ? new Prisma.Decimal(dto.widthCm) : null,
        heightCm: dto.heightCm !== undefined ? new Prisma.Decimal(dto.heightCm) : null,
        thicknessMm:
          dto.thicknessMm !== undefined ? new Prisma.Decimal(dto.thicknessMm) : null,
        valueSar: dto.valueSar !== undefined ? new Prisma.Decimal(dto.valueSar) : null,
        presetColorIds: presetColorIds && presetColorIds.length > 0
          ? (presetColorIds as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  }

  async updateSample(id: string, dto: UpdateSampleDto) {
    const existing = await this.prisma.sample.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Sample not found');

    // If imageUrl changes, delete the old file
    if (dto.imageUrl && dto.imageUrl !== existing.imageUrl) {
      await this.storage.delete(existing.imageUrl);
    }

    const { presetColorIds, ...rest } = dto;
    const data: Prisma.SampleUpdateInput = { ...rest } as Prisma.SampleUpdateInput;
    if (dto.widthCm !== undefined) data.widthCm = new Prisma.Decimal(dto.widthCm);
    if (dto.heightCm !== undefined) data.heightCm = new Prisma.Decimal(dto.heightCm);
    if (dto.thicknessMm !== undefined) data.thicknessMm = new Prisma.Decimal(dto.thicknessMm);
    if (dto.valueSar !== undefined) data.valueSar = new Prisma.Decimal(dto.valueSar);
    if (presetColorIds !== undefined) {
      data.presetColorIds = presetColorIds.length > 0
        ? (presetColorIds as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull;
    }
    if (dto.categoryId) {
      await this.assertCategoryExists(dto.categoryId);
      data.category = { connect: { id: dto.categoryId } };
      delete (data as { categoryId?: string }).categoryId;
    }

    return this.prisma.sample.update({ where: { id }, data });
  }

  async deleteSample(id: string) {
    const sample = await this.prisma.sample.findUnique({ where: { id } });
    if (!sample) throw new NotFoundException('Sample not found');
    await this.storage.delete(sample.imageUrl);
    return this.prisma.sample.delete({ where: { id } });
  }

  // ── Public reads (mobile / web) ────────────────────────────────────

  listCategoriesPublic(kind?: SampleKind) {
    return this.prisma.sampleCategory.findMany({
      where: { isActive: true, ...(kind ? { kind } : {}) },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  listSamplesPublic(categoryId?: string, kind?: SampleKind) {
    return this.prisma.sample.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId } : {}),
        ...(kind ? { category: { kind } } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: PUBLIC_SAMPLE_SELECT,
    });
  }

  /** Used internally by DesignsService to build the AI prompt. */
  async getSamplesForPrompt(ids: string[]): Promise<{ id: string; name: string; aiPrompt: string }[]> {
    if (ids.length === 0) return [];
    return this.prisma.sample.findMany({
      where: { id: { in: ids }, isActive: true },
      select: { id: true, name: true, aiPrompt: true },
    });
  }

  // ── helpers ────────────────────────────────────────────────────────

  private async assertCategoryExists(id: string): Promise<SampleCategory> {
    const cat = await this.prisma.sampleCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }
}
