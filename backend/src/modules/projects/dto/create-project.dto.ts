import { IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  roomType: string;

  @IsString()
  originalImageUrl: string;

  @IsString()
  @IsOptional()
  styleId?: string;

  @IsString()
  @IsOptional()
  colorPaletteId?: string;
}
