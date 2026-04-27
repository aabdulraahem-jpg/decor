'use client';

import { useEffect, useState, FormEvent } from 'react';
import { getAiSettings, updateAiSettings, AiSettings } from '@/lib/api';

function getToken() {
  return document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? '';
}

export default function AiSettingsPage() {
  const [form, setForm] = useState<AiSettings>({ apiKey: '', modelName: 'dall-e-3' });
  const [hasKey, setHasKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    getAiSettings(getToken())
      .then((data) => {
        if (data) {
          setHasKey(data.hasKey ?? false);
          setForm({ apiKey: '', modelName: data.modelName ?? 'dall-e-3' });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form.apiKey && !hasKey) {
      setError('يرجى إدخال مفتاح API');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await updateAiSettings(getToken(), form);
      setHasKey(true);
      setForm((f) => ({ ...f, apiKey: '' }));
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  }

  const models = ['dall-e-3', 'dall-e-2', 'gpt-image-1'];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-navy">إعدادات الذكاء الاصطناعي — OpenAI</h1>
        <p className="text-gray-500 text-sm mt-1">
          مفتاح OpenAI API لتوليد التصاميم. يُخزَّن بشكل آمن في قاعدة البيانات.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-400">جارٍ التحميل...</div>
      ) : (
        <form onSubmit={save} className="card space-y-4">
          {hasKey && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-sm">
              ✅ يوجد مفتاح API محفوظ. أدخل مفتاحاً جديداً فقط إذا أردت تغييره.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key {hasKey && '(اتركه فارغاً للإبقاء على الحالي)'}
            </label>
            <div className="relative">
              <input
                className="input pr-10"
                type={showKey ? 'text' : 'password'}
                value={form.apiKey}
                placeholder={hasKey ? '••••••••••••••••' : 'sk-proj-...'}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {showKey ? 'إخفاء' : 'إظهار'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">النموذج</label>
            <select
              className="input"
              value={form.modelName}
              onChange={(e) => setForm({ ...form, modelName: e.target.value })}
            >
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
            <div><strong>كل تصميم يكلّف:</strong> 5 نقاط (= طلب واحد لـ DALL-E 3)</div>
            <div><strong>تكلفة DALL-E 3:</strong> ~$0.04 للصورة (1024×1024 standard)</div>
            <div><strong>النموذج الموصى به:</strong> dall-e-3 للجودة العالية</div>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
              ✅ تم حفظ إعدادات الذكاء الاصطناعي بنجاح
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
