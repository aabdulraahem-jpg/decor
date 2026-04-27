import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Free email OTP — works with any SMTP. Recommended:
 * - Gmail (App Password): SMTP_HOST=smtp.gmail.com SMTP_PORT=465
 * - Mailgun free tier
 * - SendGrid free 100/day
 * - Brevo (Sendinblue) free 300/day
 *
 * Required env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */
@Injectable()
export class EmailOtpService {
  private readonly logger = new Logger(EmailOtpService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 0);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  get isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendOtp(toEmail: string, code: string): Promise<boolean> {
    if (!this.transporter) return false;
    const from = this.config.get<string>('SMTP_FROM') ?? 'Sufuf <noreply@sufuf.pro>';
    try {
      await this.transporter.sendMail({
        from,
        to: toEmail,
        subject: `رمز التحقق صفوف رايقة: ${code}`,
        html: `
<!DOCTYPE html><html dir="rtl" lang="ar"><body style="font-family:Tahoma,Arial,sans-serif;background:#faf7f2;padding:24px;">
  <div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;padding:32px;border:1px solid #eee;">
    <div style="text-align:center;font-size:28px;font-weight:900;color:#0d1b2a;">صفوف رايقة</div>
    <h2 style="color:#0d1b2a;margin-top:24px;">رمز التحقق الخاص بك</h2>
    <p style="color:#666;line-height:1.7;">استخدم الرمز التالي لإكمال التحقق من حسابك. صلاحيته 10 دقائق.</p>
    <div style="text-align:center;margin:24px 0;">
      <div style="display:inline-block;background:#c9a55c;color:#0d1b2a;font-weight:900;font-size:36px;letter-spacing:0.4em;padding:16px 28px;border-radius:12px;">${code}</div>
    </div>
    <p style="color:#999;font-size:12px;line-height:1.7;">إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.</p>
  </div>
</body></html>`,
        text: `رمز التحقق: ${code} (صلاحيته 10 دقائق)`,
      });
      return true;
    } catch (e) {
      this.logger.error(`Email OTP send failed: ${(e as Error).message}`);
      return false;
    }
  }
}
