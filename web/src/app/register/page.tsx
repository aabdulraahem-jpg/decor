'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Turnstile from '@/components/turnstile';
import { register } from '@/lib/api';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', password: '' });
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
    if (form.password.length < 8) {
      setError('كلمة المرور يجب ألا تقل عن 8 حروف');
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name || undefined,
        phoneNumber: form.phoneNumber || undefined,
        captchaToken: captchaToken || undefined,
      });
      router.push('/studio');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل التسجيل');
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
            <p className="text-gray-500 text-sm mb-6">احصل على 5 تصاميم مجانية فور التسجيل</p>
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
                <span className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال (اختياري — صيغة دولية)</span>
                <input className="input ltr" placeholder="+9665XXXXXXXX" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور (8 حروف على الأقل)</span>
                <input className="input" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
              </label>
              <Turnstile onToken={setCaptchaToken} />
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'جارٍ الإنشاء...' : 'إنشاء حساب مجاني'}
              </button>
            </form>
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
