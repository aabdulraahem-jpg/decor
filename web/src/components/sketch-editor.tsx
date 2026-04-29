'use client';

import { useEffect, useRef, useState } from 'react';
import { ELEMENT_KINDS, ELEMENT_TYPES, ElementCategory, ElementKind } from '@/lib/elements';

/**
 * Visual annotation tool: drops markers on the user's uploaded sketch image
 * with drag/move, camera rotation, and per-marker info fields. The result
 * (markers + ad-hoc dimensions) becomes part of the AI prompt and can be
 * exported as a PNG (sketch + overlays burned in).
 *
 * Tools available:
 *  - 📷 Camera (with rotation handle)
 *  - 📏 Dimension label (free text, e.g. "5×4 م")
 *  - All 14 ELEMENT_TYPES (handrail, fence, pergola, ... pool, courtyard)
 */

export type MarkerKind = ElementKind | 'CAMERA' | 'DIMENSION';

export interface SketchMarker {
  id: string;
  kind: MarkerKind;
  /** 0–100 percent of the image (so it scales) */
  xPct: number;
  yPct: number;
  /** Camera viewing direction in degrees (0 = right, 90 = down) */
  rotationDeg?: number;
  /** Element variant (e.g. "خشب طبيعي") */
  variant?: string;
  /** Free text — used by DIMENSION + as notes for elements */
  text?: string;
  /** Numeric metadata when relevant */
  lengthMeters?: number;
  widthMeters?: number;
  heightMeters?: number;
  areaSqm?: number;
  glassPercent?: number;
}

interface Props {
  sketchUrl: string;
  markers: SketchMarker[];
  onChange: (next: SketchMarker[]) => void;
  /** Called with a PNG data URL when user clicks "تحميل / حفظ" */
  onExport?: (dataUrl: string) => void;
  /** Loading state for save action */
  saving?: boolean;
}

