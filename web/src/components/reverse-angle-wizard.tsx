'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, describeDesignCost, uploadReferenceImage } from '@/lib/api';
import { ReferenceImage, ReferenceRole } from '@/lib/references';
import SketchEditor, { SketchMarker } from '@/components/sketch-editor';
import SideReferenceSlot from '@/components/side-reference-slot';

const newId = () => Math.random().toString(36).slice(2, 9);
type SideRole = 'right_side' | 'left_side' | 'opposite_angle';

interface Props {
  /** Main reference image (the user's current photo). */
  referenceUrl: string;
  setReferenceUrl: (url: string) => void;
  /** Opposite-angle / style / element_source references. */
  references: ReferenceImage[];
  setReferences: (refs: ReferenceImage[]) => void;
  /** Toggle for the reverse-angle preset directive. */
  oppositeAngle: boolean;
  setOppositeAngle: (v: boolean) => void;
  /** Wishlist chips for what should appear in the newly visible side. */
  oppositeWishlist: Set<string>;
  setOppositeWishlist: (s: Set<string>) => void;
  /** Sketch markers (we use one CAMERA marker for placement / direction). */
  markers: SketchMarker[];
  setMarkers: (m: SketchMarker[]) => void;
  /** Pre-generation step: render the design first with dimension callouts. */
  measuredFirst: boolean;
  setMeasuredFirst: (v: boolean) => void;
  measuredUnit: 'm' | 'cm' | 'in';
  setMeasuredUnit: (u: 'm' | 'cm' | 'in') => void;
  /** Trigger the existing studio-page generate flow. */
  onGenerate: () => void;
  generating: boolean;
}

const WISHLIST_OPTIONS = [
  'تلفزيون جداري كبير',
  'مكتبة ممتدة',
  'نافذة بانورامية',
  'باب فرنسي للحديقة',
  'جدار حجري ديكوري',
  'لوحة فنية كبيرة',
  'مدفأة حديثة',
  'نباتات داخلية',
  'إطلالة على المسبح',
  'إضاءة مخفيّة (LED)',
  'بار / منطقة ضيافة',
  'زاوية قراءة',
];

