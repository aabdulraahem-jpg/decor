import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { randomBytes } from 'crypto';
import { join } from 'path';
import sharp from 'sharp';

export type ImageBucket = 'samples' | 'categories' | 'references';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB raw upload cap
const MAX_DIMENSION = 2048;
const ACCEPTED_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly root: string;
  private readonly publicBase: string;

  constructor(private readonly config: ConfigService) {
    this.root =
      this.config.get<string>('UPLOADS_DIR') ??
      '/home/sufuf/web/api.sufuf.pro/public_html/uploads';
    this.publicBase =
      this.config.get<string>('UPLOADS_PUBLIC_BASE') ??
      'https://api.sufuf.pro/uploads';
  }

  /**
   * Save a Multer file as a WebP under /uploads/{bucket}/<random>.webp
   * and return the public URL.
   */
  async saveAsWebp(
    file: { buffer: Buffer; mimetype: string; size: number; originalname: string },
    bucket: ImageBucket,
    opts: { quality?: number } = {},
  ): Promise<string> {
    if (!file?.buffer) throw new BadRequestException('No file uploaded');
    if (file.size > MAX_BYTES) throw new BadRequestException('File too large (max 8MB)');
    if (!ACCEPTED_MIMES.has(file.mimetype.toLowerCase())) {
      throw new BadRequestException(`Unsupported image type: ${file.mimetype}`);
    }

    const dir = join(this.root, bucket);
    await fs.mkdir(dir, { recursive: true });

    const slug = randomBytes(12).toString('base64url');
    const filename = `${Date.now().toString(36)}-${slug}.webp`;
    const dest = join(dir, filename);

    try {
      await sharp(file.buffer, { failOn: 'error' })
        .rotate() // honour EXIF orientation
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: opts.quality ?? 85, effort: 4 })
        .toFile(dest);
    } catch (e) {
      this.logger.error(`sharp failed: ${(e as Error).message}`);
      throw new BadRequestException('Could not process image');
    }

    return `${this.publicBase}/${bucket}/${filename}`;
  }

  /** Best-effort delete. Silently ignores null/missing files. */
  async delete(publicUrl: string | null | undefined): Promise<void> {
    if (!publicUrl) return;
    if (!publicUrl.startsWith(this.publicBase + '/')) return;
    const rel = publicUrl.slice(this.publicBase.length + 1);
    // sanity: only allow files inside one of our buckets
    if (!/^(samples|categories|references)\/[a-zA-Z0-9._-]+$/.test(rel)) return;
    const path = join(this.root, rel);
    await fs.unlink(path).catch(() => undefined);
  }
}
