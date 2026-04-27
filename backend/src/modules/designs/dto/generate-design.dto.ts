import {
  ArrayMaxSize,
  IsArray,
  IsIn,
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
}
