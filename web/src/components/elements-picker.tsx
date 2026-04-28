'use client';

import { useState } from 'react';
import { ELEMENT_KINDS, ELEMENT_TYPES, ElementKind, SpaceElement } from '@/lib/elements';

interface Props {
  value: SpaceElement[];
  onChange: (next: SpaceElement[]) => void;
}

export default function ElementsPicker({ value, onChange }: Props) {
  const [adding, setAdding] = useState<ElementKind | null>(null);
  const [draft, setDraft] = useState<SpaceElement | null>(null);

  function startAdd(kind: ElementKind) {
    setAdding(kind);
    const t = ELEMENT_TYPES[kind];
    setDraft({
      kind,
      variant: t.variants[0],
      lengthMeters: undefined,
      heightMeters: undefined,
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

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-navy flex items-center gap-2">
        <span>🏗️ عناصر إنشائية وخارجية (اختياري)</span>
        <span className="text-[11px] text-gray-500 font-normal">دربزين، حواجز، مظلّات…</span>
      </div>

      {/* Existing elements list */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((e, i) => {
            const t = ELEMENT_TYPES[e.kind];
            return (
              <div key={i} className="rounded-xl bg-cream/50 border border-gray-200 px-3 py-2 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-navy">
                    <span className="ml-1">{t.icon}</span>
                    {t.label}
                    <span className="text-clay-dark mx-1.5">·</span>
                    <span className="font-normal">{e.variant}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 flex flex-wrap gap-x-2">
                    {e.lengthMeters ? <span>📏 طول {e.lengthMeters} م</span> : null}
                    {e.heightMeters ? <span>↕️ ارتفاع {e.heightMeters} م</span> : null}
                    {e.notes ? <span>💬 {e.notes}</span> : null}
                  </div>
                </div>
                <button onClick={() => removeAt(i)} className="text-red-500 hover:bg-red-50 rounded px-1.5 text-sm" aria-label="حذف">×</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add buttons */}
      {!adding && (
        <div className="flex flex-wrap gap-1.5">
          {ELEMENT_KINDS.map((k) => {
            const t = ELEMENT_TYPES[k];
            return (
              <button
                key={k}
                type="button"
                onClick={() => startAdd(k)}
                className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-navy text-[12px] hover:border-clay/40 hover:text-clay-dark transition-colors"
                title={t.hint}
              >
                + {t.icon} {t.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Add modal-inline */}
      {adding && draft && (
        <div className="rounded-2xl border-2 border-clay/30 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-navy">
              {ELEMENT_TYPES[adding].icon} إضافة {ELEMENT_TYPES[adding].label}
            </div>
            <button onClick={cancelAdd} className="text-xs text-gray-500 hover:text-clay-dark">إلغاء</button>
          </div>

          <div className="bg-clay/5 border-r-2 border-clay rounded-lg p-2.5 text-[11px] text-gray-600 leading-relaxed">
            <strong className="text-navy">في الاسكيتش:</strong> {ELEMENT_TYPES[adding].drawHint}
          </div>

          {/* Variant chips */}
          <div>
            <div className="text-[11px] font-bold text-gray-600 mb-1.5">اختر النوع</div>
            <div className="flex flex-wrap gap-1.5">
              {ELEMENT_TYPES[adding].variants.map((v) => (
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
                value={ELEMENT_TYPES[adding].variants.includes(draft.variant) ? '' : draft.variant}
                onChange={(e) => setDraft({ ...draft, variant: e.target.value.slice(0, 80) })}
                className="px-2.5 py-1 rounded-full text-[11px] border border-gray-200 focus:border-clay focus:outline-none w-32"
              />
            </div>
          </div>

          {/* Dimensions */}
          {(ELEMENT_TYPES[adding].askLength || ELEMENT_TYPES[adding].askHeight) && (
            <div className="grid grid-cols-2 gap-2">
              {ELEMENT_TYPES[adding].askLength && (
                <label className="block">
                  <span className="block text-[11px] font-bold text-gray-600 mb-1">📏 الطول (متر)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={draft.lengthMeters ?? ''}
                    onChange={(e) => setDraft({ ...draft, lengthMeters: e.target.value === '' ? undefined : Number(e.target.value) })}
                    className="input ltr text-sm"
                    placeholder="مثال: 6"
                  />
                </label>
              )}
              {ELEMENT_TYPES[adding].askHeight && (
                <label className="block">
                  <span className="block text-[11px] font-bold text-gray-600 mb-1">↕️ الارتفاع (متر)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={draft.heightMeters ?? ''}
                    onChange={(e) => setDraft({ ...draft, heightMeters: e.target.value === '' ? undefined : Number(e.target.value) })}
                    className="input ltr text-sm"
                    placeholder="مثال: 2.5"
                  />
                </label>
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
              placeholder={ELEMENT_TYPES[adding].notesPlaceholder}
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
