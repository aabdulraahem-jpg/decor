import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  // Public — active packages only, sorted
  async findAll() {
    return this.prisma.package.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const pkg = await this.prisma.package.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  // Admin — all packages
  async findAllAdmin() {
    return this.prisma.package.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(dto: CreatePackageDto) {
    return this.prisma.package.create({
      data: {
        name: dto.name,
        pointsAmount: dto.pointsAmount,
        priceSar: dto.priceSar,
        profitMargin: dto.profitMargin ?? 0,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdatePackageDto) {
    await this.findOne(id);
    return this.prisma.package.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.pointsAmount !== undefined && { pointsAmount: dto.pointsAmount }),
        ...(dto.priceSar !== undefined && { priceSar: dto.priceSar }),
        ...(dto.profitMargin !== undefined && { profitMargin: dto.profitMargin }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.package.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
