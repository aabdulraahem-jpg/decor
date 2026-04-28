import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import * as QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';

const COMPANY = {
  name: 'مؤسسة صفوف رايقة',
  nameEn: 'Sufuf Rayqah Establishment',
  domain: 'sufuf.pro',
  email: 'support@sufuf.pro',
  phone: '+966 57 020 5674',
  address: 'جدّة، حيّ البوادي، مبنى 2475، الرمز البريدي 23531',
  addressEn: 'Jeddah, Al Bawadi, Bldg 2475, P.O. 23531, Saudi Arabia',
  unifiedNumber: '7054166389',
  vat: '', // VAT number when registered — leave blank for now
};

const VAT_RATE = 0.15; // KSA standard VAT 15%

@Injectable()
export class PdfService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a tax invoice PDF for a successful transaction.
   * Returns the buffer; controller streams it to the client.
   */
  async invoiceForTransaction(transactionId: string, userId: string): Promise<Buffer> {
    const tx = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: { select: { id: true, name: true, email: true } }, package: true },
    });
    if (!tx) throw new NotFoundException('العملية غير موجودة');
    if (tx.userId !== userId) throw new NotFoundException();

    const amountSar = Number(tx.amountPaid ?? 0);
    const subtotal = amountSar / (1 + VAT_RATE);
    const vat = amountSar - subtotal;

    const qrPayload = `${COMPANY.name}|${COMPANY.unifiedNumber}|${tx.id}|${amountSar.toFixed(2)} SAR|${tx.createdAt.toISOString()}`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 200 });
    const qrBuf = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header bar
      doc.rect(0, 0, doc.page.width, 90).fill('#2c2e3a');
      doc.fillColor('#a8896d').fontSize(28).font('Helvetica-Bold').text('SUFUF', 48, 30);
      doc.fillColor('#ffffff').fontSize(11).font('Helvetica').text(COMPANY.nameEn, 48, 60);
      doc.fillColor('#cbd5e1').fontSize(9).text(COMPANY.domain, 48, 74);

      // Right side: TAX INVOICE
      doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('TAX INVOICE', doc.page.width - 200, 30, { width: 152, align: 'right' });
      doc.fillColor('#cbd5e1').fontSize(9).font('Helvetica').text('فاتورة ضريبية مبسّطة', doc.page.width - 200, 50, { width: 152, align: 'right' });
      doc.text(`#${tx.id.slice(-12).toUpperCase()}`, doc.page.width - 200, 64, { width: 152, align: 'right' });

      // Body
      doc.moveDown(2);
      doc.fillColor('#2c2e3a').fontSize(10).font('Helvetica');

      // Two-column header info
      const top = 110;
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#7d6450').text('FROM / من', 48, top);
      doc.font('Helvetica').fontSize(10).fillColor('#2c2e3a')
        .text(COMPANY.nameEn, 48, top + 14)
        .text(COMPANY.addressEn, 48, top + 28, { width: 240 })
        .text(`${COMPANY.email}  ·  ${COMPANY.phone}`, 48, top + 56)
        .text(`Unified No: ${COMPANY.unifiedNumber}`, 48, top + 70);

      doc.font('Helvetica-Bold').fontSize(9).fillColor('#7d6450').text('TO / إلى', 320, top);
      doc.font('Helvetica').fontSize(10).fillColor('#2c2e3a')
        .text(tx.user.name ?? '—', 320, top + 14)
        .text(tx.user.email, 320, top + 28);

      // Meta
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#7d6450').text('Date / التاريخ', 48, top + 100);
      doc.font('Helvetica').fontSize(10).fillColor('#2c2e3a').text(tx.createdAt.toISOString().slice(0, 10), 48, top + 114);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#7d6450').text('Status / الحالة', 200, top + 100);
      doc.font('Helvetica').fontSize(10).fillColor(tx.status === 'SUCCESS' ? '#15803d' : '#b45309').text(tx.status, 200, top + 114);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#7d6450').text('Method', 320, top + 100);
      doc.font('Helvetica').fontSize(10).fillColor('#2c2e3a').text(tx.apsPaymentMethod ?? 'Card', 320, top + 114);

      // Line items
      const tableTop = top + 160;
      doc.rect(48, tableTop, doc.page.width - 96, 22).fill('#f7f3ec');
      doc.fillColor('#2c2e3a').font('Helvetica-Bold').fontSize(10);
      doc.text('Description / الوصف', 56, tableTop + 6);
      doc.text('Qty', 360, tableTop + 6);
      doc.text('Unit', 410, tableTop + 6);
      doc.text('Amount (SAR)', doc.page.width - 160, tableTop + 6, { width: 110, align: 'right' });

      doc.fillColor('#2c2e3a').font('Helvetica').fontSize(10);
      const desc = `${tx.package?.name ?? 'Sufuf Points Package'} (${tx.pointsAdded ?? 0} points)`;
      doc.text(desc, 56, tableTop + 32, { width: 280 });
      doc.text('1', 360, tableTop + 32);
      doc.text(subtotal.toFixed(2), 410, tableTop + 32);
      doc.text(subtotal.toFixed(2), doc.page.width - 160, tableTop + 32, { width: 110, align: 'right' });

      // Totals
      const totalsY = tableTop + 80;
      doc.font('Helvetica').fontSize(10);
      doc.text('Subtotal:', doc.page.width - 240, totalsY, { width: 120, align: 'right' });
      doc.text(`${subtotal.toFixed(2)} SAR`, doc.page.width - 110, totalsY, { width: 70, align: 'right' });
      doc.text(`VAT (15%):`, doc.page.width - 240, totalsY + 16, { width: 120, align: 'right' });
      doc.text(`${vat.toFixed(2)} SAR`, doc.page.width - 110, totalsY + 16, { width: 70, align: 'right' });
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#7d6450');
      doc.text('TOTAL:', doc.page.width - 240, totalsY + 38, { width: 120, align: 'right' });
      doc.text(`${amountSar.toFixed(2)} SAR`, doc.page.width - 110, totalsY + 38, { width: 70, align: 'right' });

      // QR code (ZATCA-style placeholder — the layout is right; the encoded
      // payload should be replaced with the official ZATCA TLV when VAT-registered)
      doc.image(qrBuf, 48, totalsY, { width: 90, height: 90 });
      doc.fontSize(8).fillColor('#7d6450').text('Scan to verify', 48, totalsY + 92, { width: 90, align: 'center' });

      // Footer
      doc.rect(0, doc.page.height - 60, doc.page.width, 60).fill('#f7f3ec');
      doc.fillColor('#7d6450').fontSize(9).font('Helvetica')
        .text(COMPANY.address, 48, doc.page.height - 50, { width: doc.page.width - 96, align: 'center' })
        .fillColor('#999').fontSize(8)
        .text(`Generated on ${new Date().toISOString()}  ·  ${COMPANY.domain}`, 48, doc.page.height - 30, { width: doc.page.width - 96, align: 'center' });

      doc.end();
    });
  }

  /**
   * Generate a presentation PDF for a single design.
   * The image is fetched server-side and embedded.
   */
  async designPresentation(designId: string, userId: string): Promise<Buffer> {
    const design = await this.prisma.design.findUnique({
      where: { id: designId },
      include: { project: true },
    });
    if (!design) throw new NotFoundException();
    if (design.project.userId !== userId) throw new NotFoundException();

    // Fetch the image bytes
    const imgUrl = design.generatedImageUrl;
    let imgBuf: Buffer | null = null;
    if (imgUrl) {
      try {
        const res = await fetch(imgUrl);
        if (res.ok) imgBuf = Buffer.from(await res.arrayBuffer());
      } catch { /* leave null */ }
    }

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 36 });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.rect(0, 0, doc.page.width, 70).fill('#2c2e3a');
      doc.fillColor('#a8896d').fontSize(24).font('Helvetica-Bold').text('SUFUF', 36, 22);
      doc.fillColor('#cbd5e1').fontSize(10).font('Helvetica').text(COMPANY.domain, 36, 50);
      doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold')
        .text(design.project.name ?? 'Sufuf Design', doc.page.width - 250, 24, { width: 214, align: 'right' });
      doc.fillColor('#cbd5e1').fontSize(9).font('Helvetica')
        .text(design.createdAt.toISOString().slice(0, 10), doc.page.width - 250, 48, { width: 214, align: 'right' });

      // Image
      if (imgBuf) {
        doc.image(imgBuf, 36, 100, { fit: [doc.page.width - 72, 480], align: 'center', valign: 'center' });
      } else {
        doc.fillColor('#999').fontSize(12).text('Image not available', 36, 250, { width: doc.page.width - 72, align: 'center' });
      }

      // Footer info card
      const footerY = doc.page.height - 130;
      doc.rect(36, footerY, doc.page.width - 72, 80).fill('#f7f3ec').stroke('#a8896d');
      doc.fillColor('#2c2e3a').fontSize(11).font('Helvetica-Bold').text('Project / المشروع', 50, footerY + 12);
      doc.font('Helvetica').fontSize(10).text(design.project.name ?? '—', 50, footerY + 28);
      if (design.project.roomType) doc.fillColor('#666').fontSize(9).text(`Space: ${design.project.roomType}`, 50, footerY + 44);

      doc.fillColor('#7d6450').fontSize(9).font('Helvetica')
        .text('Want to bring this design to life in Jeddah?', 50, footerY + 60)
        .fillColor('#2c2e3a').font('Helvetica-Bold').fontSize(10)
        .text(`${COMPANY.phone}  ·  ${COMPANY.email}  ·  ${COMPANY.domain}/implementation`, doc.page.width / 2, footerY + 60, { width: (doc.page.width - 72) / 2 - 20, align: 'right' });

      doc.fillColor('#999').fontSize(7).font('Helvetica')
        .text(`© ${new Date().getFullYear()} ${COMPANY.name} · ${COMPANY.unifiedNumber}`, 36, doc.page.height - 30, { width: doc.page.width - 72, align: 'center' });

      doc.end();
    });
  }
}
