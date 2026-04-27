import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateApsSettingsDto {
  @IsString()
  merchantId: string;

  @IsString()
  accessCode: string;

  @IsString()
  shaRequestPhrase: string;

  @IsString()
  shaResponsePhrase: string;

  @IsString()
  @IsOptional()
  baseUrl?: string;
}

export class UpdateAiSettingsDto {
  @IsString()
  apiKey: string;

  @IsString()
  @IsOptional()
  modelName?: string;

  @IsString()
  @IsOptional()
  quality?: 'low' | 'medium' | 'high' | 'standard' | 'hd';

  @IsObject()
  @IsOptional()
  modelConfig?: Record<string, unknown>;
}

export class UpdateUserPointsDto {
  @IsString()
  userId: string;

  @IsBoolean()
  @IsOptional()
  increment?: boolean; // true = add, false = set

  @IsOptional()
  amount?: number;
}
