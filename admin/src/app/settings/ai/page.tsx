'use client';

import { useEffect, useState, FormEvent } from 'react';
import { getAiSettings, updateAiSettings, AiSettings } from '@/lib/api';

function getToken() {
  return document.cookie.match(/admin_token=([^;]+)/)?.[1] ?? '';
}

export default function AiSettingsPage() {
  const [form, setForm] = useState<AiSettings & { systemPrompt?: string; visionModel?: string }>({
    apiKey: '',
    modelName: 'gpt-image-2',
    quality: 'medium',
    visionModel: 'gpt-4o-mini',
    systemPrompt: '',
  });
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
          const d = data as AiSettings & { systemPrompt?: string; visionModel?: string };
          setForm({
            apiKey: '',
            modelName: d.modelName ?? 'gpt-image-2',
            quality: d.quality ?? 'medium',
            visionModel: d.visionModel ?? 'gpt-4o-mini',
            systemPrompt: d.systemPrompt ?? '',
          });
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

  const models = ['gpt-image-2', 'gpt-image-1', 'dall-e-3', 'dall-e-2'];
  const qualityOptions = form.modelName?.startsWith('gpt-image')
    ? [
        { v: 'low', label: 'منخفضة (~$0.006)' },
        { v: 'medium', label: 'متوسطة (~$0.05) — موصى بها' },
        { v: 'high', label: 'عالية (~$0.21)' },
      ]
    : [
        { v: 'standard', label: 'قياسية' },
        { v: 'hd', label: 'HD' },
      ];

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">النموذج</label>
              <select
                className="input"
                value={form.modelName}
                onChange={(e) => setForm({ ...form, modelName: e.target.value, quality: e.target.value.startsWith('gpt-image') ? 'medium' : 'standard' })}
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">جودة التوليد</label>
              <select
                className="input"
                value={form.quality ?? 'medium'}
                onChange={(e) => setForm({ ...form, quality: e.target.value as AiSettings['quality'] })}
              >
                {qualityOptions.map((q) => (
                  <option key={q.v} value={q.v}>{q.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              موديل الرؤية (لوصف الصور تلقائياً)
            </label>
            <select
              className="input"
              value={form.visionModel ?? 'gpt-4o-mini'}
              onChange={(e) => setForm({ ...form, visionModel: e.target.value })}
            >
              {['gpt-4o-mini', 'gpt-4o', 'gpt-5-mini', 'gpt-5'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              يُستخدم في زر "✨ صف بالذكاء" داخل لوحة العينات. gpt-4o-mini هو الأرخص والأسرع.
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Prompt (يُحقن في كل عملية توليد)
            </label>
            <textarea
              className="input ltr font-mono text-sm"
              rows={6}
              dir="ltr"
              value={form.systemPrompt ?? ''}
              onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
              placeholder={'مثال (إنجليزي يُفضّل):\n\nYou are an expert interior designer. Render in photorealistic 4K with believable lighting, materials, and proportions. Honor the user-selected style and material samples as non-negotiable constraints. Avoid clutter, watermarks, and people.'}
            />
            <div className="text-xs text-gray-500 mt-1">
              يوضع قبل كل prompt يُرسل لـ OpenAI. اتركه فارغاً لإلغاء التفعيل.
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
            <div><strong>كل تصميم يكلّف:</strong> 5 نقاط</div>
            <div><strong>gpt-image-2</strong> هو أحدث موديل (21 أبريل 2026) ويحلّ محلّ DALL-E 3</div>
            <div><strong>الجودة المتوسطة</strong> هي الأنسب للإنتاج (~$0.05 / صورة)</div>
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
