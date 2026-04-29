'use client';

import { ChangeEvent, FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import {
  Sample,
  SampleCategory,
  ColorEntry,
  SpaceType,
  listSampleCategories,
  listSamples,
  listColorsPublic,
  listSpacesPublic,
  uploadReferenceImage,
  createProject,
  generateDesign,
  dataUrlToFile,
  getMe,
  Design,
  ApiError,
  listPublicCustomElements,
  describeDesignCost,
} from '@/lib/api';
import Link from 'next/link';
import SketchStudio from '@/components/sketch-studio';
import CanvasStudio from '@/components/canvas-studio';
import SketchEditor, { SketchMarker } from '@/components/sketch-editor';
import ElementsPicker from '@/components/elements-picker';
import ReferenceBoard from '@/components/reference-board';
import ReverseAngleWizard from '@/components/reverse-angle-wizard';
import { SpaceElement, registerCustomElements } from '@/lib/elements';
import { buildMarkersPrompt } from '@/lib/markers';
import { ReferenceImage, OPPOSITE_ANGLE_PROMPT, buildReferencesPrompt, buildMeasuredFirstPrompt, collectUserRulerStrings } from '@/lib/references';

type Size = '1024x1024' | '1024x1792' | '1792x1024';
type StudioMode = 'single' | 'sketch' | 'canvas';

const CUSTOM_SPACE = '__custom__';

const SIZES: { v: Size; label: string; aspect: string }[] = [
  { v: '1024x1024', label: 'مربعة', aspect: 'aspect-square' },
  { v: '1792x1024', label: 'أفقية', aspect: 'aspect-[16/9]' },
  { v: '1024x1792', label: 'عمودية', aspect: 'aspect-[9/16]' },
];

export default function StudioPage() {
  return (
    <Suspense fallback={null}>
      <StudioInner />
    </Suspense>
  );
}

function StudioInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<StudioMode>(() => {
    const m = searchParams.get('mode');
    if (m === 'sketch') return 'sketch';
    if (m === 'canvas') return 'canvas';
    return 'single';
  });
  const [styleCategories, setStyleCategories] = useState<SampleCategory[]>([]);
  const [styleOptionsByCat, setStyleOptionsByCat] = useState<Record<string, Sample[]>>({});
  /** one selected style per category (categoryId → sampleId) */
  const [styleChoice, setStyleChoice] = useState<Record<string, string>>({});

  const [categories, setCategories] = useState<SampleCategory[]>([]);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [selectedSampleIds, setSelectedSampleIds] = useState<Set<string>>(new Set());
  const [customPrompt, setCustomPrompt] = useState('');
  const [size, setSize] = useState<Size>('1024x1024');
  const [spaces, setSpaces] = useState<SpaceType[]>([]);
  const [spaceTypeId, setSpaceTypeId] = useState<string>('');
  const [customSpace, setCustomSpace] = useState('');
  const [projectName, setProjectName] = useState('تصميم جديد');
  const [allColors, setAllColors] = useState<ColorEntry[]>([]);
  /** sampleId → { colorId? customHex? note? } */
  const [sampleColors, setSampleColors] = useState<Record<string, { colorId?: string; customHex?: string; note?: string }>>({});
  const [referenceUrl, setReferenceUrl] = useState('');
  const [markers, setMarkers] = useState<SketchMarker[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [imgElements, setImgElements] = useState<SpaceElement[]>([]);
  const [references, setReferences] = useState<ReferenceImage[]>([]);
  const [oppositeAngle, setOppositeAngle] = useState(false);
  const [oppositeWishlist, setOppositeWishlist] = useState<Set<string>>(new Set());
  const [measuredFirst, setMeasuredFirst] = useState(false);
  const [measuredUnit, setMeasuredUnit] = useState<'m' | 'cm' | 'in'>('m');
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);

  // Load admin-defined custom elements once
  useEffect(() => {
    void listPublicCustomElements()
      .then((items) => registerCustomElements(items))
      .catch(() => { /* ignore — fall back to built-ins only */ });
  }, []);

  // Proactive auth check: studio actions (upload, generate, sketch analyze)
  // all require login. Redirect early so the user lands on /login before
  // wasting time filling forms.
  useEffect(() => {
    void getMe().catch((e) => {
      if (e instanceof ApiError && e.status === 401) {
        const mode = searchParams.get('mode');
        const next = mode ? `/studio?mode=${mode}` : '/studio';
        router.push(`/login?next=${encodeURIComponent(next)}`);
      }
    });
  }, [router, searchParams]);

  useEffect(() => {
    // Pick up the teaser image from sessionStorage. If it's a data URL,
    // upload it as a file FIRST so we don't blow nginx's body limit on
    // generate (HTTP 413). The proxy + WebP pipeline handles it.
    try {
      const t = sessionStorage.getItem('teaser_image');
      if (t && !referenceUrl) {
        sessionStorage.removeItem('teaser_image');
        if (t.startsWith('data:')) {
          void (async () => {
            try {
              const file = await dataUrlToFile(t, 'teaser.jpg');
              const { url } = await uploadReferenceImage(file);
              setReferenceUrl(url);
            } catch (err) {
              console.warn('Failed to upload teaser image', err);
            }
          })();
        } else {
          setReferenceUrl(t);
        }
      }
    } catch {}
    void (async () => {
      try {
        const [sampleCats, styleCats, spacesList, colorsList] = await Promise.all([
          listSampleCategories('SAMPLE'),
          listSampleCategories('STYLE'),
          listSpacesPublic().catch(() => []),
          listColorsPublic().catch(() => []),
        ]);
        setCategories(sampleCats);
        setStyleCategories(styleCats);
        setSpaces(spacesList);
        setAllColors(colorsList);
        if (spacesList.length > 0) setSpaceTypeId(spacesList[0].id);
        if (sampleCats.length > 0) setActiveCatId(sampleCats[0].id);
        const optsMap: Record<string, Sample[]> = {};
        await Promise.all(
          styleCats.map(async (sc) => {
            optsMap[sc.id] = await listSamples(sc.id, 'STYLE').catch(() => []);
          }),
        );
        setStyleOptionsByCat(optsMap);
      } catch (e) {
        if (e instanceof Error && e.message.includes('401')) {
          router.push('/login?next=/studio');
        } else {
          setError('فشل تحميل الفئات');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!activeCatId) return;
    void listSamples(activeCatId, 'SAMPLE').then(setSamples).catch(() => setSamples([]));
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
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login?next=/studio');
      } else {
        alert(err instanceof Error ? err.message : 'فشل الرفع');
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleGenerate(e?: FormEvent) {
    e?.preventDefault();
    setError('');
    if (!referenceUrl) {
      setError('ارفع صورة الغرفة الأصلية أولاً');
      return;
    }
    const styleIds = Object.values(styleChoice);
    if (selectedSampleIds.size === 0 && styleIds.length === 0 && !customPrompt.trim()) {
      setError('اختر عيّنة أو نمطاً أو اكتب وصفاً مخصّصاً');
      return;
    }
    const space = spaces.find((s) => s.id === spaceTypeId);
    const isCustomSpace = spaceTypeId === CUSTOM_SPACE;
    const resolvedSpaceName = isCustomSpace ? customSpace.trim() : (space?.name ?? '');
    if (!resolvedSpaceName) {
      setError('اختر نوع المساحة أو اكتبه');
      return;
    }

    setGenerating(true);
    setResult(null);
    try {
      const markersText = buildMarkersPrompt(markers);
      const elementsText = imgElements.length > 0
        ? `Additional elements user wants placed in the image:\n${imgElements
            .map((e) => {
              const dims: string[] = [];
              if (e.lengthMeters) dims.push(`L=${e.lengthMeters}m`);
              if (e.widthMeters) dims.push(`W=${e.widthMeters}m`);
              if (e.heightMeters) dims.push(`H=${e.heightMeters}m`);
              if (e.areaSqm) dims.push(`area ${e.areaSqm}m²`);
              const d = dims.length ? ` [${dims.join(', ')}]` : '';
              const note = e.notes ? ` — ${e.notes}` : '';
              return `${e.kind} (${e.variant})${d}${note}`;
            })
            .join('\n')}`
        : '';
      const referencesText = buildReferencesPrompt(references);
      const oppositeText = oppositeAngle ? OPPOSITE_ANGLE_PROMPT : '';
      const wishlistText = oppositeAngle && oppositeWishlist.size > 0
        ? `In the newly visible part of the room (opposite side), the user wants to add: ${Array.from(oppositeWishlist).join('، ')}.`
        : '';
      const measuredText = measuredFirst
        ? buildMeasuredFirstPrompt(measuredUnit, collectUserRulerStrings(references))
        : '';
      const fullCustom = [
        customPrompt.trim(),
        oppositeText,
        wishlistText,
        markersText,
        elementsText,
        referencesText,
        measuredText,
      ]
        .filter(Boolean)
        .join('\n\n');
      const project = await createProject({
        name: projectName || 'تصميم جديد',
        roomType: isCustomSpace ? customSpace.trim() : (space?.slug ?? resolvedSpaceName),
        originalImageUrl: referenceUrl,
      });
      const design = await generateDesign({
        projectId: project.id,
        sampleIds: [...styleIds, ...Array.from(selectedSampleIds)],
        customPrompt: fullCustom || undefined,
        referenceImageUrl: referenceUrl,
        imageSize: size,
        sampleColors,
        customSpaceType: isCustomSpace ? customSpace.trim() : resolvedSpaceName,
        extraReferenceCount: references.length,
        measuredFirst,
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
            <p className="text-gray-500 text-sm">
              {mode === 'single'
                ? 'اختر العينات، حمّل صورة غرفتك، ودَع AI يُنجز الباقي'
                : mode === 'sketch'
                ? 'حمّل اسكيتش/مخطط بيتك كاملاً واحصل على تصميم لكل مساحة'
                : '✏️ صفحة فارغة — صمّم بيتك من الصفر بالجدران والعناصر'}
            </p>
          </div>
          <a href="/history" className="btn-secondary text-sm">📁 تصاميمي</a>
        </div>

        {/* Mode toggle */}
        <div className="bg-white border border-gray-100 rounded-2xl p-1.5 inline-flex mb-6 shadow-sm flex-wrap">
          <button
            onClick={() => setMode('single')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-2 ${
              mode === 'single' ? 'bg-clay text-white' : 'text-navy hover:bg-cream'
            }`}
          >
            <PhotoIcon className="w-5 h-5" />
            صورة
          </button>
          <button
            onClick={() => setMode('sketch')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-2 ${
              mode === 'sketch' ? 'bg-clay text-white' : 'text-navy hover:bg-cream'
            }`}
          >
            <SketchIcon className="w-5 h-5" />
            صورة سكيتش
          </button>
          <button
            onClick={() => setMode('canvas')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-2 ${
              mode === 'canvas' ? 'bg-clay text-white' : 'text-navy hover:bg-cream'
            }`}
          >
            <CanvasIcon className="w-5 h-5" />
            تصميم جديد
          </button>
        </div>

        {mode === 'sketch' && <SketchStudio />}
        {mode === 'canvas' && <CanvasStudio />}
        <div style={{ display: mode === 'single' ? 'block' : 'none' }}>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>}

        {/* ── Reverse-angle hero wizard — the fastest path to a new design ── */}
        <ReverseAngleWizard
          referenceUrl={referenceUrl}
          setReferenceUrl={setReferenceUrl}
          references={references}
          setReferences={setReferences}
          oppositeAngle={oppositeAngle}
          setOppositeAngle={setOppositeAngle}
          oppositeWishlist={oppositeWishlist}
          setOppositeWishlist={setOppositeWishlist}
          markers={markers}
          setMarkers={setMarkers}
          measuredFirst={measuredFirst}
          setMeasuredFirst={setMeasuredFirst}
          measuredUnit={measuredUnit}
          setMeasuredUnit={setMeasuredUnit}
          onGenerate={() => handleGenerate()}
          generating={generating}
        />

        <form onSubmit={handleGenerate} className="grid lg:grid-cols-12 gap-6">
          {/* Left: Styles + Categories + samples */}
          <section className="lg:col-span-7 space-y-4">
            {styleCategories.length > 0 && (
              <div className="card">
                <div className="font-bold text-navy mb-3">✨ النمط والمزاج</div>
                <p className="text-xs text-gray-500 mb-3">اختر نمطاً واحداً من كل فئة (اختياري)</p>
                <div className="space-y-4">
                  {styleCategories.map((sc) => {
                    const opts = styleOptionsByCat[sc.id] ?? [];
                    if (opts.length === 0) return null;
                    return (
                      <div key={sc.id}>
                        <div className="text-sm font-medium text-navy mb-2">{sc.name}</div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...styleChoice };
                              delete next[sc.id];
                              setStyleChoice(next);
                            }}
                            className={
                              'px-3 py-1.5 rounded-full text-xs font-medium border transition ' +
                              (!styleChoice[sc.id]
                                ? 'bg-navy text-white border-navy'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300')
                            }
                          >
                            تجاوز
                          </button>
                          {opts.map((o) => {
                            const sel = styleChoice[sc.id] === o.id;
                            return (
                              <button
                                type="button"
                                key={o.id}
                                onClick={() => setStyleChoice({ ...styleChoice, [sc.id]: o.id })}
                                className={
                                  'px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-2 ' +
                                  (sel
                                    ? 'bg-gold text-navy border-gold'
                                    : 'bg-white text-navy border-gray-200 hover:border-gold')
                                }
                              >
                                {o.imageUrl && <img src={o.imageUrl} alt="" className="w-5 h-5 rounded-full object-cover" />}
                                {o.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                            {s.imageUrl ? (
                              <img src={s.imageUrl} alt={s.name} className="w-full h-24 object-cover" />
                            ) : (
                              <div className="w-full h-24 bg-navy/5 flex items-center justify-center text-2xl">✨</div>
                            )}
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

              {/* Per-sample color pickers (only for selected samples that allow color) */}
              {selectedSampleIds.size > 0 && (
                <div className="mt-4 space-y-3">
                  {Array.from(selectedSampleIds).map((id) => {
                    const s = samples.find((x) => x.id === id);
                    if (!s || (s.colorMode ?? 'NONE') === 'NONE') return null;
                    const sel = sampleColors[id] ?? {};
                    const allowed = s.colorMode === 'PRESET'
                      ? allColors.filter((c) => (s.presetColorIds ?? []).includes(c.id))
                      : allColors;
                    if (allowed.length === 0 && s.colorMode === 'PRESET') return null;
                    return (
                      <div key={id} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-bold text-navy">🎨 لون لـ {s.name}</div>
                          {sel.colorId && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = { ...sampleColors };
                                delete next[id];
                                setSampleColors(next);
                              }}
                              className="text-[10px] text-gray-500 hover:underline"
                            >إلغاء الاختيار</button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {allowed.map((c) => {
                            const picked = sel.colorId === c.id;
                            return (
                              <button
                                type="button"
                                key={c.id}
                                title={`${c.name} ${c.code}`}
                                onClick={() => setSampleColors({ ...sampleColors, [id]: { ...sel, colorId: c.id, customHex: undefined } })}
                                className={
                                  'w-8 h-8 rounded-lg border-2 transition relative ' +
                                  (picked ? 'border-navy ring-2 ring-navy/30 scale-110' : 'border-gray-200 hover:border-gray-400')
                                }
                                style={{ background: c.hex }}
                              >
                                {picked && <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black drop-shadow">✓</span>}
                              </button>
                            );
                          })}
                          {s.colorMode === 'ANY' && (
                            <input
                              type="color"
                              value={sel.customHex ?? '#000000'}
                              onChange={(e) => setSampleColors({ ...sampleColors, [id]: { ...sel, customHex: e.target.value, colorId: undefined } })}
                              className="w-8 h-8 rounded-lg cursor-pointer"
                              title="لون مخصّص"
                            />
                          )}
                        </div>
                        <input
                          type="text"
                          className="input text-xs"
                          placeholder="ملاحظة (اختياري) — مثال: درجة أفتح، مع لمسة ذهبية..."
                          value={sel.note ?? ''}
                          onChange={(e) => setSampleColors({ ...sampleColors, [id]: { ...sel, note: e.target.value } })}
                          maxLength={150}
                        />
                        {(sel.colorId || sel.customHex) && (
                          <div className="text-[11px] text-gray-500 mt-1 ltr">
                            {sel.colorId ? (() => {
                              const c = allColors.find((x) => x.id === sel.colorId);
                              return c ? `${c.name} · ${c.code} · ${c.hex}` : '';
                            })() : sel.customHex}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
              <div className="font-bold text-navy mb-3">3️⃣ صورة</div>
              {referenceUrl ? (
                <div className="relative">
                  <img src={referenceUrl} alt="" className="w-full h-48 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => { setReferenceUrl(''); setMarkers([]); setImgElements([]); setEditorOpen(false); }}
                    className="absolute top-2 left-2 bg-white/90 rounded-full px-3 py-1 text-xs"
                  >حذف</button>
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

            {/* Visual editor on the uploaded photo — place columns, walls, doors, etc. */}
            {referenceUrl && (
              <div className="card">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-navy text-sm flex items-center gap-2">
                      <span>✨ ضع عناصر على الصورة (اختياري)</span>
                      {markers.length > 0 && (
                        <span className="badge bg-sage/20 text-sage-dark text-[10px]">{markers.length} عنصر</span>
                      )}
                    </div>
                    <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">
                      مثال: ضع <strong>عمود دائري</strong> أو <strong>عمود مستطيل</strong> أو نافذة جديدة أو باب
                      على صورة الغرفة قبل التوليد، وحدّد المقاسات. الذكاء سيُدرجها في تصميمه.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditorOpen((v) => !v)}
                    className="btn-primary text-sm"
                  >
                    {editorOpen ? 'إخفاء المحرّر' : '🎨 افتح المحرّر'}
                  </button>
                </div>

                {editorOpen && (
                  <SketchEditor
                    sketchUrl={referenceUrl}
                    markers={markers}
                    onChange={setMarkers}
                  />
                )}

                {/* Element-by-element picker (no need to draw — just describe + dims) */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ElementsPicker value={imgElements} onChange={setImgElements} />
                </div>
              </div>
            )}

            {/* Reverse-angle hero card was moved above the form. Below is the
                multi-reference board for advanced users (style boards, element
                sources, additional context — beyond what the hero card covers). */}
            <div className="card">
              <ReferenceBoard
                mainImageUrl={referenceUrl || undefined}
                references={references}
                onChange={setReferences}
              />
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
                <span className="block text-xs text-gray-500 mb-1">نوع المساحة</span>
                <select
                  className="input"
                  value={spaceTypeId}
                  onChange={(e) => setSpaceTypeId(e.target.value)}
                >
                  {spaces.map((s) => (
                    <option key={s.id} value={s.id}>{s.icon ? `${s.icon} ` : ''}{s.name}</option>
                  ))}
                  <option value={CUSTOM_SPACE}>✏️ نوع آخر — اكتبه أنت</option>
                </select>
              </label>
              {spaceTypeId === CUSTOM_SPACE && (
                <label className="block">
                  <span className="block text-xs text-gray-500 mb-1">اكتب نوع المساحة</span>
                  <input
                    className="input"
                    value={customSpace}
                    onChange={(e) => setCustomSpace(e.target.value)}
                    placeholder="مثال: غرفة هواية، مدخل بيت، ركن قراءة..."
                    maxLength={120}
                  />
                </label>
              )}
            </div>

            <button type="submit" disabled={generating} className="btn-primary w-full text-lg">
              {generating ? '✨ يولّد التصميم... (10-30 ثانية)' : '🎨 توليد التصميم (5 نقاط)'}
            </button>
          </aside>
        </form>

        {result && (
          <section className="mt-8">
            <div className="card p-0 overflow-hidden bg-gradient-to-br from-navy to-navy-lighter text-white">
              <div className="relative">
                {result.generatedImageUrl && (
                  <img
                    src={result.generatedImageUrl}
                    alt=""
                    className="w-full max-h-[420px] object-cover"
                    style={{ filter: 'blur(12px) brightness(0.65) saturate(1.2)' }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="text-5xl mb-2">🎨</div>
                  <div className="text-2xl md:text-3xl font-black mb-1">تصميمك جاهز للتسليم</div>
                  <div className="text-sm text-gray-200 mb-4 max-w-md">
                    أعدّ AI تصميمك كاملاً بصيغة PNG. اختر باقة لاستلام النسخة كاملة وتحميلها على جهازك.
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    <span className="badge bg-white/15 text-white">📐 {result.imageSize}</span>
                    <span className="badge bg-white/15 text-white">🖼️ PNG عالي الجودة</span>
                    <span className="badge bg-white/15 text-white">♾️ ملكية كاملة</span>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Link href="/pricing" className="btn-primary text-base">💎 اختر باقة لاستلام التصميم</Link>
                    <Link href="/history" className="btn-secondary text-base bg-white/10 border-white/20 text-white hover:bg-white/20">عرض كل تصاميمي</Link>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white/5 text-xs text-gray-300 text-center">
                💾 محفوظ في حسابك · 🔒 لن يحذف إلا بطلبك · 📧 سنرسل النسخة لبريدك بعد الشراء
              </div>
            </div>
          </section>
        )}
        </div>
      </main>
    </>
  );
}

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="8.5" cy="10.5" r="1.6" fill="currentColor" stroke="none" />
      <path d="M21 17l-5.2-5.2a1.5 1.5 0 0 0-2.1 0L4 21" />
      <path d="M3 19l4.5-4.5a1.5 1.5 0 0 1 2.1 0L13 18" />
    </svg>
  );
}

function CanvasIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3.5" width="18" height="17" rx="1.5" />
      <path d="M7 7h10M7 11h10M7 15h10" strokeOpacity="0.4" strokeDasharray="2 3" />
      <path d="M14.8 4.6l4.6 4.6-7.2 7.2H7.6v-4.6z" />
    </svg>
  );
}

function SketchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3.5" width="18" height="17" rx="1.5" />
      <line x1="3" y1="11" x2="14" y2="11" />
      <line x1="11" y1="3.5" x2="11" y2="11" />
      <line x1="14" y1="11" x2="14" y2="20.5" />
      <path d="M16.8 6.4l3 3-7.2 7.2H9.6v-3z" />
    </svg>
  );
}
