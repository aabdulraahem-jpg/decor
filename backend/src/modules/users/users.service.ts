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
        referralCode: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const [designsCount, referredCount] = await Promise.all([
      this.prisma.design.count({ where: { project: { userId: id } } }),
      this.prisma.user.count({ where: { referredById: id } }),
    ]);
    return { ...user, designsCount, referredCount };
  }

  async updateName(userId: string, name: string) {
    const trimmed = (name ?? '').trim();
    if (!trimmed || trimmed.length > 120) {
      throw new BadRequestException('الاسم يجب أن يكون بين 1 و 120 حرفاً');
    }
    await this.prisma.user.update({ where: { id: userId }, data: { name: trimmed } });
    return this.findById(userId);
  }

  async insights(userId: string) {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [user, total, last30, projects, recent, transactions] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { pointsBalance: true, createdAt: true },
      }),
      this.prisma.design.count({ where: { project: { userId } } }),
      this.prisma.design.count({ where: { project: { userId }, createdAt: { gte: since } } }),
      this.prisma.project.count({ where: { userId } }),
      this.prisma.design.findMany({
        where: { project: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: { createdAt: true, pointsConsumed: true },
      }),
      this.prisma.transaction.aggregate({
        where: { userId, status: 'SUCCESS' },
        _sum: { amountPaid: true, pointsAdded: true },
        _count: true,
      }),
    ]);
    if (!user) throw new NotFoundException();

    const pointsConsumed = recent.reduce((s, d) => s + (d.pointsConsumed ?? 0), 0);

    // Per-day series for last 14 days
    const series: { date: string; designs: number }[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 13; i >= 0; i -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const count = recent.filter((d) => d.createdAt >= day && d.createdAt < next).length;
      series.push({ date: day.toISOString().slice(0, 10), designs: count });
    }

    const sums = transactions._sum ?? {};
    return {
      pointsBalance: user.pointsBalance,
      memberSince: user.createdAt,
      totalDesigns: total,
      designsLast30Days: last30,
      pointsConsumedRecent: pointsConsumed,
      projectsCount: projects,
      transactions: {
        count: transactions._count,
        totalSpent: Number(sums.amountPaid ?? 0) * 100,
        totalPointsBought: sums.pointsAdded ?? 0,
      },
      series,
    };
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
