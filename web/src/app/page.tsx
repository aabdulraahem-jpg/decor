import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

const FEATURES = [
  { icon: '🪄', title: 'تصميم خلال ثوانٍ', desc: 'اختر العينات أو اكتب وصفك، وستحصل على تصميم احترافي من DALL-E خلال 10 ثوانٍ.' },
  { icon: '🎨', title: 'مكتبة عينات غنيّة', desc: 'مئات العينات من الجدران والبلاط والأثاث والإضاءة، مصنّفة وقابلة للتحميل.' },
  { icon: '✏️', title: 'تخصيص كامل', desc: 'حمّل صورة غرفتك الحقيقية، اختر مقاس الصورة، وأضف لمستك الخاصة بنص حر.' },
  { icon: '🔒', title: 'بياناتك آمنة', desc: 'تشفير كامل + Cloudflare Turnstile + قفل الحسابات بعد محاولات الدخول الفاشلة.' },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-cream to-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="badge bg-gold/15 text-gold-dark mb-4">جديد · مدعوم بـ gpt-image-2</span>
            <h1 className="text-4xl md:text-5xl font-black text-navy leading-tight mb-4">
              صمّم ديكور غرفتك<br />بالذكاء الاصطناعي
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              ارفع صورة غرفتك، اختر العينات التي تعجبك، أو اكتب وصفاً مخصّصاً. سُفُف ينتج لك تصميماً واقعياً بدقّة عالية خلال ثوانٍ.
            </p>
            <div className="flex gap-3">
              <Link href="/register" className="btn-primary text-lg">جرّب 5 تصاميم مجاناً</Link>
              <Link href="/studio" className="btn-secondary text-lg">شاهد الاستوديو</Link>
            </div>
            <div className="mt-4 text-sm text-gray-500">لا حاجة لبطاقة ائتمان · 5 صور مجانية لكل مستخدم</div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-gold/30 to-navy/10 rounded-3xl flex items-center justify-center text-6xl">
              🛋️
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg p-4 text-sm border border-gray-100">
              <div className="font-bold text-navy">+250 عيّنة</div>
              <div className="text-gray-500 text-xs">جدران · بلاط · أثاث</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-navy mb-2">لماذا سُفُف؟</h2>
          <p className="text-gray-500">منصّة كاملة من الفكرة حتى التنفيذ</p>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-navy mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-3">ابدأ الآن وحوّل غرفتك</h2>
          <p className="text-gray-300 mb-6">سجّل حساباً مجانياً واحصل على 5 تصاميم فوراً.</p>
          <Link href="/register" className="btn-primary text-lg inline-block">إنشاء حساب مجاني</Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
