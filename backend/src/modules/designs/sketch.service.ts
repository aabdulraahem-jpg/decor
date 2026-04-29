import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as https from 'https';

import { PrismaService } from '../../prisma/prisma.service';
import { SamplesService } from '../samples/samples.service';
import { calcDesignCost, POINTS_PER_DESIGN } from './pricing';

const MAX_SPACES = 12;

export interface DetectedSpace {
  label: string;
  count: number;
  notes?: string;
}

export interface AnalyzeResult {
  spaces: DetectedSpace[];
  warning?: string;
  totalSpaces: number;
  estimatedPoints: number;
}

interface SpaceElementInput {
  kind: string; // ElementKind in client lib — kept as string here for forward-compat
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
}

interface SketchSpaceInput {
  /** Final label e.g. "حمام 1" or "مجلس" — comes from the dynamic form. */
  label: string;
  customPrompt?: string;
  sampleIds?: string[];
  styleId?: string;
  colorIds?: string[];
  /** Optional camera viewpoint hint (Arabic free text). Becomes part of the AI prompt. */
  cameraAngle?: string;
  /** Optional structural elements (handrail, fence, pergola, carport, wall topper). */
  elements?: SpaceElementInput[];
  /**
   * Sequential continuity: URL(s) of previously approved designs from the same
   * project. Injected into the AI prompt with strict instructions to keep
   * decor/style/materials/palette consistent with those images. We only pass
   * the most recent 1-2 URLs to keep token cost bounded (linear, not quadratic).
   */
  previousApprovedUrls?: string[];
  /** Reference images attached to this space (each one billed for vision). */
  extraReferenceCount?: number;
  /** Measured-overlay mode: extra vision pass to estimate dimensions. */
  measuredFirst?: boolean;
}

const ELEMENT_LABELS: Record<string, string> = {
  HANDRAIL: 'دربزين الدرج',
  INTERIOR_WALL: 'جدار داخلي',
  WINDOW: 'نافذة',
  DOOR_GAP: 'باب (فجوة)',
  DOOR_ARC: 'باب مع قوس فتح',
  STAIRS: 'درج',
  HANDWASH: 'مغسلة ايدي',
  CORRIDOR: 'ممر',
  COLUMN_ROUND: 'عمود دائري',
  COLUMN_RECT: 'عمود مستطيل',
  PLATFORM: 'مستوى مرتفع',
  ELEVATOR: 'مصعد',
  FENCE: 'حاجز حديقة',
  PERGOLA: 'مظلة جلوس',
  CARPORT: 'مظلة سيارة',
  WALL_TOPPER: 'حاجز فوق السور',
  EXTERIOR_FACADE: 'واجهة المبنى',
  ANNEX: 'ملحق خارجي',
  BOUNDARY_WALL: 'سور خارجي',
  GATE: 'بوّابة',
  GRASS: 'عشب / مساحة خضراء',
  WALKWAY: 'ممشى',
  POOL: 'مسبح',
  COURTYARD: 'ساحة / مسيح',
  BAIT_SHAR: 'بيت شعر / خيمة',
};

function elementToPromptFragment(e: SpaceElementInput): string {
  const label = ELEMENT_LABELS[e.kind] ?? e.kind;
  const parts: string[] = [`${label}: ${e.variant ?? ''}`.trim()];
  const dim: string[] = [];
  if (e.lengthMeters) dim.push(`length ~${e.lengthMeters}m`);
  if (e.widthMeters) dim.push(`width ~${e.widthMeters}m`);
  if (e.heightMeters) dim.push(`height ~${e.heightMeters}m`);
  if (e.areaSqm) dim.push(`area ~${e.areaSqm}m²`);
  if (e.glassPercent) dim.push(`glass façade ~${e.glassPercent}%`);
  if (e.stepCount) dim.push(`${e.stepCount} steps`);
  if (e.totalRiseMeters) dim.push(`total rise ~${e.totalRiseMeters}m to upper landing`);
  if (e.doorDirection) dim.push(`door faces ${e.doorDirection}`);
  if (dim.length) parts.push(`[${dim.join(', ')}]`);
  if (e.floorMaterial) parts.push(`floor material: ${e.floorMaterial}`);
  if (e.floorColorHex) parts.push(`floor color: ${e.floorColorHex}`);
  if (e.notes && e.notes.trim()) parts.push(`note: ${e.notes.trim()}`);
  return parts.join(' ');
}

