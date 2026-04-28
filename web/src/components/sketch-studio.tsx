'use client';

import { useEffect, useMemo, useState, ChangeEvent } from 'react';
import {
  Sample,
  SampleCategory,
  SketchAnalyzeResponse,
  DetectedSpace,
  SketchSpaceInput,
  analyzeSketch,
  generateFromSketch,
  uploadReferenceImage,
  listSampleCategories,
  listSamples,
} from '@/lib/api';

type Step = 'upload' | 'analyzing' | 'review' | 'customize' | 'submitting' | 'done';

interface SpaceForm {
  label: string;            // e.g. "حمام 1"
  baseLabel: string;        // e.g. "حمام"
  index: number;            // 1, 2, 3 (for duplicates)
  styleId?: string;         // optional STYLE-kind sample
  sampleIds: Set<string>;   // optional decor samples
  customPrompt: string;
}

const POINTS_PER_DESIGN = 5;

export default function SketchStudio() {
  const [step, setStep] = useState<Step>('upload');
  const [sketchUrl, setSketchUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<SketchAnalyzeResponse | null>(null);
  const [spaces, setSpaces] = useState<SpaceForm[]>([]);
  const [projectName, setProjectName] = useState('بيتي الجديد');
  const [error, setError] = useState('');
  const [submitResult, setSubmitResult] = useState<{ count: number; points: number } | null>(null);

  // Catalogs (loaded once when reaching customize step)
  const [styleCats, setStyleCats] = useState<SampleCategory[]>([]);
  const [styleOpts, setStyleOpts] = useState<Record<string, Sample[]>>({});
  const [sampleCats, setSampleCats] = useState<SampleCategory[]>([]);
  const [samplesByCat, setSamplesByCat] = useState<Record<string, Sample[]>>({});
  const [activeSpaceIdx, setActiveSpaceIdx] = useState(0);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);

  // ── Step 1: upload ──────────────────────────────────────────────
  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { url } = await uploadReferenceImage(file);
      setSketchUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  }

  // ── Step 2: analyze ──────────────────────────────────────────────
  async function startAnalysis() {
    if (!sketchUrl) return;
    setError('');
    setStep('analyzing');
    try {
      const r = await analyzeSketch(sketchUrl);
      setAnalysis(r);
      // Build initial form: expand each detected space into individual rows
      const rows: SpaceForm[] = [];
      r.spaces.forEach((s) => {
        for (let i = 1; i <= s.count; i += 1) {
          const label = s.count > 1 ? `${s.label} ${i}` : s.label;
          rows.push({
            label,
            baseLabel: s.label,
            index: i,
            sampleIds: new Set(),
            customPrompt: s.notes ?? '',
          });
        }
      });
      setSpaces(rows);
      setStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل التحليل');
      setStep('upload');
    }
  }

  // ── Step 3 prep: load catalogs ──────────────────────────────────
  async function startCustomize() {
    setStep('customize');
    if (sampleCats.length === 0) {
      try {
        const [sc, st] = await Promise.all([
          listSampleCategories('SAMPLE'),
          listSampleCategories('STYLE'),
        ]);
        setSampleCats(sc);
        setStyleCats(st);
        if (sc.length > 0) setActiveCatId(sc[0].id);
        const styleMap: Record<string, Sample[]> = {};
        await Promise.all(
          st.map(async (c) => {
            styleMap[c.id] = await listSamples(c.id, 'STYLE').catch(() => []);
          }),
        );
        setStyleOpts(styleMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تحميل الفئات');
      }
    }
  }

  useEffect(() => {
    if (!activeCatId) return;
    if (samplesByCat[activeCatId]) return;
    void listSamples(activeCatId, 'SAMPLE').then((items) =>
      setSamplesByCat((prev) => ({ ...prev, [activeCatId]: items })),
    );
  }, [activeCatId, samplesByCat]);

  // ── helpers to mutate the active space ──────────────────────────
  function updateActive(patch: Partial<SpaceForm>) {
    setSpaces((prev) => prev.map((s, i) => (i === activeSpaceIdx ? { ...s, ...patch } : s)));
  }
  function toggleSample(sampleId: string) {
    setSpaces((prev) =>
      prev.map((s, i) => {
        if (i !== activeSpaceIdx) return s;
        const next = new Set(s.sampleIds);
        if (next.has(sampleId)) next.delete(sampleId);
        else next.add(sampleId);
        return { ...s, sampleIds: next };
      }),
    );
  }

  function removeSpace(idx: number) {
    setSpaces((prev) => prev.filter((_, i) => i !== idx));
    setActiveSpaceIdx((i) => Math.max(0, i >= spaces.length - 1 ? spaces.length - 2 : i));
  }
  function addCustomSpace() {
    const label = prompt('اسم المساحة (مثال: غرفة الغسيل)');
    if (!label || !label.trim()) return;
    setSpaces((prev) => [
      ...prev,
      { label: label.trim(), baseLabel: label.trim(), index: 1, sampleIds: new Set(), customPrompt: '' },
    ]);
  }

  // ── Step 4: submit ──────────────────────────────────────────────
  async function submit() {
    if (spaces.length === 0) return;
    setError('');
    setStep('submitting');
    try {
      const payload = {
        sketchUrl,
        projectName: projectName.trim() || 'تصميم من سكيتش',
        spaces: spaces.map<SketchSpaceInput>((s) => ({
          label: s.label,
          styleId: s.styleId,
          sampleIds: Array.from(s.sampleIds),
          customPrompt: s.customPrompt.trim() || undefined,
        })),
        analysis: analysis ? { spaces: analysis.spaces } : undefined,
      };
      const r = await generateFromSketch(payload);
      setSubmitResult({ count: r.designs.length, points: r.pointsConsumed });
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الإنشاء');
      setStep('customize');
    }
  }

  function reset() {
    setStep('upload');
    setSketchUrl('');
    setAnalysis(null);
    setSpaces([]);
    setError('');
    setSubmitResult(null);
    setActiveSpaceIdx(0);
  }

  const totalPoints = spaces.length * POINTS_PER_DESIGN;
  const active = spaces[activeSpaceIdx];

  return (
    <div className="space-y-5">
      {/* Stepper indicator */}
      <Stepper step={step} />

      {/* ── Upload ──────────────────────────────────────────── */}
      {(step === 'upload' || step === 'analyzing') && (
        <div className="card">
          <div className="bg-clay/10 border border-clay/30 rounded-2xl p-4 mb-5 flex gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <div className="text-sm text-navy leading-relaxed">
              <strong>قبل رفع الاسكيتش:</strong> اكتب أسماء المساحات بخط يدك على الصورة (مجلس، مطبخ، حمام 1، حمام 2، صالة، حديقة...).
              الذكاء الاصطناعي يقرأ هذه التسميات ويُولّد لك تصميماً مخصّصاً لكل مساحة على حدة.
            </div>
          </div>

          {/* Example sketch — visual reference */}
          <ExampleSketch />

          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-2">صورة الاسكيتش / المخطط</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={uploading || step === 'analyzing'}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-clay file:text-white file:font-semibold hover:file:bg-clay-dark file:cursor-pointer"
            />
          </label>

          {sketchUrl && (
            <div className="mt-4 relative rounded-2xl overflow-hidden border border-gray-200">
              <img src={sketchUrl} alt="sketch" className="w-full max-h-96 object-contain bg-gray-50" />
            </div>
          )}

          {error && <ErrorBox msg={error} />}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={startAnalysis}
              disabled={!sketchUrl || step === 'analyzing'}
              className="btn-primary"
            >
              {step === 'analyzing' ? '🔍 جارٍ التحليل...' : '🔍 ابدأ التحليل (مجاناً)'}
            </button>
            {sketchUrl && (
              <button type="button" onClick={() => setSketchUrl('')} className="btn-ghost text-sm">
                صورة أخرى
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Review analysis ─────────────────────────────────── */}
      {step === 'review' && analysis && (
        <div className="card">
          {analysis.spaces.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🤔</div>
              <h3 className="font-bold text-navy text-lg mb-2">لم نتمكّن من قراءة أي تسميات</h3>
              <p className="text-sm text-gray-500 mb-5">
                تأكّد من كتابة أسماء المساحات بوضوح على الاسكيتش (مجلس، حمام 1، حمام 2...) ثم أعد رفع الصورة.
              </p>
              <button onClick={reset} className="btn-secondary">رفع صورة جديدة</button>
            </div>
          ) : (
            <>
              <h3 className="font-black text-navy text-xl mb-1">تم اكتشاف {analysis.totalSpaces} مساحات ✨</h3>
              <p className="text-sm text-gray-500 mb-5">
                راجع القائمة. يمكنك حذف أي مساحة لا تريد توليدها، أو إضافة مساحة جديدة لم يقرأها الذكاء الاصطناعي.
              </p>

              <div className="space-y-2 mb-5">
                {analysis.spaces.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-cream rounded-xl px-4 py-3">
                    <div>
                      <span className="font-bold text-navy">{s.label}</span>
                      {s.count > 1 && <span className="text-xs text-gray-500 mr-2">×{s.count}</span>}
                      {s.notes && <span className="text-xs text-gray-400 mr-2">— {s.notes}</span>}
                    </div>
                    <span className="text-xs text-clay-dark font-bold">{s.count * POINTS_PER_DESIGN} نقطة</span>
                  </div>
                ))}
              </div>

              <div className="bg-clay/5 border border-clay/20 rounded-xl p-4 mb-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الإجمالي:</span>
                  <span className="font-black text-navy text-lg">{analysis.totalSpaces} تصميم · {analysis.estimatedPoints} نقطة</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={startCustomize} className="btn-primary">تخصيص كل مساحة ←</button>
                <button onClick={reset} className="btn-ghost text-sm">صورة أخرى</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Customize per-space ─────────────────────────────── */}
      {step === 'customize' && active && (
        <div className="grid lg:grid-cols-[260px_1fr] gap-4">
          {/* Left: space list */}
          <aside className="card lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-auto">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">المساحات ({spaces.length})</div>
            <div className="space-y-1.5">
              {spaces.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSpaceIdx(i)}
                  className={`w-full text-right px-3 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-between ${
                    i === activeSpaceIdx ? 'bg-clay text-white' : 'hover:bg-cream text-navy'
                  }`}
                >
                  <span>{s.label}</span>
                  {(s.styleId || s.sampleIds.size > 0 || s.customPrompt) && (
                    <span className="text-[10px] opacity-70">✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
              <button onClick={addCustomSpace} className="w-full text-xs text-clay-dark hover:underline text-right">
                + إضافة مساحة
              </button>
              {spaces.length > 1 && (
                <button onClick={() => removeSpace(activeSpaceIdx)} className="w-full text-xs text-red-500 hover:underline text-right">
                  − حذف هذه المساحة
                </button>
              )}
            </div>
          </aside>

          {/* Right: form for active space */}
          <div className="card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-navy text-xl">{active.label}</h3>
                <p className="text-xs text-gray-500 mt-0.5">المساحة {activeSpaceIdx + 1} من {spaces.length}</p>
              </div>
              <span className="badge bg-clay/15 text-clay-dark">{POINTS_PER_DESIGN} نقاط</span>
            </div>

            {/* Style picker */}
            {styleCats.length > 0 && (
              <div>
                <div className="text-sm font-medium text-navy mb-2">النمط</div>
                <div className="flex flex-wrap gap-2">
                  {styleCats.flatMap((c) => styleOpts[c.id] ?? []).slice(0, 16).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateActive({ styleId: active.styleId === opt.id ? undefined : opt.id })}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        active.styleId === opt.id
                          ? 'bg-clay text-white border-clay'
                          : 'bg-white text-navy border-gray-200 hover:border-clay'
                      }`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sample categories */}
            {sampleCats.length > 0 && (
              <div>
                <div className="text-sm font-medium text-navy mb-2">العناصر والعينات</div>
                <div className="flex flex-wrap gap-1.5 mb-3 border-b border-gray-100 pb-2">
                  {sampleCats.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCatId(c.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        activeCatId === c.id ? 'bg-cream text-navy' : 'text-gray-500 hover:text-navy'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-auto">
                  {(samplesByCat[activeCatId ?? ''] ?? []).map((s) => {
                    const checked = active.sampleIds.has(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleSample(s.id)}
                        className={`text-right rounded-xl border px-3 py-2 text-xs transition-colors ${
                          checked ? 'bg-clay/10 border-clay text-navy' : 'bg-white border-gray-200 hover:border-clay/50'
                        }`}
                      >
                        <div className="font-bold truncate">{s.name}</div>
                        {checked && <div className="text-[10px] text-clay-dark mt-0.5">✓ مختار</div>}
                      </button>
                    );
                  })}
                  {(samplesByCat[activeCatId ?? ''] ?? []).length === 0 && (
                    <div className="col-span-3 text-center text-xs text-gray-400 py-4">لا توجد عينات في هذه الفئة</div>
                  )}
                </div>
              </div>
            )}

            {/* Custom prompt */}
            <div>
              <div className="text-sm font-medium text-navy mb-2">وصفك الخاص لهذه المساحة (اختياري)</div>
              <textarea
                value={active.customPrompt}
                onChange={(e) => updateActive({ customPrompt: e.target.value })}
                placeholder={`مثال: أرغب بـ${active.baseLabel} فاخر بإضاءة دافئة وأرضية رخامية...`}
                rows={3}
                className="input"
                maxLength={500}
              />
              <div className="text-[11px] text-gray-400 mt-1 text-left">{active.customPrompt.length}/500</div>
            </div>

            {/* Sticky bottom bar */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => setActiveSpaceIdx((i) => Math.max(0, i - 1))}
                disabled={activeSpaceIdx === 0}
                className="btn-ghost text-sm disabled:opacity-30"
              >
                ← السابقة
              </button>
              {activeSpaceIdx < spaces.length - 1 ? (
                <button
                  onClick={() => setActiveSpaceIdx((i) => Math.min(spaces.length - 1, i + 1))}
                  className="btn-secondary text-sm"
                >
                  التالية →
                </button>
              ) : (
                <button onClick={submit} className="btn-primary text-sm">
                  ✨ توليد {spaces.length} تصميم ({totalPoints} نقطة)
                </button>
              )}
            </div>

            {error && <ErrorBox msg={error} />}
          </div>
        </div>
      )}

      {/* ── Submitting ─────────────────────────────────────── */}
      {step === 'submitting' && (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3 animate-pulse">🎨</div>
          <div className="font-bold text-navy">جارٍ تجهيز {spaces.length} تصميم...</div>
          <div className="text-xs text-gray-500 mt-2">لا تغلق الصفحة</div>
        </div>
      )}

      {/* ── Done ───────────────────────────────────────────── */}
      {step === 'done' && submitResult && (
        <div className="card text-center py-10">
          <div className="text-6xl mb-3">🎉</div>
          <h3 className="font-black text-navy text-2xl mb-2">تم تجهيز {submitResult.count} تصميم!</h3>
          <p className="text-sm text-gray-500 mb-5">خصم {submitResult.points} نقطة. لتنزيل التصاميم بدقّة 4K، اشترِ باقة لتفعيل التوليد الفعلي.</p>
          <div className="flex justify-center gap-2">
            <a href="/pricing" className="btn-primary">شراء باقة لتنزيل التصاميم ←</a>
            <a href="/history" className="btn-secondary">عرض المشروع</a>
          </div>
        </div>
      )}
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const stages: { key: Step | 'multi'; label: string }[] = [
    { key: 'upload', label: 'رفع الاسكيتش' },
    { key: 'review', label: 'تأكيد المساحات' },
    { key: 'customize', label: 'تخصيص لكل مساحة' },
    { key: 'done', label: 'جاهز' },
  ];
  const order = (s: Step): number => {
    if (s === 'upload' || s === 'analyzing') return 0;
    if (s === 'review') return 1;
    if (s === 'customize' || s === 'submitting') return 2;
    return 3;
  };
  const current = order(step);
  return (
    <div className="flex items-center justify-between text-xs">
      {stages.map((s, i) => (
        <div key={s.key} className="flex items-center flex-1">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              i <= current ? 'bg-clay text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            {i < current ? '✓' : i + 1}
          </div>
          <div className={`mr-2 hidden sm:block ${i <= current ? 'text-navy font-bold' : 'text-gray-400'}`}>{s.label}</div>
          {i < stages.length - 1 && <div className={`flex-1 h-px mx-2 ${i < current ? 'bg-clay' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mt-3">{msg}</div>
  );
}

function ExampleSketch() {
  return (
    <figure className="mb-5">
      <figcaption className="flex items-center gap-2 text-xs font-bold text-clay-dark mb-2">
        <span className="badge bg-clay/15 text-clay-dark">مثال</span>
        <span>هكذا تبدو الصورة المثالية — مخطّط يدوي بأسماء المساحات</span>
      </figcaption>

      <div className="rounded-2xl overflow-hidden border-2 border-dashed border-clay/40 bg-cream">
        <svg
          viewBox="0 0 400 260"
          className="w-full h-auto block"
          role="img"
          aria-label="مثال صورة سكيتش لمخطّط بيت بأسماء المساحات: مجلس، صالة، مطبخ، حمام 1، حمام 2، نوم، حديقة"
        >
          <defs>
            <pattern id="ex-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#a8896d" strokeOpacity="0.25" strokeWidth="0.4" />
            </pattern>
            <filter id="ex-rough" x="-2%" y="-2%" width="104%" height="104%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
              <feDisplacementMap in="SourceGraphic" scale="0.8" />
            </filter>
          </defs>

          {/* Paper grid */}
          <rect width="400" height="260" fill="url(#ex-grid)" />

          {/* Outer hand-drawn wall */}
          <g
            stroke="#2c2e3a"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.65)"
            filter="url(#ex-rough)"
          >
            <rect x="20" y="20" width="360" height="220" rx="3" />

            {/* Inner partitions */}
            <line x1="20" y1="120" x2="240" y2="120" />
            <line x1="160" y1="20" x2="160" y2="120" />
            <line x1="240" y1="20" x2="240" y2="240" />
            <line x1="240" y1="170" x2="320" y2="170" />
            <line x1="320" y1="120" x2="320" y2="240" />
            <line x1="100" y1="120" x2="100" y2="240" />
            <line x1="100" y1="180" x2="240" y2="180" />
          </g>

          {/* Door arcs (small swing markers) */}
          <g stroke="#7d6450" strokeWidth="0.9" fill="none" strokeLinecap="round">
            <path d="M 92 120 A 12 12 0 0 1 100 132" />
            <path d="M 152 120 A 12 12 0 0 1 160 132" />
            <path d="M 232 100 A 12 12 0 0 1 240 112" />
            <path d="M 312 170 A 12 12 0 0 1 320 182" />
          </g>

          {/* Windows (double parallel lines on outer walls) */}
          <g stroke="#7d6450" strokeWidth="0.8">
            <line x1="60" y1="20" x2="120" y2="20" />
            <line x1="60" y1="22" x2="120" y2="22" />
            <line x1="280" y1="20" x2="340" y2="20" />
            <line x1="280" y1="22" x2="340" y2="22" />
            <line x1="380" y1="80" x2="380" y2="140" />
            <line x1="378" y1="80" x2="378" y2="140" />
          </g>

          {/* Hand-written room labels (slight rotations for sketch feel) */}
          <g
            fontFamily="'Cairo', 'Tajawal', sans-serif"
            fontWeight="700"
            fill="#2c2e3a"
            textAnchor="middle"
          >
            <text x="80" y="78" fontSize="15" transform="rotate(-2 80 78)">مجلس</text>
            <text x="200" y="78" fontSize="14" transform="rotate(1 200 78)">صالة</text>
            <text x="310" y="78" fontSize="13" transform="rotate(-1 310 78)">نوم</text>
            <text x="60" y="185" fontSize="12" transform="rotate(-1 60 185)">مطبخ</text>
            <text x="170" y="155" fontSize="11" transform="rotate(1 170 155)">حمام 1</text>
            <text x="170" y="215" fontSize="11" transform="rotate(-1 170 215)">حمام 2</text>
            <text x="280" y="210" fontSize="13" transform="rotate(2 280 210)">حديقة</text>
          </g>

          {/* Tiny decorative annotations */}
          <g stroke="#a8896d" strokeWidth="0.6" fill="none" strokeLinecap="round">
            <path d="M 295 200 q -8 -4 -16 0" />
            <path d="M 295 215 q -8 -4 -16 0" />
            <circle cx="350" cy="215" r="5" />
            <circle cx="355" cy="220" r="3" />
          </g>

          {/* Pencil scribble corner */}
          <g stroke="#7d6450" strokeWidth="0.5" fill="none" opacity="0.5">
            <path d="M 28 250 q 4 -3 8 0 t 8 0 t 8 0 t 8 0" />
          </g>

          {/* North arrow */}
          <g transform="translate(360 235)" fontFamily="'Cairo', sans-serif">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#7d6450" strokeWidth="0.7" />
            <path d="M 0 -8 L 3 4 L 0 1 L -3 4 Z" fill="#7d6450" />
            <text x="0" y="-12" fontSize="7" textAnchor="middle" fill="#7d6450">ش</text>
          </g>
        </svg>
      </div>

      <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
        لا حاجة لمخطّط احترافي — رسمة بسيطة بقلم رصاص أو حتى صورة من ورقة كرّاسة تكفي،
        المهمّ أن تكون أسماء المساحات (مجلس، مطبخ، حمام 1، حمام 2، صالة، نوم، حديقة...)
        مكتوبة بوضوح داخل كل غرفة.
      </p>
    </figure>
  );
}
