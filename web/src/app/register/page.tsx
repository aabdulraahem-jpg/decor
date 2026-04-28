'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Turnstile from '@/components/turnstile';
import { register } from '@/lib/api';
import { gatherSecuritySignals } from '@/lib/security';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

function prettifyRegisterError(err: unknown): string {
  const raw = err instanceof Error ? err.message : '';
  try {
    const parsed = JSON.parse(raw) as { message?: string };
    const msg = parsed.message ?? '';
    if (/already registered/i.test(msg)) return 'هذا البريد مسجّل مسبقاً. سجّل الدخول.';
    if (/blocked/i.test(msg)) return 'تم منع التسجيل من هذا الجهاز/الشبكة. تواصل معنا.';
    if (msg) return msg;
  } catch {}
  return 'فشل التسجيل. تحقّق من البيانات وحاول مجدّداً.';
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refFromUrl = (searchParams.get('ref') ?? '').toUpperCase().slice(0, 20);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [website, setWebsite] = useState(''); // honeypot — must stay empty
  const [captchaToken, setCaptchaToken] = useState('');
  const [referralCode, setReferralCode] = useState(refFromUrl);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signals, setSignals] = useState<{ deviceId: string; signedDeviceId: string; visitorId: string } | null>(null);

  useEffect(() => {
    if (refFromUrl) setReferralCode(refFromUrl);
  }, [refFromUrl]);

  // Pre-warm anti-abuse signals in the background so submit is instant
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const s = await gatherSecuritySignals();
      if (!cancelled) setSignals(s);
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (SITE_KEY && !captchaToken) {
      setError('يرجى إكمال التحقق من أنك لست روبوتاً');
      return;
    }
    if (form.password.length < 8) {
      setError('كلمة المرور يجب ألا تقل عن 8 حروف');
      return;
    }
    setLoading(true);
    try {
      // Use pre-warmed signals if available; otherwise gather now
      const s = signals ?? await gatherSecuritySignals();
      await register({
        email: form.email,
        password: form.password,
        name: form.name || undefined,
        captchaToken: captchaToken || undefined,
        deviceId: s.deviceId,
        visitorId: s.visitorId,
        signedDeviceId: s.signedDeviceId,
        website, // honeypot — empty for humans
        referralCode: referralCode || undefined,
      });
      router.push('/studio');
    } catch (err) {
      setError(prettifyRegisterError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-cream">
        <div className="w-full max-w-md">
          <div className="card">
            <h1 className="text-2xl font-black text-navy mb-1">انضم لـ سُفُف</h1>
            <p className="text-gray-500 text-sm mb-6">احصل على 5 نقاط مجاناً فور التسجيل</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">الاسم (اختياري)</span>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</span>
                <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور (8 حروف على الأقل)</span>
                <input className="input" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">
                  رمز الدعوة (اختياري)
                  {refFromUrl && <span className="badge bg-sage/20 text-sage-dark mr-2 text-[10px]">🎁 +5 نقاط إضافية</span>}
                </span>
                <input
                  className="input ltr font-mono uppercase tracking-widest"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase().slice(0, 20))}
                  placeholder="مثال: AHMD7K3X"
                />
              </label>
              {/* Honeypot — invisible to humans, attractive to bots. Must stay empty. */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
                <label htmlFor="website">Website (do not fill)</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <Turnstile onToken={setCaptchaToken} />
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'جارٍ الإنشاء...' : 'إنشاء حساب مجاني'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
              <div className="flex-1 h-px bg-gray-200" />
              <span>أو</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <a
              href="https://api.sufuf.pro/api/v1/auth/google"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white py-3 font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.227c1.886-1.737 2.986-4.296 2.986-7.351z"/>
                <path fill="#34A853" d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.227-2.51c-.895.6-2.04.955-3.391.955-2.605 0-4.81-1.76-5.595-4.123H3.073v2.59A9.997 9.997 0 0 0 12 22z"/>
                <path fill="#FBBC05" d="M6.405 13.9a6.011 6.011 0 0 1 0-3.8V7.51H3.073a9.997 9.997 0 0 0 0 8.98l3.332-2.59z"/>
                <path fill="#EA4335" d="M12 5.977c1.468 0 2.786.505 3.823 1.495l2.864-2.864C16.96 2.99 14.696 2 12 2 8.092 2 4.713 4.245 3.073 7.51l3.332 2.59C7.19 7.736 9.395 5.977 12 5.977z"/>
              </svg>
              المتابعة باستخدام قوقل
            </a>

            <div className="mt-5 text-sm text-gray-600 text-center">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-gold font-bold hover:underline">دخول</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
