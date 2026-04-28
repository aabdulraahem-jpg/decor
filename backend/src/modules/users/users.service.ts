import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        pointsBalance: true,
        emailVerified: true,
        authProvider: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const designsCount = await this.prisma.design.count({
      where: { project: { userId: id } },
    });
    return { ...user, designsCount };
  }

  async updateName(userId: string, name: string) {
    const trimmed = (name ?? '').trim();
    if (!trimmed || trimmed.length > 120) {
      throw new BadRequestException('الاسم يجب أن يكون بين 1 و 120 حرفاً');
    }
    await this.prisma.user.update({ where: { id: userId }, data: { name: trimmed } });
    return this.findById(userId);
  }

  // TODO: pagination + filters عند بناء لوحة الإدارة
  async listAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        pointsBalance: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
