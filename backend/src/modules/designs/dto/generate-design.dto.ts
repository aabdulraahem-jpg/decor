import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const ALLOWED_IMAGE_SIZES = ['1024x1024', '1024x1792', '1792x1024'] as const;
export type AllowedImageSize = (typeof ALLOWED_IMAGE_SIZES)[number];

export class GenerateDesignDto {
  @IsString()
  projectId!: string;

  // Legacy catalog fields (kept for backward compat with mobile mocks)
  @IsString() @IsOptional() styleId?: string;
  @IsString() @IsOptional() colorPaletteId?: string;
  @IsArray() @IsOptional() furnitureIds?: string[];
  @IsString() @IsOptional() wallOptionId?: string;
  @IsString() @IsOptional() tileOptionId?: string;

  // New sample-driven flow
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  sampleIds?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  customPrompt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  referenceImageUrl?: string;

  @IsOptional()
  @IsIn(ALLOWED_IMAGE_SIZES as unknown as string[])
  imageSize?: AllowedImageSize;

  /**
   * Per-sample color overrides chosen in the studio.
   * Map of sampleId → { colorId? (from master palette), customHex?, note? }
   */
  @IsOptional()
  @IsObject()
  sampleColors?: Record<string, { colorId?: string; customHex?: string; note?: string }>;

  /** Free-text custom space type when the user picks "أخرى" in the studio. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  customSpaceType?: string;
}
