import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import TeaserStudio from '@/components/teaser-studio';
import HeroVisual from '@/components/hero-visual';
import { getSiteContentPublic, listShowcasePublic, SiteContent, Showcase } from '@/lib/api';

export const revalidate = 60;

const FALLBACK_SITE: SiteContent = {
  brandName: 'صفوف رايقة',
  brandTagline: 'ديكور رايق بلمسة الذكاء',
  heroEyebrow: 'جديد · مدعوم بـ gpt-image-2',
  heroTitle: 'تخيّل بيتك… كما تتمنّاه تماماً',
  heroSubtitle: 'ارفع صورة غرفتك، اختَر النمط واللون والعناصر، ودَع الذكاء الاصطناعي يرسم لك مشهداً واقعياً بدقّة 4K خلال ثوانٍ — جاهز لتنفّذه.',
  ctaPrimary: 'ابدأ تجربتك المجانية',
  ctaSecondary: 'شاهد أمثلة التصاميم',
  trustLine: 'بدون بطاقة ائتمان · 5 نقاط مجاناً · جودة احترافية',
  freeQuotaText: 'احصل على 5 نقاط مجاناً فور التسجيل',
};

const FEATURES = [
  { icon: '🪄', title: 'تصميم خلال ثوانٍ', desc: 'اختر العينات أو اكتب وصفك، وستحصل على تصميم احترافي بدقّة 4K في 10-30 ثانية.' },
  { icon: '🎨', title: '+250 عيّنة قابلة للتخصيص', desc: 'مكتبة غنيّة من الجدران، البلاط، الأثاث، الإضاءة، والإكسسوارات — مع لوحة ألوان مشتركة.' },
  { icon: '🏠', title: '28 نوع مساحة', desc: 'من المجالس وغرف المعيشة إلى المحلات التجارية والحدائق والاستراحات — أو اكتب نوعك المخصّص.' },
  { icon: '🤖', title: 'ذكاء يفهم ذوقك', desc: 'يدمج العناصر التي تختارها بأناقة ويحترم تفاصيل الأثاث، الإضاءة، والمواد.' },
  { icon: '🔒', title: 'بياناتك محميّة', desc: 'تشفير كامل، Cloudflare Turnstile، قفل تلقائي بعد محاولات الدخول الفاشلة.' },
  { icon: '💳', title: 'دفع آمن وموثوق', desc: 'بطاقات فيزا، ماستركارد، Apple Pay عبر بوابة دفع مشفّرة بالكامل.' },
];

const HOW_IT_WORKS = [
  { n: 1, title: 'ارفع صورة غرفتك', desc: 'JPG أو PNG — تتحوّل تلقائياً لـ WebP محسّن' },
  { n: 2, title: 'اختر النمط والعينات', desc: 'مودرن، كلاسيك، عربي، متوسطي... + العينات والألوان' },
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
              <span className="badge bg-clay/15 text-clay-dark mb-5">{site.heroEyebrow}</span>
            )}
            <h1 className="display text-4xl md:text-6xl font-black text-navy leading-[1.1] mb-5">
              {site.heroTitle}
            </h1>
            {site.heroSubtitle && (
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-7 max-w-xl">
                {site.heroSubtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mb-5">
              <Link href="/register" className="btn-primary text-lg px-8 py-4">{site.ctaPrimary} ←</Link>
              {site.ctaSecondary && (
                <a href="#showcase" className="btn-secondary text-lg px-7 py-4">{site.ctaSecondary}</a>
              )}
            </div>
            {site.trustLine && (
              <div className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 bg-sage rounded-full animate-pulse" />
                {site.trustLine}
              </div>
            )}
            {/* Trust mini-row */}
            <div className="mt-6 flex items-center gap-5 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <span>تشفير كامل</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span>أقل من 30 ثانية</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🎨</span>
                <span>+250 عيّنة</span>
              </div>
            </div>
          </div>

          <HeroVisual imageUrl={site.heroImageUrl} />
        </div>
      </section>

      {/* Teaser Studio */}
      <section id="teaser" className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="section-eyebrow">⚡ جرّب الآن</span>
            <h2 className="section-title">قبل وبعد… أنت تختار التحوّل</h2>
            <p className="section-subtitle mx-auto">ارفع صورة غرفتك الفعلية، شاهد كيف يعيد الذكاء الاصطناعي تصوّرها أمام عينيك. بلا تسجيل، بلا التزام.</p>
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
      <section className="py-16 md:py-20 bg-cream relative overflow-hidden">
        {/* Decorative background SVG */}
        <svg className="absolute -top-10 -right-20 w-72 h-72 opacity-[0.07]" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#a8896d" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="#a8896d" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="#a8896d" strokeWidth="0.5" />
        </svg>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-12">
            <span className="section-eyebrow">كيف تعمل؟</span>
            <h2 className="section-title">من الفكرة للتصميم في 4 خطوات</h2>
            <p className="section-subtitle mx-auto">سهلة، مرنة، وبدون أي خبرة سابقة في التصميم.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n} className="card relative hover:border-clay/30 transition-colors">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-clay text-white rounded-2xl flex items-center justify-center font-black text-xl">{s.n}</div>
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
              <div key={f.title} className="card hover:border-clay/30 transition-colors">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-black text-navy text-lg mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big CTA — مع SVG زخرفي وموشن */}
      <section className="py-20 md:py-28 bg-navy text-white relative overflow-hidden">
        {/* Floating decorative SVG shapes */}
        <svg className="absolute top-10 right-10 w-32 h-32 opacity-20" viewBox="0 0 100 100" aria-hidden="true">
          <polygon points="50,5 95,75 5,75" fill="none" stroke="#a8896d" strokeWidth="1" className="cta-spin-slow" style={{ transformOrigin: '50px 50px' }} />
        </svg>
        <svg className="absolute bottom-10 left-10 w-40 h-40 opacity-20" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#a8896d" strokeWidth="1" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="#a8896d" strokeWidth="1" />
          <circle cx="50" cy="50" r="16" fill="none" stroke="#a8896d" strokeWidth="1" className="cta-pulse" style={{ transformOrigin: '50px 50px' }} />
        </svg>
        <div className="absolute inset-0 hero-bg opacity-[0.07]" />
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <span className="badge bg-clay/20 text-clay-light mb-4">🎁 عرض إطلاق محدود</span>
          <h2 className="display text-3xl md:text-5xl font-black mb-4 leading-tight">
            خذ الخطوة الأولى نحو<br />بيت يشبهك تماماً
          </h2>
          <p className="text-gray-300 mb-8 text-lg max-w-xl mx-auto leading-relaxed">
            انضم لآلاف ممن صمّموا منازلهم بأنفسهم — بدقّة احترافية، بدون مصمّم، وبدون تكاليف باهظة.
          </p>
          <Link href="/register" className="btn-primary text-lg px-10 py-5">
            إنشاء حساب مجاني ←
          </Link>
          <div className="mt-5 flex items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-sage rounded-full" /> بدون بطاقة ائتمان
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-sage rounded-full" /> 5 نقاط مجاناً
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-sage rounded-full" /> إلغاء أي وقت
            </span>
          </div>
        </div>
        <style>{`
          @keyframes cta-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .cta-spin-slow { animation: cta-spin 28s linear infinite; }
          @keyframes cta-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.5; } }
          .cta-pulse { animation: cta-pulse 3.5s ease-in-out infinite; }
        `}</style>
      </section>

      <Footer />
    </>
  );
}
