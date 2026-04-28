'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { submitContactMessage, ApiError, SubmitContactPayload } from '@/lib/api';

type Kind = NonNullable<SubmitContactPayload['kind']>;

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactInner />
    </Suspense>
  );
}

function ContactInner() {
  const params = useSearchParams();
  const initialKind: Kind = params.get('kind') === 'implementation' ? 'IMPLEMENTATION' : 'GENERAL';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [kind, setKind] = useState<Kind>(initialKind);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setKind(params.get('kind') === 'implementation' ? 'IMPLEMENTATION' : 'GENERAL');
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending) return;
    setError('');
    setSending(true);
    try {
      await submitContactMessage({ name, email, phone: phone || undefined, subject: subject || undefined, kind, message });
      setSent(true);
      setName(''); setEmail(''); setPhone(''); setSubject(''); setMessage('');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'تعذّر إرسال الرسالة. حاول لاحقاً.';
      setError(msg);
    } finally {
      setSending(false);
    }
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
                  <a href="mailto:support@sufuf.pro" className="font-black text-navy text-lg hover:text-clay-dark" dir="ltr">support@sufuf.pro</a>
                  <p className="text-xs text-gray-500 mt-1">للدعم العام، الفوترة، والشراكات.</p>
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/966570205674?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%B5%D9%81%D9%88%D9%81%20%D8%B1%D8%A7%D9%8A%D9%82%D8%A9"
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:border-sage hover:bg-sage/5 transition-colors block"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">واتساب — رد سريع</div>
                  <div className="font-black text-navy text-lg" dir="ltr">+966 57 020 5674</div>
                  <p className="text-xs text-gray-500 mt-1">دعم فني، شراكات، طلبات تنفيذ ديكور في جدّة. اضغط للمحادثة.</p>
                </div>
              </div>
            </a>

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
                    <DRow label="البريد الإلكتروني" value={<a href="mailto:support@sufuf.pro" className="text-clay-dark font-bold" dir="ltr">support@sufuf.pro</a>} />
                    <DRow label="ساعات العمل" value="الأحد – الخميس · 9 صباحاً – 5 مساءً (KSA)" />
                  </dl>
                  <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">
                    <strong>مؤسسة صفوف رايقة</strong> هي من تملك وتدير هذا الموقع الإلكتروني
                    (<span dir="ltr">sufuf.pro</span>).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card space-y-4">
            <h2 className="font-black text-navy text-xl mb-1">أرسل رسالة</h2>
            <p className="text-sm text-gray-500 mb-2">رسالتك ستصل لفريقنا فوراً عبر لوحة الإدارة والبريد.</p>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">نوع الاستفسار</label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {([
                  { v: 'GENERAL', label: 'استفسار عام' },
                  { v: 'IMPLEMENTATION', label: '🛠️ تنفيذ ديكور (جدّة)' },
                  { v: 'PARTNERSHIP', label: 'شراكة / تعاون' },
                  { v: 'SUPPORT', label: 'دعم فنّي' },
                ] as { v: Kind; label: string }[]).map((k) => (
                  <button
                    type="button"
                    key={k.v}
                    onClick={() => setKind(k.v)}
                    className={`rounded-xl border px-3 py-2.5 text-right transition-colors ${
                      kind === k.v
                        ? 'bg-clay text-white border-clay'
                        : 'bg-white text-navy border-gray-200 hover:border-clay/40'
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">الاسم</label>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="اسمك الكريم" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">رقم الجوال (اختياري)</label>
                <input className="input ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" inputMode="tel" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">البريد الإلكتروني</label>
              <input type="email" className="input ltr" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">الموضوع (اختياري)</label>
              <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="عنوان قصير للرسالة" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">الرسالة</label>
              <textarea
                className="input min-h-[140px] resize-y"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder={kind === 'IMPLEMENTATION'
                  ? 'صف لنا المساحة (مثلاً: مجلس 5×6 م في حي الصفا، نبغى تشطيب جبس وإضاءة)…'
                  : 'اكتب رسالتك هنا...'}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{error}</div>
            )}

            <button type="submit" disabled={sending} className="btn-primary w-full">
              {sending ? 'جارٍ الإرسال...' : 'إرسال الرسالة ←'}
            </button>

            {sent && (
              <div className="bg-sage/10 border border-sage/30 text-sage-dark text-sm rounded-xl p-4 text-center">
                <div className="font-bold mb-1">✅ وصلتنا رسالتك</div>
                <p>سنتواصل معك خلال يوم عمل على البريد الإلكتروني المُسجّل.</p>
              </div>
            )}
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden="true">
      <path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8c1.9 1 4 1.6 6.2 1.6 7.2 0 13-5.8 13-13S23.2 3 16 3zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-4 1 1.1-3.9-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7 0-6 4.9-10.9 10.9-10.9S26.9 10 26.9 16 22 26.6 16 26.6zm6-8.2c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.2-.7.2-.2.3-.8 1.1-1 1.3-.2.2-.4.3-.7.1-.3-.2-1.4-.5-2.7-1.6-1-.9-1.7-2-1.9-2.4-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.2 2.2 3.4 5.4 4.7 1.9.7 2.6.8 3.5.7.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.4z" />
    </svg>
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