@Injectable()
export class SketchService {
  private readonly logger = new Logger(SketchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly samples: SamplesService,
  ) {}

  /**
   * Step 1: vision analysis. Reads OpenAI key from DB ApiSetting (admin-managed).
   * Calls gpt-4o-mini with the sketch URL and returns detected spaces.
   * If the user didn't label spaces, returns a warning instead of guessing.
   */
  async analyze(userId: string, sketchUrl: string): Promise<AnalyzeResult> {
    if (!sketchUrl || typeof sketchUrl !== 'string') {
      throw new BadRequestException('sketchUrl is required');
    }
    const apiKey = await this.getOpenAIKey();

    const systemPrompt = `You analyze architectural floor plans or hand-drawn sketches.
Extract every distinct labeled space the user wrote on the sketch (in Arabic or English).
Return JSON only, no prose, with this exact shape:
{ "spaces": [{ "label": string, "count": number, "notes"?: string }], "warning"?: string }
Rules:
- "label" must be a normalized canonical form in Arabic preferred (e.g. "حمام", "مجلس", "غرفة نوم", "صالة", "مطبخ", "حديقة", "ممر", "مدخل", "شرفة", "غسيل", "مكتب", "غرفة طعام", "درج", "مغسلة ايدي", "بدروم", "روف").
- If a label appears multiple times, set count to that number (e.g. two bathrooms => count: 2).
- Only return spaces the USER explicitly labelled. Do NOT infer from shapes.
- If you can't read any labels, return { "spaces": [], "warning": "no_labels" }.
- "notes" can hold any text the user wrote next to a label (e.g. "كبير", "للضيوف").`;

    const body = JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'حلّل هذا الاسكيتش وأخرج المساحات المكتوبة فقط.' },
            { type: 'image_url', image_url: { url: sketchUrl } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 800,
    });

    const raw = await this.openAIRequest('/v1/chat/completions', body, apiKey);
    const parsed = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };
    if (parsed.error) {
      throw new ServiceUnavailableException(`Vision error: ${parsed.error.message}`);
    }
    const content = parsed.choices?.[0]?.message?.content ?? '{}';
    let json: { spaces?: DetectedSpace[]; warning?: string };
    try {
      json = JSON.parse(content) as typeof json;
    } catch {
      throw new ServiceUnavailableException('Failed to parse vision response');
    }

    const spaces = (json.spaces ?? [])
      .filter((s) => s && typeof s.label === 'string' && s.label.trim().length > 0)
      .map((s) => ({
        label: s.label.trim().slice(0, 80),
        count: Math.max(1, Math.min(10, Number(s.count) || 1)),
        notes: s.notes ? String(s.notes).slice(0, 200) : undefined,
      }))
      .slice(0, MAX_SPACES);

    const totalSpaces = spaces.reduce((sum, s) => sum + s.count, 0);

    // Cache the analysis for the user (so re-running same sketch doesn't recharge)
    this.logger.log(`Sketch analysis for user ${userId}: ${totalSpaces} spaces detected`);

    return {
      spaces,
      warning: spaces.length === 0 ? json.warning ?? 'no_labels' : undefined,
      totalSpaces,
      estimatedPoints: totalSpaces * POINTS_PER_DESIGN,
    };
  }

  /**
   * Step 2: create a SKETCH project + N pending Design rows (one per space).
   * Cost-control mode: like single-room generation, we DON'T call gpt-image-2 here.
   * We save placeholder records (status PENDING_PAYMENT) and deduct points so
   * the studio can show a paywall before the real generation runs after purchase.
   */
  async generateAll(
    userId: string,
    payload: {
      sketchUrl: string;
      projectName?: string;
      spaces: SketchSpaceInput[];
      analysis?: { spaces: DetectedSpace[] };
      /** When set, append designs to an existing SKETCH project instead of creating one. */
      projectId?: string;
    },
  ) {
    if (!payload.sketchUrl) throw new BadRequestException('sketchUrl required');
    const spaces = (payload.spaces ?? []).filter((s) => s && s.label && s.label.trim().length > 0);
    if (spaces.length === 0) throw new BadRequestException('At least one space required');
    if (spaces.length > MAX_SPACES) {
      throw new BadRequestException(`Max ${MAX_SPACES} spaces per sketch`);
    }

    // Per-space cost varies with reference count + measured-first mode.
    const perSpaceCosts = spaces.map((sp) => calcDesignCost({
      refCount: sp.extraReferenceCount,
      measuredFirst: sp.measuredFirst,
    }));
    const requiredPoints = perSpaceCosts.reduce((a, b) => a + b, 0);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, pointsBalance: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.pointsBalance < requiredPoints) {
      throw new BadRequestException(
        `Insufficient points. Required: ${requiredPoints}, available: ${user.pointsBalance}`,
      );
    }

    // Resolve sample prompts in one shot for all spaces
    const allSampleIds = Array.from(
      new Set(spaces.flatMap((s) => s.sampleIds ?? []).filter(Boolean)),
    );
    const sampleMap = new Map<string, { aiPrompt: string; name: string }>();
    if (allSampleIds.length > 0) {
      const rows = await this.samples.getSamplesForPrompt(allSampleIds);
      rows.forEach((r) => sampleMap.set(r.id, { aiPrompt: r.aiPrompt, name: r.name }));
    }

    // Resolve style IDs (treated as STYLE-kind samples in this codebase)
    const styleIds = Array.from(new Set(spaces.map((s) => s.styleId).filter((x): x is string => !!x)));
    if (styleIds.length > 0) {
      const styles = await this.samples.getSamplesForPrompt(styleIds);
      styles.forEach((r) => sampleMap.set(r.id, { aiPrompt: r.aiPrompt, name: r.name }));
    }

    // Either reuse a project (sequential approval flow) or create a new one.
    let project;
    if (payload.projectId) {
      const existing = await this.prisma.project.findUnique({ where: { id: payload.projectId } });
      if (!existing) throw new NotFoundException('Project not found');
      if (existing.userId !== userId) throw new ForbiddenException('Project belongs to another user');
      project = existing;
    } else {
      project = await this.prisma.project.create({
        data: {
          userId,
          name: payload.projectName?.trim() || 'تصميم من سكيتش',
          roomType: 'SKETCH',
          kind: 'SKETCH',
          originalImageUrl: payload.sketchUrl,
          metadataJson: payload.analysis ? (payload.analysis as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });
    }

    const designs = await this.prisma.$transaction(async (tx) => {
      const created = [];
      for (let i = 0; i < spaces.length; i++) {
        const sp = spaces[i];
        const spaceCost = perSpaceCosts[i];
        const promptParts: string[] = [`Space: ${sp.label}.`];
        if (sp.styleId) {
          const st = sampleMap.get(sp.styleId);
          if (st) promptParts.push(`Style: ${st.aiPrompt}.`);
        }
        if (sp.sampleIds && sp.sampleIds.length > 0) {
          for (const id of sp.sampleIds) {
            const samp = sampleMap.get(id);
            if (samp) promptParts.push(samp.aiPrompt);
          }
        }
        if (sp.cameraAngle && sp.cameraAngle.trim()) {
          // The camera-angle hint helps the model frame the shot deliberately.
          promptParts.push(`Camera viewpoint: ${sp.cameraAngle.trim()}.`);
        }
        if (Array.isArray(sp.elements) && sp.elements.length > 0) {
          const elementBits = sp.elements
            .filter((e) => e && e.kind && e.variant)
            .map(elementToPromptFragment);
          if (elementBits.length > 0) {
            promptParts.push(`Structural elements: ${elementBits.join(' | ')}.`);
          }
        }
        if (sp.customPrompt) promptParts.push(sp.customPrompt);
        // Sequential continuity: tell the model to lock decor to previously
        // approved frames so multi-angle output of the same project remains
        // visually consistent. We cap at the 2 most recent to bound tokens.
        if (Array.isArray(sp.previousApprovedUrls) && sp.previousApprovedUrls.length > 0) {
          const recent = sp.previousApprovedUrls.slice(-2).filter(Boolean);
          if (recent.length > 0) {
            promptParts.push(
              `Continuity reference (must match): the following ${recent.length} image(s) are previously approved frames of THE SAME project from different camera angles — keep furniture style, materials, color palette, lighting mood, fixtures and finishes consistent with them. Only the camera viewpoint and any newly placed elements may differ. URLs: ${recent.join(' | ')}.`,
            );
          }
        }
        const fullPrompt = promptParts.join(' ');

        const d = await tx.design.create({
          data: {
            projectId: project.id,
            spaceLabel: sp.label,
            generatedImageUrl: payload.sketchUrl, // placeholder until paid
            promptUsed: fullPrompt,
            customPrompt: sp.customPrompt ?? null,
            imageSize: '1024x1024',
            referenceImageUrl: payload.sketchUrl,
            sampleIdsJson: (sp.sampleIds ?? []) as unknown as Prisma.InputJsonValue,
            parametersJson: { ...sp, status: 'PENDING_PAYMENT', kind: 'SKETCH' } as unknown as Prisma.InputJsonValue,
            modelUsed: 'queued',
            pointsConsumed: spaceCost,
          },
        });
        created.push(d);
      }
      await tx.user.update({
        where: { id: userId },
        data: { pointsBalance: { decrement: requiredPoints } },
      });
      return created;
    });

    return {
      project,
      designs,
      pointsConsumed: requiredPoints,
      status: 'PENDING_PAYMENT' as const,
    };
  }

  /**
   * Sequential approval flow: generate / re-generate ONE space at a time.
   * - First call (no projectId): creates the project AND the design row, decrements 5 points.
   * - Subsequent calls with `projectId`: appends a new design row, decrements 5 points.
   * - Calls with `regenerateDesignId` (must belong to the project): UPDATES the
   *   existing pending row in place — no new row, no extra point deduction.
   *   Used when the user iterates on the same space before approving.
   */
  async generateOne(
    userId: string,
    payload: {
      sketchUrl: string;
      projectName?: string;
      projectId?: string;
      space: SketchSpaceInput;
      regenerateDesignId?: string;
      analysis?: { spaces: DetectedSpace[] };
    },
  ) {
    if (!payload.sketchUrl) throw new BadRequestException('sketchUrl required');
    const sp = payload.space;
    if (!sp || !sp.label || !sp.label.trim()) {
      throw new BadRequestException('space.label required');
    }

    const isRegenerate = !!payload.regenerateDesignId;
    if (isRegenerate && !payload.projectId) {
      throw new BadRequestException('projectId required when regenerating');
    }

    // Per-call cost depends on the references attached + measured-overlay flag.
    const callCost = calcDesignCost({
      refCount: sp.extraReferenceCount,
      measuredFirst: sp.measuredFirst,
    });
    const requiredPoints = isRegenerate ? 0 : callCost;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, pointsBalance: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!isRegenerate && user.pointsBalance < requiredPoints) {
      throw new BadRequestException(
        `Insufficient points. Required: ${requiredPoints}, available: ${user.pointsBalance}`,
      );
    }

    const sampleMap = new Map<string, { aiPrompt: string; name: string }>();
    const ids = [
      ...(sp.sampleIds ?? []),
      ...(sp.styleId ? [sp.styleId] : []),
    ];
    if (ids.length > 0) {
      const rows = await this.samples.getSamplesForPrompt(ids);
      rows.forEach((r) => sampleMap.set(r.id, { aiPrompt: r.aiPrompt, name: r.name }));
    }

    let project;
    if (payload.projectId) {
      const existing = await this.prisma.project.findUnique({ where: { id: payload.projectId } });
      if (!existing) throw new NotFoundException('Project not found');
      if (existing.userId !== userId) throw new ForbiddenException('Project belongs to another user');
      project = existing;
    } else {
      project = await this.prisma.project.create({
        data: {
          userId,
          name: payload.projectName?.trim() || 'تصميم من سكيتش',
          roomType: 'SKETCH',
          kind: 'SKETCH',
          originalImageUrl: payload.sketchUrl,
          metadataJson: payload.analysis ? (payload.analysis as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });
    }

    const promptParts: string[] = [`Space: ${sp.label}.`];
    if (sp.styleId) {
      const st = sampleMap.get(sp.styleId);
      if (st) promptParts.push(`Style: ${st.aiPrompt}.`);
    }
    if (sp.sampleIds && sp.sampleIds.length > 0) {
      for (const id of sp.sampleIds) {
        const samp = sampleMap.get(id);
        if (samp) promptParts.push(samp.aiPrompt);
      }
    }
    if (sp.cameraAngle && sp.cameraAngle.trim()) {
      promptParts.push(`Camera viewpoint: ${sp.cameraAngle.trim()}.`);
    }
    if (Array.isArray(sp.elements) && sp.elements.length > 0) {
      const elementBits = sp.elements
        .filter((e) => e && e.kind && e.variant)
        .map(elementToPromptFragment);
      if (elementBits.length > 0) {
        promptParts.push(`Structural elements: ${elementBits.join(' | ')}.`);
      }
    }
    if (sp.customPrompt) promptParts.push(sp.customPrompt);
    if (Array.isArray(sp.previousApprovedUrls) && sp.previousApprovedUrls.length > 0) {
      const recent = sp.previousApprovedUrls.slice(-2).filter(Boolean);
      if (recent.length > 0) {
        promptParts.push(
          `Continuity reference (must match): the following ${recent.length} image(s) are previously approved frames of THE SAME project from different camera angles — keep furniture style, materials, color palette, lighting mood, fixtures and finishes consistent with them. Only the camera viewpoint and any newly placed elements may differ. URLs: ${recent.join(' | ')}.`,
        );
      }
    }
    const fullPrompt = promptParts.join(' ');

    const design = await this.prisma.$transaction(async (tx) => {
      let d;
      if (isRegenerate && payload.regenerateDesignId) {
        const existing = await tx.design.findUnique({ where: { id: payload.regenerateDesignId } });
        if (!existing) throw new NotFoundException('Design not found');
        if (existing.projectId !== project.id) {
          throw new ForbiddenException('Design does not belong to this project');
        }
        d = await tx.design.update({
          where: { id: existing.id },
          data: {
            spaceLabel: sp.label,
            promptUsed: fullPrompt,
            customPrompt: sp.customPrompt ?? null,
            sampleIdsJson: (sp.sampleIds ?? []) as unknown as Prisma.InputJsonValue,
            parametersJson: { ...sp, status: 'PENDING_PAYMENT', kind: 'SKETCH' } as unknown as Prisma.InputJsonValue,
          },
        });
      } else {
        d = await tx.design.create({
          data: {
            projectId: project.id,
            spaceLabel: sp.label,
            generatedImageUrl: payload.sketchUrl,
            promptUsed: fullPrompt,
            customPrompt: sp.customPrompt ?? null,
            imageSize: '1024x1024',
            referenceImageUrl: payload.sketchUrl,
            sampleIdsJson: (sp.sampleIds ?? []) as unknown as Prisma.InputJsonValue,
            parametersJson: { ...sp, status: 'PENDING_PAYMENT', kind: 'SKETCH' } as unknown as Prisma.InputJsonValue,
            modelUsed: 'queued',
            pointsConsumed: callCost,
          },
        });
        await tx.user.update({
          where: { id: userId },
          data: { pointsBalance: { decrement: callCost } },
        });
      }
      return d;
    });

    return {
      project,
      design,
      pointsConsumed: requiredPoints,
      status: 'PENDING_PAYMENT' as const,
    };
  }

  // ── helpers ────────────────────────────────────────────────────────────

  private async getOpenAIKey(): Promise<string> {
    const setting = await this.prisma.apiSetting.findFirst({
      where: { provider: 'OPENAI', isActive: true },
    });
    const cfg = (setting?.modelConfigJson as Record<string, string> | null) ?? {};
    const apiKey = cfg.apiKey ?? this.config.get<string>('OPENAI_API_KEY') ?? '';
    if (!apiKey) throw new ServiceUnavailableException('AI service not configured');
    return apiKey;
  }

  private openAIRequest(path: string, body: string, apiKey: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.openai.com',
          path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (c: Buffer) => (data += c.toString()));
          res.on('end', () => resolve(data));
        },
      );
      req.on('error', (err: Error) => reject(new ServiceUnavailableException(err.message)));
      req.write(body);
      req.end();
    });
  }
}
