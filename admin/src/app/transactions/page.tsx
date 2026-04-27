'use client';

import { useEffect, useState } from 'react';
import { getTransactions, TransactionRow } from '@/lib/api';

function getToken() {
  return document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? '';
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  SUCCESS: { label: 'ناجحة', cls: 'badge-success' },
  PENDING: { label: 'معلّقة', cls: 'badge-pending' },
  FAILED: { label: 'فاشلة', cls: 'badge-failed' },
  REFUNDED: { label: 'مُسترجعة', cls: 'badge-pending' },
};

export default function TransactionsPage() {
  const [data, setData] = useState<{ transactions: TransactionRow[]; total: number } | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(s?: string) {
    setLoading(true);
    try {
      const res = await getTransactions(getToken(), 1, s || undefined);
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-navy">المعاملات</h1>
          <p className="text-gray-500 text-sm">إجمالي: {data?.total?.toLocaleString('ar') ?? '—'} معاملة</p>
        </div>
        <div className="flex gap-2">
          {['', 'SUCCESS', 'PENDING', 'FAILED'].map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); void load(s); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${status === s ? 'bg-navy text-white border-navy' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {s === '' ? 'الكل' : STATUS_MAP[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">جارٍ التحميل...</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">المستخدم</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">الباقة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">المبلغ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">النقاط</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.transactions.map((tx) => {
                const st = STATUS_MAP[tx.status] ?? { label: tx.status, cls: 'badge-pending' };
                return (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-navy">{tx.user.name ?? '—'}</div>
                      <div className="text-gray-400 text-xs">{tx.user.email}</div>
                    </td>
                    <td className="px-4 py-3">{tx.package.name}</td>
                    <td className="px-4 py-3 font-medium">{Number(tx.amountPaid).toFixed(2)} ﷼</td>
                    <td className="px-4 py-3">{tx.pointsAdded.toLocaleString('ar')}</td>
                    <td className="px-4 py-3">
                      <span className={st.cls}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(tx.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
