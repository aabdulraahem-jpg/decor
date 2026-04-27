import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const SINGLETON_ID = 'singleton';

const DEFAULTS = {
  brandName: 'صفوف رايقة',
  brandTagline: 'ديكور رايق بلمسة الذكاء',
  heroEyebrow: 'جديد · مدعوم بـ gpt-image-2',
  heroTitle: 'حوّل غرفتك إلى تحفة بضغطة واحدة',
  heroSubtitle: 'ارفع صورة غرفتك واختر العينات وقل ما تتمنى. الذكاء الاصطناعي يُسلّمك تصميماً واقعياً بدقّة 4K خلال ثوانٍ.',
  ctaPrimary: 'جرّب مجاناً الآن',
  ctaSecondary: 'شاهد أمثلة التصاميم',
  trustLine: 'بدون بطاقة ائتمان · 5 تصاميم مجانية · يلتزم بهوية البيت السعودي',
  freeQuotaText: 'احصل على 5 تصاميم مجانية فور التسجيل',
};

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  async getContent() {
    let row = await this.prisma.siteContent.findUnique({ where: { id: SINGLETON_ID } });
    if (!row) {
      row = await this.prisma.siteContent.create({ data: { id: SINGLETON_ID, ...DEFAULTS } });
    }
    return row;
  }

  async updateContent(data: Prisma.SiteContentUpdateInput) {
    return this.prisma.siteContent.upsert({
      where: { id: SINGLETON_ID },
      create: { id: SINGLETON_ID, ...DEFAULTS, ...(data as Prisma.SiteContentCreateInput) },
      update: data,
    });
  }

  // ── Showcase ──

  listShowcasePublic() {
    return this.prisma.showcase.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  listShowcaseAdmin() {
    return this.prisma.showcase.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  createShowcase(data: { title: string; imageUrl: string; description?: string; badge?: string; sortOrder?: number; isActive?: boolean }) {
    return this.prisma.showcase.create({ data });
  }

  updateShowcase(id: string, data: Partial<{ title: string; imageUrl: string; description: string; badge: string; sortOrder: number; isActive: boolean }>) {
    return this.prisma.showcase.update({ where: { id }, data });
  }

  deleteShowcase(id: string) {
    return this.prisma.showcase.delete({ where: { id } });
  }
}
