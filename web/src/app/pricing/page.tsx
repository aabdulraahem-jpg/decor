'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { listPackages, PointsPackage } from '@/lib/api';

const POINTS_PER_DESIGN = 5;

export default function PricingPage() {
  const [pkgs, setPkgs] = useState<PointsPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listPackages().then(setPkgs).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-navy mb-2">باقات النقاط</h1>
          <p className="text-gray-600">كل تصميم يكلّف <strong>{POINTS_PER_DESIGN} نقاط</strong>. اختر الباقة المناسبة لك.</p>
          <div className="mt-3 inline-block badge bg-gold/15 text-gold-dark">🎁 5 تصاميم مجانية لكل مستخدم جديد</div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-16">جارٍ التحميل...</div>
        ) : pkgs.length === 0 ? (
          <div className="text-center text-gray-400 py-16">لا توجد باقات حالياً</div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {pkgs.map((p, idx) => {
              const designs = Math.floor(p.pointsAmount / POINTS_PER_DESIGN);
              const featured = idx === 2; // middle one
              return (
                <div
                  key={p.id}
                  className={
                    'card text-center relative ' +
                    (featured ? 'border-gold border-2 ring-4 ring-gold/20 transform md:scale-105' : '')
                  }
                >
                  {featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full">الأكثر شعبيّة</div>
                  )}
                  <div className="font-bold text-navy text-lg mb-1">{p.name}</div>
                  <div className="text-3xl font-black text-gold mb-1">{p.pointsAmount}</div>
                  <div className="text-xs text-gray-500 mb-3">نقطة (≈ {designs} تصميم)</div>
                  <div className="text-2xl font-black text-navy">{p.priceSar}<span className="text-sm font-normal text-gray-500"> ر.س</span></div>
                  <Link href="/account" className={featured ? 'btn-primary mt-4 inline-block w-full' : 'btn-secondary mt-4 inline-block w-full'}>
                    شراء
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center text-sm text-gray-500">
          نتقبّل الدفع عبر <strong>مدى</strong> و <strong>Apple Pay</strong> و <strong>فيزا/ماستركارد</strong> عبر Amazon Payment Services. <br />
          (الدفع سيُفعّل قريباً عند اكتمال الإعدادات.)
        </div>
      </main>
      <Footer />
    </>
  );
}
