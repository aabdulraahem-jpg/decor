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

const POINTS_PER_DESIGN = 5;
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

interface SketchSpaceInput {
  /** Final label e.g. "حمام 1" or "مجلس" — comes from the dynamic form. */
  label: string;
  customPrompt?: string;
  sampleIds?: string[];
  styleId?: string;
  colorIds?: string[];
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
- "label" must be a normalized canonical form in Arabic preferred (e.g. "حمام", "مجلس", "غرفة نوم", "صالة", "مطبخ", "حديقة", "ممر", "مدخل", "شرفة", "غسيل", "مكتب", "غرفة طعام").
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
    payload: { sketchUrl: string; projectName?: string; spaces: SketchSpaceInput[]; analysis?: { spaces: DetectedSpace[] } },
  ) {
    if (!payload.sketchUrl) throw new BadRequestException('sketchUrl required');
    const spaces = (payload.spaces ?? []).filter((s) => s && s.label && s.label.trim().length > 0);
    if (spaces.length === 0) throw new BadRequestException('At least one space required');
    if (spaces.length > MAX_SPACES) {
      throw new BadRequestException(`Max ${MAX_SPACES} spaces per sketch`);
    }

    const requiredPoints = spaces.length * POINTS_PER_DESIGN;
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

    const project = await this.prisma.project.create({
      data: {
        userId,
        name: payload.projectName?.trim() || 'تصميم من سكيتش',
        roomType: 'SKETCH',
        kind: 'SKETCH',
        originalImageUrl: payload.sketchUrl,
        metadataJson: payload.analysis ? (payload.analysis as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });

    const designs = await this.prisma.$transaction(async (tx) => {
      const created = [];
      for (const sp of spaces) {
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
        if (sp.customPrompt) promptParts.push(sp.customPrompt);
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
            pointsConsumed: POINTS_PER_DESIGN,
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
