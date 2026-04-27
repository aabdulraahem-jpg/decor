import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * WhatsApp Cloud API (Meta) — free tier: 1,000 service conversations per
 * month for WhatsApp Business accounts. Sign up at
 * https://developers.facebook.com → WhatsApp → Get Started.
 *
 * Required env vars:
 * - WHATSAPP_PHONE_NUMBER_ID
 * - WHATSAPP_ACCESS_TOKEN  (system user permanent token)
 * - WHATSAPP_TEMPLATE_NAME (defaults to "verify_otp", a pre-approved template)
 *
 * If any are missing, the service is "disabled" and caller should fall
 * back to logging the OTP (admin manual delivery) or email OTP.
 */
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly config: ConfigService) {}

  get isConfigured(): boolean {
    return !!(this.config.get('WHATSAPP_PHONE_NUMBER_ID') && this.config.get('WHATSAPP_ACCESS_TOKEN'));
  }

  /**
   * Sends an OTP code to a phone via a pre-approved Cloud API template.
   * Returns true on accepted-by-Meta, false on any failure (caller should
   * fall back).
   */
  async sendOtp(phoneE164: string, code: string): Promise<boolean> {
    if (!this.isConfigured) return false;
    const phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    const accessToken = this.config.get<string>('WHATSAPP_ACCESS_TOKEN');
    const template = this.config.get<string>('WHATSAPP_TEMPLATE_NAME') ?? 'verify_otp';

    // Meta Cloud API expects E.164 without leading +
    const to = phoneE164.replace(/^\+/, '');

    try {
      const r = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: template,
            language: { code: 'ar' },
            components: [
              {
                type: 'body',
                parameters: [{ type: 'text', text: code }],
              },
              // Some templates require the OTP as a button parameter too:
              {
                type: 'button',
                sub_type: 'url',
                index: '0',
                parameters: [{ type: 'text', text: code }],
              },
            ],
          },
        }),
      });
      if (!r.ok) {
        const text = await r.text().catch(() => '');
        this.logger.error(`WhatsApp send failed (${r.status}): ${text}`);
        return false;
      }
      return true;
    } catch (e) {
      this.logger.error(`WhatsApp send threw: ${(e as Error).message}`);
      return false;
    }
  }
}
