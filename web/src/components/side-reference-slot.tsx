'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, uploadReferenceImage } from '@/lib/api';
import { ReferenceImage, ReferenceRole, ROLE_LABELS, ReferenceRuler } from '@/lib/references';

const newId = () => Math.random().toString(36).slice(2, 9);
type Unit = 'm' | 'cm' | 'in';
function unitLabel(u: Unit) { return u === 'cm' ? 'سم' : u === 'in' ? 'بوصة' : 'م'; }
function fromUnit(v: number, u: Unit) {
  if (u === 'cm') return v / 100;
  if (u === 'in') return v / 39.3701;
  return v;
}
function toUnit(v: number, u: Unit) {
  if (u === 'cm') return Math.round(v * 100);
  if (u === 'in') return Math.round(v * 39.3701 * 10) / 10;
  return Math.round(v * 100) / 100;
}

interface Props {
  /** Restricted to side-view roles that need a directional arrow. */
  role: 'right_side' | 'left_side' | 'opposite_angle';
  /** The current reference of this role (or undefined if none). */
  image: ReferenceImage | undefined;
  onChange: (image: ReferenceImage | undefined) => void;
}

export default function SideReferenceSlot({ role, image, onChange }: Props) {
  const router = useRouter();
  const meta = ROLE_LABELS[role];
  const fileRef = useRef<HTMLInputElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState<{ kind: 'move' | 'rotate' } | { kind: 'ruler-end'; rulerId: string; which: 'A' | 'B' } | null>(null);
  /** Ruler tool: when 'pending', the next two clicks define a new ruler. */
  const [rulerMode, setRulerMode] = useState(false);
  const [rulerSeed, setRulerSeed] = useState<{ xPct: number; yPct: number } | null>(null);
  const [defaultUnit, setDefaultUnit] = useState<Unit>('m');

  async function handlePickFile(file: File) {
    setUploading(true);
    try {
      const { url } = await uploadReferenceImage(file);
      // Default arrow at center pointing in the role's natural direction.
      const defaultRot = role === 'right_side' ? 0 : role === 'left_side' ? 180 : -90;
      onChange({
        id: newId(),
        url,
        role,
        cameraXPct: 50,
        cameraYPct: 50,
        cameraRotationDeg: defaultRot,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push('/login?next=/studio');
      }
    } finally {
      setUploading(false);
    }
  }

  function pctOfEvent(e: React.PointerEvent): { xPct: number; yPct: number } | null {
    if (!stageRef.current) return null;
    const r = stageRef.current.getBoundingClientRect();
    return {
      xPct: clamp(((e.clientX - r.left) / r.width) * 100, 0, 100),
      yPct: clamp(((e.clientY - r.top) / r.height) * 100, 0, 100),
    };
  }

  function handleStageClick(e: React.MouseEvent) {
    if (!image) return;
    if (e.target !== e.currentTarget) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const yPct = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);

    // Ruler mode: collect two endpoints, then create a ruler.
    if (rulerMode) {
      if (!rulerSeed) {
        setRulerSeed({ xPct, yPct });
        return;
      }
      const newRuler: ReferenceRuler = {
        id: newId(),
        x1Pct: rulerSeed.xPct, y1Pct: rulerSeed.yPct,
        x2Pct: xPct, y2Pct: yPct,
        unit: defaultUnit,
      };
      onChange({ ...image, rulers: [...(image.rulers ?? []), newRuler] });
      setRulerSeed(null);
      setRulerMode(false);
      return;
    }

    // Normal click moves the camera arrow
    onChange({ ...image, cameraXPct: xPct, cameraYPct: yPct });
  }

  function handleArrowDown(e: React.PointerEvent, kind: 'move' | 'rotate') {
    e.stopPropagation();
    setDrag({ kind });
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function handleRulerEndDown(e: React.PointerEvent, rulerId: string, which: 'A' | 'B') {
    e.stopPropagation();
    setDrag({ kind: 'ruler-end', rulerId, which });
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!drag || !image) return;
    const p = pctOfEvent(e);
    if (!p) return;
    if (drag.kind === 'move') {
      onChange({ ...image, cameraXPct: p.xPct, cameraYPct: p.yPct });
    } else if (drag.kind === 'rotate') {
      const rect = stageRef.current!.getBoundingClientRect();
      const cx = ((image.cameraXPct ?? 50) / 100) * rect.width;
      const cy = ((image.cameraYPct ?? 50) / 100) * rect.height;
      const dx = (e.clientX - rect.left) - cx;
      const dy = (e.clientY - rect.top) - cy;
      const deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
      onChange({ ...image, cameraRotationDeg: deg });
    } else if (drag.kind === 'ruler-end') {
      const rulers = (image.rulers ?? []).map((r) => {
        if (r.id !== drag.rulerId) return r;
        return drag.which === 'A'
          ? { ...r, x1Pct: p.xPct, y1Pct: p.yPct }
          : { ...r, x2Pct: p.xPct, y2Pct: p.yPct };
      });
      onChange({ ...image, rulers });
    }
  }
  function handlePointerUp() { setDrag(null); }
  function updateRuler(id: string, patch: Partial<ReferenceRuler>) {
    if (!image) return;
    onChange({ ...image, rulers: (image.rulers ?? []).map((r) => r.id === id ? { ...r, ...patch } : r) });
  }
  function removeRuler(id: string) {
    if (!image) return;
    onChange({ ...image, rulers: (image.rulers ?? []).filter((r) => r.id !== id) });
  }

  return (
    <div className={`rounded-xl border-2 ${image ? 'border-solid' : 'border-dashed'} ${meta.color.replace(/text-\S+/, '')} p-2 flex flex-col`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[12px] font-bold flex items-center gap-1">
          <span className="text-base">{meta.emoji}</span>
          <span>{meta.label}</span>
        </div>
        {image && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-[10px] text-clay-dark hover:underline"
            >تغيير</button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-[10px] text-red-500 hover:underline"
            >حذف</button>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) void handlePickFile(f);
        }}
      />
      {!image ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-1 min-h-[140px] flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-clay-dark text-xs font-bold disabled:opacity-50"
        >
          <div className="text-2xl">📤</div>
          <div>{uploading ? 'يُرفَع...' : 'ارفع صورة'}</div>
          <div className="text-[10px] font-normal text-gray-400 px-2 text-center leading-relaxed">
            {meta.hint}
          </div>
        </button>
      ) : (
        <>
          <div
            ref={stageRef}
            onClick={handleStageClick}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative rounded-lg overflow-hidden bg-cream select-none ${rulerMode ? 'cursor-crosshair ring-2 ring-amber-400' : 'cursor-crosshair'}`}
            style={{ touchAction: 'none', minHeight: 140 }}
            title={rulerMode ? 'انقر نقطتَين لرسم مسطرة قياس' : 'اسحب السهم لتحريكه أو دوّره — انقر مكاناً آخر لنقل السهم'}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt=""
              className="w-full h-auto block pointer-events-none"
              draggable={false}
            />
            {/* Rulers (drawn under arrow) */}
            {(image.rulers ?? []).map((r) => (
              <RulerOverlay
                key={r.id}
                ruler={r}
                onEndDown={(e, w) => handleRulerEndDown(e, r.id, w)}
              />
            ))}
            {/* Ruler seed dot (between two clicks) */}
            {rulerMode && rulerSeed && (
              <div
                className="absolute w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow pointer-events-none animate-pulse"
                style={{ left: `${rulerSeed.xPct}%`, top: `${rulerSeed.yPct}%`, transform: 'translate(-50%, -50%)' }}
              />
            )}
            {/* Camera-direction arrow */}
            <CameraArrow
              xPct={image.cameraXPct ?? 50}
              yPct={image.cameraYPct ?? 50}
              rotationDeg={image.cameraRotationDeg ?? 0}
              onMoveDown={(e) => handleArrowDown(e, 'move')}
              onRotateDown={(e) => handleArrowDown(e, 'rotate')}
            />
          </div>
          {/* Rotation slider for fine-tune */}
          <div className="mt-1.5">
            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <span>اتجاه الكاميرا</span>
              <span className="font-bold">{image.cameraRotationDeg ?? 0}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={image.cameraRotationDeg ?? 0}
              onChange={(e) => onChange({ ...image, cameraRotationDeg: Number(e.target.value) })}
              className="w-full accent-clay h-1"
            />
          </div>

          {/* Ruler controls */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => { setRulerMode((v) => !v); setRulerSeed(null); }}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  rulerMode
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
                }`}
              >
                {rulerMode ? (rulerSeed ? '✏️ النقطة الثانية...' : '✏️ النقطة الأولى...') : '📐 أضف مسطرة'}
              </button>
              <div className="flex bg-cream rounded-full p-0.5 gap-0.5">
                {(['m', 'cm', 'in'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setDefaultUnit(u)}
                    className={`px-1.5 py-0.5 rounded-full text-[9px] ${defaultUnit === u ? 'bg-clay text-white' : 'text-navy'}`}
                  >{unitLabel(u)}</button>
                ))}
              </div>
            </div>
            {(image.rulers ?? []).length > 0 && (
              <div className="mt-1 space-y-1">
                {(image.rulers ?? []).map((r, i) => {
                  const u = r.unit ?? 'm';
                  return (
                    <div key={r.id} className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                      <span className="text-[9px] text-amber-800 font-bold">📐 {i + 1}</span>
                      <input
                        type="text"
                        placeholder="تسمية (اختياري)"
                        value={r.label ?? ''}
                        onChange={(e) => updateRuler(r.id, { label: e.target.value.slice(0, 40) })}
                        className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[10px] text-navy"
                      />
                      <input
                        type="number"
                        min={0}
                        step={u === 'in' ? 0.1 : 0.5}
                        placeholder="0"
                        value={r.lengthMeters !== undefined ? toUnit(r.lengthMeters, u) : ''}
                        onChange={(e) => updateRuler(r.id, {
                          lengthMeters: e.target.value === '' ? undefined : fromUnit(Number(e.target.value), u),
                        })}
                        className="w-12 bg-white border border-amber-200 rounded text-[10px] text-navy text-center px-1 py-0.5 ltr"
                      />
                      <select
                        value={u}
                        onChange={(e) => updateRuler(r.id, { unit: e.target.value as Unit })}
                        className="text-[9px] bg-white border border-amber-200 rounded px-0.5"
                      >
                        <option value="m">م</option>
                        <option value="cm">سم</option>
                        <option value="in">بوصة</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeRuler(r.id)}
                        className="text-[10px] text-red-500 hover:text-red-700"
                        title="حذف المسطرة"
                      >×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** A measurement ruler drawn between two endpoints with a label pill. */
function RulerOverlay({
  ruler, onEndDown,
}: {
  ruler: ReferenceRuler;
  onEndDown: (e: React.PointerEvent, which: 'A' | 'B') => void;
}) {
  const u: Unit = ruler.unit ?? 'm';
  const v = ruler.lengthMeters !== undefined ? toUnit(ruler.lengthMeters, u) : null;
  const labelText = v !== null ? `${ruler.label ? ruler.label + ': ' : ''}${v} ${unitLabel(u)}` : (ruler.label ?? '—');
  const cx = (ruler.x1Pct + ruler.x2Pct) / 2;
  const cy = (ruler.y1Pct + ruler.y2Pct) / 2;
  return (
    <>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <line
          x1={ruler.x1Pct} y1={ruler.y1Pct}
          x2={ruler.x2Pct} y2={ruler.y2Pct}
          stroke="#f59e0b"
          strokeWidth="0.4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeDasharray: '0.6 0.6' }}
        />
      </svg>
      {/* Endpoint A */}
      <div
        onPointerDown={(e) => onEndDown(e, 'A')}
        className="absolute w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow cursor-grab"
        style={{ left: `${ruler.x1Pct}%`, top: `${ruler.y1Pct}%`, transform: 'translate(-50%, -50%)', touchAction: 'none' }}
        title="نهاية أ"
      />
      {/* Endpoint B */}
      <div
        onPointerDown={(e) => onEndDown(e, 'B')}
        className="absolute w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow cursor-grab"
        style={{ left: `${ruler.x2Pct}%`, top: `${ruler.y2Pct}%`, transform: 'translate(-50%, -50%)', touchAction: 'none' }}
        title="نهاية ب"
      />
      {/* Center label */}
      <div
        className="absolute bg-white/95 border border-amber-400 rounded px-1 py-0.5 text-[9px] font-bold text-amber-800 shadow pointer-events-none whitespace-nowrap"
        style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%, -50%)' }}
      >
        {labelText}
      </div>
    </>
  );
}

/** A camera + arrow overlay placed on a reference image. */
function CameraArrow({
  xPct, yPct, rotationDeg, onMoveDown, onRotateDown,
}: {
  xPct: number; yPct: number; rotationDeg: number;
  onMoveDown: (e: React.PointerEvent) => void;
  onRotateDown: (e: React.PointerEvent) => void;
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${xPct}%`, top: `${yPct}%`,
        transform: `translate(-50%, -50%) rotate(${rotationDeg}deg)`,
        pointerEvents: 'none',
      }}
    >
      {/* Arrow body — a stylized lens/cone with directional shaft */}
      <div className="relative" style={{ width: 80, height: 24 }}>
        {/* Camera dot (anchor / drag-to-move) */}
        <div
          onPointerDown={onMoveDown}
          className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-600 border-2 border-white shadow-lg cursor-move flex items-center justify-center text-[10px]"
          style={{ pointerEvents: 'auto', touchAction: 'none' }}
          title="اسحب لتحريك السهم"
        >
          📷
        </div>
        {/* Shaft */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-emerald-600 rounded-full"
          style={{ left: 14, right: 14, pointerEvents: 'none' }}
        />
        {/* Arrowhead */}
        <div
          className="absolute top-1/2 right-0 -translate-y-1/2"
          style={{
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: '14px solid #059669',
            pointerEvents: 'none',
          }}
        />
        {/* Rotation handle (drag to spin) */}
        <div
          onPointerDown={onRotateDown}
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-emerald-600 shadow cursor-grab"
          style={{ right: -8, pointerEvents: 'auto', touchAction: 'none' }}
          title="اسحب لتدوير اتجاه الكاميرا"
        />
      </div>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
