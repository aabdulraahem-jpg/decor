import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';

export interface ApsCheckoutParams {
  merchantIdentifier: string;
  accessCode: string;
  shaRequestPhrase: string;
  baseUrl: string;
  merchantReference: string;
  amountSar: number; // full SAR (e.g. 10.00)
  customerEmail: string;
  customerName: string;
  returnUrl: string;
  language?: 'ar' | 'en';
}

export interface ApsWebhookPayload {
  merchant_identifier: string;
  access_code: string;
  merchant_reference: string;
  fort_id?: string;
  payment_option?: string;
  amount?: string;
  currency?: string;
  response_code?: string;
  response_message?: string;
  status?: string; // '14' = SUCCESS, '12' = HOLD, else FAILED
  signature: string;
  [key: string]: string | undefined;
}

@Injectable()
export class ApsService {
  private readonly logger = new Logger(ApsService.name);

  // Build SHA-256 HMAC signature (same algorithm for request and response)
  computeSignature(params: Record<string, string>, phrase: string): string {
    const sorted = Object.keys(params)
      .filter((k) => k !== 'signature' && params[k] !== undefined && params[k] !== '')
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('');

    const data = `${phrase}${sorted}${phrase}`;
    return createHmac('sha256', phrase).update(data).digest('hex');
  }

  // Build the redirect URL for APS payment page
  buildCheckoutUrl(p: ApsCheckoutParams): string {
    // APS amount is in smallest currency unit (halala for SAR: 1 SAR = 100 halala)
    const amountStr = Math.round(p.amountSar * 100).toString();

    const params: Record<string, string> = {
      command: 'PURCHASE',
      merchant_identifier: p.merchantIdentifier,
      access_code: p.accessCode,
      merchant_reference: p.merchantReference,
      amount: amountStr,
      currency: 'SAR',
      language: p.language ?? 'ar',
      customer_email: p.customerEmail,
      customer_name: p.customerName,
      return_url: p.returnUrl,
    };

    params['signature'] = this.computeSignature(params, p.shaRequestPhrase);

    const query = new URLSearchParams(params).toString();
    return `${p.baseUrl}?${query}`;
  }

  // Verify APS webhook response — returns true if HMAC matches
  verifyWebhook(payload: ApsWebhookPayload, shaResponsePhrase: string): boolean {
    const expected = this.computeSignature(
      payload as unknown as Record<string, string>,
      shaResponsePhrase,
    );
    const isValid = expected === payload.signature;
    if (!isValid) {
      this.logger.warn(`APS signature mismatch. expected=${expected} got=${payload.signature}`);
    }
    return isValid;
  }

  // '14' = success per APS docs
  isSuccess(payload: ApsWebhookPayload): boolean {
    return payload.status === '14' || payload.response_code === '14000';
  }
}
