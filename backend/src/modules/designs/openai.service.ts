import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as https from 'https';

type ImageSize = '1024x1024' | '1024x1792' | '1792x1024';
type Quality = 'low' | 'medium' | 'high' | 'standard' | 'hd';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /** Reads OpenAI API key + model + quality from DB (admin-managed) with env fallbacks. */
  private async getSettings(): Promise<{ apiKey: string; model: string; quality: Quality }> {
    const setting = await this.prisma.apiSetting.findFirst({
      where: { provider: 'OPENAI', isActive: true },
    });
    const cfg = (setting?.modelConfigJson as Record<string, string> | null) ?? {};
    const apiKey =
      cfg.apiKey ?? this.config.get<string>('OPENAI_API_KEY') ?? '';
    if (!apiKey) throw new ServiceUnavailableException('AI service not configured');

    // Default to the latest model (gpt-image-2, released April 2026).
    // Falls back to whatever was saved in admin panel, then env, then default.
    const model =
      setting?.modelName ?? cfg.modelName ?? this.config.get<string>('OPENAI_MODEL') ?? 'gpt-image-2';

    const quality = (cfg.quality as Quality) ?? 'medium';
    return { apiKey, model, quality };
  }

  async generateInteriorDesign(params: {
    originalImageUrl: string;
    roomType: string;
    styleName: string;
    colorPaletteName?: string;
    furnitureNames?: string[];
    wallName?: string;
    tileName?: string;
    customPrompt?: string;
    imageSize?: ImageSize;
  }): Promise<string> {
    const { apiKey, model, quality } = await this.getSettings();

    const furniturePart =
      params.furnitureNames && params.furnitureNames.length > 0
        ? `including ${params.furnitureNames.join(', ')}`
        : '';

    const prompt =
      params.customPrompt ??
      [
        `Professional interior design render of a ${params.roomType}.`,
        `Style: ${params.styleName}.`,
        params.colorPaletteName ? `Color palette: ${params.colorPaletteName}.` : '',
        furniturePart ? `Furniture: ${furniturePart}.` : '',
        params.wallName ? `Wall finish: ${params.wallName}.` : '',
        params.tileName ? `Floor tile: ${params.tileName}.` : '',
        'Photorealistic, high quality, 4K, architectural visualization.',
      ]
        .filter(Boolean)
        .join(' ');

    this.logger.log(
      `Generating design: model=${model} quality=${quality} size=${params.imageSize ?? '1024x1024'} prompt=${prompt.substring(0, 80)}...`,
    );

    // gpt-image-2 takes quality: low|medium|high
    // dall-e-3 takes quality: standard|hd
    // Map between them based on the chosen model so the admin doesn't have to know.
    const isGptImage = model.startsWith('gpt-image');
    const apiQuality: string = isGptImage
      ? ['low', 'medium', 'high'].includes(quality) ? quality : 'medium'
      : quality === 'high' || quality === 'hd' ? 'hd' : 'standard';

    const body = JSON.stringify({
      model,
      prompt,
      n: 1,
      size: params.imageSize ?? '1024x1024',
      quality: apiQuality,
      // gpt-image-2 returns b64_json by default; dall-e-3 supports both.
      // We ask for url so the URL can be saved/proxied directly (smaller payload).
      response_format: 'url',
    });

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.openai.com',
          path: '/v1/images/generations',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk: Buffer) => {
            data += chunk.toString();
          });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data) as {
                data?: Array<{ url?: string; b64_json?: string }>;
                error?: { message?: string };
              };
              if (parsed.error) {
                reject(new ServiceUnavailableException(`OpenAI error: ${parsed.error.message}`));
                return;
              }
              const item = parsed.data?.[0];
              if (item?.url) {
                resolve(item.url);
              } else if (item?.b64_json) {
                // gpt-image-2 sometimes ignores response_format=url; fall back gracefully
                resolve(`data:image/png;base64,${item.b64_json}`);
              } else {
                reject(new ServiceUnavailableException('No image returned'));
              }
            } catch {
              reject(new ServiceUnavailableException('Failed to parse OpenAI response'));
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
