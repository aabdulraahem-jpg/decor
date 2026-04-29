'use client';

import { useEffect, useState } from 'react';
import {
  ElementCategory,
  ElementKind,
  getAllElementKinds,
  getElementType,
} from '@/lib/elements';

/** Ephemeral drawing the user just made — awaits classification into an element. */
export interface PendingDraw {
  shape: 'line' | 'rect';
  /** First endpoint (line) OR top-left (rect) — both in canvas % coords. */
  xPct: number;
  yPct: number;
  /** Second endpoint (line). */
  x2Pct?: number;
  y2Pct?: number;
  /** Rect dims. */
  wPct?: number;
  hPct?: number;
}

export type Unit = 'm' | 'cm' | 'in';

export interface ClassifyResult {
  kind: ElementKind;
  variant?: string;
  lengthMeters?: number;
  widthMeters?: number;
  heightMeters?: number;
  areaSqm?: number;
  notes?: string;
  rotationDeg?: number;
  /** Echoed unit so the editor can persist it on the marker. */
  unit: Unit;
}

interface Props {
  pending: PendingDraw;
  defaultUnit: Unit;
  onConfirm: (result: ClassifyResult) => void;
  onCancel: () => void;
}

/** Sensible default real-world dimensions (in meters) per element kind so the
 *  popover pre-fills numbers as soon as the user picks a category. */
const DEFAULT_DIMS: Partial<Record<ElementKind, { L?: number; W?: number; H?: number; A?: number }>> = {
  HANDRAIL:        { L: 4,    H: 0.9 },
  INTERIOR_WALL:   { L: 4,    H: 3 },
  WINDOW:          { L: 1.2,  H: 1.4 },
  DOOR_GAP:        { L: 0.9,  H: 2.1 },
  DOOR_ARC:        { L: 0.9,  H: 2.1 },
  STAIRS:          { L: 1.2,  W: 4 },
  HANDWASH:        {          W: 0.6 },
  CORRIDOR:        { L: 6,    W: 1.5 },
  COLUMN_ROUND:    { L: 0.4,  H: 3 },
  COLUMN_RECT:     { L: 0.5,  W: 0.5,  H: 3 },
  PLATFORM:        { L: 4,    W: 3,    H: 0.6 },
  ELEVATOR:        { L: 1.4,  W: 1.4,  H: 2.4 },
  FENCE:           { L: 8,    H: 1.2 },
  PERGOLA:         { L: 4,    W: 3,    H: 2.5 },
  CARPORT:         { L: 6,    W: 6,    H: 2.5 },
  WALL_TOPPER:     { L: 8,    H: 0.8 },
  EXTERIOR_FACADE: { H: 3.5 },
  ANNEX:           { L: 6,    W: 4,    H: 3 },
  BOUNDARY_WALL:   { L: 10,   H: 2.5 },
  GATE:            { L: 4,    H: 2.5 },
  GRASS:           { A: 60 },
  WALKWAY:         { L: 10,   W: 1.2 },
  POOL:            { L: 6,    W: 3,    H: 1.4 },
  COURTYARD:       { L: 8,    W: 6 },
  BAIT_SHAR:       { L: 5,    W: 4,    H: 3 },
};

function unitLabel(u: Unit): string { return u === 'cm' ? 'سم' : u === 'in' ? 'بوصة' : 'م'; }
function fromUnit(v: number, u: Unit): number {
  if (u === 'cm') return v / 100;
  if (u === 'in') return v / 39.3701;
  return v;
}
function toUnit(v: number, u: Unit): number {
  if (u === 'cm') return Math.round(v * 100);
  if (u === 'in') return Math.round(v * 39.3701 * 10) / 10;
  return Math.round(v * 100) / 100;
}

/** Pick a sensible initial element kind based on the shape the user drew. */
function defaultKindForShape(shape: 'line' | 'rect'): ElementKind {
  return shape === 'line' ? 'INTERIOR_WALL' : 'COURTYARD';
}

