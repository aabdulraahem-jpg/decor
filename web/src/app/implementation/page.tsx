import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata = {
  title: 'تنفيذ ديكور في جدّة — صفوف رايقة',
  description: 'فريق متخصّص ينفّذ تصميمات الديكور في مدينة جدّة — معاينة مجانية، ضمان 12 شهر، دفع مرحلي. مجالس، صالات، مطابخ، حمّامات، حدائق ومحلّات.',
};

const PROCESS = [
  { n: 1, title: 'صمّم على المنصّة', desc: 'استخدم استوديو AI لتصميم المساحة كما تريدها — مجاناً.' },
  { n: 2, title: 'تواصل معنا', desc: 'واتساب أو نموذج طلب معاينة — أي قناة تناسبك.' },
  { n: 3, title: 'معاينة مجّانية', desc: 'فنّي يصلك للموقع، يأخذ المقاسات، ويناقش التفاصيل.' },
  { n: 4, title: 'عرض سعر مفصّل', desc: 'خلال 48 ساعة من المعاينة — مع جدول زمني واضح.' },
  { n: 5, title: 'التنفيذ', desc: 'فريق متخصّص يبدأ العمل بمراحل تسليم محدّدة.' },
  { n: 6, title: 'التسليم والضمان', desc: 'تسلّم المشروع نهائياً مع ضمان 12 شهر على التشطيبات.' },
];

const SCOPE = [
  { icon: '🪑', title: 'النجارة والأثاث', desc: 'ديكورات جدارية، مكتبات، خزائن مخفيّة، مكاتب، رفوف حسب الطلب.' },
  { icon: '🏛️', title: 'الجبس والجبسوم', desc: 'أسقف فرنسية، إضاءة مخفية، فواصل ديكورية، أقواس وأعمدة.' },
  { icon: '💡', title: 'الإضاءة والكهرباء', desc: 'سبوت لايت، شرائط LED، ثريّات، أنظمة إضاءة ذكية.' },
  { icon: '🎨', title: 'الدهانات', desc: 'دهانات مغربية، أتش بي، أوربان، تشطيبات يدوية فنّية.' },
  { icon: '🧱', title: 'الأرضيات', desc: 'سيراميك، باركيه، رخام، بورسلين، سجاد جداري.' },
  { icon: '🛋️', title: 'الأثاث الجاهز', desc: 'تنسيق وتنفيذ كنبات، طاولات، إكسسوارات حسب التصميم.' },
];

const FAQ = [
  {
    q: 'هل خدمة التنفيذ متوفّرة خارج جدّة؟',
    a: 'حالياً نخدم مدينة جدّة وضواحيها فقط. نخطّط للتوسّع لمكّة المكرمة ثم الرياض خلال 2026.',
  },
  {
    q: 'كم مدّة المشروع المعتاد؟',
    a: 'مجلس واحد بالتشطيب الكامل: 7–14 يوم. شقّة كاملة (4 غرف): 30–45 يوم. نعطيك جدول دقيق بعد المعاينة.',
  },
  {
    q: 'هل التصميم على المنصّة مُلزِم لي بالتنفيذ معكم؟',
    a: 'لا أبداً. تستطيع توليد التصاميم مجاناً والاستفادة منها مع أي مقاول. خدمة التنفيذ اختيارية تماماً.',
  },
  {
    q: 'ما هو الضمان؟',
    a: 'ضمان 12 شهر على التركيب والدهانات والكهرباء. أي عيب صناعي أو في التنفيذ خلال السنة الأولى نُصلِحه مجّاناً.',
  },
  {
    q: 'هل يمكن تعديل التصميم بعد بدء التنفيذ؟',
    a: 'نعم لكن قد يؤثّر على الجدول والسعر. نحرص على ثبات التصميم قبل البدء عبر اجتماع تأكيد قبل الانطلاق.',
  },
  {
    q: 'كيف أدفع؟',
    a: 'دفع مرحلي على 3-4 دفعات حسب حجم المشروع: مقدّم 30٪، مرحلتَي تنفيذ، ودفعة نهائية عند التسليم. كل دفعة بفاتورة.',
  },
];

