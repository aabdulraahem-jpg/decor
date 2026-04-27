'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);

      if (data.user.role !== 'ADMIN') {
        setError('ليس لديك صلاحية الوصول إلى لوحة التحكم');
        setLoading(false);
        return;
      }

      // Save token in cookie via API route
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.accessToken, user: data.user }),
      });

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gold rounded-2xl mx-auto flex items-center justify-center mb-4">
            <span className="text-navy text-3xl font-black">س</span>
          </div>
          <h1 className="text-white text-3xl font-black">سُفُف</h1>
          <p className="text-gray-400 mt-1 text-sm">لوحة تحكم الإدارة</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-navy text-xl font-bold mb-6">تسجيل الدخول</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@sufuf.pro"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'جارٍ التحقق...' : 'دخول'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
