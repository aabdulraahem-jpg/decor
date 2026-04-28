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
import ElementsPicker from '@/components/elements-picker';
import { SpaceElement } from '@/lib/elements';

type Step = 'upload' | 'analyzing' | 'review' | 'customize' | 'submitting' | 'done';

interface SpaceForm {
  label: string;            // e.g. "حمام 1"
  baseLabel: string;        // e.g. "حمام"
  index: number;            // 1, 2, 3 (for duplicates)
  styleId?: string;         // optional STYLE-kind sample
  sampleIds: Set<string>;   // optional decor samples
  customPrompt: string;
  cameraAngle?: string;     // free text e.g. "from corner facing the entrance"
  elements?: SpaceElement[];// handrail, fence, pergola, carport, wall topper
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
  function addSpaceWithLabel(rawLabel: string) {
    const label = rawLabel.trim();
    if (!label) return;
    // Auto-number duplicates
    const existing = spaces.filter((s) => s.baseLabel === label).length;
    const finalLabel = existing > 0 ? `${label} ${existing + 1}` : label;
    setSpaces((prev) => [
      ...prev,
      { label: finalLabel, baseLabel: label, index: existing + 1, sampleIds: new Set(), customPrompt: '' },
    ]);
  }
  function addCustomSpace() {
    const label = prompt('اسم المساحة (مثال: غرفة الغسيل)');
    if (label) addSpaceWithLabel(label);
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
          cameraAngle: s.cameraAngle?.trim() || undefined,
          elements: s.elements && s.elements.length > 0 ? s.elements : undefined,
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

          {/* How-to-draw guide */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 mb-5">
            <div className="font-bold text-navy mb-3 flex items-center gap-2">
              <span className="text-xl">✏️</span>
              <span>كيف ترسم اسكيتش يفهمه الذكاء الاصطناعي</span>
            </div>
            <ol className="text-sm text-gray-700 leading-relaxed space-y-2 list-decimal pr-5 mb-4">
              <li>
                <strong>الجدران:</strong> ارسم خطوط مستقيمة للجدران الخارجية والداخلية. لا يهم
                إن كان الرسم بقلم رصاص، حبر، أو حتى صورة من تطبيق رسم على الجوال.
              </li>
              <li>
                <strong>الأبواب:</strong> أمامك خياران — كلاهما مقبول:
                <ul className="list-disc pr-5 mt-1 space-y-1">
                  <li><strong>باب بدون قوس (الأسهل):</strong> اترك فقط <em>فجوة بسيطة</em> في الجدار في
                    مكان الباب — يكفي أن يكون الجدار مكسوراً قطعتَين بمسافة فراغ بينهما (≈ 80–90 سم على المخطط).</li>
                  <li><strong>باب مع قوس فتح (أوضح):</strong> ارسم نفس الفجوة + قوس صغير ربع دائرة
                    (<span dir="ltr">⌒</span>) عند نهايتها يوضّح اتجاه فتح الباب.</li>
                </ul>
              </li>
              <li>
                <strong>النوافذ:</strong> ارسم <strong>خطّين متوازيين</strong> داخل الجدار
                الخارجي بمكان النافذة (مثل <span dir="ltr">═</span>). هذا يميّزها عن الباب.
              </li>
              <li>
                <strong>أسماء المساحات:</strong> اكتب اسم كل غرفة <strong>داخلها</strong>
                بخطّ واضح ومقروء. الذكاء يتعرّف على هذه التسميات الشائعة:
                <span className="block mt-1 text-[12px] text-gray-600">
                  مجلس · صالة · مطبخ · نوم · حمام 1 · حمام 2 · حديقة ·
                  <strong className="text-clay-dark"> ممر</strong> ·
                  <strong className="text-clay-dark"> درج</strong> ·
                  <strong className="text-clay-dark"> مغسلة ايدي</strong> ·
                  مدخل · شرفة · غسيل · مكتب · غرفة طعام · بدروم · روف
                </span>
              </li>
              <li>
                <strong>الدرج:</strong> ارسم مستطيلاً صغيراً مقسَّماً بـ4-6 خطوط أفقية (تمثّل
                الدرجات)، واكتب "درج" بداخله. أضف سهماً صغيراً على الأرضية يشير لاتجاه الصعود ↑.
              </li>
              <li>
                <strong>الممر:</strong> مساحة طويلة وضيّقة بين غرفتَين أو أكثر — ارسم خطَّين
                متوازيَين يفصلان بين الغرف، وضع كلمة "ممر" في منتصفها.
              </li>
              <li>
                <strong>مغسلة ايدي:</strong> مكان صغير غالباً خارج الحمّام لغسل اليدَين قبل
                الأكل أو الصلاة. ارسم دائرة صغيرة (الحوض) واكتب "مغسلة ايدي" بجانبها.
              </li>
              <li>
                <strong>📷 موقع الكاميرا (مهمّ):</strong> لتحديد الزاوية التي يصوّرها الذكاء
                داخل كل غرفة، ارسم <strong>دائرة صغيرة فيها رقم</strong> (1, 2, 3...) في الزاوية
                التي ستقف فيها الكاميرا، ثم ارسم <strong>سهم خارج منها</strong> يشير إلى الاتجاه
                الذي تنظر إليه. هذا يجعل التصميم أقرب لمنظورك الفعلي.
              </li>
              <li>
                <strong>🏗️ عناصر إضافية (اختياري):</strong> ترسم في الاسكيتش، وتختار نوعها وأبعادها في خطوة التخصيص:
                <ul className="list-disc pr-5 mt-1 space-y-1">
                  <li><strong>🪜 دربزين الدرج:</strong> قضبان عمودية قصيرة على جانب الدرج.</li>
                  <li><strong>🏛️ واجهة المبنى:</strong> سهم على الجدار الخارجي مكتوب عليه "واجهة".</li>
                  <li><strong>🏠 ملحق خارجي:</strong> مستطيل منفصل عن المبنى الأساسي + اسمه (ضيوف، خادمة...).</li>
                  <li><strong>🧱 سور خارجي:</strong> خطّ سميك يحيط بالأرض كاملةً.</li>
                  <li><strong>🚪 بوّابة:</strong> فجوة في خط السور + كلمة "بوّابة" أو 🚪.</li>
                  <li><strong>🚗 مظلة سيارة:</strong> مستطيل واسع عند مدخل المنزل + رمز 🚗.</li>
                  <li><strong>🏡 مظلة جلوس / بيرجولا:</strong> مستطيل في الحديقة مع علامة × أو شبكة.</li>
                  <li><strong>🛖 بيت شعر / خيمة:</strong> مثلث △ أو شبه منحرف داخل الحديقة.</li>
                  <li><strong>🪴 حاجز حديقة:</strong> خطّان متوازيان قصيران مع شُرَط عمودية بينهما.</li>
                  <li><strong>🌿 حاجز فوق السور:</strong> خطّ متموّج فوق خط السور.</li>
                  <li><strong>🌱 عشب / مساحة خضراء:</strong> منطقة بنقاط صغيرة (••• ٠٠٠) مع كلمة "عشب".</li>
                  <li><strong>👣 ممشى:</strong> خطّان متوازيان منحنيان أو مستقيمان يربطان بين منطقتَين.</li>
                  <li><strong>🏊 مسبح:</strong> مستطيل (أو شكل منحني) فيه خطوط متموّجة 〰️ تمثّل الماء.</li>
                  <li><strong>⬛ ساحة / مسيح:</strong> مستطيل مرصوف بشبكة خطوط (#####).</li>
                </ul>
              </li>
              <li>
                <strong>المقاسات (اختياري لكن يحسّن الدقّة):</strong> إذا تعرف أبعاد الغرفة،
                اكتبها داخل المساحة بصيغة <span dir="ltr" className="font-mono">4×5 m</span>
                أو <span dir="ltr" className="font-mono">4م × 5م</span>.
                المقاسات تساعد الذكاء على اختيار حجم الأثاث المناسب.
              </li>
              <li>
                <strong>الاتجاه (اختياري):</strong> ارسم سهم صغير يشير إلى الشمال إن أمكن،
                ليفهم الذكاء أين تقع نوافذ الإضاءة الطبيعية.
              </li>
            </ol>

            {/* Symbol legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <LegendItem
                label="جدار"
                svg={<line x1="6" y1="18" x2="42" y2="18" stroke="#2c2e3a" strokeWidth="2.4" strokeLinecap="round" />}
              />
              <LegendItem
                label="باب (فجوة فقط)"
                svg={
                  <>
                    <line x1="6" y1="22" x2="14" y2="22" stroke="#2c2e3a" strokeWidth="2" />
                    <line x1="34" y1="22" x2="42" y2="22" stroke="#2c2e3a" strokeWidth="2" />
                    <text x="24" y="14" textAnchor="middle" fontSize="7" fontFamily="Cairo, sans-serif" fill="#7d6450">باب</text>
                  </>
                }
              />
              <LegendItem
                label="باب مع قوس"
                svg={
                  <>
                    <line x1="6" y1="22" x2="14" y2="22" stroke="#2c2e3a" strokeWidth="2" />
                    <line x1="34" y1="22" x2="42" y2="22" stroke="#2c2e3a" strokeWidth="2" />
                    <path d="M 14 22 A 12 12 0 0 1 26 10" fill="none" stroke="#7d6450" strokeWidth="1.2" />
                  </>
                }
              />
              <LegendItem
                label="نافذة"
                svg={
                  <>
                    <line x1="6" y1="20" x2="42" y2="20" stroke="#2c2e3a" strokeWidth="2.2" />
                    <line x1="6" y1="24" x2="42" y2="24" stroke="#2c2e3a" strokeWidth="2.2" />
                  </>
                }
              />
              <LegendItem
                label="درج"
                svg={
                  <>
                    <rect x="8" y="6" width="32" height="20" fill="none" stroke="#2c2e3a" strokeWidth="1.2" />
                    <line x1="8" y1="11" x2="40" y2="11" stroke="#2c2e3a" strokeWidth="0.8" />
                    <line x1="8" y1="16" x2="40" y2="16" stroke="#2c2e3a" strokeWidth="0.8" />
                    <line x1="8" y1="21" x2="40" y2="21" stroke="#2c2e3a" strokeWidth="0.8" />
                    <path d="M 24 28 L 24 30 M 22 30 L 24 28 L 26 30" stroke="#7d6450" strokeWidth="1" fill="none" strokeLinecap="round" />
                  </>
                }
              />
              <LegendItem
                label="مغسلة ايدي"
                svg={
                  <>
                    <circle cx="18" cy="16" r="7" fill="none" stroke="#2c2e3a" strokeWidth="1.2" />
                    <circle cx="18" cy="16" r="2" fill="#7d6450" />
                    <text x="32" y="20" fontSize="8" fontFamily="Cairo, sans-serif" fill="#7d6450">حوض</text>
                  </>
                }
              />
              <LegendItem
                label="ممر"
                svg={
                  <>
                    <line x1="6" y1="10" x2="42" y2="10" stroke="#2c2e3a" strokeWidth="1.2" />
                    <line x1="6" y1="22" x2="42" y2="22" stroke="#2c2e3a" strokeWidth="1.2" />
                    <text x="24" y="20" textAnchor="middle" fontSize="9" fontFamily="Cairo, sans-serif" fontWeight="700" fill="#7d6450">ممر</text>
                  </>
                }
              />
              <LegendItem
                label="📷 كاميرا + اتجاه"
                svg={
                  <>
                    <circle cx="14" cy="16" r="7" fill="#2c2e3a" />
                    <text x="14" y="19" textAnchor="middle" fontSize="9" fontFamily="Cairo, sans-serif" fontWeight="900" fill="#fff">1</text>
                    <line x1="20" y1="16" x2="38" y2="16" stroke="#7d6450" strokeWidth="1.4" />
                    <path d="M 35 13 L 38 16 L 35 19" stroke="#7d6450" strokeWidth="1.4" fill="none" />
                  </>
                }
              />
            </div>

            {/* Structural / decor elements legend */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-[11px] font-bold text-gray-600 mb-2">
                🏗️ عناصر إضافية (اختياري — تُرسَم في الاسكيتش وتُختار في خطوة التخصيص بالنوع والمقاسات):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[11px]">
                <LegendItem
                  label="🪜 دربزين"
                  svg={
                    <>
                      <line x1="6" y1="22" x2="42" y2="22" stroke="#2c2e3a" strokeWidth="1.2" />
                      {[10, 16, 22, 28, 34, 40].map((x) => (
                        <line key={x} x1={x} y1="22" x2={x} y2="10" stroke="#2c2e3a" strokeWidth="1" />
                      ))}
                      <line x1="6" y1="9" x2="42" y2="9" stroke="#7d6450" strokeWidth="1.2" />
                    </>
                  }
                />
                <LegendItem
                  label="🏛️ واجهة"
                  svg={
                    <>
                      <line x1="6" y1="22" x2="42" y2="22" stroke="#2c2e3a" strokeWidth="2" />
                      <line x1="24" y1="22" x2="24" y2="8" stroke="#7d6450" strokeWidth="1" />
                      <path d="M 21 11 L 24 8 L 27 11" stroke="#7d6450" strokeWidth="1" fill="none" />
                      <text x="24" y="6" fontSize="5" textAnchor="middle" fill="#7d6450">واجهة</text>
                    </>
                  }
                />
                <LegendItem
                  label="🏠 ملحق"
                  svg={
                    <>
                      <rect x="6" y="6" width="20" height="14" fill="none" stroke="#2c2e3a" strokeWidth="1.2" />
                      <text x="16" y="16" fontSize="6" textAnchor="middle" fill="#7d6450" fontFamily="Cairo, sans-serif">ملحق</text>
                      <rect x="30" y="14" width="14" height="10" fill="rgba(0,0,0,0.1)" stroke="#2c2e3a" strokeWidth="0.6" />
                    </>
                  }
                />
                <LegendItem
                  label="🧱 سور"
                  svg={
                    <>
                      <rect x="6" y="6" width="36" height="20" fill="none" stroke="#2c2e3a" strokeWidth="2" />
                      <text x="24" y="18" fontSize="7" textAnchor="middle" fill="#7d6450">سور</text>
                    </>
                  }
                />
                <LegendItem
                  label="🚪 بوّابة"
                  svg={
                    <>
                      <line x1="6" y1="22" x2="14" y2="22" stroke="#2c2e3a" strokeWidth="2" />
                      <line x1="34" y1="22" x2="42" y2="22" stroke="#2c2e3a" strokeWidth="2" />
                      <text x="24" y="18" fontSize="9" textAnchor="middle">🚪</text>
                    </>
                  }
                />
                <LegendItem
                  label="🚗 مظلة سيارة"
                  svg={
                    <>
                      <rect x="6" y="10" width="36" height="14" fill="none" stroke="#2c2e3a" strokeWidth="1.2" />
                      <text x="24" y="20" textAnchor="middle" fontSize="11">🚗</text>
                    </>
                  }
                />
                <LegendItem
                  label="🏡 بيرجولا"
                  svg={
                    <>
                      <rect x="8" y="6" width="32" height="20" fill="none" stroke="#2c2e3a" strokeWidth="1.2" />
                      <line x1="8" y1="6" x2="40" y2="26" stroke="#7d6450" strokeWidth="0.6" />
                      <line x1="40" y1="6" x2="8" y2="26" stroke="#7d6450" strokeWidth="0.6" />
                    </>
                  }
                />
                <LegendItem
                  label="🛖 بيت شعر"
                  svg={
                    <>
                      <polygon points="24,5 6,25 42,25" fill="rgba(168,137,109,0.15)" stroke="#2c2e3a" strokeWidth="1.1" />
                      <line x1="14" y1="15" x2="34" y2="15" stroke="#7d6450" strokeWidth="0.5" />
                      <line x1="10" y1="20" x2="38" y2="20" stroke="#7d6450" strokeWidth="0.5" />
                    </>
                  }
                />
                <LegendItem
                  label="🪴 حاجز حديقة"
                  svg={
                    <>
                      <line x1="6" y1="9" x2="42" y2="9" stroke="#2c2e3a" strokeWidth="1.2" />
                      <line x1="6" y1="22" x2="42" y2="22" stroke="#2c2e3a" strokeWidth="1.2" />
                      {[12, 20, 28, 36].map((x) => (
                        <line key={x} x1={x} y1="9" x2={x} y2="22" stroke="#2c2e3a" strokeWidth="0.7" />
                      ))}
                    </>
                  }
                />
                <LegendItem
                  label="🌿 فوق السور"
                  svg={
                    <>
                      <line x1="6" y1="22" x2="42" y2="22" stroke="#2c2e3a" strokeWidth="1.6" />
                      <path d="M 6 18 q 3 -4 6 0 t 6 0 t 6 0 t 6 0 t 6 0 t 6 0" fill="none" stroke="#7d6450" strokeWidth="1" />
                    </>
                  }
                />
                <LegendItem
                  label="🌱 عشب"
                  svg={
                    <>
                      <rect x="6" y="6" width="36" height="20" fill="rgba(138,154,123,0.15)" stroke="#2c2e3a" strokeWidth="0.6" />
                      {[
                        [12, 12], [20, 13], [28, 11], [36, 13],
                        [10, 18], [18, 19], [26, 17], [34, 19], [40, 17],
                        [12, 23], [22, 22], [30, 23], [38, 22],
                      ].map(([x, y], i) => (
                        <line key={i} x1={x} y1={y + 2} x2={x} y2={y - 1} stroke="#6b7a5f" strokeWidth="0.7" />
                      ))}
                    </>
                  }
                />
                <LegendItem
                  label="👣 ممشى"
                  svg={
                    <>
                      <path d="M 6 12 C 16 14, 26 22, 42 20" fill="none" stroke="#2c2e3a" strokeWidth="1.2" />
                      <path d="M 6 18 C 16 20, 26 28, 42 26" fill="none" stroke="#2c2e3a" strokeWidth="1.2" />
                    </>
                  }
                />
                <LegendItem
                  label="🏊 مسبح"
                  svg={
                    <>
                      <rect x="6" y="8" width="36" height="16" fill="rgba(96,165,250,0.18)" stroke="#2c2e3a" strokeWidth="1" rx="2" />
                      <path d="M 9 15 q 3 -2 6 0 t 6 0 t 6 0 t 6 0 t 6 0" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
                      <path d="M 9 19 q 3 -2 6 0 t 6 0 t 6 0 t 6 0 t 6 0" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
                    </>
                  }
                />
                <LegendItem
                  label="⬛ ساحة"
                  svg={
                    <>
                      <rect x="6" y="6" width="36" height="20" fill="none" stroke="#2c2e3a" strokeWidth="1" />
                      {[12, 18, 24, 30, 36].map((x) => (
                        <line key={x} x1={x} y1="6" x2={x} y2="26" stroke="#2c2e3a" strokeWidth="0.4" />
                      ))}
                      {[12, 18].map((y) => (
                        <line key={y} x1="6" y1={y} x2="42" y2={y} stroke="#2c2e3a" strokeWidth="0.4" />
                      ))}
                    </>
                  }
                />
              </div>
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

              {/* Quick-add common spaces the AI may have missed */}
              <div className="rounded-xl bg-cream/60 border border-clay/20 p-3 mb-5">
                <div className="text-xs font-bold text-gray-600 mb-2">إضافة مساحة ناقصة بنقرة واحدة</div>
                <div className="flex flex-wrap gap-1.5 text-[12px]">
                  {['ممر', 'درج', 'مغسلة ايدي', 'مدخل', 'شرفة', 'غرفة غسيل', 'مكتب', 'غرفة طعام', 'بدروم'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => addSpaceWithLabel(q)}
                      className="px-2.5 py-1 rounded-full bg-white text-navy border border-gray-200 hover:border-clay/40 hover:text-clay-dark"
                    >
                      + {q}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={addCustomSpace}
                    className="px-2.5 py-1 rounded-full bg-white text-clay-dark border border-clay/40 hover:bg-clay/10 font-bold"
                  >
                    + اسم مخصّص
                  </button>
                </div>
              </div>

              <div className="bg-clay/5 border border-clay/20 rounded-xl p-4 mb-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الإجمالي:</span>
                  <span className="font-black text-navy text-lg">{spaces.length || analysis.totalSpaces} تصميم · {(spaces.length || analysis.totalSpaces) * POINTS_PER_DESIGN} نقطة</span>
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

            {/* Camera angle hint */}
            <div>
              <div className="text-sm font-medium text-navy mb-2 flex items-center gap-2">
                <span>📷 موقع وزاوية الكاميرا (اختياري)</span>
              </div>
              <input
                type="text"
                value={active.cameraAngle ?? ''}
                onChange={(e) => updateActive({ cameraAngle: e.target.value.slice(0, 200) })}
                placeholder="مثال: من زاوية الباب، عدسة عريضة، تنظر للنافذة"
                className="input"
              />
              <div className="text-[11px] text-gray-500 mt-1">
                صف باختصار من أين تلتقط الكاميرا الصورة، ولأي اتجاه تنظر. الذكاء يستخدم هذا
                لتأطير المشهد بدقّة.
              </div>
            </div>

            {/* Structural elements (handrail / fence / pergola / carport / wall topper) */}
            <ElementsPicker
              value={active.elements ?? []}
              onChange={(next) => updateActive({ elements: next })}
            />

            {/* Apply to other spaces */}
            {spaces.length > 1 && (
              <ApplyToOthers
                spaces={spaces}
                activeIdx={activeSpaceIdx}
                onApply={(targetIdxs, fields) => {
                  setSpaces((prev) =>
                    prev.map((s, i) => {
                      if (!targetIdxs.has(i) || i === activeSpaceIdx) return s;
                      const patch: Partial<SpaceForm> = {};
                      if (fields.styleId) patch.styleId = active.styleId;
                      if (fields.samples) patch.sampleIds = new Set(active.sampleIds);
                      if (fields.customPrompt) patch.customPrompt = active.customPrompt;
                      if (fields.cameraAngle) patch.cameraAngle = active.cameraAngle;
                      if (fields.elements) patch.elements = active.elements ? [...active.elements] : [];
                      return { ...s, ...patch };
                    }),
                  );
                }}
              />
            )}

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
          <p className="text-sm text-gray-500 mb-5">خصم {submitResult.points} نقطة. لتنزيل التصاميم بجودة كاملة، اشترِ باقة لتفعيل التوليد الفعلي.</p>
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

type ApplyFields = { styleId: boolean; samples: boolean; customPrompt: boolean; cameraAngle: boolean; elements: boolean };

function ApplyToOthers({
  spaces,
  activeIdx,
  onApply,
}: {
  spaces: SpaceForm[];
  activeIdx: number;
  onApply: (targetIdxs: Set<number>, fields: ApplyFields) => void;
}) {
  const [open, setOpen] = useState(false);
  const [targets, setTargets] = useState<Set<number>>(new Set());
  const [fields, setFields] = useState<ApplyFields>({ styleId: true, samples: true, customPrompt: false, cameraAngle: false, elements: false });
  const [done, setDone] = useState(false);

  function toggleTarget(idx: number) {
    setTargets((prev) => {
      const n = new Set(prev);
      if (n.has(idx)) n.delete(idx);
      else n.add(idx);
      return n;
    });
  }
  function selectAll() { setTargets(new Set(spaces.map((_, i) => i).filter((i) => i !== activeIdx))); }
  function clearAll() { setTargets(new Set()); }

  function apply() {
    if (targets.size === 0) return;
    onApply(targets, fields);
    setDone(true);
    setTimeout(() => { setDone(false); setOpen(false); setTargets(new Set()); }, 1400);
  }

  const fieldChips: { k: keyof ApplyFields; label: string; emoji: string }[] = [
    { k: 'styleId', label: 'النمط', emoji: '🎨' },
    { k: 'samples', label: 'العيّنات (بلاط/جدار/أثاث)', emoji: '🧱' },
    { k: 'customPrompt', label: 'الوصف المخصّص', emoji: '✏️' },
    { k: 'cameraAngle', label: 'زاوية الكاميرا', emoji: '📷' },
    { k: 'elements', label: 'العناصر (دربزين/حواجز/مظلّات)', emoji: '🏗️' },
  ];

  return (
    <div className="rounded-2xl border border-clay/20 bg-clay/5 p-3">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full text-right text-sm font-bold text-clay-dark hover:text-clay flex items-center justify-between"
        >
          <span>📋 طبّق هذه الاختيارات على مساحات أخرى</span>
          <span className="text-xs font-normal text-gray-500">مثلاً: نفس البلاط للممر والصالة</span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-navy">📋 تطبيق على مساحات أخرى</div>
            <button onClick={() => { setOpen(false); setTargets(new Set()); }} className="text-xs text-gray-500 hover:text-clay-dark">إلغاء</button>
          </div>

          <div>
            <div className="text-xs font-bold text-gray-600 mb-1.5">ما الذي تريد نسخه؟</div>
            <div className="flex flex-wrap gap-1.5">
              {fieldChips.map((c) => (
                <button
                  key={c.k}
                  type="button"
                  onClick={() => setFields((f) => ({ ...f, [c.k]: !f[c.k] }))}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                    fields[c.k] ? 'bg-clay text-white border-clay' : 'bg-white text-navy border-gray-200 hover:border-clay/40'
                  }`}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-xs font-bold text-gray-600">إلى أيّ مساحات؟</div>
              <div className="flex gap-2 text-[11px]">
                <button type="button" onClick={selectAll} className="text-clay-dark hover:underline">الكل</button>
                <button type="button" onClick={clearAll} className="text-gray-500 hover:underline">مسح</button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {spaces.map((s, i) => (
                i === activeIdx ? null : (
                  <label key={i} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2 py-1.5 cursor-pointer hover:border-clay/40">
                    <input
                      type="checkbox"
                      checked={targets.has(i)}
                      onChange={() => toggleTarget(i)}
                      className="accent-clay"
                    />
                    <span className="text-[12px] text-navy">{s.label}</span>
                  </label>
                )
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={apply}
            disabled={targets.size === 0}
            className="w-full btn-primary text-sm py-2 disabled:opacity-50"
          >
            {done ? '✅ تم النسخ' : `طبّق على ${targets.size} مساحة`}
          </button>
        </div>
      )}
    </div>
  );
}

function LegendItem({ label, svg }: { label: string; svg: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-cream/50 p-2 flex items-center gap-2">
      <svg viewBox="0 0 48 32" className="w-12 h-8 shrink-0">{svg}</svg>
      <span className="text-navy font-semibold leading-tight">{label}</span>
    </div>
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

          {/* Outer hand-drawn wall — draws itself on load */}
          <g
            stroke="#2c2e3a"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.65)"
            filter="url(#ex-rough)"
            className="ex-draw"
          >
            <rect x="20" y="20" width="360" height="220" rx="3" pathLength={1} />

            {/* Inner partitions (each animates with a slight stagger) */}
            <line x1="20" y1="120" x2="240" y2="120" pathLength={1} style={{ animationDelay: '0.4s' }} />
            <line x1="160" y1="20" x2="160" y2="120" pathLength={1} style={{ animationDelay: '0.5s' }} />
            <line x1="240" y1="20" x2="240" y2="240" pathLength={1} style={{ animationDelay: '0.6s' }} />
            <line x1="240" y1="170" x2="320" y2="170" pathLength={1} style={{ animationDelay: '0.7s' }} />
            <line x1="320" y1="120" x2="320" y2="240" pathLength={1} style={{ animationDelay: '0.8s' }} />
            <line x1="100" y1="120" x2="100" y2="240" pathLength={1} style={{ animationDelay: '0.9s' }} />
            <line x1="100" y1="180" x2="240" y2="180" pathLength={1} style={{ animationDelay: '1.0s' }} />
          </g>

          {/* Door arcs (small swing markers) — draw after walls */}
          <g stroke="#7d6450" strokeWidth="0.9" fill="none" strokeLinecap="round" className="ex-draw">
            <path d="M 92 120 A 12 12 0 0 1 100 132" pathLength={1} style={{ animationDelay: '1.2s' }} />
            <path d="M 152 120 A 12 12 0 0 1 160 132" pathLength={1} style={{ animationDelay: '1.3s' }} />
            <path d="M 232 100 A 12 12 0 0 1 240 112" pathLength={1} style={{ animationDelay: '1.4s' }} />
            <path d="M 312 170 A 12 12 0 0 1 320 182" pathLength={1} style={{ animationDelay: '1.5s' }} />
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

          {/* Stairs symbol — small rectangle in the corridor */}
          <g stroke="#2c2e3a" strokeWidth="0.8" fill="none">
            <rect x="247" y="125" width="22" height="38" />
            <line x1="247" y1="132" x2="269" y2="132" />
            <line x1="247" y1="139" x2="269" y2="139" />
            <line x1="247" y1="146" x2="269" y2="146" />
            <line x1="247" y1="153" x2="269" y2="153" />
            <line x1="247" y1="160" x2="269" y2="160" />
            {/* Handrail running along the stairs (vertical bars) */}
            <g stroke="#7d6450" strokeWidth="0.7">
              <line x1="245" y1="128" x2="245" y2="160" />
              <line x1="245" y1="128" x2="245" y2="123" />
              <line x1="245" y1="135" x2="245" y2="130" />
              <line x1="245" y1="142" x2="245" y2="137" />
              <line x1="245" y1="149" x2="245" y2="144" />
              <line x1="245" y1="156" x2="245" y2="151" />
            </g>
          </g>
          {/* Stairs up arrow */}
          <g stroke="#7d6450" strokeWidth="0.8" fill="none">
            <line x1="258" y1="166" x2="258" y2="172" />
            <path d="M 255 169 L 258 166 L 261 169" />
          </g>

          {/* Handwash basin — small circle on the corridor edge */}
          <g>
            <circle cx="270" cy="195" r="6" fill="rgba(168,137,109,0.15)" stroke="#2c2e3a" strokeWidth="0.8" />
            <circle cx="270" cy="195" r="1.5" fill="#7d6450" />
          </g>

          {/* Camera viewpoints — circle with number + direction arrow */}
          <g>
            {/* Camera 1 — in majlis, facing center */}
            <circle cx="50" cy="60" r="6" fill="#2c2e3a" />
            <text x="50" y="63" fontSize="8" fontFamily="Cairo, sans-serif" fontWeight="900" fill="#fff" textAnchor="middle">1</text>
            <line x1="55" y1="60" x2="78" y2="78" stroke="#7d6450" strokeWidth="1.1" />
            <path d="M 73 75 L 78 78 L 75 73" stroke="#7d6450" strokeWidth="1.1" fill="none" />

            {/* Camera 2 — in salah */}
            <circle cx="220" cy="60" r="6" fill="#2c2e3a" />
            <text x="220" y="63" fontSize="8" fontFamily="Cairo, sans-serif" fontWeight="900" fill="#fff" textAnchor="middle">2</text>
            <line x1="218" y1="65" x2="200" y2="95" stroke="#7d6450" strokeWidth="1.1" />
            <path d="M 198 91 L 200 95 L 204 93" stroke="#7d6450" strokeWidth="1.1" fill="none" />

            {/* Camera 3 — in kitchen */}
            <circle cx="38" cy="148" r="6" fill="#2c2e3a" />
            <text x="38" y="151" fontSize="8" fontFamily="Cairo, sans-serif" fontWeight="900" fill="#fff" textAnchor="middle">3</text>
            <line x1="44" y1="148" x2="64" y2="160" stroke="#7d6450" strokeWidth="1.1" />
            <path d="M 60 158 L 64 160 L 62 156" stroke="#7d6450" strokeWidth="1.1" fill="none" />
          </g>

          {/* Hand-written room labels + optional dimensions */}
          <g
            fontFamily="'Cairo', 'Tajawal', sans-serif"
            fontWeight="700"
            fill="#2c2e3a"
            textAnchor="middle"
          >
            <text x="80" y="72" fontSize="15" transform="rotate(-2 80 72)">مجلس</text>
            <text x="80" y="92" fontSize="9" fill="#7d6450">5×6 م</text>

            <text x="200" y="72" fontSize="14" transform="rotate(1 200 72)">صالة</text>
            <text x="200" y="92" fontSize="9" fill="#7d6450">4×5 م</text>

            <text x="310" y="72" fontSize="13" transform="rotate(-1 310 72)">نوم</text>
            <text x="310" y="92" fontSize="9" fill="#7d6450">4×4 م</text>

            <text x="60" y="180" fontSize="12" transform="rotate(-1 60 180)">مطبخ</text>
            <text x="60" y="198" fontSize="9" fill="#7d6450">3×4 م</text>

            <text x="170" y="155" fontSize="11" transform="rotate(1 170 155)">حمام 1</text>
            <text x="170" y="215" fontSize="11" transform="rotate(-1 170 215)">حمام 2</text>
            <text x="280" y="205" fontSize="13" transform="rotate(2 280 205)">حديقة</text>
            <text x="280" y="222" fontSize="9" fill="#7d6450">5×7 م</text>

            {/* New labels: stairs, corridor, handwash */}
            <text x="258" y="148" fontSize="8" fill="#7d6450">درج</text>
            <text x="285" y="195" fontSize="8" fill="#7d6450" textAnchor="start">مغسلة ايدي</text>
            <text x="125" y="174" fontSize="9" transform="rotate(0 125 174)">ممر</text>
          </g>

          {/* Corridor strip between kitchen and bathrooms */}
          <g stroke="#a8896d" strokeWidth="0.4" strokeDasharray="2 3" fill="none">
            <line x1="100" y1="174" x2="155" y2="174" />
          </g>

          {/* Garden — pergola */}
          <g stroke="#2c2e3a" strokeWidth="0.7" fill="rgba(168,137,109,0.06)">
            <rect x="290" y="178" width="28" height="20" />
            <line x1="290" y1="178" x2="318" y2="198" />
            <line x1="318" y1="178" x2="290" y2="198" />
          </g>
          <text x="304" y="206" fontSize="5.5" fontFamily="Cairo, sans-serif" fontWeight="700" fill="#7d6450" textAnchor="middle">بيرجولا</text>

          {/* Bait Shar (Bedouin tent) — small triangle */}
          <g stroke="#2c2e3a" strokeWidth="0.7" fill="rgba(168,137,109,0.18)">
            <polygon points="335,200 322,222 348,222" />
          </g>
          <text x="335" y="228" fontSize="5" fontFamily="Cairo, sans-serif" fontWeight="700" fill="#7d6450" textAnchor="middle">بيت شعر</text>

          {/* Pool */}
          <g stroke="#2c2e3a" strokeWidth="0.7">
            <rect x="252" y="192" width="32" height="20" rx="1" fill="rgba(96,165,250,0.18)" />
            <path d="M 254 200 q 2 -1.5 4 0 t 4 0 t 4 0 t 4 0 t 4 0 t 4 0 t 4 0" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
            <path d="M 254 205 q 2 -1.5 4 0 t 4 0 t 4 0 t 4 0 t 4 0 t 4 0 t 4 0" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
          </g>
          <text x="268" y="190" fontSize="5.5" fontFamily="Cairo, sans-serif" fontWeight="700" fill="#3b82f6" textAnchor="middle">مسبح</text>

          {/* Grass area */}
          <g>
            <rect x="252" y="172" width="80" height="18" fill="rgba(138,154,123,0.12)" stroke="none" />
            {[
              [258, 180], [266, 178], [274, 182], [282, 178], [290, 181], [298, 179], [306, 182], [314, 178], [322, 181],
              [262, 186], [270, 184], [278, 187], [286, 185], [294, 187], [302, 184], [310, 187], [318, 185], [326, 187],
            ].map(([x, y], i) => (
              <line key={i} x1={x} y1={y + 1.5} x2={x} y2={y - 1} stroke="#6b7a5f" strokeWidth="0.5" />
            ))}
          </g>
          <text x="268" y="170" fontSize="5" fontFamily="Cairo, sans-serif" fontWeight="700" fill="#6b7a5f" textAnchor="middle">عشب</text>

          {/* Walkway curving from main door to pergola */}
          <g stroke="#7d6450" strokeWidth="0.5" fill="none" strokeDasharray="2 2">
            <path d="M 245 240 C 270 230, 290 215, 304 198" />
            <path d="M 248 244 C 273 234, 293 219, 307 202" />
          </g>
          <text x="280" y="238" fontSize="5" fontFamily="Cairo, sans-serif" fontWeight="700" fill="#7d6450" textAnchor="middle">ممشى</text>

          {/* Wall topper above outer wall — wavy line */}
          <path d="M 30 18 q 5 -6 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 10 0 t 10 0"
                fill="none" stroke="#7d6450" strokeWidth="0.6" strokeLinecap="round" />

          {/* Boundary wall gate — gap on the bottom edge, with arrow */}
          <g stroke="#2c2e3a" strokeWidth="2.4">
            <line x1="20" y1="240" x2="170" y2="240" />
            <line x1="200" y1="240" x2="230" y2="240" />
            <line x1="260" y1="240" x2="380" y2="240" />
          </g>
          <g stroke="#7d6450" strokeWidth="0.7" fill="none">
            <line x1="170" y1="240" x2="170" y2="246" />
            <line x1="200" y1="240" x2="200" y2="246" />
          </g>
          <text x="185" y="252" fontSize="6" fontFamily="Cairo, sans-serif" fontWeight="700" fill="#7d6450" textAnchor="middle">🚪 بوّابة</text>

          {/* Annex (separate small building) — outside main wall in lower-right corner */}
          <g stroke="#2c2e3a" strokeWidth="0.9" fill="rgba(168,137,109,0.10)">
            <rect x="320" y="245" width="48" height="14" rx="1" />
          </g>
          <text x="344" y="254" fontSize="6" fontFamily="Cairo, sans-serif" fontWeight="700" fill="#7d6450" textAnchor="middle">ملحق ضيوف</text>

          {/* Carport — narrow strip beside the gate */}
          <g stroke="#2c2e3a" strokeWidth="0.7" fill="rgba(168,137,109,0.08)">
            <rect x="232" y="245" width="32" height="12" rx="1" />
          </g>
          <text x="248" y="253" fontSize="5.5" fontFamily="Cairo, sans-serif" fontWeight="700" fill="#7d6450" textAnchor="middle">🚗 مظلة سيارة</text>

          {/* Callouts pointing to door + window + camera */}
          <g fontFamily="'Cairo', sans-serif" fill="#a8896d" fontSize="8">
            <line x1="96" y1="126" x2="115" y2="142" stroke="#a8896d" strokeWidth="0.5" />
            <text x="118" y="146">باب (قوس فتح)</text>
            <line x1="90" y1="22" x2="78" y2="42" stroke="#a8896d" strokeWidth="0.5" />
            <text x="46" y="46">نافذة (خطّان)</text>
            <line x1="50" y1="55" x2="38" y2="40" stroke="#a8896d" strokeWidth="0.5" />
            <text x="22" y="38">📷 كاميرا 1</text>
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

          <style>{`
            @keyframes ex-stroke { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
            .ex-draw rect, .ex-draw line, .ex-draw path {
              stroke-dasharray: 1;
              stroke-dashoffset: 1;
              animation: ex-stroke 0.9s ease-out forwards;
            }
          `}</style>
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
