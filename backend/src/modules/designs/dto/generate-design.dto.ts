import { IsArray, IsOptional, IsString } from 'class-validator';

export class GenerateDesignDto {
  @IsString()
  projectId: string;

  @IsString()
  styleId: string;

  @IsString()
  @IsOptional()
  colorPaletteId?: string;

  @IsArray()
  @IsOptional()
  furnitureIds?: string[];

  @IsString()
  @IsOptional()
  wallOptionId?: string;

  @IsString()
  @IsOptional()
  tileOptionId?: string;

  @IsString()
  @IsOptional()
  customPrompt?: string;
}
