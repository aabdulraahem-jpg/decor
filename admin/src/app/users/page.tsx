'use client';

import { useEffect, useState } from 'react';
import { getUsers, adjustPoints, AdminUserRow } from '@/lib/api';

function getToken() {
  return document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? '';
}

export default function UsersPage() {
  const [data, setData] = useState<{ users: AdminUserRow[]; total: number } | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [pointsAmount, setPointsAmount] = useState('');
  const [error, setError] = useState('');

  async function load(q?: string) {
    setLoading(true);
    try {
      const res = await getUsers(getToken(), 1, q);
      setData(res);
    } catch {
      setError('فشل تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleAdjustPoints(userId: string) {
    const amount = Number(pointsAmount);
    if (isNaN(amount)) return;
    try {
      await adjustPoints(getToken(), userId, amount);
      setAdjustingId(null);
      setPointsAmount('');
      await load(search);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل التعديل');
    }
  }

  const roleLabel = (role: string) =>
    role === 'ADMIN' ? <span className="badge-success">أدمن</span> : <span className="badge-pending">مستخدم</span>;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('ar-SA');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-navy">المستخدمون</h1>
          <p className="text-gray-500 text-sm">إجمالي: {data?.total?.toLocaleString('ar') ?? '—'} مستخدم</p>
        </div>
        <div className="flex gap-3">
          <input
            className="input w-64"
            placeholder="بحث بالبريد أو الاسم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(search)}
          />
          <button onClick={() => load(search)} className="btn-secondary">بحث</button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-gray-400">جارٍ التحميل...</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">المستخدم</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">الدور</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">النقاط</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">المشاريع</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">المعاملات</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">تاريخ التسجيل</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy">{u.name ?? '—'}</div>
                    <div className="text-gray-400 text-xs">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">{roleLabel(u.role)}</td>
                  <td className="px-4 py-3 font-medium">{u.pointsBalance.toLocaleString('ar')}</td>
                  <td className="px-4 py-3">{u._count.projects}</td>
                  <td className="px-4 py-3">{u._count.transactions}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    {adjustingId === u.id ? (
                      <div className="flex gap-1">
                        <input
                          className="input w-20 text-xs py-1"
                          type="number"
                          placeholder="±نقاط"
                          value={pointsAmount}
                          onChange={(e) => setPointsAmount(e.target.value)}
                        />
                        <button onClick={() => handleAdjustPoints(u.id)} className="btn-primary text-xs py-1 px-2">حفظ</button>
                        <button onClick={() => setAdjustingId(null)} className="text-gray-400 text-xs px-1">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAdjustingId(u.id); setPointsAmount(''); }}
                        className="text-gold hover:underline text-xs"
                      >
                        تعديل النقاط
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
