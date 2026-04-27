import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ColorDto {
  code?: string;
  name?: string;
  hex?: string;
  family?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface SpaceTypeDto {
  slug?: string;
  name?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
}

@Injectable()
export class PaletteService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Colors ────────────────────────────────────────────────

  listColorsPublic() {
    return this.prisma.color.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
  }

  listColorsAdmin() {
    return this.prisma.color.findMany({
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
  }

  createColor(dto: Required<Pick<ColorDto, 'code' | 'name' | 'hex'>> & ColorDto) {
    return this.prisma.color.create({
      data: {
        code: dto.code,
        name: dto.name,
        hex: dto.hex,
        family: dto.family ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateColor(id: string, dto: ColorDto) {
    const existing = await this.prisma.color.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Color not found');
    return this.prisma.color.update({ where: { id }, data: dto });
  }

  async deleteColor(id: string) {
    return this.prisma.color.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Color not found');
    });
  }

  // ── Space Types ───────────────────────────────────────────

  listSpacesPublic() {
    return this.prisma.spaceType.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  listSpacesAdmin() {
    return this.prisma.spaceType.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  createSpace(dto: Required<Pick<SpaceTypeDto, 'slug' | 'name'>> & SpaceTypeDto) {
    return this.prisma.spaceType.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        description: dto.description ?? null,
        icon: dto.icon ?? null,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateSpace(id: string, dto: SpaceTypeDto) {
    const existing = await this.prisma.spaceType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Space type not found');
    return this.prisma.spaceType.update({ where: { id }, data: dto });
  }

  async deleteSpace(id: string) {
    return this.prisma.spaceType.delete({ where: { id } }).catch(() => {
      throw new NotFoundException('Space type not found');
    });
  }
}
