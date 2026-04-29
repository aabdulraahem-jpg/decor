import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface UpsertBody {
  kindCode?: string;
  label?: string;
  icon?: string;
  category?: string;
  hint?: string | null;
  variants?: string[];
  askLength?: boolean;
  askWidth?: boolean;
  askHeight?: boolean;
  askArea?: boolean;
  defaultUnit?: string;
  notesPlaceholder?: string | null;
  drawHint?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

@Injectable()
export class CustomElementsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic() {
    const items = await this.prisma.customElement.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return items.map(this.serialize);
  }

  async listAdmin() {
    const items = await this.prisma.customElement.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return items.map(this.serialize);
  }

  async create(body: UpsertBody) {
    const code = (body.kindCode ?? '').toUpperCase().trim();
    if (!/^[A-Z][A-Z0-9_]{2,38}$/.test(code)) {
      throw new BadRequestException('kindCode يجب أن يكون أحرفاً إنكليزية كبيرة فقط (مثال: FOUNTAIN)');
    }
    if (!body.label || body.label.trim().length < 2) throw new BadRequestException('label مطلوب');
    if (!body.icon || body.icon.length > 8) throw new BadRequestException('icon (إيموجي) مطلوب');
    if (!Array.isArray(body.variants) || body.variants.length === 0) {
      throw new BadRequestException('variants يجب أن يكون قائمة على الأقل بنوع واحد');
    }
    const variants = body.variants.filter((v) => typeof v === 'string' && v.trim().length > 0).slice(0, 30);
    const created = await this.prisma.customElement.create({
      data: {
        kindCode: code,
        label: body.label.trim().slice(0, 120),
        icon: body.icon.trim().slice(0, 8),
        category: ['INTERIOR', 'EXTERIOR'].includes(body.category ?? '') ? body.category! : 'EXTERIOR',
        hint: body.hint?.slice(0, 200) ?? null,
        variantsJson: variants as unknown as object,
        askLength: !!body.askLength,
        askWidth: !!body.askWidth,
        askHeight: !!body.askHeight,
        askArea: !!body.askArea,
        defaultUnit: ['m', 'cm', 'in'].includes(body.defaultUnit ?? '') ? body.defaultUnit! : 'm',
        notesPlaceholder: body.notesPlaceholder?.slice(0, 200) ?? null,
        drawHint: body.drawHint?.slice(0, 300) ?? null,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return this.serialize(created);
  }

  async update(id: string, body: UpsertBody) {
    const existing = await this.prisma.customElement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    const data: Record<string, unknown> = {};
    if (body.label !== undefined) data.label = body.label.trim().slice(0, 120);
    if (body.icon !== undefined) data.icon = body.icon.trim().slice(0, 8);
    if (body.category !== undefined && ['INTERIOR', 'EXTERIOR'].includes(body.category)) data.category = body.category;
    if (body.hint !== undefined) data.hint = body.hint?.slice(0, 200) ?? null;
    if (body.variants !== undefined && Array.isArray(body.variants)) {
      data.variantsJson = body.variants.filter((v) => typeof v === 'string' && v.trim().length > 0).slice(0, 30);
    }
    if (body.askLength !== undefined) data.askLength = !!body.askLength;
    if (body.askWidth !== undefined) data.askWidth = !!body.askWidth;
    if (body.askHeight !== undefined) data.askHeight = !!body.askHeight;
    if (body.askArea !== undefined) data.askArea = !!body.askArea;
    if (body.defaultUnit !== undefined && ['m', 'cm', 'in'].includes(body.defaultUnit)) data.defaultUnit = body.defaultUnit;
    if (body.notesPlaceholder !== undefined) data.notesPlaceholder = body.notesPlaceholder?.slice(0, 200) ?? null;
    if (body.drawHint !== undefined) data.drawHint = body.drawHint?.slice(0, 300) ?? null;
    if (body.isActive !== undefined) data.isActive = !!body.isActive;
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
    const updated = await this.prisma.customElement.update({ where: { id }, data });
    return this.serialize(updated);
  }

  async remove(id: string) {
    await this.prisma.customElement.delete({ where: { id } });
    return { ok: true };
  }

  private serialize = (e: {
    id: string; kindCode: string; label: string; icon: string; category: string; hint: string | null;
    variantsJson: unknown; askLength: boolean; askWidth: boolean; askHeight: boolean; askArea: boolean;
    defaultUnit: string; notesPlaceholder: string | null; drawHint: string | null; isActive: boolean;
    sortOrder: number; createdAt: Date; updatedAt: Date;
  }) => ({
    id: e.id,
    kindCode: e.kindCode,
    label: e.label,
    icon: e.icon,
    category: e.category,
    hint: e.hint,
    variants: Array.isArray(e.variantsJson) ? (e.variantsJson as string[]) : [],
    askLength: e.askLength,
    askWidth: e.askWidth,
    askHeight: e.askHeight,
    askArea: e.askArea,
    defaultUnit: e.defaultUnit,
    notesPlaceholder: e.notesPlaceholder,
    drawHint: e.drawHint,
    isActive: e.isActive,
    sortOrder: e.sortOrder,
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  });
}
