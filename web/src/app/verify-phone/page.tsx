'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import { startPhoneVerify, confirmPhoneVerify } from '@/lib/api';

export default function VerifyPhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('+966');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [grantedPoints, setGrantedPoints] = useState<number | null>(null);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\+?[1-9]\d{6,14}$/.test(phone)) { setError('أدخل رقماً دولياً صحيحاً (+966...)'); return; }
    setBusy(true);
    try {
      await startPhoneVerify(phone);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الإرسال');
    } finally { setBusy(false); }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code)) { setError('الرمز 6 أرقام'); return; }
    setBusy(true);
    try {
      const r = await confirmPhoneVerify(phone, code);
      setGrantedPoints(r.pointsGranted);
      setTimeout(() => router.push('/studio'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'الرمز غير صحيح');
    } finally { setBusy(false); }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-cream p-4">
        <div className="w-full max-w-md card">
          {grantedPoints !== null ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-3">🎉</div>
              <h1 className="text-2xl font-black text-navy mb-2">تم التحقق بنجاح</h1>
              <p className="text-gray-500 mb-3">حصلت على <strong className="text-gold">+{grantedPoints} نقاط</strong> هدية</p>
              <p className="text-xs text-gray-400">نُحوّلك للاستوديو خلال ثوانٍ...</p>
            </div>
          ) : step === 'phone' ? (
            <form onSubmit={sendCode} className="space-y-3">
              <h1 className="text-2xl font-black text-navy">تحقّق برقم الجوال</h1>
              <p className="text-sm text-gray-500">سنرسل لك رمزاً عبر واتساب. التحقق يمنحك <strong className="text-gold">+5 نقاط</strong> هدية إضافية لتجربة أوسع.</p>
              <label className="block">
                <span className="block text-xs text-gray-500 mb-1">رقم الجوال (دولي)</span>
                <input className="input ltr text-lg tracking-wider" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+9665XXXXXXXX" required />
              </label>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
              <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'يرسل...' : '📱 أرسل رمز التحقق عبر واتساب'}</button>
              <div className="text-[11px] text-gray-400 text-center">رقمك آمن — يُستخدم فقط لتأكيد أنك مستخدم حقيقي ولن يُشارك مع أي طرف ثالث.</div>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-3">
              <h1 className="text-2xl font-black text-navy">أدخل رمز التحقق</h1>
              <p className="text-sm text-gray-500">أرسلنا رمزاً مكوّناً من 6 أرقام إلى <strong>{phone}</strong>. صلاحية الرمز 10 دقائق.</p>
              <label className="block">
                <span className="block text-xs text-gray-500 mb-1">الرمز (6 أرقام)</span>
                <input className="input ltr text-2xl tracking-[0.5em] text-center font-mono" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required autoFocus />
              </label>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
              <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'يتحقق...' : '✅ تأكيد'}</button>
              <button type="button" onClick={() => { setStep('phone'); setCode(''); }} className="text-xs text-gray-500 hover:text-navy w-full">رقم خاطئ؟ تغيير</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
