'use client';

import { useState } from 'react';
import { ELEMENT_TYPES, ElementCategory, ElementKind, SpaceElement, getAllElementKinds, getElementType } from '@/lib/elements';

interface Props {
  value: SpaceElement[];
  onChange: (next: SpaceElement[]) => void;
}

export default function ElementsPicker({ value, onChange }: Props) {
  const [adding, setAdding] = useState<ElementKind | null>(null);
  const [draft, setDraft] = useState<SpaceElement | null>(null);

  function startAdd(kind: ElementKind) {
    setAdding(kind);
    const t = getElementType(kind)!;
    setDraft({
      kind,
      variant: t.variants[0],
      lengthMeters: undefined,
      widthMeters: undefined,
      heightMeters: undefined,
      areaSqm: undefined,
      glassPercent: undefined,
      notes: '',
    });
  }
  function cancelAdd() { setAdding(null); setDraft(null); }
  function commitAdd() {
    if (!draft) return;
    onChange([...value, draft]);
    setAdding(null); setDraft(null);
  }
  function removeAt(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  const allKinds = getAllElementKinds();
  const interiorKinds = allKinds.filter((k) => getElementType(k)?.category === 'INTERIOR');
  const exteriorKinds = allKinds.filter((k) => getElementType(k)?.category === 'EXTERIOR');

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-navy flex items-center gap-2 flex-wrap">
        <span>🏗️ عناصر إضافية</span>
        <span className="text-[11px] text-gray-500 font-normal">
          (دربزين، حواجز، أسوار، مظلّات، مماشي، مسبح، عشب، ملاحق، بيت شعر…)
        </span>
      </div>

      {/* Existing elements list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((e, i) => {
            const t = getElementType(e.kind);
            if (!t) return null;
            const dimBits: string[] = [];
            if (e.lengthMeters) dimBits.push(`📏 طول ${e.lengthMeters} م`);
            if (e.widthMeters) dimBits.push(`↔️ عرض ${e.widthMeters} م`);
            if (e.heightMeters) dimBits.push(`↕️ ${t.heightLabel ? t.heightLabel.replace(/[^؀-ۿ\s]+/g, '').trim() : 'ارتفاع'} ${e.heightMeters} م`);
            if (e.areaSqm) dimBits.push(`📐 ${e.areaSqm} م²`);
            if (e.glassPercent) dimBits.push(`🪟 زجاج ${e.glassPercent}%`);
            return (
              <div key={i} className="rounded-xl bg-cream/50 border border-gray-200 px-3 py-2 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-navy">
                    <span className="ml-1">{t.icon}</span>
                    {t.label}
                    <span className="text-clay-dark mx-1.5">·</span>
                    <span className="font-normal">{e.variant}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                    {dimBits.map((b, k) => <span key={k}>{b}</span>)}
                    {e.notes ? <span>💬 {e.notes}</span> : null}
                  </div>
                </div>
                <button onClick={() => removeAt(i)} className="text-red-500 hover:bg-red-50 rounded px-1.5 text-sm" aria-label="حذف">×</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Category-grouped Add buttons */}
      {!adding && (
        <div className="space-y-2.5">
          {interiorKinds.length > 0 && (
            <CategoryGroup label="🏠 إنشائيات داخلية" kinds={interiorKinds} onPick={startAdd} />
          )}
          {exteriorKinds.length > 0 && (
            <CategoryGroup label="🌳 ديكور خارجي" kinds={exteriorKinds} onPick={startAdd} />
          )}
        </div>
      )}

      {/* Add modal-inline */}
      {adding && draft && (
        <div className="rounded-2xl border-2 border-clay/30 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-navy">
              {getElementType(adding)!.icon} إضافة {getElementType(adding)!.label}
            </div>
            <button onClick={cancelAdd} className="text-xs text-gray-500 hover:text-clay-dark">إلغاء</button>
          </div>

          <div className="bg-clay/5 border-r-2 border-clay rounded-lg p-2.5 text-[11px] text-gray-600 leading-relaxed">
            <strong className="text-navy">في الاسكيتش:</strong> {getElementType(adding)!.drawHint}
          </div>

          {/* Variant chips */}
          <div>
            <div className="text-[11px] font-bold text-gray-600 mb-1.5">اختر النوع</div>
            <div className="flex flex-wrap gap-1.5">
              {getElementType(adding)!.variants.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setDraft({ ...draft, variant: v })}
                  className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                    draft.variant === v ? 'bg-clay text-white border-clay' : 'bg-white text-navy border-gray-200 hover:border-clay/40'
                  }`}
                >
                  {v}
                </button>
              ))}
              <input
                type="text"
                placeholder="✏️ مخصّص..."
                value={getElementType(adding)!.variants.includes(draft.variant) ? '' : draft.variant}
                onChange={(e) => setDraft({ ...draft, variant: e.target.value.slice(0, 80) })}
                className="px-2.5 py-1 rounded-full text-[11px] border border-gray-200 focus:border-clay focus:outline-none w-32"
              />
            </div>
          </div>

          {/* Dimensions */}
          {(getElementType(adding)!.askLength ||
            getElementType(adding)!.askWidth ||
            getElementType(adding)!.askHeight ||
            getElementType(adding)!.askArea ||
            getElementType(adding)!.askGlassPercent) && (
            <div className="grid grid-cols-2 gap-2">
              {getElementType(adding)!.askLength && (
                <DimField
                  label={getElementType(adding)!.lengthLabel ?? '📏 الطول (متر)'}
                  value={draft.lengthMeters}
                  onChange={(n) => setDraft({ ...draft, lengthMeters: n })}
                  placeholder="مثال: 6"
                />
              )}
              {getElementType(adding)!.askWidth && (
                <DimField
                  label="↔️ العرض (متر)"
                  value={draft.widthMeters}
                  onChange={(n) => setDraft({ ...draft, widthMeters: n })}
                  placeholder="مثال: 4"
                />
              )}
              {getElementType(adding)!.askHeight && (
                <DimField
                  label={getElementType(adding)!.heightLabel ?? '↕️ الارتفاع (متر)'}
                  value={draft.heightMeters}
                  onChange={(n) => setDraft({ ...draft, heightMeters: n })}
                  placeholder="مثال: 2.5"
                  step={0.1}
                />
              )}
              {getElementType(adding)!.askArea && (
                <DimField
                  label="📐 المساحة (م²)"
                  value={draft.areaSqm}
                  onChange={(n) => setDraft({ ...draft, areaSqm: n })}
                  placeholder="مثال: 60"
                />
              )}
              {getElementType(adding)!.askGlassPercent && (
                <DimField
                  label="🪟 نسبة الزجاج % (0-100)"
                  value={draft.glassPercent}
                  onChange={(n) => setDraft({ ...draft, glassPercent: clampPct(n) })}
                  placeholder="مثال: 60 (0=خرسانة، 100=زجاج كامل)"
                  step={5}
                  max={100}
                />
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <span className="block text-[11px] font-bold text-gray-600 mb-1">وصفك الإضافي (اختياري)</span>
            <input
              type="text"
              value={draft.notes ?? ''}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value.slice(0, 200) })}
              placeholder={getElementType(adding)!.notesPlaceholder}
              className="input text-sm"
            />
          </div>

          <button
            onClick={commitAdd}
            disabled={!draft.variant.trim()}
            className="btn-primary text-sm w-full disabled:opacity-50"
          >
            إضافة العنصر
          </button>
        </div>
      )}
    </div>
  );
}

function clampPct(n: number | undefined): number | undefined {
  if (n === undefined) return undefined;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function DimField({
  label, value, onChange, placeholder, step, max,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  step?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-gray-600 mb-1">{label}</span>
      <input
        type="number"
        min={0}
        step={step ?? 0.5}
        max={max}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        className="input ltr text-sm"
        placeholder={placeholder}
      />
    </label>
  );
}

function CategoryGroup({
  label,
  kinds,
  onPick,
}: {
  label: string;
  kinds: ElementKind[];
  onPick: (k: ElementKind) => void;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {kinds.map((k) => {
          const t = getElementType(k);
          if (!t) return null;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onPick(k)}
              className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-navy text-[12px] hover:border-clay/40 hover:text-clay-dark transition-colors"
              title={t.hint}
            >
              + {t.icon} {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
