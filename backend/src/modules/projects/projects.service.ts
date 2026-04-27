import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        userId,
        name: dto.name,
        roomType: dto.roomType,
        originalImageUrl: dto.originalImageUrl,
      },
      include: { designs: true },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        designs: { select: { id: true, generatedImageUrl: true, pointsConsumed: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { designs: { orderBy: { createdAt: 'desc' } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException();
    return project;
  }

  async remove(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException();
    return this.prisma.project.delete({ where: { id } });
  }
}
