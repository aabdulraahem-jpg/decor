import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenAiService } from './openai.service';
import { SamplesService } from '../samples/samples.service';
import { GenerateDesignDto } from './dto/generate-design.dto';

const POINTS_PER_DESIGN = 5;

@Injectable()
export class DesignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openai: OpenAiService,
    private readonly samples: SamplesService,
  ) {}

  async generate(userId: string, dto: GenerateDesignDto) {
    // 1. Verify user has enough points
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, pointsBalance: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.pointsBalance < POINTS_PER_DESIGN) {
      throw new BadRequestException(
        `Insufficient points. Required: ${POINTS_PER_DESIGN}, available: ${user.pointsBalance}`,
      );
    }

    // 2. Verify project belongs to user
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException();

    // 3. Resolve names + sample prompts + selected colors
    const colorIdsNeeded = dto.sampleColors
      ? Object.values(dto.sampleColors)
          .map((c) => c?.colorId)
          .filter((x): x is string => !!x)
      : [];
    const [style, palette, wall, tile, furniture, samples, colors] = await Promise.all([
      dto.styleId ? this.prisma.decorElement.findUnique({ where: { id: dto.styleId }, select: { name: true } }) : null,
      dto.colorPaletteId ? this.prisma.colorPalette.findUnique({ where: { id: dto.colorPaletteId }, select: { name: true } }) : null,
      dto.wallOptionId ? this.prisma.wallOption.findUnique({ where: { id: dto.wallOptionId }, select: { name: true } }) : null,
      dto.tileOptionId ? this.prisma.tileOption.findUnique({ where: { id: dto.tileOptionId }, select: { name: true } }) : null,
      dto.furnitureIds && dto.furnitureIds.length > 0
        ? this.prisma.furnitureItem.findMany({ where: { id: { in: dto.furnitureIds } }, select: { name: true } })
        : [],
      dto.sampleIds && dto.sampleIds.length > 0
        ? this.samples.getSamplesForPrompt(dto.sampleIds)
        : [],
      colorIdsNeeded.length > 0
        ? this.prisma.color.findMany({
            where: { id: { in: colorIdsNeeded } },
            select: { id: true, code: true, name: true, hex: true },
          })
        : [],
    ]);

    // Build the combined prompt (still computed so it's saved with the
    // design — we'll need it later when the user pays and we trigger
    // the actual OpenAI generation)
    const colorById = new Map(colors.map((c) => [c.id, c]));
    const samplePromptParts = samples.map((s) => {
      const sel = dto.sampleColors?.[s.id];
      if (!sel) return s.aiPrompt;
      const c = sel.colorId ? colorById.get(sel.colorId) : null;
      const colorTag = c
        ? ` (color: ${c.name} ${c.hex} [${c.code}])`
        : sel.customHex
          ? ` (color: ${sel.customHex})`
          : '';
      const note = sel.note ? ` — note: ${sel.note}` : '';
      return `${s.aiPrompt}${colorTag}${note}`;
    }).filter(Boolean);

    const spacePrompt = dto.customSpaceType
      ? `Space type: ${dto.customSpaceType}.`
      : '';
    const combinedCustomPrompt = [spacePrompt, ...samplePromptParts, dto.customPrompt]
      .filter((p) => p && p.trim().length > 0)
      .join('. ');

    /*
     * Cost-control mode: we DO NOT call OpenAI here. Instead we save a
     * "queued" Design record with the user's reference image as the
     * placeholder, so the studio can show the "design ready — pick
     * package to download" paywall. The full prompt is saved so the
     * actual high-quality generation can be triggered after a successful
     * package purchase. Free points (5) still get deducted to enforce
     * the 1 free design quota until phone verification grants more.
     */
    const placeholderUrl = dto.referenceImageUrl ?? project.originalImageUrl;
    const [design] = await this.prisma.$transaction([
      this.prisma.design.create({
        data: {
          projectId: dto.projectId,
          generatedImageUrl: placeholderUrl,
          promptUsed: combinedCustomPrompt || `${project.roomType} - ${style?.name ?? 'Modern'}`,
          customPrompt: dto.customPrompt ?? null,
          imageSize: dto.imageSize ?? '1024x1024',
          referenceImageUrl: dto.referenceImageUrl ?? null,
          sampleIdsJson: (dto.sampleIds ?? []) as unknown as Prisma.InputJsonValue,
          parametersJson: { ...dto, status: 'PENDING_PAYMENT' } as unknown as Prisma.InputJsonValue,
          modelUsed: 'queued',
          pointsConsumed: POINTS_PER_DESIGN,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { pointsBalance: { decrement: POINTS_PER_DESIGN } },
      }),
    ]);

    return { ...design, status: 'PENDING_PAYMENT' as const };
  }

  async findOne(id: string, userId: string) {
    const design = await this.prisma.design.findUnique({
      where: { id },
      include: { project: { select: { userId: true, roomType: true } } },
    });
    if (!design) throw new NotFoundException('Design not found');
    if (design.project.userId !== userId) throw new ForbiddenException();
    return design;
  }

  /** Toggle public share for a design owned by userId. Generates a URL-safe slug on first share. */
  async toggleShare(designId: string, userId: string, isPublic: boolean) {
    const design = await this.prisma.design.findUnique({
      where: { id: designId },
      include: { project: { select: { userId: true } } },
    });
    if (!design) throw new NotFoundException();
    if (design.project.userId !== userId) throw new ForbiddenException();

    let publicSlug = design.publicSlug;
    if (isPublic && !publicSlug) {
      // 10-char URL-safe random
      const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
      do {
        publicSlug = '';
        for (let i = 0; i < 10; i += 1) publicSlug += chars[Math.floor(Math.random() * chars.length)];
        const exists = await this.prisma.design.findUnique({ where: { publicSlug }, select: { id: true } });
        if (!exists) break;
      } while (true);
    }

    const updated = await this.prisma.design.update({
      where: { id: designId },
      data: { isPublic, publicSlug: publicSlug ?? null },
    });
    return {
      isPublic: updated.isPublic,
      publicSlug: updated.publicSlug,
      shareUrl: updated.isPublic && updated.publicSlug ? `https://sufuf.pro/share/${updated.publicSlug}` : null,
    };
  }

  /** Public read by slug — bumps view counter. */
  async findBySlug(slug: string) {
    const design = await this.prisma.design.findUnique({
      where: { publicSlug: slug },
      include: { project: { select: { name: true, roomType: true } } },
    });
    if (!design || !design.isPublic) throw new NotFoundException();
    // Fire-and-forget view bump
    void this.prisma.design.update({
      where: { id: design.id },
      data: { shareViewCount: { increment: 1 } },
    }).catch(() => undefined);
    return {
      id: design.id,
      generatedImageUrl: design.generatedImageUrl,
      createdAt: design.createdAt,
      project: design.project,
      shareViewCount: design.shareViewCount + 1,
    };
  }
}
