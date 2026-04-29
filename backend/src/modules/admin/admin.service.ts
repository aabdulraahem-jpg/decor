import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  // ─── Admin-uploaded designs (free designs for implementation clients) ──
  // The admin can hand-upload finished design images to a user's account so
  // implementation clients don't need to use the studio themselves.

  async listUserProjects(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { designs: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
  }

  async createProjectForUser(userId: string, data: {
    name: string;
    roomType?: string;
    originalImageUrl?: string;
    kind?: 'SINGLE' | 'SKETCH';
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) throw new NotFoundException('User not found');
    if (!data.name?.trim()) throw new BadRequestException('name required');
    return this.prisma.project.create({
      data: {
        userId,
        name: data.name.trim().slice(0, 200),
        roomType: (data.roomType ?? 'CUSTOM').slice(0, 80),
        originalImageUrl: data.originalImageUrl ?? '',
        kind: data.kind ?? 'SINGLE',
      },
    });
  }

  async addDesignToProject(projectId: string, data: {
    generatedImageUrl: string;
    spaceLabel?: string;
    notes?: string;
    imageSize?: string;
  }) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (!data.generatedImageUrl?.trim()) {
      throw new BadRequestException('generatedImageUrl required');
    }
    return this.prisma.design.create({
      data: {
        projectId,
        generatedImageUrl: data.generatedImageUrl,
        promptUsed: 'Admin-uploaded design (implementation flow)',
        customPrompt: data.notes ?? null,
        spaceLabel: data.spaceLabel ?? null,
        imageSize: data.imageSize ?? '1024x1024',
        parametersJson: { adminUploaded: true } as unknown as Prisma.InputJsonValue,
        modelUsed: 'admin-upload',
        pointsConsumed: 0,
      },
    });
  }

  async deleteAdminDesign(designId: string) {
    const d = await this.prisma.design.findUnique({ where: { id: designId } });
    if (!d) throw new NotFoundException('Design not found');
    if (d.modelUsed !== 'admin-upload') {
      throw new BadRequestException('Refusing to delete a non-admin-uploaded design');
    }
    await this.prisma.design.delete({ where: { id: designId } });
    return { ok: true };
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
