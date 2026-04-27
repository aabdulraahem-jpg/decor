'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { listPackages, PointsPackage } from '@/lib/api';

const POINTS_PER_DESIGN = 5;

const TRUST = [
  { icon: '🔒', title: 'دفع مشفّر 256-bit', desc: 'حماية كاملة لبياناتك المالية' },
  { icon: '🇸🇦', title: 'بوابة معتمدة', desc: 'Amazon Payment Services في السعودية' },
  { icon: '↩️', title: 'استرداد سهل', desc: 'سياسة استرداد واضحة خلال 7 أيام' },
  { icon: '💬', title: 'دعم سريع', desc: 'فريق دعم يتحدث العربية على مدار الساعة' },
];

export default function PricingPage() {
  const [pkgs, setPkgs] = useState<PointsPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listPackages().then(setPkgs).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="hero-bg py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <span className="section-eyebrow">الأسعار</span>
            <h1 className="section-title mb-3">باقات النقاط</h1>
            <p className="section-subtitle mx-auto">
              كل تصميم يكلّف <strong className="text-navy">{POINTS_PER_DESIGN} نقاط</strong>.
              اختر الباقة الأنسب لك.
            </p>
            <div className="mt-5 inline-block badge bg-green-50 text-green-700 border border-green-200 text-sm px-4 py-2">
              🎁 5 تصاميم مجانية لكل مستخدم جديد — بدون بطاقة ائتمان
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="text-center text-gray-400 py-16">جارٍ التحميل...</div>
            ) : pkgs.length === 0 ? (
              <div className="text-center text-gray-400 py-16">لا توجد باقات حالياً</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {pkgs.map((p, idx) => {
                  const designs = Math.floor(p.pointsAmount / POINTS_PER_DESIGN);
                  const featured = idx === 2;
                  const perDesign = (Number(p.priceSar) / Math.max(designs, 1)).toFixed(2);
                  return (
                    <div
                      key={p.id}
                      className={
                        'card text-center relative transition-all ' +
                        (featured ? 'border-gold border-2 ring-4 ring-gold/20 lg:scale-105 shadow-2xl shadow-gold/10' : 'hover:border-gold/30 hover:shadow-lg')
                      }
                    >
                      {featured && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-l from-gold to-gold-dark text-navy text-xs font-black px-4 py-1.5 rounded-full shadow-md">⭐ الأكثر طلباً</div>
                      )}
                      <div className="font-black text-navy text-lg mb-3 mt-2">{p.name}</div>
                      <div className="my-3">
                        <span className="text-4xl font-black text-navy">{p.priceSar}</span>
                        <span className="text-sm text-gray-500"> ر.س</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-4">~ {perDesign} ر.س للتصميم</div>
                      <div className="bg-gold/10 rounded-xl py-3 mb-4">
                        <div className="text-3xl font-black text-gold-dark">{p.pointsAmount}</div>
                        <div className="text-xs text-navy/70">نقطة (≈ {designs} تصميم)</div>
                      </div>
                      <Link href="/account" className={featured ? 'btn-primary inline-block w-full' : 'btn-secondary inline-block w-full'}>
                        {featured ? 'اشترِ الآن' : 'اختر هذه الباقة'}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Payment methods */}
        <section className="py-12 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-8">
              <span className="section-eyebrow">طرق الدفع</span>
              <h2 className="text-2xl md:text-3xl font-black text-navy">ادفع بالطريقة التي تفضّلها</h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {[
                { label: 'مدى', sub: 'البطاقة السعودية', emoji: '💚' },
                { label: 'Apple Pay', sub: 'دفع ذكي بضغطة', emoji: '🍎' },
                { label: 'Visa', sub: 'حول العالم', emoji: '💳' },
                { label: 'Mastercard', sub: 'موثوقة', emoji: '💳' },
                { label: 'Apple Pay', sub: 'لـ iPhone و Mac', emoji: '📱' },
              ].map((m, i) => (
                <div key={i} className="card min-w-[160px] text-center hover:border-gold/40 transition">
                  <div className="text-3xl mb-1">{m.emoji}</div>
                  <div className="font-bold text-navy">{m.label}</div>
                  <div className="text-[11px] text-gray-500">{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {TRUST.map((t) => (
                <div key={t.title} className="card text-center">
                  <div className="text-3xl mb-2">{t.icon}</div>
                  <div className="font-bold text-navy">{t.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ-ish section */}
        <section className="py-12 bg-cream">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-black text-navy text-center mb-6">أسئلة شائعة</h2>
            <div className="space-y-3">
              {[
                { q: 'هل تنتهي صلاحية النقاط؟', a: 'لا، نقاطك تبقى لك للأبد. استخدمها متى شئت.' },
                { q: 'هل يمكن استرداد المبلغ؟', a: 'نعم، خلال 7 أيام من الشراء طالما لم تستهلك أكثر من 50% من النقاط.' },
                { q: 'كم تستغرق عملية التوليد؟', a: 'من 10 إلى 30 ثانية حسب جودة الموديل المختار من الإدارة.' },
                { q: 'هل التصاميم ملكي؟', a: 'نعم، أي تصميم تنتجه يخصّك بالكامل لاستخدامه شخصياً أو تجارياً.' },
              ].map((f, i) => (
                <details key={i} className="card cursor-pointer">
                  <summary className="font-bold text-navy">{f.q}</summary>
                  <p className="text-sm text-gray-600 mt-2">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
