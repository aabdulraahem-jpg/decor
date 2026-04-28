import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactKind, ContactStatus } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../prisma/prisma.service';

const KINDS: ContactKind[] = ['GENERAL', 'IMPLEMENTATION', 'PARTNERSHIP', 'SUPPORT'];
const STATUSES: ContactStatus[] = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'];
const NOTIFY_EMAIL = 'project@sufuf.pro';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {
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

  async submit(
    body: { name: string; email: string; phone?: string; subject?: string; kind?: string; message: string },
    ip?: string,
    ua?: string,
  ) {
    const name = (body.name ?? '').trim();
    const email = (body.email ?? '').trim().toLowerCase();
    const message = (body.message ?? '').trim();
    if (!name || name.length < 2) throw new BadRequestException('الاسم مطلوب');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new BadRequestException('بريد إلكتروني غير صحيح');
    if (!message || message.length < 5) throw new BadRequestException('الرسالة قصيرة جداً');
    if (message.length > 5000) throw new BadRequestException('الرسالة طويلة جداً');

    const kind = (KINDS as string[]).includes(body.kind ?? '') ? (body.kind as ContactKind) : 'GENERAL';

    const created = await this.prisma.contactMessage.create({
      data: {
        name: name.slice(0, 120),
        email: email.slice(0, 255),
        phone: body.phone?.trim().slice(0, 40) || null,
        subject: body.subject?.trim().slice(0, 200) || null,
        kind,
        message: message.slice(0, 5000),
        ipAddress: ip,
        userAgent: ua?.slice(0, 500),
      },
    });

    // Best-effort notify project@sufuf.pro — don't fail the request if email fails
    void this.notify(created).catch((err) => this.logger.warn(`notify failed: ${err?.message ?? err}`));

    return { ok: true, id: created.id };
  }

  private async notify(msg: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    kind: ContactKind;
    message: string;
    createdAt: Date;
  }) {
    if (!this.transporter) {
      this.logger.warn('SMTP not configured — cannot send notification email');
      return;
    }
    const from = this.config.get<string>('SMTP_FROM') ?? 'Sufuf <noreply@sufuf.pro>';
    const kindLabel = ({
      GENERAL: 'استفسار عام',
      IMPLEMENTATION: 'طلب تنفيذ ديكور (جدّة)',
      PARTNERSHIP: 'شراكة',
      SUPPORT: 'دعم فني',
    } as Record<ContactKind, string>)[msg.kind];

    const safe = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    try {
      await this.transporter.sendMail({
        from,
        to: NOTIFY_EMAIL,
        replyTo: msg.email,
        subject: `[صفوف رايقة · ${kindLabel}] ${msg.subject ?? msg.name}`,
        html: `
<!DOCTYPE html><html dir="rtl" lang="ar"><body style="font-family:Tahoma,Arial,sans-serif;background:#faf7f2;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;padding:28px;border:1px solid #eee;">
    <div style="font-size:22px;font-weight:900;color:#0d1b2a;margin-bottom:4px;">رسالة جديدة من sufuf.pro</div>
    <div style="display:inline-block;background:#c9a55c20;color:#7d6450;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700;margin-bottom:18px;">${kindLabel}</div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
      <tr><td style="padding:6px 0;color:#888;width:90px;">الاسم</td><td style="padding:6px 0;font-weight:700;">${safe(msg.name)}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">البريد</td><td style="padding:6px 0;direction:ltr;text-align:right;"><a href="mailto:${safe(msg.email)}" style="color:#7d6450;">${safe(msg.email)}</a></td></tr>
      ${msg.phone ? `<tr><td style="padding:6px 0;color:#888;">الجوال</td><td style="padding:6px 0;direction:ltr;text-align:right;">${safe(msg.phone)}</td></tr>` : ''}
      ${msg.subject ? `<tr><td style="padding:6px 0;color:#888;">الموضوع</td><td style="padding:6px 0;">${safe(msg.subject)}</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#888;">التاريخ</td><td style="padding:6px 0;">${msg.createdAt.toLocaleString('ar-SA')}</td></tr>
    </table>
    <div style="margin-top:18px;padding:14px;background:#faf7f2;border-radius:10px;line-height:1.8;white-space:pre-wrap;">${safe(msg.message)}</div>
    <div style="margin-top:18px;font-size:12px;color:#999;">معرّف الرسالة: ${msg.id}</div>
  </div>
</body></html>`,
        text: `${kindLabel}\n\nالاسم: ${msg.name}\nالبريد: ${msg.email}\n${msg.phone ? `الجوال: ${msg.phone}\n` : ''}${msg.subject ? `الموضوع: ${msg.subject}\n` : ''}\n${msg.message}`,
      });

      await this.prisma.contactMessage.update({
        where: { id: msg.id },
        data: { emailSent: true },
      });
    } catch (err) {
      this.logger.error(`failed to email ${NOTIFY_EMAIL}: ${(err as Error).message}`);
      throw err;
    }
  }

  async list(filter: { status?: string; kind?: string }) {
    const where: Record<string, unknown> = {};
    if (filter.status && (STATUSES as string[]).includes(filter.status)) where.status = filter.status;
    if (filter.kind && (KINDS as string[]).includes(filter.kind)) where.kind = filter.kind;
    return this.prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async stats() {
    const [total, unread, implementation] = await Promise.all([
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({ where: { status: 'NEW' } }),
      this.prisma.contactMessage.count({ where: { kind: 'IMPLEMENTATION' } }),
    ]);
    return { total, unread, implementation };
  }

  async update(id: string, body: { status?: string; adminNote?: string }) {
    const existing = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    const data: Record<string, unknown> = {};
    if (body.status && (STATUSES as string[]).includes(body.status)) {
      data.status = body.status;
      if (body.status === 'READ' && !existing.readAt) data.readAt = new Date();
    }
    if (typeof body.adminNote === 'string') data.adminNote = body.adminNote.slice(0, 2000);
    return this.prisma.contactMessage.update({ where: { id }, data });
  }
}
