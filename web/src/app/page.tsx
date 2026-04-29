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
  heroSubtitle: 'ارفع صورة غرفتك، اختَر النمط واللون والعناصر، ودَع الذكاء الاصطناعي يرسم لك مشهداً واقعياً خلال ثوانٍ — جاهز لتنفّذه.',
  ctaPrimary: 'ابدأ تجربتك المجانية',
  ctaSecondary: 'شاهد أمثلة التصاميم',
  trustLine: 'بدون بطاقة ائتمان · 5 نقاط مجاناً · جودة احترافية',
  freeQuotaText: 'احصل على 5 نقاط مجاناً فور التسجيل',
};

const FEATURES = [
  { icon: '🪄', title: 'تصميم خلال ثوانٍ', desc: 'اختر العينات أو اكتب وصفك، وستحصل على تصميم احترافي في 10-30 ثانية.' },
  { icon: '🎨', title: '+250 عيّنة قابلة للتخصيص', desc: 'مكتبة غنيّة من الجدران، البلاط، الأثاث، الإضاءة، والإكسسوارات — مع لوحة ألوان مشتركة.' },
  { icon: '🏠', title: '28 نوع مساحة', desc: 'من المجالس وغرف المعيشة إلى المحلات التجارية والحدائق والاستراحات — أو اكتب نوعك المخصّص.' },
  { icon: '🤖', title: 'ذكاء يفهم ذوقك', desc: 'يدمج العناصر التي تختارها بأناقة ويحترم تفاصيل الأثاث، الإضاءة، والمواد.' },
  { icon: '🔒', title: 'بياناتك محميّة', desc: 'تشفير كامل، Cloudflare Turnstile، قفل تلقائي بعد محاولات الدخول الفاشلة.' },
  { icon: '💳', title: 'دفع آمن وموثوق', desc: 'بطاقات فيزا، ماستركارد، Apple Pay عبر بوابة دفع مشفّرة بالكامل.' },
];

