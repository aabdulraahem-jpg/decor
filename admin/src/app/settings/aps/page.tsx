'use client';

import { useEffect, useState, FormEvent } from 'react';
import { getApsSettings, updateApsSettings, ApsSettings } from '@/lib/api';

function getToken() {
  return document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? '';
}

const empty: ApsSettings = {
  merchantId: '',
  accessCode: '',
  shaRequestPhrase: '',
  shaResponsePhrase: '',
  baseUrl: 'https://checkout.paymentservices.amazon.com/FortAPI/paymentPage',
};

export default function ApsSettingsPage() {
  const [form, setForm] = useState<ApsSettings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getApsSettings(getToken())
      .then((data) => {
        if (data?.config) {
          setForm({
            merchantId: (data.config as ApsSettings).merchantId ?? '',
            accessCode: (data.config as ApsSettings).accessCode ?? '',
            shaRequestPhrase: (data.config as ApsSettings).shaRequestPhrase ?? '',
            shaResponsePhrase: (data.config as ApsSettings).shaResponsePhrase ?? '',
            baseUrl: (data.config as ApsSettings).baseUrl ?? empty.baseUrl,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await updateApsSettings(getToken(), form);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  }

  function field(key: keyof ApsSettings, label: string, placeholder = '', type = 'text') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          className="input"
          type={type}
          value={form[key] ?? ''}
          placeholder={placeholder}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-navy">إعدادات الدفع — Amazon Payment Services</h1>
        <p className="text-gray-500 text-sm mt-1">
          أدخل بيانات الاعتماد من لوحة تحكم APS (PayFort).
          ستُطبَّق فوراً على جميع عمليات الشراء.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400">جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="card space-y-4">
          <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 text-sm text-navy">
            <strong>ملاحظة:</strong> يمكنك استخدام بيئة الاختبار أولاً (<code>sbcheckout.paymentservices.amazon.com</code>)
            ثم تغييرها للإنتاج عند الجاهزية.
          </div>

          {field('merchantId', 'Merchant Identifier', 'TestMerchant')}
          {field('accessCode', 'Access Code', 'zx0IPmPy5jp1vAz8Kpg7')}
          {field('shaRequestPhrase', 'SHA Request Phrase', 'TESTSHAIN')}
          {field('shaResponsePhrase', 'SHA Response Phrase', 'TESTSHAOUT')}
          {field('baseUrl', 'Base URL (Payment Page)', 'https://checkout.paymentservices.amazon.com/FortAPI/paymentPage')}

          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
            <div><strong>Webhook URL للإشعارات:</strong> <code>https://api.sufuf.pro/api/v1/payments/webhook</code></div>
            <div><strong>Return URL الموبايل:</strong> <code>https://api.sufuf.pro/api/v1/payments/return</code></div>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
              ✅ تم حفظ إعدادات الدفع بنجاح
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full disabled:opacity-60">
            {saving ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </form>
      )}
    </div>
  );
}