export default function ImplementationPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero-bg relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <span className="badge bg-clay/15 text-clay-dark mb-5">جدّة فقط · خدمة محلّية</span>
            <h1 className="display text-4xl md:text-6xl font-black text-navy leading-[1.1] mb-5">
              نُصمّم تصميمك<br />ثُمّ نُنفّذه على أرض الواقع
            </h1>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-7 max-w-xl">
              فريقنا في <strong className="text-navy">جدّة</strong> يحوّل تصميم الذكاء الاصطناعي إلى مشروع
              ديكور حقيقي — تشطيب، جبس، إضاءة، أرضيات، دهانات، وأثاث مخصّص. تبدأ من معاينة مجّانية
              وتنتهي بضمان 12 شهر.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/966570205674?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%B7%D9%84%D8%A8%20%D9%85%D8%B9%D8%A7%D9%8A%D9%86%D8%A9%20%D9%84%D8%AA%D9%86%D9%81%D9%8A%D8%B0%20%D8%AF%D9%8A%D9%83%D9%88%D8%B1%20%D9%81%D9%8A%20%D8%AC%D8%AF%D8%A9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-2xl px-7 py-4 text-lg transition-colors shadow-md"
              >
                <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                  <path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8c1.9 1 4 1.6 6.2 1.6 7.2 0 13-5.8 13-13S23.2 3 16 3zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-4 1 1.1-3.9-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7 0-6 4.9-10.9 10.9-10.9S26.9 10 26.9 16 22 26.6 16 26.6zm6-8.2c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.2-.7.2-.2.3-.8 1.1-1 1.3-.2.2-.4.3-.7.1-.3-.2-1.4-.5-2.7-1.6-1-.9-1.7-2-1.9-2.4-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.2 2.2 3.4 5.4 4.7 1.9.7 2.6.8 3.5.7.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4z" />
                </svg>
                واتساب — طلب معاينة
              </a>
              <Link href="/contact?kind=implementation" className="btn-secondary text-lg px-6 py-3.5">
                نموذج طلب معاينة ←
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-5 text-xs text-gray-500 flex-wrap">
              <span className="flex items-center gap-1.5">📍 جدّة وضواحيها</span>
              <span className="flex items-center gap-1.5">🛡️ ضمان 12 شهر</span>
              <span className="flex items-center gap-1.5">💳 دفع مرحلي</span>
            </div>
          </div>

          {/* Decorative blueprint-to-real card */}
          <div className="relative aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 grid grid-cols-2 gap-3 p-2">
              <div className="rounded-2xl bg-white border-2 border-dashed border-clay/40 flex items-center justify-center text-clay-dark p-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <pattern id="impl-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                      <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#a8896d" strokeOpacity="0.3" strokeWidth="0.4" />
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#impl-grid)" />
                  <g stroke="#2c2e3a" strokeWidth="1.6" fill="none">
                    <rect x="10" y="10" width="80" height="80" />
                    <line x1="10" y1="50" x2="90" y2="50" />
                    <line x1="50" y1="10" x2="50" y2="50" />
                  </g>
                  <g fontFamily="Cairo, sans-serif" fontSize="9" fontWeight="700" fill="#2c2e3a" textAnchor="middle">
                    <text x="30" y="32">مجلس</text>
                    <text x="70" y="32">صالة</text>
                    <text x="50" y="72">حديقة</text>
                  </g>
                </svg>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-clay to-clay-dark text-white flex flex-col items-center justify-center p-6 text-center shadow-xl">
                <div className="text-4xl mb-2">🛠️</div>
                <div className="font-black text-lg mb-1">تنفيذ احترافي</div>
                <div className="text-xs opacity-80">من الفكرة إلى الواقع</div>
              </div>
              <div className="col-span-2 rounded-2xl bg-navy text-white p-5 flex items-center gap-4">
                <div className="text-3xl">📞</div>
                <div className="flex-1">
                  <div className="text-xs text-clay-light mb-0.5">للحجز والاستفسار</div>
                  <a href="tel:+966570205674" className="font-black text-xl tracking-wide" dir="ltr">+966 57 020 5674</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scope of services */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-eyebrow">نطاق العمل</span>
            <h2 className="section-title">ما الذي ننفّذه</h2>
            <p className="section-subtitle mx-auto">من قواطع الجبس حتى آخر إكسسوار — حلّ كامل تحت إشراف فريق واحد.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCOPE.map((s) => (
              <div key={s.title} className="card hover:border-clay/30 transition-colors">
                <div className="text-4xl mb-3">{s.icon}</div>
                <h3 className="font-black text-navy text-lg mb-1.5">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process timeline */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-eyebrow">مراحل المشروع</span>
            <h2 className="section-title">كيف نشتغل معك خطوة بخطوة</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROCESS.map((p) => (
              <div key={p.n} className="card relative hover:border-clay/30 transition-colors">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-clay text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md">{p.n}</div>
                <div className="font-black text-navy text-lg mb-1 mt-2">{p.title}</div>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio placeholder */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="section-eyebrow">معرض الأعمال</span>
            <h2 className="section-title">نضيف مشاريعنا تباعاً</h2>
            <p className="section-subtitle mx-auto">تابعنا قريباً لنشر أوّل دفعة من مشاريع جدّة المنفَّذة.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-cream via-sand to-cream border border-gray-100 flex items-center justify-center text-clay-dark">
                <div className="text-center">
                  <div className="text-4xl mb-2 opacity-40">🏠</div>
                  <div className="text-xs text-gray-400">قريباً · مشروع #{i}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="section-eyebrow">الأسئلة الشائعة</span>
            <h2 className="section-title">قبل أن تطلب معاينة</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <details key={i} className="card group cursor-pointer">
                <summary className="flex items-center justify-between font-bold text-navy list-none">
                  <span>{f.q}</span>
                  <span className="text-clay-dark text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-gray-600 leading-relaxed mt-3 pt-3 border-t border-gray-100">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-[0.05]" />
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <h2 className="display text-3xl md:text-5xl font-black mb-4 leading-tight">
            بيتك يستحقّ أكثر من فكرة على الورق
          </h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            خذ الخطوة التالية — معاينة مجّانية في أيّ منطقة من جدّة، بدون التزام.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/966570205674?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%B7%D9%84%D8%A8%20%D9%85%D8%B9%D8%A7%D9%8A%D9%86%D8%A9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-2xl px-8 py-4 text-lg transition-colors"
            >
              📞 احجز معاينة عبر واتساب
            </a>
            <Link href="/contact?kind=implementation" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-2xl px-7 py-4 text-lg transition-colors">
              نموذج تواصل
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
