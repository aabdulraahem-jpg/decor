import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export const metadata = {
  title: 'تنفيذ ديكور في جدّة — صفوف رايقة',
  description:
    'فريق متخصّص ينفّذ ديكور المباني السكنية والتجارية في مدينة جدّة فقط — معاينة مجانية، عقد رسمي، ضمان 12 شهر، ودفع مرحلي. مدّة المشروع تُحدَّد حسب طبيعة الديكور والاتفاق مع العميل.',
};

/** Project process — icon-free, contract step included, no fixed day windows.
 * Step #1 makes designing OPTIONAL: client can submit existing photos /
 * sketches and our team prepares free designs for them. */
const PROCESS = [
  { n: 1, title: 'تواصل معنا', desc: 'واتساب أو نموذج طلب معاينة — أي قناة تناسبك. لا يُشترَط أن تصمّم بنفسك.' },
  { n: 2, title: 'تصاميم مجّانية لك', desc: 'إن لم يكن لديك تصميم، فريقنا يُجهّز لك تصاميم على المنصّة مجاناً — فقط أرسل صور المساحة أو مخطّطها وأخبرنا بذوقك.' },
  { n: 3, title: 'معاينة مجّانية في جدّة', desc: 'فنّي يصلك للموقع داخل جدّة، يأخذ المقاسات، ويناقش التفاصيل.' },
  { n: 4, title: 'عرض سعر مفصّل', desc: 'نُقدّم لك عرضاً واضحاً يشمل المواد والتنفيذ — ومدّة المشروع تُحدَّد حسب طبيعة الديكور والاتفاق المتبادَل.' },
  { n: 5, title: 'توقيع العقد', desc: 'عقد رسمي يوضّح النطاق، الجدول، الدفعات، الضمان، وحقوق الطرفَين قبل أيّ عمل على الأرض.' },
  { n: 6, title: 'التنفيذ', desc: 'فريق متخصّص يبدأ العمل بمراحل تسليم محدّدة في العقد، مع تحديثات دورية لك.' },
  { n: 7, title: 'التسليم والضمان', desc: 'تسلّم المشروع نهائياً مع ضمان 12 شهر على التشطيبات والتركيب.' },
];

/** Scope of services — text-only, no icons per design directive. */
const SCOPE = [
  { title: 'النجارة والأثاث', desc: 'ديكورات جدارية، مكتبات، خزائن مخفيّة، مكاتب، رفوف حسب الطلب.' },
  { title: 'الجبس والجبسوم', desc: 'أسقف فرنسية، إضاءة مخفية، فواصل ديكورية، أقواس وأعمدة.' },
  { title: 'الإضاءة والكهرباء', desc: 'سبوت لايت، شرائط LED، ثريّات، أنظمة إضاءة ذكية.' },
  { title: 'الدهانات', desc: 'دهانات مغربية، أتش بي، أوربان، تشطيبات يدوية فنّية.' },
  { title: 'الأرضيات', desc: 'سيراميك، باركيه، رخام، بورسلين، سجاد جداري.' },
  { title: 'الأثاث الجاهز', desc: 'تنسيق وتنفيذ كنبات، طاولات، إكسسوارات حسب التصميم.' },
];

const FAQ = [
  {
    q: 'هل خدمة التنفيذ متوفّرة خارج جدّة؟',
    a: 'لا. خدمة التنفيذ متاحة في مدينة جدّة فقط، ولا نُنفّذ خارجها.',
  },
  {
    q: 'ما هي مدّة تنفيذ المشروع؟',
    a: 'تُحدَّد مدّة كل مشروع حسب طبيعة الديكور المطلوب وحجم العمل، ويُتَّفَق عليها كتابياً مع العميل في العقد قبل بدء التنفيذ.',
  },
  {
    q: 'هل يجب أن أصمّم بنفسي قبل طلب التنفيذ؟',
    a: 'لا. أرسل لنا صور المساحة أو مخطّطها على واتساب وفريقنا يُجهّز لك التصاميم على المنصّة بدون احتساب نقاط، حتى تختار التصميم النهائي قبل توقيع العقد.',
  },
  {
    q: 'ما هو الضمان؟',
    a: 'ضمان 12 شهر على التركيب والدهانات والكهرباء. أيّ عيب صناعي أو في التنفيذ خلال السنة الأولى نُصلِحه مجّاناً.',
  },
  {
    q: 'هل يمكن تعديل التصميم بعد بدء التنفيذ؟',
    a: 'نعم لكن قد يؤثّر على الجدول والتكلفة. نحرص على ثبات التصميم قبل البدء عبر اجتماع تأكيد، وأي تعديل لاحق يُوثَّق بملحق للعقد.',
  },
  {
    q: 'كيف أدفع؟',
    a: 'دفع مرحلي على دفعات حسب حجم المشروع: مقدّم، مراحل تنفيذ، ودفعة نهائية عند التسليم. كل دفعة بفاتورة، والتفاصيل مذكورة في العقد.',
  },
  {
    q: 'هل المباني المخدومة سكنية فقط؟',
    a: 'لا — ننفّذ المباني السكنية والتجارية في جدّة (مكاتب، مقاهي، مطاعم، محلات، عيادات، صالونات…)، أمّا المباني الصناعية أو المنشآت الكبرى فهي خارج نطاق خدماتنا حالياً.',
  },
];

