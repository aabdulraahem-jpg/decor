import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';
import * as geoip from 'geoip-lite';
import { createHash } from 'crypto';

/**
 * Anti-abuse + phone validation utilities.
 *
 * Centralised so the auth + phone flows reuse the same hashing,
 * normalisation, and geo logic.
 */
@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly phoneUtil = PhoneNumberUtil.getInstance();

  constructor(private readonly config: ConfigService) {}

  private get pepper(): string {
    // Hash secret — same JWT_SECRET is fine, it's never exposed
    return this.config.get<string>('JWT_SECRET') ?? 'sufuf-default-pepper';
  }

  // ── Phone normalisation + hash ──────────────────────────────────────

  /** Returns E.164 (e.g. +966501234567) or null if invalid. Default region SA. */
  normalisePhone(input: string, defaultRegion = 'SA'): string | null {
    try {
      const num = this.phoneUtil.parseAndKeepRawInput(input.trim(), defaultRegion);
      if (!this.phoneUtil.isValidNumber(num)) return null;
      return this.phoneUtil.format(num, PhoneNumberFormat.E164);
    } catch {
      return null;
    }
  }

  /** ISO 3166-1 alpha-2 country code from a phone number, or null. */
  phoneCountry(input: string, defaultRegion = 'SA'): string | null {
    try {
      const num = this.phoneUtil.parseAndKeepRawInput(input.trim(), defaultRegion);
      return this.phoneUtil.getRegionCodeForNumber(num) ?? null;
    } catch {
      return null;
    }
  }

  /** Stable SHA-256 of the E.164 number with server pepper — used for unique check. */
  hashPhone(e164: string): string {
    return createHash('sha256').update(`${e164}|${this.pepper}`).digest('hex');
  }

  // ── Geolocation ─────────────────────────────────────────────────────

  /** ISO country code from IP, e.g. "SA". Uses local geoip-lite (offline). */
  ipCountry(ip?: string): string | null {
    if (!ip) return null;
    const stripped = ip.replace(/^::ffff:/, '');
    try {
      const r = geoip.lookup(stripped);
      return r?.country ?? null;
    } catch {
      return null;
    }
  }

  geoMismatch(phoneE164: string | null, ip?: string): boolean {
    if (!phoneE164 || !ip) return false;
    const pc = this.phoneCountry(phoneE164);
    const ipC = this.ipCountry(ip);
    if (!pc || !ipC) return false;
    return pc !== ipC;
  }

  // ── Browser fingerprint hash ────────────────────────────────────────

  /** Hashes the raw FingerprintJS visitorId with server pepper. */
  hashBrowserFingerprint(visitorId: string): string {
    return createHash('sha256').update(`bfp|${visitorId}|${this.pepper}`).digest('hex');
  }

  /** Hashes the client-supplied SubtleCrypto-signed device ID. */
  hashSignedDeviceId(signedId: string): string {
    return createHash('sha256').update(`sdi|${signedId}|${this.pepper}`).digest('hex');
  }
}
