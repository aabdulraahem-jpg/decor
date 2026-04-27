import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import TeaserStudio from '@/components/teaser-studio';
import { getSiteContentPublic, listShowcasePublic, SiteContent, Showcase } from '@/lib/api';

export const revalidate = 60;

const FALLBACK_SITE: SiteContent = {
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

const FEATURES = [
  { icon: '🪄', title: 'تصميم خلال ثوانٍ', desc: 'اختر العينات أو اكتب وصفك، وستحصل على تصميم احترافي بدقّة 4K في 10-30 ثانية.' },
  { icon: '🎨', title: '+250 عيّنة قابلة للتخصيص', desc: 'مكتبة غنيّة من الجدران، البلاط، الأثاث، الإضاءة، والإكسسوارات — مع لوحة ألوان مشتركة.' },
  { icon: '🏠', title: '28 نوع مساحة', desc: 'من المجلس النجدي إلى المحل التجاري والاستراحة والحديقة — أو اكتب نوعك المخصّص.' },
  { icon: '🇸🇦', title: 'هويّة سعودية أصيلة', desc: 'يفهم المجلس، النجدي التقليدي، الجلسات العائلية، والتفاصيل الخليجية المميزة.' },
  { icon: '🔒', title: 'بياناتك محميّة', desc: 'تشفير كامل، Cloudflare Turnstile، قفل تلقائي بعد محاولات الدخول الفاشلة.' },
  { icon: '💳', title: 'دفع آمن وموثوق', desc: 'مدى، Apple Pay، فيزا، ماستركارد عبر Amazon Payment Services المعتمدة في السعودية.' },
];

const HOW_IT_WORKS = [
  { n: 1, title: 'ارفع صورة غرفتك', desc: 'JPG أو PNG — تتحوّل تلقائياً لـ WebP محسّن' },
  { n: 2, title: 'اختر النمط والعينات', desc: 'مودرن، كلاسيك، عربي، نجدي... + العينات والألوان' },
  { n: 3, title: 'اضغط توليد', desc: 'تنتظر 15 ثانية، تستلم تصميماً جاهزاً بدقّة 4K' },
  { n: 4, title: 'حمّل وشارك', desc: 'تصميماتك تُحفظ في حسابك للوصول لها أي وقت' },
];

export default async function HomePage() {
  const [siteRaw, showcaseRaw] = await Promise.all([
    getSiteContentPublic().catch(() => FALLBACK_SITE),
    listShowcasePublic().catch(() => [] as Showcase[]),
  ]);
  const site: SiteContent = siteRaw ?? FALLBACK_SITE;
  const showcase: Showcase[] = (showcaseRaw ?? []).filter((s) => !!s.imageUrl); // hide unfilled placeholders

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero-bg">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            {site.heroEyebrow && (
              <span className="badge bg-gold/15 text-gold-dark mb-5">{site.heroEyebrow}</span>
            )}
            <h1 className="display text-4xl md:text-6xl font-black text-navy leading-[1.1] mb-5">
              {site.heroTitle}
            </h1>
            {site.heroSubtitle && (
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-7 max-w-xl">
                {site.heroSubtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mb-4">
              <Link href="/register" className="btn-primary text-lg px-8 py-4">{site.ctaPrimary} →</Link>
              {site.ctaSecondary && (
                <a href="#showcase" className="btn-secondary text-lg px-7 py-4">{site.ctaSecondary}</a>
              )}
            </div>
            {site.trustLine && (
              <div className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                {site.trustLine}
              </div>
            )}
          </div>

          <div className="relative">
            {site.heroImageUrl ? (
              <img src={site.heroImageUrl} alt="" className="w-full aspect-[5/4] object-cover rounded-3xl shadow-2xl shadow-navy/20" />
            ) : (
              <div className="aspect-[5/4] bg-gradient-to-br from-gold/30 to-navy/10 rounded-3xl shadow-2xl shadow-navy/10 flex items-center justify-center text-7xl">🛋️</div>
            )}
            <div className="absolute -bottom-5 -right-5 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 max-w-[180px]">
              <div className="font-black text-navy text-lg">+250</div>
              <div className="text-xs text-gray-500">عيّنة وعنصر تصميم جاهز</div>
            </div>
            <div className="absolute -top-5 -left-5 bg-white rounded-2xl shadow-xl p-3 border border-gray-100 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="text-xs font-bold text-navy">30 ثانية</div>
                <div className="text-[10px] text-gray-500">حتى التصميم الأول</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teaser Studio */}
      <section id="teaser" className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="section-eyebrow">⚡ جرّب الآن</span>
            <h2 className="section-title">شاهد التحوّل بعينيك</h2>
            <p className="section-subtitle mx-auto">ارفع صورة غرفتك الفعلية واترك الذكاء الاصطناعي يعرض لك معاينة سريعة. لا حاجة لتسجيل الدخول.</p>
          </div>
          <TeaserStudio />
        </div>
      </section>

      {/* Showcase / Examples */}
      {showcase.length > 0 && (
        <section id="showcase" className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="section-eyebrow">معرض الأعمال</span>
              <h2 className="section-title">أمثلة من تصاميمنا</h2>
              <p className="section-subtitle mx-auto">صور حقيقية لتصاميم أنتجها الذكاء الاصطناعي على منصّتنا.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {showcase.map((s) => (
                <article key={s.id} className="group relative rounded-3xl overflow-hidden bg-cream shadow-sm hover:shadow-2xl transition-all">
                  <img src={s.imageUrl} alt={s.title} className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/0 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  <div className="absolute bottom-0 right-0 left-0 p-4 text-white opacity-0 group-hover:opacity-100 transition">
                    {s.badge && <span className="badge bg-gold/30 backdrop-blur text-gold-dark mb-2">{s.badge}</span>}
                    <div className="font-black text-lg">{s.title}</div>
                    {s.description && <div className="text-xs text-gray-200 mt-0.5 line-clamp-2">{s.description}</div>}
                  </div>
                  {/* Always-visible footer for mobile */}
                  <div className="p-4 sm:hidden">
                    {s.badge && <span className="badge bg-gold/15 text-gold-dark mb-1">{s.badge}</span>}
                    <div className="font-bold text-navy">{s.title}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-eyebrow">كيف تعمل؟</span>
            <h2 className="section-title">من الفكرة للتصميم في 4 خطوات</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n} className="card relative">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-gold to-gold-dark text-navy rounded-2xl flex items-center justify-center font-black text-xl shadow-md">{s.n}</div>
                <div className="font-black text-navy text-lg mb-1 mt-2">{s.title}</div>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-eyebrow">لماذا نحن</span>
            <h2 className="section-title">كل ما تحتاجه لتصميم احترافي</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card hover:border-gold/30 transition">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-black text-navy text-lg mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section className="py-16 md:py-24 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-10" />
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <h2 className="display text-3xl md:text-5xl font-black mb-4">جاهز لتحوّل غرفتك؟</h2>
          <p className="text-gray-300 mb-7 text-lg">{site.freeQuotaText ?? 'احصل على 5 تصاميم مجانية فور التسجيل'}</p>
          <Link href="/register" className="btn-primary text-lg px-10 py-5">إنشاء حساب مجاني</Link>
          <div className="text-xs text-gray-400 mt-4">لن نطلب بطاقتك الائتمانية للتجربة المجانية</div>
        </div>
      </section>

      <Footer />
    </>
  );
}
