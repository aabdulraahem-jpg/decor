import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OpenAiService } from './openai.service';
import { GenerateDesignDto } from './dto/generate-design.dto';

const POINTS_PER_DESIGN = 5;

@Injectable()
export class DesignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openai: OpenAiService,
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

    // 3. Resolve names for prompt building
    const [style, palette, wall, tile, furniture] = await Promise.all([
      dto.styleId ? this.prisma.decorElement.findUnique({ where: { id: dto.styleId }, select: { name: true } }) : null,
      dto.colorPaletteId ? this.prisma.colorPalette.findUnique({ where: { id: dto.colorPaletteId }, select: { name: true } }) : null,
      dto.wallOptionId ? this.prisma.wallOption.findUnique({ where: { id: dto.wallOptionId }, select: { name: true } }) : null,
      dto.tileOptionId ? this.prisma.tileOption.findUnique({ where: { id: dto.tileOptionId }, select: { name: true } }) : null,
      dto.furnitureIds && dto.furnitureIds.length > 0
        ? this.prisma.furnitureItem.findMany({ where: { id: { in: dto.furnitureIds } }, select: { name: true } })
        : [],
    ]);

    const startTime = Date.now();

    // 4. Generate image via OpenAI
    const generatedImageUrl = await this.openai.generateInteriorDesign({
      originalImageUrl: project.originalImageUrl,
      roomType: project.roomType,
      styleName: style?.name ?? 'Modern',
      colorPaletteName: palette?.name,
      furnitureNames: (furniture as Array<{ name: string }>).map((f) => f.name),
      wallName: wall?.name,
      tileName: tile?.name,
      customPrompt: dto.customPrompt,
    });

    const durationMs = Date.now() - startTime;

    // 5. Save design + deduct points atomically
    const [design] = await this.prisma.$transaction([
      this.prisma.design.create({
        data: {
          projectId: dto.projectId,
          generatedImageUrl,
          promptUsed: `${project.roomType} - ${style?.name ?? 'Modern'}`,
          parametersJson: dto as unknown as Prisma.InputJsonValue,
          modelUsed: 'dall-e-3',
          pointsConsumed: POINTS_PER_DESIGN,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { pointsBalance: { decrement: POINTS_PER_DESIGN } },
      }),
    ]);

    // 6. Log AI usage
    await this.prisma.aiGenerationLog.create({
      data: {
        userId,
        projectId: dto.projectId,
        designId: design.id,
        requestPayload: dto as unknown as Prisma.InputJsonValue,
        responsePayload: { url: generatedImageUrl },
        modelUsed: 'dall-e-3',
        durationMs,
        status: 'SUCCESS',
      },
    }).catch(() => { /* non-fatal */ });

    return design;
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
}
