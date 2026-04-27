import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as https from 'https';

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private async getApiKey(): Promise<string> {
    // Prefer DB-stored key (admin-managed) over env var
    const setting = await this.prisma.apiSetting.findFirst({
      where: { provider: 'OPENAI', isActive: true },
    });
    const key =
      (setting?.modelConfigJson as Record<string, string> | null)?.apiKey ??
      this.config.get<string>('OPENAI_API_KEY') ??
      '';
    if (!key) throw new ServiceUnavailableException('AI service not configured');
    return key;
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
    imageSize?: '1024x1024' | '1024x1792' | '1792x1024';
  }): Promise<string> {
    const apiKey = await this.getApiKey();

    const furniturePart =
      params.furnitureNames && params.furnitureNames.length > 0
        ? `including ${params.furnitureNames.join(', ')}`
        : '';

    const prompt = params.customPrompt ??
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

    this.logger.log(`Generating design with prompt: ${prompt.substring(0, 100)}...`);

    // Call OpenAI DALL-E 3 image generation
    const body = JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: params.imageSize ?? '1024x1024',
      quality: 'standard',
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
            'Authorization': `Bearer ${apiKey}`,
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data) as { data?: Array<{ url?: string }>; error?: { message?: string } };
              if (parsed.error) {
                reject(new ServiceUnavailableException(`OpenAI error: ${parsed.error.message}`));
              } else {
                const url = parsed.data?.[0]?.url;
                if (!url) reject(new ServiceUnavailableException('No image URL returned'));
                else resolve(url);
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
