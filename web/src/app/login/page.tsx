'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Turnstile from '@/components/turnstile';
import { login } from '@/lib/api';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

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
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول');
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