export default function ImplementationPage() {
  return (
    <>
      <Navbar />

      {/* ── Hero — Jeddah-only, clear, icon-free, well-balanced grid ──── */}
      <section className="hero-bg relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1">
            <span className="badge bg-clay/15 text-clay-dark mb-5">جدّة فقط · داخل حدود المدينة</span>
            <h1 className="display text-3xl sm:text-4xl md:text-5xl font-black text-navy leading-[1.15] mb-5 break-words">
              نُصمّم بصميمك… ثُمّ نُنفّذه على أرض الواقع
            </h1>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-7 max-w-xl">
              فريقنا في <strong className="text-navy">جدّة</strong> يحوّل تصاميم الذكاء الاصطناعي إلى مشروع
              ديكور حقيقي للمباني <strong className="text-navy">السكنية والتجارية</strong> داخل المدينة —
              تشطيب، جبس، إضاءة، أرضيات، دهانات، وأثاث مخصّص. تبدأ الرحلة من معاينة مجّانية،
              يتبعها عرض سعر، ثُمّ توقيع عقد، وتنتهي بضمان 12 شهر.
            </p>

            <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-4 mb-6">
              <div className="font-black text-emerald-800 text-base mb-1">
                🎁 لا يُشترَط أن تصمّم بنفسك — تصاميم مجانية لك
              </div>
              <p className="text-sm text-emerald-900 leading-relaxed">
                ليس عليك استخدام الاستوديو. أرسل لنا صور المساحة أو مخطّطها بواتساب، وفريقنا يُجهّز لك
                <strong> تصاميم مجانية على المنصّة</strong> لكل مساحات المشروع — حتى تختار التصميم النهائي
                قبل بدء التنفيذ.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/966570205674?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%B7%D9%84%D8%A8%20%D9%85%D8%B9%D8%A7%D9%8A%D9%86%D8%A9%20%D9%84%D8%AA%D9%86%D9%81%D9%8A%D8%B0%20%D8%AF%D9%8A%D9%83%D9%88%D8%B1%20%D9%81%D9%8A%20%D8%AC%D8%AF%D8%A9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-2xl px-6 py-3.5 text-base sm:text-lg transition-colors shadow-md"
              >
                واتساب — طلب معاينة
              </a>
              <Link
                href="/contact?kind=implementation"
                className="inline-flex items-center justify-center gap-2 btn-secondary text-base sm:text-lg px-6 py-3.5"
              >
                نموذج طلب معاينة ←
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-5 text-xs text-gray-500 flex-wrap">
              <span>📍 جدّة فقط</span>
              <span>📝 عقد رسمي</span>
              <span>🛡️ ضمان 12 شهر</span>
              <span>💳 دفع مرحلي</span>
            </div>
          </div>

          {/* Right column — clean stat / contact card stack (no decorative chair) */}
          <div className="order-1 md:order-2 space-y-3">
            <div className="rounded-3xl bg-white border-2 border-clay/30 p-5 shadow-sm">
              <div className="text-[11px] font-bold text-clay-dark uppercase tracking-widest mb-3">
                صفوف رايقة · تنفيذ
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Stat label="نطاق العمل" value="جدّة فقط" />
                <Stat label="الضمان" value="12 شهر" />
                <Stat label="مدّة المشروع" value="حسب الاتفاق" hint="تُحدَّد بحسب طبيعة الديكور" />
                <Stat label="المعاينة" value="مجّانية" />
              </div>
              <div className="rounded-2xl bg-navy text-white p-4 flex items-center gap-4">
                <div>
                  <div className="text-[11px] text-clay-light mb-0.5">للحجز والاستفسار</div>
                  <a href="tel:+966570205674" className="font-black text-lg sm:text-xl tracking-wide" dir="ltr">
                    +966 57 020 5674
                  </a>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-cream border border-clay/20 p-4 text-center">
              <div className="text-xs text-gray-700 leading-relaxed">
                نخدم المباني <strong>السكنية</strong> والمباني <strong>التجارية</strong> داخل جدّة.
                خارج جدّة لا نُنفّذ — نشكر تواصلك ونعتذر مسبقاً.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scope of services — TEXT-ONLY cards (no icons) */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-eyebrow">نطاق العمل</span>
            <h2 className="section-title">ما الذي ننفّذه</h2>
            <p className="section-subtitle mx-auto">
              من قواطع الجبس حتى آخر تشطيب — حلّ كامل تحت إشراف فريق واحد، داخل مدينة جدّة فقط.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCOPE.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border-2 border-gray-100 hover:border-clay/40 transition-colors p-5 bg-white"
              >
                <h3 className="font-black text-navy text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process timeline — 7 steps, contract signing included, no day windows */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="section-eyebrow">مراحل المشروع</span>
            <h2 className="section-title">كيف نشتغل معك خطوة بخطوة</h2>
            <p className="section-subtitle mx-auto">
              عملية شفّافة منظَّمة بالعقد، تبدأ من المعاينة المجّانية حتى التسليم وضمان 12 شهر.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROCESS.map((p) => (
              <div key={p.n} className="rounded-2xl bg-white border-2 border-gray-100 hover:border-clay/40 transition-colors p-5 relative">
                <div className="absolute -top-4 -right-4 w-11 h-11 bg-clay text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md">
                  {p.n}
                </div>
                <div className="font-black text-navy text-lg mb-1.5 mt-2">{p.title}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Free-designs offer reinforced inside the process section too */}
          <div className="mt-10 rounded-2xl bg-white border-2 border-emerald-300 p-5 max-w-3xl mx-auto text-center">
            <div className="font-black text-emerald-800 text-lg mb-1">
              🎁 ليس عليك تصميم شيء بنفسك — نحن نُجهّز التصاميم لك
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              يكفي إرسال صور أو مخطّطات المساحة عبر واتساب، وفريقنا يُجهّز التصاميم النهائية على
              حسابك في المنصّة بدون احتساب نقاط — تختار وتعتمد، ثم نوقّع العقد ونبدأ التنفيذ.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio placeholder — no chair icon, just a clean «soon» state */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="section-eyebrow">معرض الأعمال</span>
            <h2 className="section-title">نضيف مشاريعنا تباعاً</h2>
            <p className="section-subtitle mx-auto">
              سنُضيف هنا أوّل دفعة من مشاريع جدّة المنفَّذة، وكلّها بصور حقيقية بعد التسليم.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-cream via-sand to-cream border border-gray-100 flex items-center justify-center"
              >
                <div className="text-center px-6">
                  <div className="text-xs font-bold text-clay-dark mb-1">قريباً</div>
                  <div className="text-[11px] text-gray-500">مشروع #{i} — جدّة</div>
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
            مساحتك تستحقّ أكثر من فكرة على الورق
          </h2>
          <p className="text-gray-300 mb-8 text-base md:text-lg leading-relaxed">
            خذ الخطوة التالية — معاينة مجّانية في أيّ منطقة من جدّة، بدون التزام، وعند توقيع العقد
            تحصل على تصاميمك مجاناً على المنصّة.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/966570205674?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%B7%D9%84%D8%A8%20%D9%85%D8%B9%D8%A7%D9%8A%D9%86%D8%A9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-2xl px-7 py-3.5 text-base md:text-lg transition-colors"
            >
              احجز معاينة عبر واتساب
            </a>
            <Link
              href="/contact?kind=implementation"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold rounded-2xl px-6 py-3.5 text-base md:text-lg transition-colors"
            >
              نموذج تواصل
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-cream/60 border border-gray-100 p-3">
      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="font-black text-navy text-base leading-tight">{value}</div>
      {hint && <div className="text-[10px] text-gray-500 mt-1 leading-tight">{hint}</div>}
    </div>
  );
}
