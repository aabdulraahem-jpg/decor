'use client';

import { useRef, useState } from 'react';
import { ReferenceImage, ReferenceRole, ROLE_LABELS } from '@/lib/references';
import { uploadReferenceImage } from '@/lib/api';

interface Props {
  /** The main design's reference image — used to let user pick target XY. */
  mainImageUrl?: string;
  references: ReferenceImage[];
  onChange: (next: ReferenceImage[]) => void;
}

const newId = () => Math.random().toString(36).slice(2, 9);

export default function ReferenceBoard({ mainImageUrl, references, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [annotatingId, setAnnotatingId] = useState<string | null>(null);

  async function handleAddFile(file: File, role: ReferenceRole) {
    setUploading(true);
    try {
      const { url } = await uploadReferenceImage(file);
      const ref: ReferenceImage = { id: newId(), url, role };
      onChange([...references, ref]);
    } catch (err) {
      console.warn('reference upload failed', err);
    } finally {
      setUploading(false);
    }
  }

  function update(id: string, patch: Partial<ReferenceImage>) {
    onChange(references.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function remove(id: string) {
    onChange(references.filter((r) => r.id !== id));
  }

  const annotating = annotatingId ? references.find((r) => r.id === annotatingId) ?? null : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="text-sm font-bold text-navy">📚 صور مرجعية إضافية</div>
        <span className="text-[11px] text-gray-500">
          (اختياري — لكل صورة دور: زاوية معاكسة، سياق، نمط، أو مصدر عنصر)
        </span>
      </div>

      {/* Add buttons by role */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {(Object.keys(ROLE_LABELS) as ReferenceRole[]).map((role) => {
          const meta = ROLE_LABELS[role];
          return (
            <label
              key={role}
              className={`cursor-pointer rounded-xl border-2 border-dashed px-3 py-2 text-[11px] font-bold text-center transition-colors hover:border-clay ${meta.color}`}
              title={meta.hint}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (f) await handleAddFile(f, role);
                }}
              />
              <span className="block text-base">{meta.emoji}</span>
              <span className="block">+ {meta.label}</span>
            </label>
          );
        })}
      </div>
      {uploading && <div className="text-xs text-clay-dark animate-pulse">⏳ يُرفَع المرجع...</div>}

      {/* Existing reference cards */}
      {references.length > 0 && (
        <div className="space-y-2">
          {references.map((r) => {
            const meta = ROLE_LABELS[r.role];
            const hasSel = !!r.selection;
            const hasTarget = r.targetXPct !== undefined && r.targetYPct !== undefined;
            return (
              <div key={r.id} className="rounded-xl bg-white border border-gray-200 p-2 flex gap-2">
                <div className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.url} alt="" className="w-full h-full object-cover" />
                  {hasSel && r.selection && (
                    <div
                      className="absolute border-2 border-rose-500 bg-rose-500/15"
                      style={{
                        left: `${r.selection.xPct}%`, top: `${r.selection.yPct}%`,
                        width: `${r.selection.wPct}%`, height: `${r.selection.hPct}%`,
                      }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${meta.color}`}>
                      {meta.emoji} {meta.label}
                    </span>
                    {hasSel && <span className="text-[10px] text-rose-700">✂️ منطقة محدّدة</span>}
                    {hasTarget && <span className="text-[10px] text-emerald-700">🎯 موقع مستهدَف</span>}
                  </div>
                  <input
                    type="text"
                    placeholder="اسم/تسمية مختصرة (اختياري)"
                    value={r.label ?? ''}
                    onChange={(e) => update(r.id, { label: e.target.value.slice(0, 60) })}
                    className="input text-[11px] py-1"
                  />
                  <input
                    type="text"
                    placeholder={r.role === 'element_source'
                      ? 'مثال: ضع هذه الكنبة قرب النافذة'
                      : r.role === 'opposite_angle'
                      ? 'مثال: أضف تلفزيوناً جدارياً ومكتبة في هذا الجدار'
                      : 'تعليمات للذكاء (اختياري)'}
                    value={r.instruction ?? ''}
                    onChange={(e) => update(r.id, { instruction: e.target.value.slice(0, 280) })}
                    className="input text-[11px] py-1"
                  />
                  <div className="flex gap-1.5 flex-wrap pt-0.5">
                    {(r.role === 'element_source' || r.role === 'style') && (
                      <button
                        type="button"
                        onClick={() => setAnnotatingId(r.id)}
                        className="text-[10px] px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                      >
                        ✂️ {hasSel ? 'تعديل المنطقة' : 'حدّد منطقة من الصورة'}
                      </button>
                    )}
                    {mainImageUrl && r.role === 'element_source' && (
                      <button
                        type="button"
                        onClick={() => setAnnotatingId(r.id)}
                        className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      >
                        🎯 {hasTarget ? 'تعديل الموقع' : 'اختر موقعاً في التصميم'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      className="text-[10px] px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 mr-auto"
                    >
                      🗑 حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {annotating && (
        <ReferenceAnnotator
          ref={annotating}
          mainImageUrl={mainImageUrl}
          onClose={() => setAnnotatingId(null)}
          onSave={(patch) => {
            update(annotating.id, patch);
            setAnnotatingId(null);
          }}
        />
      )}
    </div>
  );
}

// ── Modal annotator: pick a region on the ref + a target on the main ──

type DragState =
  | { kind: 'sel'; startX: number; startY: number }
  | null;

function ReferenceAnnotator({
  ref,
  mainImageUrl,
  onClose,
  onSave,
}: {
  ref: ReferenceImage;
  mainImageUrl?: string;
  onClose: () => void;
  onSave: (patch: Partial<ReferenceImage>) => void;
}) {
  const [selection, setSelection] = useState(ref.selection);
  const [target, setTarget] = useState<{ xPct: number; yPct: number } | undefined>(
    ref.targetXPct !== undefined && ref.targetYPct !== undefined
      ? { xPct: ref.targetXPct, yPct: ref.targetYPct }
      : undefined,
  );
  const [drag, setDrag] = useState<DragState>(null);
  const refStageRef = useRef<HTMLDivElement | null>(null);
  const targetStageRef = useRef<HTMLDivElement | null>(null);

  function pct(e: React.PointerEvent, el: HTMLDivElement | null) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      xPct: clamp(((e.clientX - r.left) / r.width) * 100, 0, 100),
      yPct: clamp(((e.clientY - r.top) / r.height) * 100, 0, 100),
    };
  }

  function handleRefDown(e: React.PointerEvent) {
    const p = pct(e, refStageRef.current);
    if (!p) return;
    setDrag({ kind: 'sel', startX: p.xPct, startY: p.yPct });
    setSelection({ xPct: p.xPct, yPct: p.yPct, wPct: 0, hPct: 0 });
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function handleRefMove(e: React.PointerEvent) {
    if (!drag) return;
    const p = pct(e, refStageRef.current);
    if (!p) return;
    if (drag.kind === 'sel') {
      const x = Math.min(drag.startX, p.xPct);
      const y = Math.min(drag.startY, p.yPct);
      const w = Math.abs(p.xPct - drag.startX);
      const h = Math.abs(p.yPct - drag.startY);
      setSelection({ xPct: x, yPct: y, wPct: w, hPct: h });
    }
  }
  function handleRefUp() { setDrag(null); }

  function handleTargetClick(e: React.PointerEvent) {
    const p = pct(e, targetStageRef.current);
    if (!p) return;
    setTarget(p);
  }

  function clearSelection() { setSelection(undefined); }
  function clearTarget() { setTarget(undefined); }

  function save() {
    onSave({
      selection: (selection && selection.wPct > 1 && selection.hPct > 1) ? selection : undefined,
      targetXPct: target?.xPct,
      targetYPct: target?.yPct,
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-4 max-h-[95vh] overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-navy text-lg">✂️ حدّد العنصر وموقعه</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-clay-dark text-xl leading-none">×</button>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed mb-3">
          <strong className="text-navy">١.</strong> اسحب على الصورة المرجعية اليمين لتحديد منطقة العنصر بمستطيل.
          {mainImageUrl && (
            <>{' '}<strong className="text-navy">٢.</strong> انقر على صورة التصميم اليسار لتحديد المكان الذي تريد إضافته فيه.</>
          )}
        </p>

        <div className="grid lg:grid-cols-2 gap-3">
          {/* Reference (right in RTL — first in DOM order) */}
          <div>
            <div className="text-xs font-bold text-rose-700 mb-1">📷 الصورة المرجعية — حدّد العنصر</div>
            <div
              ref={refStageRef}
              onPointerDown={handleRefDown}
              onPointerMove={handleRefMove}
              onPointerUp={handleRefUp}
              onPointerCancel={handleRefUp}
              className="relative rounded-xl overflow-hidden border-2 border-rose-300 bg-cream cursor-crosshair select-none"
              style={{ touchAction: 'none' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ref.url} alt="" className="w-full h-auto block pointer-events-none" draggable={false} />
              {selection && selection.wPct > 0 && selection.hPct > 0 && (
                <div
                  className="absolute border-2 border-rose-500 bg-rose-500/20 pointer-events-none"
                  style={{
                    left: `${selection.xPct}%`, top: `${selection.yPct}%`,
                    width: `${selection.wPct}%`, height: `${selection.hPct}%`,
                  }}
                >
                  <span className="absolute -top-5 left-0 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {selection.wPct.toFixed(0)}% × {selection.hPct.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-1.5 mt-1.5">
              <button onClick={clearSelection} className="text-[11px] text-gray-500 hover:text-clay-dark">مسح التحديد</button>
            </div>
          </div>

          {/* Target on main image */}
          {mainImageUrl ? (
            <div>
              <div className="text-xs font-bold text-emerald-700 mb-1">🎯 صورة التصميم — حدّد المكان</div>
              <div
                ref={targetStageRef}
                onPointerUp={handleTargetClick}
                className="relative rounded-xl overflow-hidden border-2 border-emerald-300 bg-cream cursor-crosshair select-none"
                style={{ touchAction: 'none' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mainImageUrl} alt="" className="w-full h-auto block pointer-events-none" draggable={false} />
                {target && (
                  <div
                    className="absolute pointer-events-none"
                    style={{ left: `${target.xPct}%`, top: `${target.yPct}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="w-8 h-8 rounded-full border-4 border-emerald-500 bg-emerald-500/30 animate-pulse" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                      هنا
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-1.5 mt-1.5">
                <button onClick={clearTarget} className="text-[11px] text-gray-500 hover:text-clay-dark">مسح الموقع</button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
              ارفع صورة التصميم الرئيسية أوّلاً لتحديد موقع.
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost text-sm">إلغاء</button>
          <button onClick={save} className="btn-primary text-sm">حفظ</button>
        </div>
      </div>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