export default function SketchEditor({ sketchUrl, markers, onChange, onExport, saving }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [armedTool, setArmedTool] = useState<MarkerKind | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);
  const [drag, setDrag] = useState<
    | { kind: 'move'; id: string; offsetX: number; offsetY: number }
    | { kind: 'rotate'; id: string; cxPct: number; cyPct: number }
    | null
  >(null);
  const [exporting, setExporting] = useState(false);

  function newId() { return Math.random().toString(36).slice(2, 9); }

  // Place tool on image click
  function handleStageClick(e: React.MouseEvent) {
    if (!armedTool || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    if (xPct < 0 || xPct > 100 || yPct < 0 || yPct > 100) return;
    const id = newId();
    const m: SketchMarker = {
      id,
      kind: armedTool,
      xPct,
      yPct,
      rotationDeg: armedTool === 'CAMERA' ? 0 : undefined,
      variant: armedTool === 'CAMERA' || armedTool === 'DIMENSION' ? undefined
        : ELEMENT_TYPES[armedTool as ElementKind]?.variants[0],
      text: armedTool === 'DIMENSION' ? '5×4 م' : '',
    };
    onChange([...markers, m]);
    setSelectedId(id);
    setArmedTool(null);
  }

  // Pointer handlers for move/rotate
  function startMove(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const m = markers.find((x) => x.id === id);
    if (!m) return;
    const cx = (m.xPct / 100) * rect.width;
    const cy = (m.yPct / 100) * rect.height;
    setDrag({ kind: 'move', id, offsetX: e.clientX - rect.left - cx, offsetY: e.clientY - rect.top - cy });
    setSelectedId(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function startRotate(e: React.PointerEvent, m: SketchMarker) {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDrag({ kind: 'rotate', id: m.id, cxPct: (m.xPct / 100) * rect.width, cyPct: (m.yPct / 100) * rect.height });
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!drag || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (drag.kind === 'move') {
      const x = e.clientX - rect.left - drag.offsetX;
      const y = e.clientY - rect.top - drag.offsetY;
      const xPct = Math.max(2, Math.min(98, (x / rect.width) * 100));
      const yPct = Math.max(2, Math.min(98, (y / rect.height) * 100));
      onChange(markers.map((m) => (m.id === drag.id ? { ...m, xPct, yPct } : m)));
    } else if (drag.kind === 'rotate') {
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const dx = px - drag.cxPct;
      const dy = py - drag.cyPct;
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
      onChange(markers.map((m) => (m.id === drag.id ? { ...m, rotationDeg: Math.round(deg) } : m)));
    }
  }
  function handlePointerUp() { setDrag(null); }

  // Keyboard delete
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setArmedTool(null);
        setSelectedId(null);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !isInputFocused()) {
        onChange(markers.filter((m) => m.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [markers, selectedId, onChange]);

  function isInputFocused() {
    const ae = document.activeElement;
    return ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA');
  }

  function updateSelected(patch: Partial<SketchMarker>) {
    if (!selectedId) return;
    onChange(markers.map((m) => (m.id === selectedId ? { ...m, ...patch } : m)));
  }
  function removeSelected() {
    if (!selectedId) return;
    onChange(markers.filter((m) => m.id !== selectedId));
    setSelectedId(null);
  }

  async function handleExport() {
    if (!containerRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await renderToPng(containerRef.current, sketchUrl);
      // Trigger download
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `sufuf-sketch-${Date.now()}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      onExport?.(dataUrl);
    } finally {
      setExporting(false);
    }
  }

  const selected = markers.find((m) => m.id === selectedId) ?? null;
  const interiorTools = ELEMENT_KINDS.filter((k) => ELEMENT_TYPES[k].category === 'INTERIOR');
  const exteriorTools = ELEMENT_KINDS.filter((k) => ELEMENT_TYPES[k].category === 'EXTERIOR');

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm font-bold text-navy">🎯 ضع العناصر مباشرة على الاسكتش</div>
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <span className="hidden sm:inline">انقر أداة ثم انقر مكانها على الصورة · سحب للتحريك · Delete للحذف</span>
          </div>
        </div>

        {/* Camera + Dimension special tools */}
        <div>
          <div className="text-[11px] font-bold text-gray-500 mb-1">🛠️ أدوات</div>
          <div className="flex flex-wrap gap-1.5">
            <ToolBtn armed={armedTool === 'CAMERA'} onClick={() => setArmedTool(armedTool === 'CAMERA' ? null : 'CAMERA')}>
              📷 كاميرا
            </ToolBtn>
            <ToolBtn armed={armedTool === 'DIMENSION'} onClick={() => setArmedTool(armedTool === 'DIMENSION' ? null : 'DIMENSION')}>
              📏 مقاس
            </ToolBtn>
          </div>
        </div>

        {interiorTools.length > 0 && (
          <ToolGroup label="🏠 إنشائيات داخلية" kinds={interiorTools} armed={armedTool} setArmed={setArmedTool} />
        )}
        <ToolGroup label="🌳 ديكور خارجي" kinds={exteriorTools} armed={armedTool} setArmed={setArmedTool} />

        {armedTool && (
          <div className="bg-clay/10 border border-clay/30 rounded-lg p-2 text-xs text-navy">
            ✏️ اضغط على المكان المرغوب على الاسكتش لوضع <strong>{toolLabel(armedTool)}</strong>. اضغط Esc للإلغاء.
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-3">
        <div
          ref={containerRef}
          onClick={handleStageClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative rounded-2xl overflow-hidden border-2 bg-cream/30 select-none ${
            armedTool ? 'border-dashed border-clay cursor-crosshair' : 'border-gray-200'
          }`}
          style={{ touchAction: 'none' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sketchUrl}
            alt="sketch"
            crossOrigin="anonymous"
            onLoad={(e) => {
              const t = e.currentTarget;
              setImgDims({ w: t.naturalWidth, h: t.naturalHeight });
            }}
            className="w-full h-auto block pointer-events-none"
            draggable={false}
          />
          {/* Markers overlay */}
          {markers.map((m) => (
            <MarkerView
              key={m.id}
              marker={m}
              isSelected={selectedId === m.id}
              onPointerDown={(e) => startMove(e, m.id)}
              onSelect={() => setSelectedId(m.id)}
              onRotateStart={(e) => startRotate(e, m)}
            />
          ))}
        </div>

        {/* Inspector */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3 lg:max-h-[70vh] lg:overflow-auto">
          {selected ? (
            <Inspector
              marker={selected}
              onChange={updateSelected}
              onDelete={removeSelected}
            />
          ) : (
            <div className="text-center text-gray-400 text-xs py-8 px-3 leading-relaxed">
              📌 اختر عنصراً من الأدوات أعلاه ثم انقر على الاسكتش لوضعه.
              بعد ذلك انقر على العنصر لتعديل بياناته (النوع، الطول، العرض…).
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || markers.length === 0}
              className="btn-secondary text-xs flex-1 disabled:opacity-50"
            >
              {exporting ? 'جارٍ التصدير...' : '⬇️ تنزيل PNG'}
            </button>
          </div>
          <div className="text-[10px] text-gray-400 mt-2 leading-relaxed">
            عناصر: {markers.length} · Esc للإلغاء · Delete لحذف العنصر المحدّد · {imgDims ? `${imgDims.w}×${imgDims.h}` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Subcomponents ──────────────────────────────────────────────

function ToolBtn({ children, armed, onClick }: { children: React.ReactNode; armed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[12px] border transition-colors ${
        armed ? 'bg-clay text-white border-clay' : 'bg-white text-navy border-gray-200 hover:border-clay/40 hover:text-clay-dark'
      }`}
    >
      {children}
    </button>
  );
}

function ToolGroup({
  label, kinds, armed, setArmed,
}: {
  label: string;
  kinds: ElementKind[];
  armed: MarkerKind | null;
  setArmed: (v: MarkerKind | null) => void;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold text-gray-500 mb-1">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {kinds.map((k) => {
          const t = ELEMENT_TYPES[k];
          return (
            <ToolBtn key={k} armed={armed === k} onClick={() => setArmed(armed === k ? null : k)}>
              {t.icon} {t.label}
            </ToolBtn>
          );
        })}
      </div>
    </div>
  );
}

function toolLabel(k: MarkerKind): string {
  if (k === 'CAMERA') return 'كاميرا';
  if (k === 'DIMENSION') return 'مقاس';
  return ELEMENT_TYPES[k as ElementKind].label;
}

function MarkerView({
  marker, isSelected, onPointerDown, onSelect, onRotateStart,
}: {
  marker: SketchMarker;
  isSelected: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onSelect: () => void;
  onRotateStart: (e: React.PointerEvent) => void;
}) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${marker.xPct}%`,
    top: `${marker.yPct}%`,
    transform: 'translate(-50%, -50%)',
    cursor: 'move',
    touchAction: 'none',
    zIndex: isSelected ? 30 : 10,
  };
  const ringClass = isSelected ? 'ring-2 ring-clay ring-offset-2 ring-offset-white' : '';

  if (marker.kind === 'CAMERA') {
    const rot = marker.rotationDeg ?? 0;
    return (
      <div style={style} onPointerDown={onPointerDown} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <div className={`relative ${ringClass} rounded-full`}>
          <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-black shadow-md">📷</div>
          {/* Direction arrow */}
          <div
            className="absolute top-1/2 left-1/2 origin-left pointer-events-none"
            style={{ transform: `translateY(-50%) rotate(${rot}deg)`, width: 56 }}
          >
            <div className="h-0.5 bg-clay-dark w-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[8px] border-l-clay-dark border-y-[5px] border-y-transparent" />
          </div>
          {/* Rotation handle (only when selected) */}
          {isSelected && (
            <div
              onPointerDown={onRotateStart}
              className="absolute top-1/2 left-1/2 w-3.5 h-3.5 rounded-full bg-clay border-2 border-white cursor-grab shadow"
              style={{
                transform: `translate(-50%, -50%) rotate(${rot}deg) translateX(56px) rotate(-${rot}deg)`,
              }}
              title="دوّر الكاميرا"
            />
          )}
        </div>
      </div>
    );
  }

  if (marker.kind === 'DIMENSION') {
    return (
      <div style={style} onPointerDown={onPointerDown} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <div className={`bg-white border-2 border-clay rounded-lg px-2 py-0.5 text-xs font-bold text-clay-dark shadow ${ringClass}`}>
          📏 {marker.text || '—'}
        </div>
      </div>
    );
  }

  // Element marker
  const t = ELEMENT_TYPES[marker.kind as ElementKind];
  if (!t) return null;
  return (
    <div style={style} onPointerDown={onPointerDown} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <div className={`flex items-center gap-1.5 bg-white/95 border-2 border-clay/60 rounded-xl px-2 py-1 shadow ${ringClass}`}>
        <span className="text-base leading-none">{t.icon}</span>
        <span className="text-[11px] font-bold text-navy whitespace-nowrap">{t.label}</span>
      </div>
    </div>
  );
}

function Inspector({
  marker, onChange, onDelete,
}: {
  marker: SketchMarker;
  onChange: (patch: Partial<SketchMarker>) => void;
  onDelete: () => void;
}) {
  if (marker.kind === 'CAMERA') {
    return (
      <>
        <div className="font-bold text-navy text-sm mb-2">📷 كاميرا</div>
        <div className="space-y-2 text-xs">
          <div>
            <label className="block text-gray-600 mb-1">زاوية الدوران: <strong>{marker.rotationDeg ?? 0}°</strong></label>
            <input
              type="range" min={-180} max={180} step={5}
              value={marker.rotationDeg ?? 0}
              onChange={(e) => onChange({ rotationDeg: Number(e.target.value) })}
              className="w-full accent-clay"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">وصف للذكاء (اختياري)</label>
            <input
              type="text" className="input text-xs"
              value={marker.text ?? ''}
              onChange={(e) => onChange({ text: e.target.value.slice(0, 200) })}
              placeholder="عدسة عريضة، تنظر للحديقة"
            />
          </div>
        </div>
        <button onClick={onDelete} className="text-red-500 text-xs mt-3 hover:underline">🗑️ حذف</button>
      </>
    );
  }

  if (marker.kind === 'DIMENSION') {
    return (
      <>
        <div className="font-bold text-navy text-sm mb-2">📏 مقاس</div>
        <div className="space-y-2 text-xs">
          <div>
            <label className="block text-gray-600 mb-1">النص (مثال: 5×4 م، ارتفاع 3 م)</label>
            <input
              type="text" className="input text-xs"
              value={marker.text ?? ''}
              onChange={(e) => onChange({ text: e.target.value.slice(0, 80) })}
            />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <NumField label="طول م" value={marker.lengthMeters} onChange={(v) => onChange({ lengthMeters: v })} />
            <NumField label="عرض م" value={marker.widthMeters} onChange={(v) => onChange({ widthMeters: v })} />
            <NumField label="ارتفاع م" value={marker.heightMeters} onChange={(v) => onChange({ heightMeters: v })} />
          </div>
        </div>
        <button onClick={onDelete} className="text-red-500 text-xs mt-3 hover:underline">🗑️ حذف</button>
      </>
    );
  }

  const t = ELEMENT_TYPES[marker.kind as ElementKind];
  if (!t) return null;
  return (
    <>
      <div className="font-bold text-navy text-sm mb-2">{t.icon} {t.label}</div>
      <div className="space-y-2 text-xs">
        <div>
          <label className="block text-gray-600 mb-1">النوع</label>
          <select
            className="input text-xs"
            value={marker.variant ?? t.variants[0]}
            onChange={(e) => onChange({ variant: e.target.value })}
          >
            {t.variants.map((v) => <option key={v}>{v}</option>)}
            <option value="مخصّص">مخصّص…</option>
          </select>
        </div>
        {marker.variant === 'مخصّص' && (
          <input
            type="text" className="input text-xs"
            placeholder="اكتب نوعاً مخصّصاً"
            onChange={(e) => onChange({ variant: e.target.value })}
          />
        )}
        <div className="grid grid-cols-2 gap-1.5">
          {t.askLength && <NumField label={t.lengthLabel ?? '📏 طول م'} value={marker.lengthMeters} onChange={(v) => onChange({ lengthMeters: v })} />}
          {t.askWidth && <NumField label="↔️ عرض م" value={marker.widthMeters} onChange={(v) => onChange({ widthMeters: v })} />}
          {t.askHeight && <NumField label={t.heightLabel ?? '↕️ ارتفاع م'} value={marker.heightMeters} onChange={(v) => onChange({ heightMeters: v })} />}
          {t.askArea && <NumField label="📐 مساحة م²" value={marker.areaSqm} onChange={(v) => onChange({ areaSqm: v })} />}
          {t.askGlassPercent && <NumField label="🪟 زجاج %" value={marker.glassPercent} onChange={(v) => onChange({ glassPercent: v })} max={100} step={5} />}
        </div>
        <div>
          <label className="block text-gray-600 mb-1">ملاحظات</label>
          <input
            type="text" className="input text-xs"
            value={marker.text ?? ''}
            onChange={(e) => onChange({ text: e.target.value.slice(0, 200) })}
            placeholder={t.notesPlaceholder}
          />
        </div>
      </div>
      <button onClick={onDelete} className="text-red-500 text-xs mt-3 hover:underline">🗑️ حذف</button>
    </>
  );
}

function NumField({
  label, value, onChange, step = 0.5, max,
}: { label: string; value: number | undefined; onChange: (v: number | undefined) => void; step?: number; max?: number; }) {
  return (
    <label className="block">
      <span className="block text-[10px] text-gray-500 mb-0.5">{label}</span>
      <input
        type="number" min={0} step={step} max={max}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        className="input ltr text-xs py-1"
      />
    </label>
  );
}

// ── PNG export ──────────────────────────────────────────────────

async function renderToPng(stage: HTMLDivElement, imgUrl: string): Promise<string> {
  // Load the image to get its natural size (so we render at full quality)
  const img = await loadImage(imgUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || stage.clientWidth;
  canvas.height = img.naturalHeight || stage.clientHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas2d unavailable');

  // Draw the source image at native resolution
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Foreground markers — read live DOM positions and draw overlays as
  // rectangles + text labels with the same content the user sees.
  const stageRect = stage.getBoundingClientRect();
  const sx = canvas.width / stageRect.width;
  const sy = canvas.height / stageRect.height;
  const overlayNodes = stage.querySelectorAll('[data-marker]');
  // Fallback: walk children with absolute positioning
  const allChildren = stage.querySelectorAll('div[style*="position: absolute"]');
  const list: HTMLElement[] = overlayNodes.length > 0
    ? Array.from(overlayNodes) as HTMLElement[]
    : Array.from(allChildren) as HTMLElement[];
  for (const el of list) {
    const r = el.getBoundingClientRect();
    const x = (r.left - stageRect.left) * sx;
    const y = (r.top - stageRect.top) * sy;
    const w = r.width * sx;
    const h = r.height * sy;
    const text = el.textContent?.trim() ?? '';
    // Background pill
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.strokeStyle = '#a8896d';
    ctx.lineWidth = 2 * Math.min(sx, sy);
    roundRect(ctx, x, y, w, h, 10 * Math.min(sx, sy));
    ctx.fill(); ctx.stroke();
    // Text
    ctx.fillStyle = '#2c2e3a';
    ctx.font = `bold ${Math.max(12, h * 0.55)}px Cairo, Tajawal, sans-serif`;
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
  }
  return canvas.toDataURL('image/png');
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
