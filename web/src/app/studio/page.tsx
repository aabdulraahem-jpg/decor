'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import {
  Sample,
  SampleCategory,
  listSampleCategories,
  listSamples,
  uploadReferenceImage,
  createProject,
  generateDesign,
  Design,
} from '@/lib/api';

type Size = '1024x1024' | '1024x1792' | '1792x1024';

const ROOM_TYPES = [
  { v: 'living-room', label: 'صالة جلوس' },
  { v: 'bedroom', label: 'غرفة نوم' },
  { v: 'kitchen', label: 'مطبخ' },
  { v: 'dining-room', label: 'غرفة طعام' },
  { v: 'bathroom', label: 'حمّام' },
  { v: 'office', label: 'مكتب' },
  { v: 'majlis', label: 'مجلس' },
];

const SIZES: { v: Size; label: string; aspect: string }[] = [
  { v: '1024x1024', label: 'مربعة', aspect: 'aspect-square' },
  { v: '1792x1024', label: 'أفقية', aspect: 'aspect-[16/9]' },
  { v: '1024x1792', label: 'عمودية', aspect: 'aspect-[9/16]' },
];

export default function StudioPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<SampleCategory[]>([]);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedSampleIds, setSelectedSampleIds] = useState<Set<string>>(new Set());
  const [customPrompt, setCustomPrompt] = useState('');
  const [size, setSize] = useState<Size>('1024x1024');
  const [roomType, setRoomType] = useState('living-room');
  const [projectName, setProjectName] = useState('تصميم جديد');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const cats = await listSampleCategories();
        setCategories(cats);
        if (cats.length > 0) setActiveCatId(cats[0].id);
      } catch (e) {
        if (e instanceof Error && e.message.includes('401')) router.push('/login');
        setError('فشل تحميل الفئات');
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!activeCatId) return;
    void listSamples(activeCatId).then(setSamples).catch(() => setSamples([]));
  }, [activeCatId]);

  const samplesByCat = useMemo(
    () => categories.find((c) => c.id === activeCatId)?.name ?? '',
    [categories, activeCatId],
  );

  function toggleSample(id: string) {
    const next = new Set(selectedSampleIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSampleIds(next);
  }

  async function handleReferenceUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadReferenceImage(file);
      setReferenceUrl(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل الرفع');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!referenceUrl) {
      setError('ارفع صورة الغرفة الأصلية أولاً');
      return;
    }
    if (selectedSampleIds.size === 0 && !customPrompt.trim()) {
      setError('اختر عيّنة واحدة على الأقل أو اكتب وصفاً مخصّصاً');
      return;
    }
    setGenerating(true);
    setResult(null);
    try {
      const project = await createProject({
        name: projectName || 'تصميم جديد',
        roomType,
        originalImageUrl: referenceUrl,
      });
      const design = await generateDesign({
        projectId: project.id,
        sampleIds: Array.from(selectedSampleIds),
        customPrompt: customPrompt.trim() || undefined,
        referenceImageUrl: referenceUrl,
        imageSize: size,
      });
      setResult(design);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل التوليد');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-navy">استوديو التصميم</h1>
            <p className="text-gray-500 text-sm">اختر العينات، حمّل صورة غرفتك، ودَع AI يُنجز الباقي</p>
          </div>
          <a href="/history" className="btn-secondary text-sm">📁 تصاميمي</a>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

        <form onSubmit={handleGenerate} className="grid lg:grid-cols-12 gap-6">
          {/* Left: Categories + samples */}
          <section className="lg:col-span-7 space-y-4">
            <div className="card">
              <div className="font-bold text-navy mb-3">1️⃣ اختر العينات</div>
              {loading ? (
                <div className="text-gray-400 py-8 text-center">جارٍ التحميل...</div>
              ) : categories.length === 0 ? (
                <div className="text-gray-400 py-8 text-center">لا توجد عينات بعد. الإدارة تعمل على إضافتها.</div>
              ) : (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                    {categories.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setActiveCatId(c.id)}
                        className={
                          'whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ' +
                          (activeCatId === c.id ? 'bg-navy text-white' : 'bg-gray-100 text-navy hover:bg-gray-200')
                        }
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                  {samples.length === 0 ? (
                    <div className="text-gray-400 py-6 text-center text-sm">لا توجد عينات في {samplesByCat}</div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {samples.map((s) => {
                        const selected = selectedSampleIds.has(s.id);
                        return (
                          <button
                            type="button"
                            key={s.id}
                            onClick={() => toggleSample(s.id)}
                            className={
                              'group relative rounded-xl overflow-hidden border-2 transition ' +
                              (selected ? 'border-gold ring-2 ring-gold/30' : 'border-transparent hover:border-gray-200')
                            }
                          >
                            <img src={s.imageUrl} alt={s.name} className="w-full h-24 object-cover" />
                            <div className="px-2 py-1 text-[11px] font-medium text-navy text-right truncate">{s.name}</div>
                            {selected && (
                              <div className="absolute top-1 left-1 bg-gold text-navy w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">✓</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
              <div className="text-xs text-gray-500 mt-3">
                مختار: <strong>{selectedSampleIds.size}</strong> عيّنة
              </div>
            </div>

            <div className="card">
              <div className="font-bold text-navy mb-3">2️⃣ نص مخصّص (اختياري)</div>
              <textarea
                className="input"
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="مثال: غرفة نوم بأرضية خشبية فاتحة، إضاءة دافئة، نباتات طبيعية، نمط حديث بسيط..."
                maxLength={2000}
              />
              <div className="text-xs text-gray-400 mt-1 text-left">{customPrompt.length} / 2000</div>
            </div>
          </section>

          {/* Right: Reference + size + project + generate */}
          <aside className="lg:col-span-5 space-y-4">
            <div className="card">
              <div className="font-bold text-navy mb-3">3️⃣ صورة الغرفة الأصلية</div>
              {referenceUrl ? (
                <div className="relative">
                  <img src={referenceUrl} alt="" className="w-full h-48 object-cover rounded-xl" />
                  <button type="button" onClick={() => setReferenceUrl('')} className="absolute top-2 left-2 bg-white/90 rounded-full px-3 py-1 text-xs">حذف</button>
                </div>
              ) : (
                <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gold">
                  <input type="file" accept="image/*" className="hidden" onChange={handleReferenceUpload} />
                  <div className="text-3xl mb-2">📷</div>
                  <div className="text-sm font-medium text-navy">{uploading ? 'جارٍ الرفع...' : 'اضغط لرفع صورة'}</div>
                  <div className="text-xs text-gray-400 mt-1">JPG / PNG / HEIC حتى 8MB — تتحوّل لـ WebP تلقائياً</div>
                </label>
              )}
            </div>

            <div className="card">
              <div className="font-bold text-navy mb-3">4️⃣ مقاس الصورة</div>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((s) => (
                  <button
                    type="button"
                    key={s.v}
                    onClick={() => setSize(s.v)}
                    className={
                      'rounded-xl border-2 p-3 text-center transition ' +
                      (size === s.v ? 'border-gold bg-gold/10' : 'border-gray-100 hover:border-gray-200')
                    }
                  >
                    <div className={'mx-auto bg-navy/10 rounded mb-2 ' + s.aspect + ' max-w-[60px]'}></div>
                    <div className="text-xs font-medium">{s.label}</div>
                    <div className="text-[10px] text-gray-400">{s.v}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card space-y-3">
              <div className="font-bold text-navy">5️⃣ تفاصيل المشروع</div>
              <label className="block">
                <span className="block text-xs text-gray-500 mb-1">اسم المشروع</span>
                <input className="input" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              </label>
              <label className="block">
                <span className="block text-xs text-gray-500 mb-1">نوع الغرفة</span>
                <select className="input" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                  {ROOM_TYPES.map((r) => <option key={r.v} value={r.v}>{r.label}</option>)}
                </select>
              </label>
            </div>

            <button type="submit" disabled={generating} className="btn-primary w-full text-lg">
              {generating ? '✨ يولّد التصميم... (10-30 ثانية)' : '🎨 توليد التصميم (5 نقاط)'}
            </button>
          </aside>
        </form>

        {result && (
          <section className="mt-8 card">
            <h2 className="text-xl font-bold text-navy mb-4">نتيجة التصميم 🎉</h2>
            <img src={result.generatedImageUrl} alt="" className="rounded-xl w-full max-w-2xl mx-auto" />
            <div className="mt-4 flex gap-3 justify-center">
              <a href={result.generatedImageUrl} download className="btn-primary">⬇ تحميل</a>
              <a href="/history" className="btn-secondary">عرض كل التصاميم</a>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
