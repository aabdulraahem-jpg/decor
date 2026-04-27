import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getFurniture(category?: string) {
    return this.prisma.furnitureItem.findMany({
      where: { isActive: true, ...(category && { category }) },
      orderBy: { name: 'asc' },
    });
  }

  async getDecorElements(category?: string) {
    return this.prisma.decorElement.findMany({
      where: { isActive: true, ...(category && { category }) },
      orderBy: { name: 'asc' },
    });
  }

  async getWallOptions(category?: string) {
    return this.prisma.wallOption.findMany({
      where: { isActive: true, ...(category && { category }) },
      orderBy: { name: 'asc' },
    });
  }

  async getTileOptions(category?: string) {
    return this.prisma.tileOption.findMany({
      where: { isActive: true, ...(category && { category }) },
      orderBy: { name: 'asc' },
    });
  }

  async getColorPalettes() {
    return this.prisma.colorPalette.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // Return all catalog in one call (for mobile initial load)
  async getAll() {
    const [furniture, styles, walls, tiles, colors] = await Promise.all([
      this.getFurniture(),
      this.getDecorElements(),
      this.getWallOptions(),
      this.getTileOptions(),
      this.getColorPalettes(),
    ]);
    return { furniture, styles, walls, tiles, colors };
  }
}
