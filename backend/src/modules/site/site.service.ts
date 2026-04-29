import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const SINGLETON_ID = 'singleton';

const DEFAULTS = {
  brandName: 'المصمّم الأفضل',
  brandTagline: 'ديكور رايق بلمسة الذكاء',
  heroEyebrow: 'جديد · مدعوم بـ gpt-image-2',
  heroTitle: 'تخيّل بيتك… كما تتمنّاه تماماً',
  heroSubtitle: 'ارفع صورة غرفتك، اختَر النمط واللون والعناصر، ودَع الذكاء الاصطناعي يرسم لك مشهداً واقعياً بدقّة 4K خلال ثوانٍ — جاهز لتنفّذه.',
  ctaPrimary: 'ابدأ تجربتك المجانية',
  ctaSecondary: 'شاهد أمثلة التصاميم',
  trustLine: 'بدون بطاقة ائتمان · 5 نقاط مجاناً · جودة احترافية',
  freeQuotaText: 'احصل على 5 نقاط مجاناً فور التسجيل',
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
