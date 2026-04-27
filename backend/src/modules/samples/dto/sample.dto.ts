import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export type SampleKindLiteral = 'SAMPLE' | 'STYLE';

export class CreateCategoryDto {
  @IsString()
  @Length(2, 80)
  slug!: string;

  @IsString()
  @Length(1, 120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsIn(['SAMPLE', 'STYLE'])
  kind?: SampleKindLiteral;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @IsOptional() @IsString() @Length(2, 80) slug?: string;
  @IsOptional() @IsString() @Length(1, 120) name?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsString() @MaxLength(500) imageUrl?: string;
  @IsOptional() @IsIn(['SAMPLE', 'STYLE']) kind?: SampleKindLiteral;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @Type(() => Boolean) @IsBoolean() isActive?: boolean;
}

export class DescribeDto {
  @IsOptional() @IsString() @MaxLength(500) imageUrl?: string;
  @IsOptional() @IsString() @MaxLength(200) textLabel?: string;
  @IsOptional() @IsString() @MaxLength(120) categoryHint?: string;
}

export class CreateSampleDto {
  @IsString() @Length(1, 80) categoryId!: string;
  @IsString() @Length(1, 200) name!: string;

  @IsOptional() @IsString() description?: string;

  @IsOptional() @IsString() @MaxLength(500) imageUrl?: string;
  @IsString() aiPrompt!: string;

  @IsOptional() @Type(() => Number) @IsNumber() widthCm?: number;
  @IsOptional() @Type(() => Number) @IsNumber() heightCm?: number;
  @IsOptional() @Type(() => Number) @IsNumber() thicknessMm?: number;
  @IsOptional() @IsString() @MaxLength(80) modelNumber?: string;
  @IsOptional() @Type(() => Number) @IsNumber() valueSar?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @Type(() => Boolean) @IsBoolean() isActive?: boolean;
}

export class UpdateSampleDto {
  @IsOptional() @IsString() @Length(1, 80) categoryId?: string;
  @IsOptional() @IsString() @Length(1, 200) name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() @MaxLength(500) imageUrl?: string;
  @IsOptional() @IsString() aiPrompt?: string;
  @IsOptional() @Type(() => Number) @IsNumber() widthCm?: number;
  @IsOptional() @Type(() => Number) @IsNumber() heightCm?: number;
  @IsOptional() @Type(() => Number) @IsNumber() thicknessMm?: number;
  @IsOptional() @IsString() @MaxLength(80) modelNumber?: string;
  @IsOptional() @Type(() => Number) @IsNumber() valueSar?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @Type(() => Boolean) @IsBoolean() isActive?: boolean;
}
