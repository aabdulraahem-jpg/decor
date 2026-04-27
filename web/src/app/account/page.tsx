'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import { getMe, SessionUser } from '@/lib/api';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void getMe()
      .then((u) => setUser(u as SessionUser))
      .catch((e: Error) => {
        if (e.message.includes('401')) router.push('/login');
        else setError('فشل التحميل');
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-navy mb-6">حسابي</h1>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
        {loading ? (
          <div className="text-gray-400 text-center py-16">جارٍ التحميل...</div>
        ) : user && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card">
              <div className="text-xs text-gray-500 mb-1">الاسم</div>
              <div className="font-bold text-navy">{user.name ?? '—'}</div>
            </div>
            <div className="card">
              <div className="text-xs text-gray-500 mb-1">البريد الإلكتروني</div>
              <div className="font-bold text-navy ltr text-left">{user.email}</div>
            </div>
            <div className="card text-center">
              <div className="text-xs text-gray-500 mb-1">رصيد النقاط</div>
              <div className="text-3xl font-black text-gold">{user.pointsBalance}</div>
              <Link href="/pricing" className="text-xs text-gold hover:underline mt-1 inline-block">شراء المزيد</Link>
            </div>
          </div>
        )}

        <div className="mt-8 card">
          <h2 className="font-bold text-navy mb-2">سجل الدفع</h2>
          <p className="text-sm text-gray-500">سيتوفّر سجلّ المعاملات هنا بعد إجراء أول عملية شراء.</p>
        </div>
      </main>
    </>
  );
}
