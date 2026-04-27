import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Calls OpenAI's vision-capable chat model to describe a sample image
 * (or refine a text label) into a high-quality prompt fragment that can
 * later be appended to a DALL-E / gpt-image generation prompt.
 */
@Injectable()
export class DescribeService {
  private readonly logger = new Logger(DescribeService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private async getSettings(): Promise<{ apiKey: string; visionModel: string }> {
    const setting = await this.prisma.apiSetting.findFirst({
      where: { provider: 'OPENAI', isActive: true },
    });
    const cfg = (setting?.modelConfigJson as Record<string, string> | null) ?? {};
    const apiKey = cfg.apiKey ?? this.config.get<string>('OPENAI_API_KEY') ?? '';
    if (!apiKey) throw new ServiceUnavailableException('AI service not configured');
    const visionModel = cfg.visionModel ?? this.config.get<string>('OPENAI_VISION_MODEL') ?? 'gpt-4o-mini';
    return { apiKey, visionModel };
  }

  /**
   * Returns a one-paragraph English prompt fragment describing the sample,
   * suitable for concatenation with other selected samples.
   */
  async describe(input: { imageUrl?: string; textLabel?: string; categoryHint?: string }): Promise<string> {
    if (!input.imageUrl && !input.textLabel) {
      throw new ServiceUnavailableException('Provide either imageUrl or textLabel');
    }
    const { apiKey, visionModel } = await this.getSettings();

    const systemMsg =
      'You are an interior-design prompt assistant. Given a material/finish image OR a short label, write ONE concise English sentence (≤ 35 words) describing the visual qualities — color, texture, style, mood — suitable to be appended to an interior render prompt. No marketing language. No "this image shows". Just the descriptor.';

    const userContent: Array<Record<string, unknown>> = [];
    if (input.textLabel) {
      const ctx = input.categoryHint ? `Category: ${input.categoryHint}. ` : '';
      userContent.push({
        type: 'text',
        text: `${ctx}Refine this design choice into a render-ready descriptor: "${input.textLabel}"`,
      });
    } else {
      const ctx = input.categoryHint ? `Category: ${input.categoryHint}. ` : '';
      userContent.push({
        type: 'text',
        text: `${ctx}Describe this sample/material as a one-sentence render descriptor.`,
      });
    }
    if (input.imageUrl) {
      userContent.push({ type: 'image_url', image_url: { url: input.imageUrl } });
    }

    const body = JSON.stringify({
      model: visionModel,
      max_tokens: 120,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: userContent },
      ],
    });

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.openai.com',
          path: '/v1/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (c: Buffer) => { data += c.toString(); });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{ message?: { content?: string } }>;
                error?: { message?: string };
              };
              if (parsed.error) {
                reject(new ServiceUnavailableException(`OpenAI: ${parsed.error.message}`));
                return;
              }
              const text = parsed.choices?.[0]?.message?.content?.trim();
              if (!text) {
                reject(new ServiceUnavailableException('Empty AI description'));
              } else {
                resolve(text.replace(/^["']|["']$/g, '').replace(/\.$/, '').trim());
              }
            } catch (e) {
              this.logger.error(`describe parse fail: ${(e as Error).message}`);
              reject(new ServiceUnavailableException('Failed to parse AI response'));
            }
          });
        },
      );
      req.on('error', (err: Error) => reject(new ServiceUnavailableException(err.message)));
      req.write(body);
      req.end();
    });
  }
}