export default function ReverseAngleWizard(props: Props) {
  const router = useRouter();
  const [uploadingMain, setUploadingMain] = useState(false);
  const [showCameraEditor, setShowCameraEditor] = useState(false);
  const fileMainRef = useRef<HTMLInputElement | null>(null);

  const cameraMarker = props.markers.find((m) => m.kind === 'CAMERA');

  /** Upsert one of the side-role references and keep all other refs intact. */
  function setSideRef(role: SideRole, next: ReferenceImage | undefined) {
    const others = props.references.filter((r) => r.role !== role);
    if (next) {
      props.setReferences([...others, next]);
      // Auto-enable opposite-angle directive whenever the user adds an opposite ref
      if (role === 'opposite_angle') props.setOppositeAngle(true);
    } else {
      props.setReferences(others);
    }
  }
  const sideImage = (role: SideRole) => props.references.find((r) => r.role === role);

  async function uploadMain(file: File) {
    setUploadingMain(true);
    try {
      const { url } = await uploadReferenceImage(file);
      props.setReferenceUrl(url);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login?next=/studio');
      }
    } finally {
      setUploadingMain(false);
    }
  }

  function placeOrEditCamera() {
    if (!cameraMarker) {
      const cam: SketchMarker = {
        id: newId(),
        kind: 'CAMERA',
        xPct: 50, yPct: 50,
        rotationDeg: 0,
        text: '',
      };
      props.setMarkers([...props.markers.filter((m) => m.kind !== 'CAMERA'), cam]);
    }
    setShowCameraEditor(true);
  }

  return (
    <div className="card border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/70 via-white to-cream/50 mb-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-3xl shrink-0">🔄</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-black text-navy">الزاوية المعاكسة + الجهات الجانبية</h2>
            <span className="badge bg-emerald-600 text-white text-[10px]">جديد</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed mt-1">
            ارفع <strong>صورة غرفتك</strong> وحدّد عليها كاميرا. ثم أضف صوراً مرجعية للجهات
            (<strong>يمين / يسار / مقابلة</strong>) واضغط على كل صورة لتضع سهماً 📷 يحدّد اتجاه عدسة الكاميرا فيها.
            الذكاء يقرأ العناصر المتكرّرة في كل الصور ويبني الصورة الجديدة من الزاوية المطلوبة.
          </p>
        </div>
      </div>

      {/* Main image slot — full width hero */}
      <div className="mb-3">
        <UploadSlot
          label="📷 صورتك الحالية"
          subLabel="(الزاوية الأصلية — الأهم)"
          url={props.referenceUrl}
          uploading={uploadingMain}
          accent="navy"
          inputRef={fileMainRef}
          onPick={() => fileMainRef.current?.click()}
          onUpload={uploadMain}
          onClear={() => props.setReferenceUrl('')}
          tall
        />
      </div>

      {/* Side reference slots — right / opposite / left, each with directional arrow */}
      {props.referenceUrl && (
        <div className="mb-4">
          <div className="text-xs font-bold text-navy mb-2 flex items-center gap-2">
            <span>📸 صور الجهات (اختياري — كل منها بسهم اتجاه كاميرا)</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-2">
            <SideReferenceSlot
              role="right_side"
              image={sideImage('right_side')}
              onChange={(img) => setSideRef('right_side', img)}
            />
            <SideReferenceSlot
              role="opposite_angle"
              image={sideImage('opposite_angle')}
              onChange={(img) => setSideRef('opposite_angle', img)}
            />
            <SideReferenceSlot
              role="left_side"
              image={sideImage('left_side')}
              onChange={(img) => setSideRef('left_side', img)}
            />
          </div>
          <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
            💡 على كل صورة جانبية: <strong>اسحب 📷 الأخضر</strong> لتحريك السهم،{' '}
            <strong>اسحب الدائرة البيضاء</strong> لتدوير اتجاه العدسة. السهم يخبر الذكاء كيف يربط هذه الصورة بصورتك الأصلية.
          </p>
        </div>
      )}

      {/* Camera placement (only after main photo is uploaded) */}
      {props.referenceUrl && (
        <div className="rounded-xl bg-clay/5 border border-clay/30 p-3 mb-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-navy text-sm flex items-center gap-2 flex-wrap">
                <span>📷 موقع واتجاه الكاميرا على صورتك</span>
                {cameraMarker ? (
                  <span className="badge bg-emerald-100 text-emerald-700 text-[10px]">✓ تم التحديد</span>
                ) : (
                  <span className="badge bg-amber-100 text-amber-700 text-[10px]">لم تُحدَّد بعد</span>
                )}
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5">
                حدّد من أين سيلتقط الذكاء الصورة الجديدة (الزاوية المعاكسة). دوّر السهم لاتجاه النظر.
              </p>
            </div>
            <button
              type="button"
              onClick={placeOrEditCamera}
              className="btn-secondary text-sm"
            >
              {cameraMarker ? '✏️ عدّل الكاميرا' : '📷 ضع كاميرا'}
            </button>
          </div>

          {showCameraEditor && (
            <div className="mt-3 border-t border-clay/20 pt-3">
              <SketchEditor
                sketchUrl={props.referenceUrl}
                markers={props.markers}
                onChange={props.setMarkers}
              />
              <button
                type="button"
                onClick={() => setShowCameraEditor(false)}
                className="mt-2 text-xs text-clay-dark hover:underline"
              >
                إغلاق المحرّر
              </button>
            </div>
          )}
        </div>
      )}

      {/* Wishlist chips for the opposite side */}
      {props.referenceUrl && (
        <div className="mb-4">
          <div className="text-xs font-bold text-navy mb-2">
            ✨ ماذا تريد إضافته في الجزء المقابل من الصورة؟
            <span className="text-gray-500 font-normal mr-1">(اختياري — اختر ما يناسبك)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {WISHLIST_OPTIONS.map((opt) => {
              const sel = props.oppositeWishlist.has(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    const next = new Set(props.oppositeWishlist);
                    if (next.has(opt)) next.delete(opt); else next.add(opt);
                    props.setOppositeWishlist(next);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                    sel
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {sel ? '✓' : '+'} {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Measured-first toggle — render annotated dimensions before final */}
      {props.referenceUrl && (
        <div className={`rounded-xl border-2 p-3 mb-3 transition-colors ${props.measuredFirst ? 'border-amber-400 bg-amber-50/60' : 'border-gray-200 bg-white'}`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={props.measuredFirst}
              onChange={(e) => props.setMeasuredFirst(e.target.checked)}
              className="accent-amber-600 mt-1"
            />
            <div className="flex-1">
              <div className="font-bold text-navy text-sm flex items-center gap-2 flex-wrap">
                <span>📐 صورة بالمقاسات أولاً</span>
                <span className="badge bg-amber-100 text-amber-700 text-[10px]">جديد</span>
              </div>
              <p className="text-[11px] text-gray-700 mt-0.5 leading-relaxed">
                ولّد الصورة مع <strong>قياسات على كل عنصر</strong> (الجدران، الأبواب، النوافذ، الأثاث…).
                المقاسات التي حدّدتها بالمسطرة تُعرَض كأرقام دقيقة، والباقي يُعرَض بصيغة
                <strong className="text-amber-700"> «تقريباً ~»</strong> بلون لطيف لا يطغى على وضوح الصورة.
              </p>
            </div>
          </label>

          {props.measuredFirst && (
            <div className="mt-2 pt-2 border-t border-amber-200/70 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-navy">وحدة المقاس:</span>
              <div className="flex bg-white rounded-full p-0.5 gap-0.5 border border-amber-300">
                {(['m', 'cm', 'in'] as const).map((u) => {
                  const labels = { m: 'متر', cm: 'سنتيمتر', in: 'بوصة' } as const;
                  return (
                    <button
                      key={u}
                      type="button"
                      onClick={() => props.setMeasuredUnit(u)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                        props.measuredUnit === u ? 'bg-amber-600 text-white' : 'text-navy hover:bg-amber-50'
                      }`}
                    >{labels[u]}</button>
                  );
                })}
              </div>
              <span className="text-[10px] text-gray-500 mr-2">
                💡 لقياسات أدقّ، استخدم 📐 المسطرة على صورك المرجعية أو الأصلية أعلاه.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Cost breakdown — only when ready to generate */}
      {props.referenceUrl && (() => {
        const cost = describeDesignCost({
          refCount: props.references.length,
          measuredFirst: props.measuredFirst,
        });
        const extra = cost.references + cost.measured;
        return (
          <div className="rounded-xl bg-cream/60 border border-clay/30 p-2.5 mb-3 text-[11px] text-navy">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="font-bold">💎 تكلفة التوليد:</span>
              <span className="font-black text-clay-dark">{cost.total} نقطة</span>
            </div>
            <div className="text-[10px] text-gray-600 mt-1 leading-relaxed">
              توليد أساسي: <strong>{cost.base}</strong>
              {cost.references > 0 && <> · تحليل {props.references.length} صورة مرجعيّة: <strong className="text-amber-700">+{cost.references}</strong></>}
              {cost.measured > 0 && <> · معاينة بالمقاسات: <strong className="text-amber-700">+{cost.measured}</strong></>}
              {extra > 0 && <span className="block text-[9px] text-gray-500 mt-0.5">المسطرة والمقاسات تستهلك توكنز ذكاء صناعي إضافيّة</span>}
            </div>
          </div>
        );
      })()}

      {/* Generate */}
      <button
        type="button"
        onClick={props.onGenerate}
        disabled={props.generating || !props.referenceUrl}
        className="btn-primary w-full text-base py-3 disabled:opacity-50"
      >
        {props.generating
          ? '✨ يولّد التصميم...'
          : !props.referenceUrl
          ? '↑ ارفع صورتك أولاً'
          : `🚀 ولّد التصميم (${describeDesignCost({ refCount: props.references.length, measuredFirst: props.measuredFirst }).total} نقطة)`}
      </button>
      <p className="text-[10px] text-gray-500 text-center mt-2 leading-relaxed">
        تتلاعب بالنمط/العيّنات/المقاسات؟ كل ذلك متاح في الأقسام أدناه — هذه البطاقة تُجمّع الأساسيات لاستخدام أسرع.
      </p>
    </div>
  );
}

function UploadSlot({
  label, subLabel, url, uploading, accent, inputRef, onPick, onUpload, onClear, tall,
}: {
  label: string;
  subLabel: string;
  url?: string;
  uploading: boolean;
  accent: 'navy' | 'emerald';
  inputRef: React.RefObject<HTMLInputElement>;
  onPick: () => void;
  onUpload: (f: File) => void;
  onClear: () => void;
  tall?: boolean;
}) {
  const accentBorder = accent === 'navy' ? 'border-navy/40 hover:border-navy' : 'border-emerald-400 hover:border-emerald-600';
  const accentBg = accent === 'navy' ? 'bg-navy/5' : 'bg-emerald-50/50';
  return (
    <div
      className={`relative rounded-xl border-2 border-dashed ${accentBorder} ${accentBg} p-3 ${tall ? 'min-h-[180px]' : 'min-h-[140px]'} flex flex-col`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) onUpload(f);
        }}
      />
      <div className="text-[12px] font-bold text-navy">{label}</div>
      <div className="text-[10px] text-gray-500 mb-2">{subLabel}</div>
      {url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className={`w-full flex-1 ${tall ? 'max-h-56' : 'max-h-32'} object-cover rounded-lg`} />
          <div className="flex gap-1.5 mt-2">
            <button
              type="button"
              onClick={onPick}
              className="text-[11px] text-clay-dark hover:underline"
            >تغيير</button>
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] text-red-500 hover:underline mr-auto"
            >حذف</button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={onPick}
          disabled={uploading}
          className={`flex-1 flex flex-col items-center justify-center gap-1 ${accent === 'navy' ? 'text-navy' : 'text-emerald-700'} hover:opacity-80 disabled:opacity-50`}
        >
          <div className="text-3xl">📤</div>
          <div className="text-xs font-bold">
            {uploading ? '⏳ يُرفَع...' : 'اضغط لرفع الصورة'}
          </div>
        </button>
      )}
    </div>
  );
}
