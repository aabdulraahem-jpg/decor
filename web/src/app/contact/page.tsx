'use client';

import { useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = encodeURIComponent(
      `الاسم: ${name}\nالبريد: ${email}\n\n${message}`,
    );
    const subj = encodeURIComponent(subject || 'استفسار من زائر صفوف رايقة');
    window.location.href = `mailto:hello@sufuf.pro?subject=${subj}&body=${body}`;
    setSent(true);
  }

  return (
    <>
      <Navbar />

      <section className="hero-bg">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-20 text-center">
          <span className="badge bg-clay/15 text-clay-dark mb-5">تواصل معنا</span>
          <h1 className="display text-4xl md:text-5xl font-black text-navy leading-[1.15] mb-4">
            نحبّ نسمع منك
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            استفسار، اقتراح، شراكة، أو طلب فاتورة ضريبية؟ راسلنا وسنرجع لك خلال يوم عمل.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-[1fr_1.2fr] gap-6">
          {/* Channels */}
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-clay/15 text-clay-dark flex items-center justify-center text-2xl shrink-0">📧</div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">البريد الإلكتروني</div>
                  <a href="mailto:hello@sufuf.pro" className="font-black text-navy text-lg hover:text-clay-dark" dir="ltr">hello@sufuf.pro</a>
                  <p className="text-xs text-gray-500 mt-1">للدعم العام، الفوترة، والشراكات.</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sage/15 text-sage-dark flex items-center justify-center text-2xl shrink-0">💬</div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">الدعم السريع</div>
                  <div className="font-black text-navy text-lg">واتساب الأعمال</div>
                  <p className="text-xs text-gray-500 mt-1">قريباً — للردّ على الاستفسارات الفنية خلال ساعات العمل.</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-navy/10 text-navy flex items-center justify-center text-2xl shrink-0">🏢</div>
                <div className="text-sm">
                  <div className="text-xs text-gray-500 mb-0.5">الجهة المُشغّلة والمالكة للموقع</div>
                  <div className="font-black text-navy text-lg leading-tight">مؤسسة صفوف رايقة</div>
                  <dl className="mt-3 space-y-1.5 text-[13px] text-gray-700">
                    <DRow label="نوع الكيان" value="مؤسسة فردية (سجل رئيسي نشط)" />
                    <DRow label="الرقم الوطني الموحّد" value={<span dir="ltr" className="font-mono">7054166389</span>} />
                    <DRow label="الدولة" value="المملكة العربية السعودية" />
                    <DRow label="المدينة" value="جدّة" />
                    <DRow label="الحيّ" value="حيّ البوادي" />
                    <DRow label="رقم المبنى" value={<span dir="ltr" className="font-mono">2475</span>} />
                    <DRow label="الرمز البريدي" value={<span dir="ltr" className="font-mono">23531</span>} />
                    <DRow label="البريد الإلكتروني" value={<a href="mailto:hello@sufuf.pro" className="text-clay-dark font-bold" dir="ltr">hello@sufuf.pro</a>} />
                    <DRow label="ساعات العمل" value="الأحد – الخميس · 9 صباحاً – 5 مساءً (KSA)" />
                  </dl>
                  <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
                    <strong>مؤسسة صفوف رايقة</strong> هي من تملك وتدير هذا الموقع الإلكتروني
                    (<span dir="ltr">sufuf.pro</span>). العنوان المنشور هنا — جدّة، حيّ البوادي، مبنى
                    <span dir="ltr" className="mx-1 font-mono">2475</span>، الرمز البريدي
                    <span dir="ltr" className="mx-1 font-mono">23531</span> — مطابق للعنوان المسجّل في السجل التجاري.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card space-y-4">
            <h2 className="font-black text-navy text-xl mb-1">أرسل رسالة</h2>
            <p className="text-sm text-gray-500 mb-2">سنفتح لك تطبيق البريد جاهزاً برسالتك.</p>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">الاسم</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="اسمك الكريم"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                className="input ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">الموضوع</label>
              <input
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="استفسار / دعم / شراكة..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">الرسالة</label>
              <textarea
                className="input min-h-[140px] resize-y"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="اكتب رسالتك هنا..."
              />
            </div>

            <button type="submit" className="btn-primary w-full">إرسال الرسالة ←</button>

            {sent && (
              <p className="text-sm text-sage-dark text-center">
                تمّ فتح تطبيق البريد. إن لم يفتح، راسلنا مباشرةً على hello@sufuf.pro
              </p>
            )}
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}

function DRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-2 items-baseline">
      <dt className="text-gray-500 text-[11px]">{label}</dt>
      <dd className="text-navy font-semibold">{value}</dd>
    </div>
  );
}