export default function DrawClassifyPopover({ pending, defaultUnit, onConfirm, onCancel }: Props) {
  const isLine = pending.shape === 'line';

  const [kind, setKind] = useState<ElementKind>(defaultKindForShape(pending.shape));
  const [variant, setVariant] = useState<string>('');
  const [lengthM, setLengthM] = useState<number | undefined>();
  const [widthM, setWidthM] = useState<number | undefined>();
  const [heightM, setHeightM] = useState<number | undefined>();
  const [areaM2, setAreaM2] = useState<number | undefined>();
  const [notes, setNotes] = useState('');
  const [unit, setUnit] = useState<Unit>(defaultUnit);
  const [rotationDeg, setRotationDeg] = useState<number>(() => {
    if (isLine && pending.x2Pct !== undefined && pending.y2Pct !== undefined) {
      const dx = pending.x2Pct - pending.xPct;
      const dy = pending.y2Pct - pending.yPct;
      return Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
    }
    return 0;
  });

  // Whenever the user picks a new kind, hydrate dim defaults so they don't
  // need to type from scratch — they can still edit any field.
  useEffect(() => {
    const d = DEFAULT_DIMS[kind] ?? {};
    setLengthM(d.L);
    setWidthM(d.W);
    setHeightM(d.H);
    setAreaM2(d.A);
    const t = getElementType(kind);
    setVariant(t?.variants[0] ?? '');
  }, [kind]);

  const t = getElementType(kind);
  if (!t) return null;

  const allKinds = getAllElementKinds();
  const interior = allKinds.filter((k) => getElementType(k)?.category === ('INTERIOR' as ElementCategory));
  const exterior = allKinds.filter((k) => getElementType(k)?.category === ('EXTERIOR' as ElementCategory));

  function commit() {
    onConfirm({
      kind,
      variant: variant || undefined,
      lengthMeters: lengthM,
      widthMeters: widthM,
      heightMeters: heightM,
      areaSqm: areaM2,
      notes: notes.trim() || undefined,
      rotationDeg,
      unit,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col">
        {/* Sticky header */}
        <div className="bg-white border-b border-gray-100 p-3 sm:p-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{isLine ? '📏' : '▭'}</span>
            <div className="min-w-0">
              <div className="font-black text-navy text-sm sm:text-base">
                {isLine ? 'خط مرسوم — اختر العنصر' : 'مستطيل مرسوم — اختر العنصر'}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">
                ⚡ المقاسات الافتراضية تظهر تلقائياً — عدّلها بسهولة قبل التثبيت.
              </div>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-clay-dark text-3xl leading-none px-2 shrink-0" aria-label="إلغاء">×</button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-auto p-3 sm:p-4 space-y-4">
          {/* Element category grids */}
          {interior.length > 0 && (
            <KindGroup label="🏠 إنشائيات داخلية" kinds={interior} value={kind} onChange={setKind} />
          )}
          {exterior.length > 0 && (
            <KindGroup label="🌳 ديكور خارجي" kinds={exterior} value={kind} onChange={setKind} />
          )}

          {/* Variant selector (always shown if kind has variants) */}
          {t.variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">النوع/الخامة</label>
              <select
                className="input text-sm"
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
              >
                {t.variants.map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
          )}

          {/* Unit selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-600">📐 وحدة المقاس:</span>
            <div className="flex bg-cream rounded-full p-0.5 gap-0.5 border border-gray-200">
              {(['m', 'cm', 'in'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    unit === u ? 'bg-clay text-white' : 'text-navy hover:bg-white'
                  }`}
                >
                  {u === 'm' ? 'متر' : u === 'cm' ? 'سنتيمتر' : 'بوصة'}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension inputs */}
          <div className="grid grid-cols-2 gap-2">
            {t.askLength && (
              <DimField
                label={`${(t.lengthLabel ?? '📏 الطول').replace(/\s*\(?[مﻡ]\)?$/, '')}`}
                unit={unit}
                value={lengthM}
                onChange={setLengthM}
              />
            )}
            {t.askWidth && (
              <DimField label="↔️ العرض" unit={unit} value={widthM} onChange={setWidthM} />
            )}
            {t.askHeight && (
              <DimField
                label={`${(t.heightLabel ?? '↕️ الارتفاع').replace(/\s*\(?[مﻡ]\)?$/, '')}`}
                unit={unit}
                value={heightM}
                onChange={setHeightM}
              />
            )}
            {t.askArea && (
              <label className="block">
                <span className="block text-[11px] font-bold text-gray-600 mb-1">📐 المساحة (م²)</span>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={areaM2 ?? ''}
                  onChange={(e) => setAreaM2(e.target.value === '' ? undefined : Number(e.target.value))}
                  className="input ltr text-sm"
                />
              </label>
            )}
          </div>

          {/* Rotation control (always visible — line uses computed angle) */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              🔄 زاوية الدوران: <strong className="text-navy">{rotationDeg}°</strong>
              {isLine && <span className="text-[10px] text-gray-500 mr-2 font-normal">(محسوبة من الخط، يمكن تعديلها)</span>}
            </label>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotationDeg}
              onChange={(e) => setRotationDeg(Number(e.target.value))}
              className="w-full accent-clay h-2"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">✏️ وصف مختصر (اختياري)</label>
            <input
              type="text"
              className="input text-sm"
              placeholder={t.notesPlaceholder || 'مثال: لون داكن، إضاءة LED سفلية'}
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 200))}
              maxLength={200}
            />
          </div>

          <div className="rounded-lg bg-cream/50 border border-clay/20 p-2 text-[10px] text-gray-600 leading-relaxed">
            💡 سيُضاف العنصر بنفس موضع الرسم وحجمه المرئي. تستطيع تعديل المقاسات والزاوية لاحقاً
            بسحب أركان العنصر أو من الإنسبكتر.
          </div>
        </div>

        {/* Sticky bottom action bar */}
        <div className="bg-white border-t border-gray-100 p-3 sm:p-4 flex gap-2 sm:rounded-b-2xl">
          <button onClick={onCancel} className="btn-ghost flex-1 py-2.5">إلغاء</button>
          <button onClick={commit} className="btn-primary flex-1 py-2.5">
            ✓ تثبيت {t.icon} {t.label}
          </button>
        </div>
      </div>
    </div>
  );
}

function KindGroup({
  label, kinds, value, onChange,
}: {
  label: string;
  kinds: ElementKind[];
  value: ElementKind;
  onChange: (k: ElementKind) => void;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {kinds.map((k) => {
          const tk = getElementType(k);
          if (!tk) return null;
          const sel = value === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChange(k)}
              className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border-2 transition-colors text-right flex items-center gap-1.5 ${
                sel
                  ? 'bg-clay text-white border-clay shadow-sm'
                  : 'bg-white text-navy border-gray-200 hover:border-clay/40'
              }`}
            >
              <span className="text-base">{tk.icon}</span>
              <span className="truncate">{tk.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DimField({
  label, unit, value, onChange,
}: {
  label: string;
  unit: Unit;
  value?: number;
  onChange: (v?: number) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-gray-600 mb-1">{label} ({unitLabel(unit)})</span>
      <input
        type="number"
        min={0}
        step={unit === 'in' ? 0.1 : 0.5}
        value={value !== undefined ? toUnit(value, unit) : ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : fromUnit(Number(e.target.value), unit))}
        className="input ltr text-sm"
        placeholder="0"
      />
    </label>
  );
}
