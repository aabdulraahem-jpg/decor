import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  // أرقام دولية E.164: +9665XXXXXXXX
  @IsOptional()
  @Matches(/^\+?[1-9]\d{6,14}$/)
  phoneNumber?: string;
}
