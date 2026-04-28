'use client';

import { useEffect, useState } from 'react';
import { getMyInsights, UserInsights } from '@/lib/api';

export default function InsightsCard() {
  const [data, setData] = useState<UserInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getMyInsights()
      .then(setData)
      .catch(() => { /* ignore — fail silently */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card text-center text-gray-400 text-sm">جارٍ تحميل الإحصائيات...</div>;
  if (!data) return null;

  const max = Math.max(1, ...data.series.map((p) => p.designs));
  const fmtSAR = (n: number) => `${(n / 100).toFixed(2)} ر.س`;

  return (
    <section className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-navy text-xl">إحصائياتك</h2>
        <span className="text-xs text-gray-500">آخر 14 يوم</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat n={data.totalDesigns} l="إجمالي التصاميم" />
        <Stat n={data.designsLast30Days} l="هذا الشهر" accent="clay" />
        <Stat n={data.projectsCount} l="عدد المشاريع" />
        <Stat n={data.transactions.totalPointsBought} l="نقاط مُشتراة" />
      </div>

      {/* Bar chart */}
      <div>
        <div className="text-xs text-gray-500 mb-2 font-bold">توليدك اليومي</div>
        <div className="flex items-end gap-1.5 h-24 bg-cream/40 rounded-xl p-2">
          {data.series.map((p) => {
            const h = p.designs === 0 ? 4 : Math.max(8, (p.designs / max) * 100);
            return (
              <div key={p.date} className="flex-1 flex flex-col items-center justify-end gap-1" title={`${p.date}: ${p.designs}`}>
                <div
                  className={`w-full rounded-t-md ${p.designs > 0 ? 'bg-clay' : 'bg-gray-200'} transition-all`}
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-gray-400">{p.date.slice(-2)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {data.transactions.count > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>📊 إجمالي المُنفَق: <strong className="text-navy">{fmtSAR(data.transactions.totalSpent)}</strong></span>
          <span>🛒 عمليات شراء ناجحة: <strong className="text-navy">{data.transactions.count}</strong></span>
        </div>
      )}
    </section>
  );
}

function Stat({ n, l, accent }: { n: number; l: string; accent?: 'clay' }) {
  const cls = accent === 'clay' ? 'bg-clay/10 text-clay-dark' : 'bg-cream/60 text-navy';
  return (
    <div className={`rounded-2xl p-3 text-center ${cls}`}>
      <div className="display text-2xl font-black">{n.toLocaleString('ar')}</div>
      <div className="text-[11px] opacity-80 mt-0.5">{l}</div>
    </div>
  );
}
