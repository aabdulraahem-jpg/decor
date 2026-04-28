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
  spaces: Array<{
    label: string;
    customPrompt?: string;
    sampleIds?: string[];
    styleId?: string;
    colorIds?: string[];
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
