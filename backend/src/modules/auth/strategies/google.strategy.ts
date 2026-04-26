import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') ?? 'placeholder',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') ?? 'placeholder',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') ??
        'https://api.sufuf.pro/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  // TODO: ربط مع AuthService.findOrCreateOAuthUser('google', profile)
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, displayName } = profile;
    const user = {
      provider: 'google' as const,
      providerId: id,
      email: emails?.[0]?.value,
      name: displayName,
    };
    done(null, user);
  }
}
