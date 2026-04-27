'use client';

import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import {
  SampleCategory,
  Sample,
  ColorEntry,
  getSampleCategories,
  createSampleCategory,
  updateSampleCategory,
  deleteSampleCategory,
  getSamples,
  createSample,
  updateSample,
  deleteSample,
  uploadSampleImage,
  aiDescribe,
  listColorsAdmin,
} from '@/lib/api';

const emptyCategory: Partial<SampleCategory> = {
  slug: '',
  name: '',
  description: '',
  kind: 'SAMPLE',
  sortOrder: 0,
  isActive: true,
};

const emptySample: Partial<Sample> = {
  name: '',
  description: '',
  imageUrl: '',
  aiPrompt: '',
  modelNumber: '',
  colorMode: 'NONE',
  presetColorIds: [],
  sortOrder: 0,
  isActive: true,
};

export default function SamplesPage() {
  const [categories, setCategories] = useState<SampleCategory[]>([]);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [catModal, setCatModal] = useState<{ open: boolean; data: Partial<SampleCategory>; editingId: string | null }>({
    open: false,
    data: emptyCategory,
    editingId: null,
  });
  const [sampleModal, setSampleModal] = useState<{ open: boolean; data: Partial<Sample>; editingId: string | null }>({
    open: false,
    data: emptySample,
    editingId: null,
  });
  const [uploading, setUploading] = useState(false);
  const [describing, setDescribing] = useState(false);
  const [kindFilter, setKindFilter] = useState<'ALL' | 'SAMPLE' | 'STYLE'>('ALL');
  const [allColors, setAllColors] = useState<ColorEntry[]>([]);

  useEffect(() => { void listColorsAdmin().then(setAllColors).catch(() => setAllColors([])); }, []);

  async function loadCategories() {
    setLoading(true);
    setError('');
    try {
      const cats = await getSampleCategories('');
      setCategories(cats);
      if (!activeCatId && cats.length > 0) setActiveCatId(cats[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل الفئات');
    } finally {
      setLoading(false);
    }
  }

  async function loadSamples(catId: string) {
    try {
      const list = await getSamples('', catId);
      setSamples(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل العينات');
    }
  }

  useEffect(() => { void loadCategories(); }, []);
  useEffect(() => { if (activeCatId) void loadSamples(activeCatId); }, [activeCatId]);

  // ── Category handlers ───────────────────────────────────────────
  function openNewCategory() {
    setCatModal({ open: true, data: emptyCategory, editingId: null });
  }
  function openEditCategory(c: SampleCategory) {
    setCatModal({ open: true, data: { ...c }, editingId: c.id });
  }
  async function saveCategory(e: FormEvent) {
    e.preventDefault();
    try {
      if (catModal.editingId) {
        await updateSampleCategory('', catModal.editingId, catModal.data);
      } else {
        await createSampleCategory('', catModal.data);
      }
      setCatModal({ open: false, data: emptyCategory, editingId: null });
      await loadCategories();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحفظ');
    }
  }
  async function removeCategory(c: SampleCategory) {
    if (!confirm(`حذف الفئة "${c.name}" وجميع عيناتها؟`)) return;
    try {
      await deleteSampleCategory('', c.id);
      if (activeCatId === c.id) setActiveCatId(null);
      await loadCategories();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحذف');
    }
  }

  // ── Sample handlers ─────────────────────────────────────────────
  function openNewSample() {
    if (!activeCatId) {
      alert('اختر فئة أولاً');
      return;
    }
    setSampleModal({
      open: true,
      data: { ...emptySample, categoryId: activeCatId },
      editingId: null,
    });
  }
  function openEditSample(s: Sample) {
    setSampleModal({ open: true, data: { ...s }, editingId: s.id });
  }
  async function aiDescribeSample() {
    const cat = categories.find((c) => c.id === sampleModal.data.categoryId);
    const isStyle = cat?.kind === 'STYLE';
    if (!sampleModal.data.imageUrl && !sampleModal.data.name) {
      alert(isStyle ? 'اكتب اسم النمط أولاً' : 'ارفع صورة العينة أولاً');
      return;
    }
    setDescribing(true);
    try {
      const { description } = await aiDescribe({
        imageUrl: sampleModal.data.imageUrl ?? undefined,
        textLabel: sampleModal.data.imageUrl ? undefined : sampleModal.data.name,
        categoryHint: cat?.name,
      });
      setSampleModal({ ...sampleModal, data: { ...sampleModal.data, aiPrompt: description } });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل توليد الوصف');
    } finally {
      setDescribing(false);
    }
  }

  async function saveSample(e: FormEvent) {
    e.preventDefault();
    const cat = categories.find((c) => c.id === sampleModal.data.categoryId);
    if (cat?.kind !== 'STYLE' && !sampleModal.data.imageUrl) {
      alert('ارفع صورة للعينة أولاً');
      return;
    }
    try {
      const payload = { ...sampleModal.data };
      // strip empty optional numerics
      (['widthCm', 'heightCm', 'thicknessMm', 'valueSar'] as const).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        else if (typeof v === 'string') payload[k] = Number(v);
      });
      if (sampleModal.editingId) {
        await updateSample('', sampleModal.editingId, payload);
      } else {
        await createSample('', payload);
      }
      setSampleModal({ open: false, data: emptySample, editingId: null });
      if (activeCatId) await loadSamples(activeCatId);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحفظ');
    }
  }
  async function removeSample(s: Sample) {
    if (!confirm(`حذف العينة "${s.name}"؟`)) return;
    try {
      await deleteSample('', s.id);
      if (activeCatId) await loadSamples(activeCatId);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل الحذف');
    }
  }

  async function handleUpload(
    e: ChangeEvent<HTMLInputElement>,
    bucket: 'samples' | 'categories',
    onUrl: (url: string) => void,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadSampleImage(file, bucket);
      onUrl(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل رفع الصورة');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-navy">العينات والفئات</h1>
          <p className="text-gray-500 text-sm">
            نظّم العينات داخل فئات. كل عيّنة تحوي صورة WebP ووصف AI يُضاف لـ DALL-E عند الاختيار.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={openNewCategory} className="btn-secondary">+ فئة جديدة</button>
          <button onClick={openNewSample} className="btn-primary" disabled={!activeCatId}>+ عيّنة جديدة</button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      <div className="flex gap-2 mb-4 text-sm">
        {(['ALL', 'SAMPLE', 'STYLE'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKindFilter(k)}
            className={
              'px-3 py-1.5 rounded-full font-medium transition ' +
              (kindFilter === k ? 'bg-navy text-white' : 'bg-gray-100 text-navy hover:bg-gray-200')
            }
          >
            {k === 'ALL' ? 'الكل' : k === 'SAMPLE' ? 'عيّنات (مواد)' : 'أنماط'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Categories panel */}
        <aside className="col-span-3 card p-3 h-fit">
          <div className="text-xs font-semibold text-gray-500 px-3 pb-2">الفئات</div>
          {loading ? (
            <div className="text-sm text-gray-400 px-3 py-4">جارٍ التحميل...</div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-gray-400 px-3 py-4">لا توجد فئات بعد</div>
          ) : (
            <div className="space-y-1">
              {categories.filter((c) => kindFilter === 'ALL' || (c.kind ?? 'SAMPLE') === kindFilter).map((c) => (
                <div
                  key={c.id}
                  className={
                    'group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer ' +
                    (activeCatId === c.id ? 'bg-gold/20 text-navy' : 'hover:bg-gray-50')
                  }
                  onClick={() => setActiveCatId(c.id)}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">📁</div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate flex items-center gap-1">
                        {c.name}
                        {c.kind === 'STYLE' && <span className="text-[9px] bg-navy text-white px-1.5 py-0.5 rounded">نمط</span>}
                      </div>
                      <div className="text-[11px] text-gray-400">{c.slug}{!c.isActive && ' • مخفي'}</div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditCategory(c); }}
                      className="text-xs text-gray-500 hover:text-navy"
                    >تعديل</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); void removeCategory(c); }}
                      className="text-xs text-red-500 hover:underline"
                    >حذف</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Samples grid */}
        <section className="col-span-9">
          {samples.length === 0 ? (
            <div className="card text-center py-16 text-gray-400">
              {activeCatId ? 'لا توجد عينات في هذه الفئة بعد' : 'اختر فئة لعرض عيناتها'}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {samples.map((s) => (
                <div key={s.id} className="card p-3 group">
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt={s.name} className="w-full h-40 object-cover rounded-xl mb-3" />
                  ) : (
                    <div className="w-full h-40 rounded-xl mb-3 bg-navy/5 flex items-center justify-center text-3xl">✨</div>
                  )}
                  <div className="font-semibold text-navy truncate">{s.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-2 min-h-[2.4em]">{s.aiPrompt}</div>
                  <div className="flex flex-wrap gap-1 mt-2 text-[11px] text-gray-500">
                    {s.modelNumber && <span className="px-2 py-0.5 bg-gray-100 rounded">#{s.modelNumber}</span>}
                    {s.widthCm && <span className="px-2 py-0.5 bg-gray-100 rounded">{s.widthCm}×{s.heightCm}سم</span>}
                    {!s.isActive && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded">مخفي</span>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEditSample(s)} className="text-xs text-gold hover:underline">تعديل</button>
                    <button onClick={() => void removeSample(s)} className="text-xs text-red-500 hover:underline">حذف</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Category Modal */}
      {catModal.open && (
        <Modal title={catModal.editingId ? 'تعديل فئة' : 'فئة جديدة'} onClose={() => setCatModal({ ...catModal, open: false })}>
          <form onSubmit={saveCategory} className="space-y-3">
            <Field label="الاسم">
              <input
                className="input"
                value={catModal.data.name ?? ''}
                onChange={(e) => setCatModal({ ...catModal, data: { ...catModal.data, name: e.target.value } })}
                required
              />
            </Field>
            <Field label="المعرّف (slug — حروف لاتينية وشرطة فقط)">
              <input
                className="input ltr"
                value={catModal.data.slug ?? ''}
                onChange={(e) => setCatModal({ ...catModal, data: { ...catModal.data, slug: e.target.value } })}
                pattern="[a-z0-9-]+"
                required
              />
            </Field>
            <Field label="نوع الفئة">
              <select
                className="input"
                value={catModal.data.kind ?? 'SAMPLE'}
                onChange={(e) => setCatModal({ ...catModal, data: { ...catModal.data, kind: e.target.value as 'SAMPLE' | 'STYLE' } })}
              >
                <option value="SAMPLE">عيّنات (مواد مادية بصور — جدران، بلاط، أثاث)</option>
                <option value="STYLE">أنماط (اختيارات مفاهيمية — مودرن، كلاسيك، إضاءة)</option>
              </select>
            </Field>
            <Field label="الوصف (اختياري)">
              <textarea
                className="input"
                rows={2}
                value={catModal.data.description ?? ''}
                onChange={(e) => setCatModal({ ...catModal, data: { ...catModal.data, description: e.target.value } })}
              />
            </Field>
            <Field label="صورة الفئة (اختياري — تُحفظ كـ WebP)">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, 'categories', (url) => setCatModal({ ...catModal, data: { ...catModal.data, imageUrl: url } }))}
              />
              {catModal.data.imageUrl && (
                <img src={catModal.data.imageUrl} alt="" className="mt-2 w-32 h-32 object-cover rounded-lg" />
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ترتيب العرض">
                <input
                  type="number"
                  className="input"
                  value={catModal.data.sortOrder ?? 0}
                  onChange={(e) => setCatModal({ ...catModal, data: { ...catModal.data, sortOrder: Number(e.target.value) } })}
                />
              </Field>
              <Field label="مفعّل">
                <select
                  className="input"
                  value={catModal.data.isActive ? '1' : '0'}
                  onChange={(e) => setCatModal({ ...catModal, data: { ...catModal.data, isActive: e.target.value === '1' } })}
                >
                  <option value="1">نعم</option>
                  <option value="0">لا (مخفي)</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setCatModal({ ...catModal, open: false })} className="btn-secondary">إلغاء</button>
              <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? 'يرفع...' : 'حفظ'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Sample Modal */}
      {sampleModal.open && (
        <Modal title={sampleModal.editingId ? 'تعديل عيّنة' : 'عيّنة جديدة'} onClose={() => setSampleModal({ ...sampleModal, open: false })}>
          <form onSubmit={saveSample} className="space-y-3">
            <Field label="الفئة">
              <select
                className="input"
                value={sampleModal.data.categoryId ?? ''}
                onChange={(e) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, categoryId: e.target.value } })}
                required
              >
                <option value="">— اختر —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="اسم العينة">
              <input
                className="input"
                value={sampleModal.data.name ?? ''}
                onChange={(e) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, name: e.target.value } })}
                required
              />
            </Field>
            <Field label={`صورة العينة ${categories.find((c) => c.id === sampleModal.data.categoryId)?.kind === 'STYLE' ? '(اختياري للأنماط)' : '(تُحوَّل لـ WebP تلقائياً)'}`}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e, 'samples', (url) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, imageUrl: url } }))}
              />
              {sampleModal.data.imageUrl && (
                <div className="mt-2 inline-block relative">
                  <img src={sampleModal.data.imageUrl} alt="" className="w-40 h-40 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, imageUrl: '' } })}
                    className="absolute top-1 left-1 bg-white/90 rounded-full px-2 py-0.5 text-xs"
                  >حذف</button>
                </div>
              )}
            </Field>
            <Field label="وصف الذكاء الاصطناعي (نص يُضاف للـ prompt عند الاختيار)">
              <div className="flex gap-2 items-start">
                <textarea
                  className="input ltr flex-1"
                  rows={3}
                  value={sampleModal.data.aiPrompt ?? ''}
                  onChange={(e) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, aiPrompt: e.target.value } })}
                  placeholder='مثال: "Wall finish: warm beige limewash, matte texture, slight cloud effect"'
                  required
                />
                <button
                  type="button"
                  onClick={aiDescribeSample}
                  disabled={describing}
                  className="btn-secondary text-xs whitespace-nowrap"
                  title="استخدام الذكاء الاصطناعي لوصف الصورة أو النص تلقائياً"
                >
                  {describing ? '...يصف' : '✨ صف بالذكاء'}
                </button>
              </div>
            </Field>
            <Field label="وصف للمستخدم (اختياري)">
              <textarea
                className="input"
                rows={2}
                value={sampleModal.data.description ?? ''}
                onChange={(e) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, description: e.target.value } })}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="العرض (سم)">
                <input
                  type="number" step="0.01" className="input"
                  value={sampleModal.data.widthCm ?? ''}
                  onChange={(e) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, widthCm: e.target.value as unknown as number } })}
                />
              </Field>
              <Field label="الطول (سم)">
                <input
                  type="number" step="0.01" className="input"
                  value={sampleModal.data.heightCm ?? ''}
                  onChange={(e) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, heightCm: e.target.value as unknown as number } })}
                />
              </Field>
              <Field label="السماكة (مم)">
                <input
                  type="number" step="0.01" className="input"
                  value={sampleModal.data.thicknessMm ?? ''}
                  onChange={(e) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, thicknessMm: e.target.value as unknown as number } })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="رقم الموديل">
                <input
                  className="input"
                  value={sampleModal.data.modelNumber ?? ''}
                  onChange={(e) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, modelNumber: e.target.value } })}
                />
              </Field>
              <Field label="القيمة (ريال — مخفية عن المستخدم)">
                <input
                  type="number" step="0.01" className="input"
                  value={sampleModal.data.valueSar ?? ''}
                  onChange={(e) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, valueSar: e.target.value as unknown as number } })}
                />
              </Field>
            </div>

            {/* Color settings */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <div className="font-bold text-navy text-sm">🎨 خيارات اللون</div>
              <Field label="هل يستطيع المستخدم اختيار لون لهذه العيّنة؟">
                <select
                  className="input"
                  value={sampleModal.data.colorMode ?? 'NONE'}
                  onChange={(e) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, colorMode: e.target.value as 'NONE' | 'PRESET' | 'ANY' } })}
                >
                  <option value="NONE">لا — لون ثابت كما في الصورة</option>
                  <option value="PRESET">نعم — من ألوان أنا أحدّدها أدناه</option>
                  <option value="ANY">نعم — من كامل لوحة الألوان</option>
                </select>
              </Field>

              {sampleModal.data.colorMode === 'PRESET' && (
                <Field label={`اختر الألوان المتاحة لهذه العيّنة (${(sampleModal.data.presetColorIds ?? []).length}/50)`}>
                  {allColors.length === 0 ? (
                    <div className="text-xs text-gray-500">لم تُضِف ألواناً بعد. اذهب إلى صفحة <a href="/palette" className="text-gold underline">الألوان والمساحات</a> أولاً.</div>
                  ) : (
                    <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1">
                      {allColors.map((c) => {
                        const ids = sampleModal.data.presetColorIds ?? [];
                        const sel = ids.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            title={`${c.name} ${c.code} ${c.hex}`}
                            onClick={() => {
                              const next = sel ? ids.filter((x) => x !== c.id) : [...ids, c.id];
                              setSampleModal({ ...sampleModal, data: { ...sampleModal.data, presetColorIds: next } });
                            }}
                            className={
                              'aspect-square rounded-lg border-2 transition relative ' +
                              (sel ? 'border-navy ring-2 ring-navy/30' : 'border-transparent hover:border-gray-300')
                            }
                            style={{ background: c.hex }}
                          >
                            {sel && <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black drop-shadow">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Field>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ترتيب العرض">
                <input
                  type="number" className="input"
                  value={sampleModal.data.sortOrder ?? 0}
                  onChange={(e) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, sortOrder: Number(e.target.value) } })}
                />
              </Field>
              <Field label="مفعّل">
                <select
                  className="input"
                  value={sampleModal.data.isActive ? '1' : '0'}
                  onChange={(e) => setSampleModal({ ...sampleModal, data: { ...sampleModal.data, isActive: e.target.value === '1' } })}
                >
                  <option value="1">نعم</option>
                  <option value="0">لا (مخفي)</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setSampleModal({ ...sampleModal, open: false })} className="btn-secondary">إلغاء</button>
              <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? 'يرفع...' : 'حفظ'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
