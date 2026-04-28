'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import { getMe, updateMyName, SessionUser } from '@/lib/api';
import InsightsCard from '@/components/insights-card';
import ReferralCard from '@/components/referral-card';

function initials(name: string | null, email: string): string {
  const src = (name && name.trim()) || email;
  const parts = src.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function formatJoinedDate(iso?: string): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ar', { year: 'numeric', month: 'long' });
  } catch { return '—'; }
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // edit-name state
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    void getMe()
      .then((u) => setUser(u as SessionUser))
      .catch((e: Error) => {
        if (e.message.includes('401')) router.push('/login');
        else setError('فشل التحميل');
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function saveName() {
    setNameError('');
    setSavingName(true);
    try {
      const updated = await updateMyName(nameDraft);
      setUser(updated as SessionUser);
      setEditingName(false);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSavingName(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>}

        {loading ? (
          <div className="text-gray-400 text-center py-20">جارٍ التحميل...</div>
        ) : user && (
          <>
            {/* Profile header card */}
            <section className="card mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-clay text-white font-black text-2xl flex items-center justify-center shrink-0">
                {initials(user.name, user.email)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-black text-navy truncate">
                    {user.name ?? 'بدون اسم'}
                  </h1>
                  {user.role === 'ADMIN' && (
                    <span className="badge bg-clay/15 text-clay-dark">🛡️ مشرف</span>
                  )}
                  {user.authProvider === 'GOOGLE' && (
                    <span className="badge bg-blue-50 text-blue-700">G قوقل</span>
                  )}
                  {user.emailVerified && (
                    <span className="badge bg-green-50 text-green-700">✓ موثّق</span>
                  )}
                </div>
                <div className="text-gray-500 text-sm mt-1 ltr text-left">{user.email}</div>
              </div>
              <Link href="/studio" className="btn-secondary text-sm">
                ابدأ تصميم جديد ←
              </Link>
            </section>

            {/* Admin shortcut — only ADMIN */}
            {user.role === 'ADMIN' && (
              <section className="card mb-6 bg-gradient-to-l from-clay/10 to-sand border-clay/30">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🛡️</div>
                  <div className="flex-1">
                    <div className="font-black text-navy text-lg">لوحة الإدارة</div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      إدارة المستخدمين، العيّنات، الباقات، إعدادات الذكاء الاصطناعي، والمحتوى.
                    </p>
                  </div>
                  <a
                    href="https://admin.sufuf.pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm whitespace-nowrap"
                  >
                    افتح اللوحة ←
                  </a>
                </div>
              </section>
            )}

            {/* Stats */}
            <section className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="card text-center">
                <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">رصيد النقاط</div>
                <div className="text-4xl font-black text-clay-dark">{user.pointsBalance}</div>
                <Link href="/pricing" className="text-xs text-clay-dark hover:underline mt-2 inline-block">
                  شراء المزيد ←
                </Link>
              </div>
              <div className="card text-center">
                <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">تصاميم منشأة</div>
                <div className="text-4xl font-black text-navy">{user.designsCount ?? 0}</div>
                <Link href="/history" className="text-xs text-gray-500 hover:underline mt-2 inline-block">
                  عرض السجل ←
                </Link>
              </div>
              <div className="card text-center">
                <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">عضو منذ</div>
                <div className="text-xl font-black text-navy mt-2">{formatJoinedDate(user.createdAt)}</div>
              </div>
            </section>

            {/* Insights */}
            <div className="mb-6"><InsightsCard /></div>

            {/* Referral */}
            <div className="mb-6"><ReferralCard referralCode={user.referralCode} referredCount={user.referredCount} /></div>

            {/* Account info */}
            <section className="card mb-6">
              <h2 className="font-bold text-navy mb-4">معلومات الحساب</h2>
              <div className="space-y-4">
                {/* Name (editable) */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-1">الاسم</div>
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          className="input flex-1"
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          autoFocus
                          maxLength={120}
                        />
                        <button
                          onClick={saveName}
                          disabled={savingName}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          {savingName ? 'حفظ...' : 'حفظ'}
                        </button>
                        <button
                          onClick={() => { setEditingName(false); setNameError(''); }}
                          className="btn-ghost text-sm"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <div className="font-bold text-navy">{user.name ?? '—'}</div>
                    )}
                    {nameError && <div className="text-xs text-red-600 mt-1">{nameError}</div>}
                  </div>
                  {!editingName && (
                    <button
                      onClick={() => { setNameDraft(user.name ?? ''); setEditingName(true); }}
                      className="text-sm text-clay-dark hover:underline shrink-0"
                    >
                      تعديل
                    </button>
                  )}
                </div>

                {/* Email (read-only) */}
                <div className="pb-4 border-b border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">البريد الإلكتروني</div>
                  <div className="font-bold text-navy ltr text-left">{user.email}</div>
                </div>

                {/* Auth provider */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">طريقة تسجيل الدخول</div>
                  <div className="font-bold text-navy">
                    {user.authProvider === 'GOOGLE' ? '🔑 حساب قوقل' : '✉️ بريد + كلمة مرور'}
                  </div>
                </div>
              </div>
            </section>

            {/* Payment history placeholder */}
            <section className="card">
              <h2 className="font-bold text-navy mb-2">سجل الدفع</h2>
              <p className="text-sm text-gray-500">سيتوفّر سجلّ المعاملات هنا بعد إجراء أول عملية شراء.</p>
            </section>
          </>
        )}
      </main>
    </>
  );
}
