import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata = {
  title: 'من نحن — صفوف رايقة',
  description: 'مؤسسة صفوف رايقة — منصّة سعودية لتصميم الديكور بالذكاء الاصطناعي. تعرّف على رحلتنا، رؤيتنا، وبيانات السجل الرسمي.',
};

const VALUES = [
  { icon: '🎯', title: 'دقة احترافية', desc: 'مخرجات بدقّة 4K تحاكي تصاميم المحترفين، بدون تعقيد ولا انتظار طويل.' },
  { icon: '🇸🇦', title: 'مؤسسة سعودية موثّقة', desc: 'مسجّلة رسمياً في المملكة العربية السعودية برقم وطني موحّد للمنشأة.' },
  { icon: '🤝', title: 'إنصاف في السعر', desc: 'باقات مرنة، نقاط مجانية لكل مستخدم جديد، وبدون التزامات مخفية.' },
  { icon: '🔐', title: 'خصوصية حقيقية', desc: 'صورك ومشاريعك ملكك. تشفير كامل، Cloudflare Turnstile، ولا مشاركة مع أطراف ثالثة.' },
];

const STATS = [
  { n: '+250', label: 'عيّنة قابلة للتخصيص' },
  { n: '28', label: 'نوع مساحة' },
  { n: '4K', label: 'دقة المخرجات' },
  { n: '<30s', label: 'زمن التوليد' },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero-bg">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <span className="badge bg-clay/15 text-clay-dark mb-5">من نحن</span>
          <h1 className="display text-4xl md:text-6xl font-black text-navy leading-[1.1] mb-5">
            ديكور عربي، بأدوات الذكاء الحديثة
          </h1>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
            <strong className="text-navy">صفوف رايقة</strong> منصّة سعودية تساعدك على تخيّل بيتك أو مكان عملك
            قبل أن تنفّذه — تختار النمط، الألوان، والعينات، ويرسم لك الذكاء الاصطناعي مشهداً واقعياً
            خلال ثوانٍ. صُمِّمت لتكون أداة عملية بيد كل من يحلم ببيت يشبهه.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-10 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="display text-3xl md:text-4xl font-black text-clay-dark">{s.n}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="section-eyebrow">قصّتنا</span>
            <h2 className="section-title">لماذا أسّسنا صفوف رايقة؟</h2>
          </div>
          <div className="card text-gray-700 leading-loose space-y-4 text-lg">
            <p>
              بدأت الفكرة من سؤال بسيط: لماذا يحتاج الواحد منّا لأسابيع من الاجتماعات
              مع المصمّمين، ومئات الصور المرجعية، وكثير من التخمين، فقط ليتخيّل كيف
              ستبدو غرفته بعد التشطيب؟
            </p>
            <p>
              كان الجواب أن أدوات الذكاء الاصطناعي صارت قادرة على إنتاج تصوّر بصري
              فوريّ بجودة احترافية. فقرّرنا أن نبني منصّة عربية أصيلة، تتحدّث بلغتنا،
              تفهم أذواقنا — من المجالس والاستراحات إلى المحلّات والحدائق — وتمنح كلّ
              شخص أداة كانت سابقاً حكراً على شركات التصميم.
            </p>
            <p>
              <strong className="text-navy">صفوف رايقة</strong> اليوم منصّة كاملة:
              استوديو لتوليد التصاميم، نظام نقاط مرن، ومعرض أعمال يتوسّع باستمرار —
              مدعومة ببنية تحتية آمنة على خوادم سعودية ومسجّلة رسمياً كمؤسسة فردية.
            </p>
            <p className="bg-clay/10 border-r-4 border-clay rounded-lg p-4 text-sm text-navy">
              <strong>إفصاح:</strong> <strong>مؤسسة صفوف رايقة</strong> هي الجهة المالكة والمُشغّلة لهذا الموقع
              الإلكتروني (<span dir="ltr">sufuf.pro</span>) وجميع تطبيقاته المرتبطة. أيّ تعامل تجاري عبر
              المنصّة يُعتبر تعاملاً مباشراً مع المؤسسة.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-eyebrow">قيمنا</span>
            <h2 className="section-title">ما الذي يُميّزنا</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="card hover:border-clay/30 transition-colors">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-black text-navy text-lg mb-1.5">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Registration Card */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="section-eyebrow">السجل الرسمي</span>
            <h2 className="section-title">مؤسسة موثّقة في المملكة</h2>
            <p className="section-subtitle mx-auto">
              صفوف رايقة منشأة فردية مسجّلة لدى مركز الأعمال السعودي،
              بسجلٍ رئيسي نشط ورقم وطني موحّد.
            </p>
          </div>

          {/* Innovative credential card — feels like an official seal */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-clay/30 bg-gradient-to-br from-cream via-white to-sand p-8 md:p-10">
            {/* Decorative arabesque corners */}
            <svg className="absolute -top-6 -right-6 w-32 h-32 opacity-20" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#a8896d" strokeWidth="0.6" />
              <circle cx="50" cy="50" r="28" fill="none" stroke="#a8896d" strokeWidth="0.6" />
              <circle cx="50" cy="50" r="16" fill="none" stroke="#a8896d" strokeWidth="0.6" />
            </svg>
            <svg className="absolute -bottom-6 -left-6 w-32 h-32 opacity-20" viewBox="0 0 100 100" aria-hidden="true">
              <polygon points="50,5 95,75 5,75" fill="none" stroke="#7d6450" strokeWidth="0.6" />
              <polygon points="50,25 80,70 20,70" fill="none" stroke="#7d6450" strokeWidth="0.6" />
            </svg>

            <div className="relative grid md:grid-cols-[auto_1fr] gap-8 items-center">
              {/* Round seal */}
              <div className="mx-auto md:mx-0">
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-clay to-clay-dark text-white flex flex-col items-center justify-center shadow-xl">
                  <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/40" />
                  <div className="text-[10px] tracking-widest opacity-90">منشأة سعودية</div>
                  <div className="text-2xl font-black mt-1">موثّقة</div>
                  <div className="text-[10px] tracking-widest opacity-90 mt-1">رسمياً</div>
                  <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-sage flex items-center justify-center text-white text-xl shadow-lg ring-4 ring-white">✓</div>
                </div>
              </div>

              {/* Details */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="badge bg-sage/15 text-sage-dark inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
                    نشط
                  </span>
                  <span className="badge bg-clay/15 text-clay-dark">سجل رئيسي</span>
                  <span className="badge bg-navy/10 text-navy">مالك مؤسسة فردية</span>
                </div>

                <h3 className="display text-2xl md:text-3xl font-black text-navy leading-tight mb-4">
                  مؤسسة صفوف رايقة
                </h3>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white border border-gray-100 p-4">
                    <div className="text-[11px] text-gray-500 mb-1">الرقم الوطني الموحّد للمنشأة</div>
                    <div className="display text-2xl font-black text-navy tracking-wider tabular-nums" dir="ltr">7054166389</div>
                  </div>
                  <div className="rounded-2xl bg-white border border-gray-100 p-4">
                    <div className="text-[11px] text-gray-500 mb-1">نوع الكيان</div>
                    <div className="display text-xl font-black text-navy">مؤسسة</div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                  يمكن التحقّق من هذه البيانات عبر منصّات الأعمال الرسمية في المملكة
                  العربية السعودية باستخدام الرقم الوطني الموحّد أعلاه.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="display text-3xl md:text-4xl font-black mb-3 leading-tight">جاهز تجرّب التصميم بنفسك؟</h2>
          <p className="text-gray-300 mb-7">5 نقاط مجاناً عند التسجيل — بدون بطاقة ائتمان.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn-primary text-lg px-8 py-4">إنشاء حساب مجاني ←</Link>
            <Link href="/contact" className="btn-secondary text-lg px-7 py-4">تواصل معنا</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
