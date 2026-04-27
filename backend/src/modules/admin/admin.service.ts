import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateApsSettingsDto, UpdateAiSettingsDto } from './dto/settings.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Dashboard Stats ─────────────────────────────────────────────────

  async getStats() {
    const [
      totalUsers,
      totalRevenueSar,
      totalTransactions,
      successfulTransactions,
      totalProjects,
      totalDesigns,
      pointsInCirculation,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.transaction.aggregate({
        _sum: { amountPaid: true },
        where: { status: 'SUCCESS' },
      }),
      this.prisma.transaction.count(),
      this.prisma.transaction.count({ where: { status: 'SUCCESS' } }),
      this.prisma.project.count(),
      this.prisma.design.count(),
      this.prisma.user.aggregate({ _sum: { pointsBalance: true } }),
    ]);

    return {
      totalUsers,
      totalRevenueSar: Number(totalRevenueSar._sum.amountPaid ?? 0),
      totalTransactions,
      successfulTransactions,
      totalProjects,
      totalDesigns,
      pointsInCirculation: pointsInCirculation._sum.pointsBalance ?? 0,
    };
  }

  // ─── Users ───────────────────────────────────────────────────────────

  async getUsers(page = 1, limit = 50, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { email: { contains: search } },
            { name: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          pointsBalance: true,
          emailVerified: true,
          authProvider: true,
          createdAt: true,
          _count: { select: { projects: true, transactions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async adjustPoints(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: { pointsBalance: { increment: amount } },
      select: { id: true, email: true, pointsBalance: true },
    });
  }

  // ─── Transactions ─────────────────────────────────────────────────────

  async getTransactions(page = 1, limit = 50, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' } : {};

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          package: { select: { name: true, pointsAmount: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { transactions, total, page, limit };
  }

  // ─── APS Settings ─────────────────────────────────────────────────────

  async getApsSettings() {
    const s = await this.prisma.apiSetting.findFirst({ where: { provider: 'APS' } });
    if (!s) return null;
    // Return config without the encrypted API key value itself
    return {
      id: s.id,
      isActive: s.isActive,
      config: s.modelConfigJson,
      updatedAt: s.updatedAt,
    };
  }

  async updateApsSettings(dto: UpdateApsSettingsDto) {
    const existing = await this.prisma.apiSetting.findFirst({ where: { provider: 'APS' } });

    const configData = {
      merchantId: dto.merchantId,
      accessCode: dto.accessCode,
      shaRequestPhrase: dto.shaRequestPhrase,
      shaResponsePhrase: dto.shaResponsePhrase,
      baseUrl: dto.baseUrl ?? 'https://checkout.paymentservices.amazon.com/FortAPI/paymentPage',
    };

    if (existing) {
      return this.prisma.apiSetting.update({
        where: { id: existing.id },
        data: {
          apiKeyEncrypted: dto.accessCode, // store access code as key reference
          modelConfigJson: configData,
          isActive: true,
        },
      });
    }

    return this.prisma.apiSetting.create({
      data: {
        provider: 'APS',
        apiKeyEncrypted: dto.accessCode,
        modelConfigJson: configData,
        isActive: true,
      },
    });
  }

  // ─── AI Settings ──────────────────────────────────────────────────────

  async getAiSettings() {
    const s = await this.prisma.apiSetting.findFirst({ where: { provider: 'OPENAI' } });
    if (!s) return null;
    const cfg = (s.modelConfigJson ?? {}) as Record<string, unknown>;
    return {
      id: s.id,
      modelName: s.modelName,
      quality: (cfg.quality as string) ?? 'medium',
      visionModel: (cfg.visionModel as string) ?? 'gpt-4o-mini',
      systemPrompt: (cfg.systemPrompt as string) ?? '',
      isActive: s.isActive,
      hasKey: s.apiKeyEncrypted.length > 0,
      modelConfig: s.modelConfigJson,
      updatedAt: s.updatedAt,
    };
  }

  async updateAiSettings(dto: UpdateAiSettingsDto) {
    const existing = await this.prisma.apiSetting.findFirst({ where: { provider: 'OPENAI' } });

    const data = {
      apiKeyEncrypted: dto.apiKey,
      modelName: dto.modelName ?? 'gpt-image-2',
      modelConfigJson: {
        apiKey: dto.apiKey,
        quality: dto.quality ?? 'medium',
        visionModel: dto.visionModel ?? 'gpt-4o-mini',
        systemPrompt: dto.systemPrompt ?? '',
        ...(dto.modelConfig ?? {}),
      },
      isActive: true,
    };

    if (existing) {
      return this.prisma.apiSetting.update({ where: { id: existing.id }, data });
    }

    return this.prisma.apiSetting.create({ data: { provider: 'OPENAI', ...data } });
  }

  // ─── AI Generation Logs ───────────────────────────────────────────────

  async getAiLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.aiGenerationLog.findMany({
        include: {
          user: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.aiGenerationLog.count(),
    ]);
    return { logs, total, page, limit };
  }
}
