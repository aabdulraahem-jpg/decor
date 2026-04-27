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

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  captchaToken?: string;

  /** Stable random UUID stored in localStorage to detect repeat signups. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  deviceId?: string;

  /** FingerprintJS visitorId — advanced canvas/audio/font/webgl fingerprint. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  visitorId?: string;

  /** Server-signed device ID retrieved via SubtleCrypto + IndexedDB persistence. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  signedDeviceId?: string;

  /** Honeypot — must be empty. Bots fill it; humans never see it. */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
