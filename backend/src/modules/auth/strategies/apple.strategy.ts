import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
// passport-apple ليس له types رسمية مكتملة — استخدم require
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AppleStrategy = require('passport-apple');

@Injectable()
export class AppleStrategy_ extends PassportStrategy(AppleStrategy, 'apple') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('APPLE_CLIENT_ID') ?? 'placeholder',
      teamID: config.get<string>('APPLE_TEAM_ID') ?? 'placeholder',
      keyID: config.get<string>('APPLE_KEY_ID') ?? 'placeholder',
      privateKeyString: config.get<string>('APPLE_PRIVATE_KEY') ?? 'placeholder',
      callbackURL:
        config.get<string>('APPLE_CALLBACK_URL') ??
        'https://api.sufuf.pro/auth/apple/callback',
      scope: ['email', 'name'],
    });
  }

  // TODO: ربط مع AuthService.findOrCreateOAuthUser('apple', profile)
  async validate(
    _accessToken: string,
    _refreshToken: string,
    idToken: { sub: string; email?: string },
    profile: unknown,
    done: (err: Error | null, user?: unknown) => void,
  ): Promise<void> {
    const user = {
      provider: 'apple' as const,
      providerId: idToken.sub,
      email: idToken.email,
      raw: profile,
    };
    done(null, user);
  }
}

// Re-export under expected name (avoid naming collision with library symbol)
export { AppleStrategy_ as AppleStrategy };
