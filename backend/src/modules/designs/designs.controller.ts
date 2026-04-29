import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DesignsService } from './designs.service';
import { SketchService, DetectedSpace } from './sketch.service';
import { GenerateDesignDto } from './dto/generate-design.dto';

interface AuthUser { id: string }

interface SketchAnalyzeBody { sketchUrl: string }

interface SketchGenerateBody {
  sketchUrl: string;
  projectName?: string;
  /** When set, append designs to an existing SKETCH project (sequential mode). */
  projectId?: string;
  spaces: Array<{
    label: string;
    customPrompt?: string;
    sampleIds?: string[];
    styleId?: string;
    colorIds?: string[];
    cameraAngle?: string;
    elements?: Array<{
      kind: string;
      variant: string;
      lengthMeters?: number;
      widthMeters?: number;
      heightMeters?: number;
      areaSqm?: number;
      glassPercent?: number;
      notes?: string;
      stepCount?: number;
      totalRiseMeters?: number;
      doorDirection?: 'N' | 'E' | 'S' | 'W';
      floorMaterial?: string;
      floorColorHex?: string;
    }>;
    previousApprovedUrls?: string[];
    extraReferenceCount?: number;
    measuredFirst?: boolean;
  }>;
  analysis?: { spaces: DetectedSpace[] };
}

@Controller('designs')
@UseGuards(JwtAuthGuard)
export class DesignsController {
  constructor(
    private readonly svc: DesignsService,
    private readonly sketch: SketchService,
  ) {}

  @Post('generate')
  generate(@Body() dto: GenerateDesignDto, @CurrentUser() user: AuthUser) {
    return this.svc.generate(user.id, dto);
  }

  // ── Sketch mode ────────────────────────────────────────────────────────

  @Post('sketch/analyze')
  analyzeSketch(@Body() body: SketchAnalyzeBody, @CurrentUser() user: AuthUser) {
    return this.sketch.analyze(user.id, body.sketchUrl);
  }

  @Post('sketch/generate')
  generateFromSketch(@Body() body: SketchGenerateBody, @CurrentUser() user: AuthUser) {
    return this.sketch.generateAll(user.id, body);
  }

  @Post('sketch/generate-one')
  generateOneFromSketch(
    @Body() body: {
      sketchUrl: string;
      projectName?: string;
      projectId?: string;
      regenerateDesignId?: string;
      space: {
        label: string;
        customPrompt?: string;
        sampleIds?: string[];
        styleId?: string;
        colorIds?: string[];
        cameraAngle?: string;
        elements?: Array<{
          kind: string;
          variant: string;
          lengthMeters?: number;
          widthMeters?: number;
          heightMeters?: number;
          areaSqm?: number;
          glassPercent?: number;
          notes?: string;
          stepCount?: number;
          totalRiseMeters?: number;
          doorDirection?: 'N' | 'E' | 'S' | 'W';
          floorMaterial?: string;
          floorColorHex?: string;
        }>;
        previousApprovedUrls?: string[];
        extraReferenceCount?: number;
        measuredFirst?: boolean;
      };
      analysis?: { spaces: DetectedSpace[] };
    },
    @CurrentUser() user: AuthUser,
  ) {
    return this.sketch.generateOne(user.id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.svc.findOne(id, user.id);
  }

  /** Toggle public share for a design (owner only). Returns slug + url. */
  @Patch(':id/share')
  toggleShare(@Param('id') id: string, @Body() body: { isPublic: boolean }, @CurrentUser() user: AuthUser) {
    return this.svc.toggleShare(id, user.id, body.isPublic);
  }
}
