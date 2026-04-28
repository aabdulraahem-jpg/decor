'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Turnstile from '@/components/turnstile';
import { login } from '@/lib/api';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

function prettifyAuthError(err: unknown): string {
  const raw = err instanceof Error ? err.message : '';
  try {
    const parsed = JSON.parse(raw) as { message?: string; error?: string; statusCode?: number };
    const msg = parsed.message ?? parsed.error ?? '';
    if (/invalid credentials/i.test(msg)) return 'البريد أو كلمة المرور غير صحيحة';
    if (/locked/i.test(msg)) return 'تم قفل الحساب مؤقتاً بعد عدّة محاولات. حاول بعد 15 دقيقة.';
    if (/captcha/i.test(msg)) return 'فشل التحقق من أنك لست روبوتاً. حدّث الصفحة وأعد المحاولة.';
    if (msg) return msg;
  } catch {
    if (/invalid credentials/i.test(raw)) return 'البريد أو كلمة المرور غير صحيحة';
  }
  return 'فشل تسجيل الدخول. تحقّق من البريد وكلمة المرور.';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (SITE_KEY && !captchaToken) {
      setError('يرجى إكمال التحقق من أنك لست روبوتاً');
      return;
    }
    setLoading(true);
    try {
      await login(email, password, captchaToken || undefined);
      router.push('/studio');
    } catch (err) {
      setError(prettifyAuthError(err));
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
            <h1 className="text-2xl font-black text-navy mb-1">مرحباً بعودتك 👋</h1>
            <p className="text-gray-500 text-sm mb-6">سجّل دخولك لمتابعة تصاميمك</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</span>
                <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</span>
                <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </label>
              <Turnstile onToken={setCaptchaToken} />
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'جارٍ التحقق...' : 'دخول'}
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
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-gold font-bold hover:underline">سجّل الآن</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