const HOW_IT_WORKS = [
  { n: 1, title: 'ارفع صورة غرفتك', desc: 'JPG أو PNG — تتحوّل تلقائياً لـ WebP محسّن' },
  { n: 2, title: 'اختر النمط والعينات', desc: 'مودرن، كلاسيك، عربي، متوسطي... + العينات والألوان' },
  { n: 3, title: 'اضغط توليد', desc: 'تنتظر 15 ثانية، تستلم تصميماً احترافياً جاهزاً' },
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
            <div className="flex flex-wrap gap-3 mb-3">
              <Link href="/register" className="btn-primary text-lg px-8 py-4">{site.ctaPrimary} ←</Link>
              {site.ctaSecondary && (
                <a href="#showcase" className="btn-secondary text-lg px-7 py-4">{site.ctaSecondary}</a>
              )}
            </div>
            {/* Stand-out implementation CTA — animated gradient with offer pill,
              * intentionally distinct from the primary/secondary buttons so it
              * catches the eye without competing with them. */}
            <Link
              href="/implementation"
              className="group relative inline-flex items-center gap-3 px-5 sm:px-7 py-3 sm:py-4 rounded-2xl bg-gradient-to-l from-emerald-600 via-emerald-500 to-clay-dark text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 mb-6 overflow-hidden"
            >
              {/* Subtle shimmering highlight on hover */}
              <span className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center gap-2">
                <span className="text-2xl">🛠️</span>
                <span className="flex flex-col items-start leading-tight">
                  <span>تنفيذ الديكور في جدّة</span>
                  <span className="text-[11px] sm:text-xs font-normal opacity-90">معاينة مجانية · تصاميم مجانية · ضمان 12 شهر</span>
                </span>
              </span>
              <span className="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">←</span>
              <span className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-amber-400 text-navy text-[10px] font-black shadow animate-pulse">
                جدّة فقط
              </span>
            </Link>
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

      {/* ── For-whom: residential + commercial only ───────────────────
       *  Marketing-grade section that frames the platform clearly: it's
       *  built ONLY for buildings (homes + commercial spaces). Two visual
       *  cards each list concrete use cases so the visitor sees themself. */}
      <section id="for-whom" className="py-14 md:py-20 bg-gradient-to-br from-cream via-white to-sand relative overflow-hidden">
        {/* Soft decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-clay/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-sage/10 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="text-center mb-10">
            <span className="section-eyebrow">🎯 لمن هذه المنصّة</span>
            <h2 className="section-title">للمباني السكنية والتجارية <span className="text-clay-dark">فقط</span></h2>
            <p className="section-subtitle mx-auto">
              صفوف رايقة مصمَّمة خصيصاً لمن يملك أو يدير <strong>مبنىً سكنياً أو تجارياً</strong>،
              ويحلم بمساحة تنبض بالأناقة وتعكس هويّته.
              لا نخلط الصور الشخصية بالأماكن — تركيزنا الكامل: <strong>ديكور المباني</strong>.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 lg:gap-7">
            {/* RESIDENTIAL CARD */}
            <div className="group relative rounded-3xl bg-white p-6 md:p-8 shadow-sm hover:shadow-xl border-2 border-clay/15 hover:border-clay/40 transition-all overflow-hidden">
              <div className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 bg-clay/10 rounded-full blur-2xl group-hover:bg-clay/20 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-clay/15 flex items-center justify-center text-3xl">
                    🏡
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-clay-dark uppercase tracking-widest">المباني السكنية</div>
                    <h3 className="text-xl md:text-2xl font-black text-navy">بيت العمر… كما تتمنّاه</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-5">
                  من الفلّا الفاخرة إلى شقّتك الأولى — نُجدّد كل مساحة في بيتك بأسلوب يعكس ذوقك،
                  ويبثّ الراحة في كل زاوية.
                </p>
                <ul className="space-y-2 mb-5">
                  {[
                    { icon: '🛋️', t: 'مجلس عربي / حديث', s: 'استقبال يليق بضيوفك' },
                    { icon: '🍽️', t: 'صالات الطعام', s: 'تجمّعات عائلية لا تُنسى' },
                    { icon: '🛏️', t: 'غرف النوم الرئيسية والأطفال', s: 'هدوء يسبق النوم العميق' },
                    { icon: '🍳', t: 'المطبخ المفتوح', s: 'القلب النابض للبيت' },
                    { icon: '🌿', t: 'الحديقة + المسبح + بيت الشعر', s: 'إطلالات خارجيّة فاتنة' },
                    { icon: '🚪', t: 'الواجهة + المداخل + المظلات', s: 'انطباع أوّل لا يُنسى' },
                  ].map((it) => (
                    <li key={it.t} className="flex items-start gap-2.5">
                      <span className="text-lg shrink-0 mt-0.5">{it.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-navy">{it.t}</div>
                        <div className="text-[11px] text-gray-500 leading-tight">{it.s}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {['فلّا', 'دور', 'شقّة', 'دوبلكس', 'استراحة', 'روف'].map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-clay/10 text-clay-dark font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* COMMERCIAL CARD */}
            <div className="group relative rounded-3xl bg-white p-6 md:p-8 shadow-sm hover:shadow-xl border-2 border-sage/30 hover:border-sage transition-all overflow-hidden">
              <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 bg-sage/15 rounded-full blur-2xl group-hover:bg-sage/25 transition-colors" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-sage/20 flex items-center justify-center text-3xl">
                    🏢
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-sage-dark uppercase tracking-widest">المباني التجارية</div>
                    <h3 className="text-xl md:text-2xl font-black text-navy">هويّة بصرية ترفع علامتك</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-5">
                  مساحتك التجارية هي <strong>صفحة الإعلان الأولى</strong> لزبائنك. نُهدّيك ديكوراً يُضاعف
                  قيمة العلامة، ويُحوّل كل زائر إلى عميل مُتذكِّر.
                </p>
                <ul className="space-y-2 mb-5">
                  {[
                    { icon: '☕', t: 'مقاهي وكافيهات', s: 'أجواء تستحقّ صورةً على إنستجرام' },
                    { icon: '🍽️', t: 'مطاعم وصالات طعام', s: 'تجربة غذائية تُكمل الطبق' },
                    { icon: '🛍️', t: 'محلات تجزئة ومعارض', s: 'ديكور يُسوِّق المنتج بصمت' },
                    { icon: '💼', t: 'مكاتب وشركات', s: 'بيئة عمل تُلهم الإنتاجية' },
                    { icon: '💆', t: 'صالونات وعيادات', s: 'هدوء راقٍ يطمئن العميل' },
                    { icon: '🏨', t: 'فنادق وشاليهات', s: 'إقامة تُحفظ في الذاكرة' },
                  ].map((it) => (
                    <li key={it.t} className="flex items-start gap-2.5">
                      <span className="text-lg shrink-0 mt-0.5">{it.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-navy">{it.t}</div>
                        <div className="text-[11px] text-gray-500 leading-tight">{it.s}</div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5">
                  {['كافيه', 'مطعم', 'محل', 'مكتب', 'عيادة', 'صالون', 'شاليه'].map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-sage/15 text-sage-dark font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reassurance line + clear CTAs */}
          <div className="mt-8 md:mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-xs text-gray-600 shadow-sm mb-4">
              <span>🚫</span>
              <span>منصّتنا <strong>للمباني فقط</strong> — لا للصور الشخصية، ولا للسيارات، ولا للأشخاص.</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <a href="/studio" className="btn-primary text-sm md:text-base">
                ✨ ابدأ تصميم مساحتك الآن
              </a>
              <a href="#showcase" className="btn-secondary text-sm md:text-base">
                شاهد أعمالاً سابقة ←
              </a>
            </div>
          </div>
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
              {/* Labeled mini sketch — preview of what the user uploads */}
              <figure className="relative">
                <svg viewBox="0 0 220 180" className="w-72 h-56 rounded-2xl bg-cream border border-clay/30 shadow-sm" role="img" aria-label="مثال صورة سكيتش بأسماء المساحات">
                  <defs>
                    <pattern id="hp-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#a8896d" strokeOpacity="0.25" strokeWidth="0.3" />
                    </pattern>
                  </defs>
                  <rect width="220" height="180" fill="url(#hp-grid)" />

                  {/* walls — animated draw-on */}
                  <g stroke="#2c2e3a" strokeWidth="1.6" strokeLinecap="round" fill="rgba(255,255,255,0.6)" className="hp-draw">
                    <rect x="14" y="14" width="192" height="152" rx="2" pathLength={1} />
                    <line x1="14" y1="86" x2="130" y2="86" pathLength={1} style={{ animationDelay: '0.4s' }} />
                    <line x1="90" y1="14" x2="90" y2="86" pathLength={1} style={{ animationDelay: '0.5s' }} />
                    <line x1="130" y1="14" x2="130" y2="166" pathLength={1} style={{ animationDelay: '0.6s' }} />
                    <line x1="60" y1="86" x2="60" y2="166" pathLength={1} style={{ animationDelay: '0.7s' }} />
                    <line x1="60" y1="124" x2="130" y2="124" pathLength={1} style={{ animationDelay: '0.8s' }} />
                  </g>

                  {/* door arc (only one — others are doorway gaps) */}
                  <g stroke="#7d6450" strokeWidth="0.8" fill="none" className="hp-draw">
                    <path d="M 126 70 A 10 10 0 0 1 130 80" pathLength={1} style={{ animationDelay: '1.1s' }} />
                  </g>

                  {/* windows */}
                  <g stroke="#7d6450" strokeWidth="0.8">
                    <line x1="36" y1="14" x2="74" y2="14" />
                    <line x1="36" y1="16" x2="74" y2="16" />
                    <line x1="150" y1="14" x2="190" y2="14" />
                    <line x1="150" y1="16" x2="190" y2="16" />
                    <line x1="206" y1="40" x2="206" y2="80" />
                    <line x1="208" y1="40" x2="208" y2="80" />
                  </g>

                  {/* Stairs in the corridor area */}
                  <g stroke="#2c2e3a" strokeWidth="0.7" fill="none">
                    <rect x="155" y="92" width="14" height="24" />
                    <line x1="155" y1="98" x2="169" y2="98" />
                    <line x1="155" y1="104" x2="169" y2="104" />
                    <line x1="155" y1="110" x2="169" y2="110" />
                    {/* Handrail */}
                    <g stroke="#7d6450" strokeWidth="0.5">
                      <line x1="153" y1="93" x2="153" y2="115" />
                      <line x1="153" y1="93" x2="153" y2="91" />
                      <line x1="153" y1="100" x2="153" y2="98" />
                      <line x1="153" y1="107" x2="153" y2="105" />
                      <line x1="153" y1="114" x2="153" y2="112" />
                    </g>
                  </g>

                  {/* Pergola in garden */}
                  <g stroke="#2c2e3a" strokeWidth="0.6" fill="rgba(168,137,109,0.1)">
                    <rect x="180" y="148" width="14" height="12" />
                    <line x1="180" y1="148" x2="194" y2="160" />
                    <line x1="194" y1="148" x2="180" y2="160" />
                  </g>
                  {/* Pool — tiny rectangle next to pergola */}
                  <g stroke="#2c2e3a" strokeWidth="0.5">
                    <rect x="146" y="148" width="22" height="12" rx="1" fill="rgba(96,165,250,0.20)" />
                    <path d="M 148 154 q 1.5 -1 3 0 t 3 0 t 3 0 t 3 0 t 3 0" fill="none" stroke="#3b82f6" strokeWidth="0.4" />
                  </g>
                  {/* Grass strokes */}
                  <g stroke="#6b7a5f" strokeWidth="0.4">
                    {[148, 156, 164, 172, 180, 188, 196].map((x) => (
                      <line key={x} x1={x} y1="142" x2={x} y2="138" />
                    ))}
                  </g>
                  {/* Bait shar — tiny multi-peak tent */}
                  <g stroke="#2c2e3a" strokeWidth="0.4" fill="rgba(168,137,109,0.18)">
                    <path d="M 195 162 L 195 158 Q 197 155, 199 157 Q 202 154, 204 156 Q 206 155, 208 158 L 208 162 Z" />
                  </g>

                  {/* Wall topper — wavy line above outer wall */}
                  <path d="M 26 12 q 4 -3 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0 t 8 0"
                        fill="none" stroke="#7d6450" strokeWidth="0.5" />

                  {/* Carport — small rectangle at bottom-left for entrance */}
                  <g stroke="#2c2e3a" strokeWidth="0.6" fill="rgba(168,137,109,0.08)">
                    <rect x="40" y="170" width="18" height="6" />
                  </g>
                  {/* Annex — separate small building bottom-right */}
                  <g stroke="#2c2e3a" strokeWidth="0.6" fill="rgba(168,137,109,0.10)">
                    <rect x="170" y="170" width="34" height="6" rx="0.5" />
                  </g>
                  {/* Gate — gap in the bottom wall */}
                  <g stroke="#2c2e3a" strokeWidth="0.7" fill="none">
                    <line x1="62" y1="166" x2="62" y2="170" />
                    <line x1="80" y1="166" x2="80" y2="170" />
                  </g>
                  {/* Hand-wash basin */}
                  <g>
                    <circle cx="155" cy="138" r="3.5" fill="rgba(168,137,109,0.15)" stroke="#2c2e3a" strokeWidth="0.7" />
                    <circle cx="155" cy="138" r="1" fill="#7d6450" />
                  </g>
                  {/* Camera 1 — in majlis pointing toward the salah */}
                  <g>
                    <circle cx="38" cy="74" r="4.5" fill="#2c2e3a" />
                    <text x="38" y="76" fontSize="6" fontFamily="Cairo, sans-serif" fontWeight="900" fill="#fff" textAnchor="middle">1</text>
                    <line x1="42" y1="74" x2="56" y2="64" stroke="#7d6450" strokeWidth="0.9" />
                    <path d="M 53 62 L 56 64 L 54 67" stroke="#7d6450" strokeWidth="0.9" fill="none" />
                  </g>

                  {/* labels */}
                  <g fontFamily="'Cairo', sans-serif" fontWeight="700" fill="#2c2e3a" textAnchor="middle">
                    <text x="50" y="52" fontSize="11" transform="rotate(-2 50 52)">مجلس</text>
                    <text x="110" y="52" fontSize="10">صالة</text>
                    <text x="170" y="52" fontSize="10" transform="rotate(1 170 52)">نوم</text>
                    <text x="38" y="130" fontSize="9">مطبخ</text>
                    <text x="95" y="108" fontSize="8">حمام 1</text>
                    <text x="95" y="148" fontSize="8">حمام 2</text>
                    <text x="170" y="130" fontSize="10" transform="rotate(2 170 130)">حديقة</text>
                    {/* New: stairs + handwash labels */}
                    <text x="162" y="124" fontSize="6" fill="#7d6450">درج</text>
                    <text x="180" y="140" fontSize="6" fill="#7d6450" textAnchor="start">مغسلة</text>
                  </g>

                  {/* highlight ring on majlis to suggest "AI is reading" */}
                  <circle cx="50" cy="52" r="22" fill="none" stroke="#a8896d" strokeWidth="0.8" strokeDasharray="2 3" className="hp-sketch-pulse" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-clay text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">مثال</span>
              </figure>
              <style>{`
                @keyframes hp-sketch-rotate { from { stroke-dashoffset: 0 } to { stroke-dashoffset: -20 } }
                .hp-sketch-pulse { animation: hp-sketch-rotate 4s linear infinite; transform-box: fill-box; transform-origin: center; }
                @keyframes hp-stroke { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
                .hp-draw rect, .hp-draw line, .hp-draw path {
                  stroke-dasharray: 1;
                  stroke-dashoffset: 1;
                  animation: hp-stroke 0.9s ease-out forwards;
                }
                /* loop the whole figure every 8s for an attractive replay */
                @keyframes hp-replay {
                  0%, 88% { opacity: 1; }
                  92%     { opacity: 0; }
                  100%    { opacity: 1; }
                }
                .hp-draw { animation: hp-replay 8s ease-in-out infinite; }
              `}</style>
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

      {/* Jeddah implementation services */}
      <section id="implementation" className="py-16 md:py-20 bg-gradient-to-l from-cream via-sand to-cream relative overflow-hidden">
        {/* Decorative city-skyline silhouette */}
        <svg className="absolute bottom-0 right-0 w-full h-32 opacity-[0.06]" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 120 L0 80 L60 80 L60 50 L120 50 L120 70 L180 70 L180 30 L220 30 L220 60 L290 60 L290 40 L340 40 L340 20 L400 20 L400 70 L460 70 L460 45 L520 45 L520 80 L600 80 L600 35 L660 35 L660 60 L720 60 L720 25 L780 25 L780 55 L840 55 L840 75 L900 75 L900 40 L960 40 L960 65 L1020 65 L1020 30 L1080 30 L1080 70 L1140 70 L1140 50 L1200 50 L1200 120 Z" fill="#7d6450" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-12">
            <span className="section-eyebrow">خدمة جديدة · جدّة فقط</span>
            <h2 className="section-title">نُصمّم لك… ثُمّ نُنفّذ ✨</h2>
            <p className="section-subtitle mx-auto">
              في مدينة جدّة، تخطّى مرحلة "وش رأيك في التصميم" واطلب فريقاً متخصّصاً
              يحوّل تصميمك إلى واقع — تشطيب، جبس، إضاءة، طلاء، أرضيات، ودهانات نهائية.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Left: features */}
            <div className="card bg-white space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-clay text-white flex items-center justify-center text-2xl">🛠️</div>
                <div>
                  <div className="font-black text-navy text-xl">تنفيذ ديكور احترافي</div>
                  <div className="text-xs text-gray-500">داخل نطاق مدينة جدّة وضواحيها</div>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-gray-700">
                <FeatureRow icon="📐" title="معاينة مجّانية" desc="فنّيونا يأتون لمعاينة المكان وأخذ المقاسات الفعلية، وعرض السعر بدون التزام." />
                <FeatureRow icon="🎨" title="مطابقة دقيقة للتصميم" desc="نلتزم بالنمط واللون والعيّنات التي اخترتها في تصميم AI، ونقترح بدائل عند الحاجة." />
                <FeatureRow icon="👷" title="فريق متخصّص" desc="نجّار، جبس، كهرباء، دهان، أرضيات — تحت إدارة مشرف واحد لمشروعك." />
                <FeatureRow icon="📅" title="جدولة واضحة" desc="خطة زمنية يومية مع مراحل تسليم محدّدة، وتحديث صور للتقدّم اليومي." />
                <FeatureRow icon="🛡️" title="ضمان جودة 12 شهر" desc="ضمان على التركيب والتشطيبات يغطّي العيوب المباشرة لمدّة سنة كاملة." />
                <FeatureRow icon="💳" title="دفع مرحليّ مرن" desc="ادفع على دفعات حسب مراحل التسليم — لا تدفع كامل المبلغ مقدّماً." />
              </ul>
            </div>

            {/* Right: CTA + categories */}
            <div className="card bg-navy text-white relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-clay/20 blur-3xl" />
              <div className="relative">
                <div className="text-clay-light text-xs font-bold tracking-widest uppercase mb-2">المساحات التي ننفّذها</div>
                <div className="grid grid-cols-2 gap-2 mb-7">
                  {['مجالس', 'صالات', 'غرف نوم', 'مطابخ', 'حمّامات', 'حدائق وأسطح', 'محلّات تجارية', 'مكاتب'].map((t) => (
                    <span key={t} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-center">{t}</span>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
                  <div className="text-clay-light text-xs font-bold mb-1">طريقة الطلب</div>
                  <ol className="text-sm space-y-1 list-decimal pr-5">
                    <li>صمّم غرفتك أو بيتك على المنصّة (مجاناً).</li>
                    <li>تواصل معنا واتساب أو من <a href="/contact" className="underline text-clay-light">صفحة تواصل معنا</a>.</li>
                    <li>نحدّد موعد معاينة مجّانية في موقعك بجدّة.</li>
                    <li>تستلم عرض سعر مفصّل خلال 48 ساعة.</li>
                  </ol>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://wa.me/966570205674?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%B7%D9%84%D8%A8%20%D9%85%D8%B9%D8%A7%D9%8A%D9%86%D8%A9%20%D9%84%D8%AA%D9%86%D9%81%D9%8A%D8%B0%20%D8%AF%D9%8A%D9%83%D9%88%D8%B1%20%D9%81%D9%8A%20%D8%AC%D8%AF%D8%A9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-2xl px-6 py-3.5 transition-colors"
                  >
                    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                      <path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8c1.9 1 4 1.6 6.2 1.6 7.2 0 13-5.8 13-13S23.2 3 16 3zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-4 1 1.1-3.9-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7 0-6 4.9-10.9 10.9-10.9S26.9 10 26.9 16 22 26.6 16 26.6zm6-8.2c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.2-.7.2-.2.3-.8 1.1-1 1.3-.2.2-.4.3-.7.1-.3-.2-1.4-.5-2.7-1.6-1-.9-1.7-2-1.9-2.4-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.2 2.2 3.4 5.4 4.7 1.9.7 2.6.8 3.5.7.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4z" />
                    </svg>
                    واتساب — طلب معاينة
                  </a>
                  <Link href="/contact?kind=implementation" className="flex-1 inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-2xl px-6 py-3.5 transition-colors">
                    نموذج طلب معاينة
                  </Link>
                </div>

                <p className="text-[11px] text-gray-400 mt-4 text-center">
                  📍 جدّة، حيّ البوادي · مبنى 2475 · رمز بريدي 23531
                </p>
              </div>
            </div>
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

function FeatureRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-2xl shrink-0">{icon}</span>
      <div>
        <div className="font-bold text-navy">{title}</div>
        <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
      </div>
    </li>
  );
}
