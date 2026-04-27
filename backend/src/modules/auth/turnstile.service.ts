import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  hostname?: string;
  action?: string;
}

@Injectable()
export class TurnstileService {
  private readonly logger = new Logger(TurnstileService.name);

  constructor(private readonly config: ConfigService) {}

  private get secret(): string | undefined {
    return this.config.get<string>('TURNSTILE_SECRET_KEY');
  }

  get isEnabled(): boolean {
    return !!this.secret && this.secret.length > 0;
  }

  async verify(token: string | undefined, ip?: string): Promise<void> {
    if (!this.isEnabled) return;
    if (!token) throw new UnauthorizedException('Captcha token missing');

    const body = new URLSearchParams();
    body.append('secret', this.secret!);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);

    let res: Response;
    try {
      res = await fetch(VERIFY_URL, { method: 'POST', body });
    } catch (e) {
      this.logger.error(`Turnstile network error: ${(e as Error).message}`);
      throw new UnauthorizedException('Captcha verification unavailable');
    }

    const data = (await res.json()) as TurnstileVerifyResponse;
    if (!data.success) {
      this.logger.warn(`Turnstile rejected: ${(data['error-codes'] ?? []).join(',')}`);
      throw new UnauthorizedException('Captcha verification failed');
    }
  }
}
