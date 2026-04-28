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

      {/* New feature highlight: Sketch mode */}
      <section className="py-12 md:py-16 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="card bg-gradient-to-l from-clay/5 to-sand border-clay/20 grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <span className="badge bg-clay text-white mb-3">⚡ ميزة جديدة</span>
              <h3 className="text-2xl md:text-3xl font-black text-navy mb-2 leading-tight">
                صمّم بيتك بالكامل من اسكيتش واحد
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4 max-w-xl">
                ارفع مخطط بيتك أو رسماً يدوياً مع تسمية المساحات (مجلس، حمام 1، حمام 2، صالة، حديقة...).
                الذكاء الاصطناعي يقرأ التسميات تلقائياً، ويُوّلد لك تصميماً مخصّصاً لكل غرفة على حدة بدلاً من تصميم واحد فقط.
              </p>
              <ul className="text-sm text-gray-600 space-y-1.5 mb-5">
                <li className="flex items-center gap-2"><span className="text-sage">✓</span> يكتشف عدد الغرف والحمامات والمساحات تلقائياً</li>
                <li className="flex items-center gap-2"><span className="text-sage">✓</span> اختر نمطاً وعينات وألواناً مختلفة لكل مساحة</li>
                <li className="flex items-center gap-2"><span className="text-sage">✓</span> 5 نقاط لكل تصميم — تدفع فقط عند تحميل النسخة الكاملة</li>
              </ul>
              <Link href="/studio?mode=sketch" className="btn-primary">
                جرّب وضع الاسكيتش ←
              </Link>
            </div>
            <div className="hidden md:block">
              {/* Decorative blueprint SVG */}
              <svg viewBox="0 0 200 160" className="w-64 h-52" aria-hidden="true">
                <defs>
                  <pattern id="bp-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#a8896d" strokeWidth="0.3" />
                  </pattern>
                </defs>
                <rect width="200" height="160" fill="url(#bp-grid)" rx="12" />
                <g stroke="#7d6450" strokeWidth="1" fill="none">
                  <rect x="20" y="20" width="80" height="50" />
                  <rect x="100" y="20" width="80" height="50" />
                  <rect x="20" y="70" width="55" height="70" />
                  <rect x="75" y="90" width="45" height="50" />
                  <rect x="120" y="70" width="60" height="70" />
                </g>
                <g fontSize="8" fill="#7d6450" fontFamily="Cairo, sans-serif" textAnchor="middle">
                  <text x="60" y="50">مجلس</text>
                  <text x="140" y="50">صالة</text>
                  <text x="47" y="110">مطبخ</text>
                  <text x="97" y="120">حمام 1</text>
                  <text x="150" y="110">نوم</text>
                </g>
                <circle cx="180" cy="20" r="4" fill="#a8896d" className="animate-pulse" />
              </svg>
            </div>
          </div>
        </div>
      </section>

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

      {/* Big CTA — زخرفة عربية مبتكرة بدل المثلث */}
      <section className="py-20 md:py-28 bg-navy text-white relative overflow-hidden">
        {/* Animated grid background */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" aria-hidden="true">
          <defs>
            <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#a8896d" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="cta-fade" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="1" />
            </radialGradient>
            <mask id="cta-mask"><rect width="100%" height="100%" fill="url(#cta-fade)" /></mask>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" mask="url(#cta-mask)" />
        </svg>

        {/* Top-right: nested arabesque rosette */}
        <svg className="absolute top-6 right-6 md:top-10 md:right-10 w-40 h-40 md:w-56 md:h-56 opacity-25" viewBox="0 0 100 100" aria-hidden="true">
          <g fill="none" stroke="#a8896d" strokeWidth="0.6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ellipse key={i} cx="50" cy="50" rx="42" ry="16" transform={`rotate(${i * 22.5} 50 50)`} />
            ))}
            <circle cx="50" cy="50" r="6" fill="#a8896d" fillOpacity="0.4" />
          </g>
          <g className="cta-spin-slow" style={{ transformOrigin: '50px 50px' }}>
            <circle cx="50" cy="50" r="46" fill="none" stroke="#a8896d" strokeWidth="0.4" strokeDasharray="2 4" />
          </g>
        </svg>

        {/* Bottom-left: orbital rings + drifting dots */}
        <svg className="absolute bottom-8 left-8 md:bottom-12 md:left-12 w-44 h-44 md:w-60 md:h-60 opacity-25" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#a8896d" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#a8896d" strokeWidth="0.5" strokeDasharray="1 3" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#a8896d" strokeWidth="0.5" />
          <g className="cta-orbit-a" style={{ transformOrigin: '50px 50px' }}>
            <circle cx="94" cy="50" r="2" fill="#d8c5ad" />
          </g>
          <g className="cta-orbit-b" style={{ transformOrigin: '50px 50px' }}>
            <circle cx="50" cy="18" r="1.4" fill="#a8896d" />
          </g>
          <g className="cta-orbit-c" style={{ transformOrigin: '50px 50px' }}>
            <circle cx="70" cy="50" r="1" fill="#d8c5ad" />
          </g>
          <circle cx="50" cy="50" r="3" fill="#a8896d" className="cta-pulse" style={{ transformOrigin: '50px 50px' }} />
        </svg>

        {/* Floating sparkles */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <span className="cta-spark cta-spark-1">✦</span>
          <span className="cta-spark cta-spark-2">✦</span>
          <span className="cta-spark cta-spark-3">✧</span>
          <span className="cta-spark cta-spark-4">✧</span>
        </div>

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
          @keyframes cta-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          .cta-spin-slow { animation: cta-spin 32s linear infinite; }
          .cta-orbit-a { animation: cta-spin 14s linear infinite; }
          .cta-orbit-b { animation: cta-spin-rev 22s linear infinite; }
          .cta-orbit-c { animation: cta-spin 9s linear infinite; }
          @keyframes cta-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: 0.4; } }
          .cta-pulse { animation: cta-pulse 3.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
          @keyframes cta-twinkle {
            0%,100% { opacity: 0; transform: translateY(0) scale(0.8); }
            50%     { opacity: 1; transform: translateY(-6px) scale(1); }
          }
          .cta-spark {
            position: absolute; color: #d8c5ad; font-size: 14px; opacity: 0;
            animation: cta-twinkle 4.5s ease-in-out infinite;
            text-shadow: 0 0 12px rgba(216,197,173,0.6);
          }
          .cta-spark-1 { top: 22%; right: 28%; animation-delay: 0s; }
          .cta-spark-2 { top: 40%; left: 22%; animation-delay: 1.2s; font-size: 18px; }
          .cta-spark-3 { bottom: 28%; right: 18%; animation-delay: 2.4s; }
          .cta-spark-4 { top: 60%; right: 38%; animation-delay: 3.3s; font-size: 11px; }
        `}</style>
      </section>

      <Footer />
    </>
  );
}
