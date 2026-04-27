import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePackageDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  pointsAmount: number;

  @IsNumber()
  @Min(0)
  priceSar: number;

  @IsNumber()
  @IsOptional()
  profitMargin?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
