'use client';

import { useEffect, useRef, useState } from 'react';
import { ELEMENT_KINDS, ELEMENT_TYPES, ElementKind } from '@/lib/elements';

/**
 * Visual annotation tool: drops markers on the user's uploaded sketch.
 *
 * Marker types:
 *  - 📷 Camera: numbered circle + draggable rotation arrow
 *  - 📏 Dimension: small movable label
 *  - 📐 Ruler: line with two draggable endpoints + editable distance label
 *  - 14 ELEMENT_TYPES, two visual flavors:
 *      • Point markers (HANDRAIL, EXTERIOR_FACADE, GATE) — small pill
 *      • Rect markers (everything else) — semi-transparent rectangle
 *        with 4 corner resize handles when selected
 *
 * The tool stays "armed" after a placement so the user can keep dropping
 * the same kind multiple times without re-clicking the toolbar.
 * Esc disarms.
 */

export type MarkerKind = ElementKind | 'CAMERA' | 'DIMENSION' | 'RULER' | 'TEXT';

export interface SketchMarker {
  id: string;
  kind: MarkerKind;
  /** 0–100 percent of the image */
  xPct: number;
  yPct: number;
  /** For RECT_KIND markers — top-left X is xPct, width/height in % */
  wPct?: number;
  hPct?: number;
  /** For RULER — second endpoint */
  x2Pct?: number;
  y2Pct?: number;
  /** Camera viewing direction in degrees */
  rotationDeg?: number;
  variant?: string;
  /** Notes / dimension text / ruler distance label */
  text?: string;
  lengthMeters?: number;
  widthMeters?: number;
  heightMeters?: number;
  areaSqm?: number;
  glassPercent?: number;
  /** Height above ground for awnings, wall toppers, pergolas */
  elevationMeters?: number;
  /** Attached to top edge of a wall (e.g. wall topper, awning flush to wall) */
  attachedToWallTop?: boolean;
}

const RECT_KINDS: ReadonlyArray<ElementKind> = [
  'ANNEX', 'PERGOLA', 'POOL', 'CARPORT', 'COURTYARD', 'GRASS', 'BAIT_SHAR',
  'FENCE', 'WALKWAY', 'BOUNDARY_WALL', 'WALL_TOPPER',
];
const SUPPORTS_ELEVATION: ReadonlyArray<ElementKind> = [
  'PERGOLA', 'CARPORT', 'WALL_TOPPER', 'BAIT_SHAR',
];
const SUPPORTS_WALL_ATTACH: ReadonlyArray<ElementKind> = [
  'WALL_TOPPER', 'PERGOLA', 'CARPORT',
];

function isRectKind(k: MarkerKind): k is ElementKind {
  return RECT_KINDS.includes(k as ElementKind);
}
function defaultSizePct(k: MarkerKind): { w: number; h: number } {
  switch (k) {
    case 'ANNEX': return { w: 18, h: 12 };
    case 'PERGOLA': case 'BAIT_SHAR': return { w: 16, h: 12 };
    case 'POOL': return { w: 20, h: 10 };
    case 'CARPORT': return { w: 22, h: 8 };
    case 'COURTYARD': case 'GRASS': return { w: 22, h: 14 };
    case 'FENCE': return { w: 25, h: 3 };
    case 'WALL_TOPPER': return { w: 28, h: 3 };
    case 'WALKWAY': return { w: 22, h: 5 };
    case 'BOUNDARY_WALL': return { w: 30, h: 3 };
    default: return { w: 12, h: 8 };
  }
}

interface Props {
  sketchUrl: string;
  markers: SketchMarker[];
  onChange: (next: SketchMarker[]) => void;
  onExport?: (dataUrl: string) => void;
}

type DragState =
  | { kind: 'move'; id: string; offsetXPct: number; offsetYPct: number }
  | { kind: 'rotate'; id: string; cxPx: number; cyPx: number }
  | { kind: 'resize'; id: string; corner: 'NW' | 'NE' | 'SW' | 'SE' }
  | { kind: 'endpoint'; id: string; which: 'A' | 'B' }
  | { kind: 'zoom'; startX: number; startY: number; startZoom: number };

export default function SketchEditor({ sketchUrl, markers, onChange, onExport }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [armedTool, setArmedTool] = useState<MarkerKind | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);
  const [imgError, setImgError] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [exporting, setExporting] = useState(false);
  const [zoom, setZoom] = useState(1);
  /** While placing a RULER: the first click endpoint in % */
  const [rulerSeed, setRulerSeed] = useState<{ xPct: number; yPct: number } | null>(null);

  const newId = () => Math.random().toString(36).slice(2, 9);

  // ── Place tool on image click ───────────────────────────────────
  function handleStageClick(e: React.MouseEvent) {
    // Critical: only place when the click was on the stage itself (or the
    // image which has pointer-events:none). Clicks bubbling up from a
    // marker, handle, or zoom grip would otherwise wrongly place duplicates.
    if (e.target !== e.currentTarget) return;
    if (!armedTool || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    if (xPct < 0 || xPct > 100 || yPct < 0 || yPct > 100) return;

    if (armedTool === 'RULER') {
      if (!rulerSeed) {
        setRulerSeed({ xPct, yPct });
        return;
      }
      const id = newId();
      onChange([
        ...markers,
        {
          id, kind: 'RULER',
          xPct: rulerSeed.xPct, yPct: rulerSeed.yPct,
          x2Pct: xPct, y2Pct: yPct,
          text: '',
        },
      ]);
      setSelectedId(id);
      setRulerSeed(null);
      return;
    }

    const id = newId();
    const marker: SketchMarker = {
      id,
      kind: armedTool,
      xPct, yPct,
      rotationDeg: armedTool === 'CAMERA' ? 0 : undefined,
      variant: armedTool === 'CAMERA' || armedTool === 'DIMENSION' || armedTool === 'TEXT' ? undefined
        : ELEMENT_TYPES[armedTool as ElementKind]?.variants[0],
      text: armedTool === 'DIMENSION' ? '5×4 م'
          : armedTool === 'TEXT' ? 'مجلس'
          : '',
    };
    if (isRectKind(armedTool)) {
      const ds = defaultSizePct(armedTool);
      // Center the rect on the click point
      marker.xPct = Math.max(2, Math.min(98 - ds.w, xPct - ds.w / 2));
      marker.yPct = Math.max(2, Math.min(98 - ds.h, yPct - ds.h / 2));
      marker.wPct = ds.w;
      marker.hPct = ds.h;
    }
    onChange([...markers, marker]);
    setSelectedId(id);
    // Tool stays armed — user can keep placing more of the same kind. Esc disarms.
  }

  // ── Pointer drag ────────────────────────────────────────────────
  function pctOfEvent(e: React.PointerEvent): { xPct: number; yPct: number; rect: DOMRect } | null {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    return {
      xPct: ((e.clientX - rect.left) / rect.width) * 100,
      yPct: ((e.clientY - rect.top) / rect.height) * 100,
      rect,
    };
  }

  function startMove(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    const p = pctOfEvent(e); if (!p) return;
    const m = markers.find((x) => x.id === id); if (!m) return;
    setDrag({
      kind: 'move',
      id,
      offsetXPct: p.xPct - m.xPct,
      offsetYPct: p.yPct - m.yPct,
    });
    setSelectedId(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function startRotate(e: React.PointerEvent, m: SketchMarker) {
    e.stopPropagation();
    const p = pctOfEvent(e); if (!p) return;
    setDrag({
      kind: 'rotate',
      id: m.id,
      cxPx: (m.xPct / 100) * p.rect.width,
      cyPx: (m.yPct / 100) * p.rect.height,
    });
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function startResize(e: React.PointerEvent, id: string, corner: 'NW' | 'NE' | 'SW' | 'SE') {
    e.stopPropagation();
    setDrag({ kind: 'resize', id, corner });
    setSelectedId(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function startEndpoint(e: React.PointerEvent, id: string, which: 'A' | 'B') {
    e.stopPropagation();
    setDrag({ kind: 'endpoint', id, which });
    setSelectedId(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function startZoomDrag(e: React.PointerEvent) {
    e.stopPropagation();
    setDrag({ kind: 'zoom', startX: e.clientX, startY: e.clientY, startZoom: zoom });
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const p = pctOfEvent(e); if (!p) return;
    if (drag.kind === 'move') {
      onChange(markers.map((m) => {
        if (m.id !== drag.id) return m;
        if (m.kind === 'RULER' && m.x2Pct !== undefined && m.y2Pct !== undefined) {
          // Move both endpoints together
          const newX = clamp(p.xPct - drag.offsetXPct, 1, 99);
          const newY = clamp(p.yPct - drag.offsetYPct, 1, 99);
          const dx = newX - m.xPct;
          const dy = newY - m.yPct;
          return { ...m, xPct: newX, yPct: newY, x2Pct: m.x2Pct + dx, y2Pct: m.y2Pct + dy };
        }
        const w = m.wPct ?? 0;
        const h = m.hPct ?? 0;
        const newX = clamp(p.xPct - drag.offsetXPct, 1, Math.max(1, 99 - w));
        const newY = clamp(p.yPct - drag.offsetYPct, 1, Math.max(1, 99 - h));
        return { ...m, xPct: newX, yPct: newY };
      }));
    } else if (drag.kind === 'rotate') {
      const dx = (e.clientX - p.rect.left) - drag.cxPx;
      const dy = (e.clientY - p.rect.top) - drag.cyPx;
      const deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
      onChange(markers.map((m) => (m.id === drag.id ? { ...m, rotationDeg: deg } : m)));
    } else if (drag.kind === 'resize') {
      onChange(markers.map((m) => {
        if (m.id !== drag.id) return m;
        const x = m.xPct, y = m.yPct, w = m.wPct ?? 0, h = m.hPct ?? 0;
        const right = x + w, bottom = y + h;
        const minSize = 3;
        const mx = clamp(p.xPct, 0, 100), my = clamp(p.yPct, 0, 100);
        let nx = x, ny = y, nw = w, nh = h;
        if (drag.corner === 'NW') {
          nx = Math.min(mx, right - minSize); ny = Math.min(my, bottom - minSize);
          nw = right - nx; nh = bottom - ny;
        } else if (drag.corner === 'NE') {
          ny = Math.min(my, bottom - minSize);
          nw = Math.max(minSize, mx - x);
          nh = bottom - ny;
        } else if (drag.corner === 'SW') {
          nx = Math.min(mx, right - minSize);
          nw = right - nx;
          nh = Math.max(minSize, my - y);
        } else { // SE
          nw = Math.max(minSize, mx - x);
          nh = Math.max(minSize, my - y);
        }
        return { ...m, xPct: nx, yPct: ny, wPct: nw, hPct: nh };
      }));
    } else if (drag.kind === 'endpoint') {
      onChange(markers.map((m) => {
        if (m.id !== drag.id) return m;
        const xPct = clamp(p.xPct, 1, 99), yPct = clamp(p.yPct, 1, 99);
        return drag.which === 'A' ? { ...m, xPct, yPct } : { ...m, x2Pct: xPct, y2Pct: yPct };
      }));
    } else if (drag.kind === 'zoom') {
      const delta = Math.max(e.clientX - drag.startX, e.clientY - drag.startY);
      const next = clamp(drag.startZoom + delta / 220, 0.5, 3);
      setZoom(next);
    }
  }
  function handlePointerUp() { setDrag(null); }

  // ── Keyboard ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setArmedTool(null);
        setSelectedId(null);
        setRulerSeed(null);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !isInputFocused()) {
        onChange(markers.filter((m) => m.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [markers, selectedId, onChange]);

  function updateSelected(patch: Partial<SketchMarker>) {
    if (!selectedId) return;
    onChange(markers.map((m) => (m.id === selectedId ? { ...m, ...patch } : m)));
  }
  function removeSelected() {
    if (!selectedId) return;
    onChange(markers.filter((m) => m.id !== selectedId));
    setSelectedId(null);
  }
  function duplicateSelected() {
    if (!selectedId) return;
    const m = markers.find((x) => x.id === selectedId); if (!m) return;
    const id = newId();
    onChange([...markers, { ...m, id, xPct: clamp(m.xPct + 4, 1, 95), yPct: clamp(m.yPct + 4, 1, 95) }]);
    setSelectedId(id);
  }

  async function handleExport() {
    if (!containerRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await renderToPng(containerRef.current, sketchUrl);
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
          <div className="text-[11px] text-gray-500 hidden sm:block">
            انقر أداة ثم انقر على الصورة (الأداة تبقى فعّالة لإضافة المزيد) · Esc للإلغاء · Delete للحذف
          </div>
        </div>

        {/* Special tools */}
        <div>
          <div className="text-[11px] font-bold text-gray-500 mb-1">🛠️ أدوات</div>
          <div className="flex flex-wrap gap-1.5">
            <ToolBtn armed={armedTool === 'CAMERA'} onClick={() => { setArmedTool(armedTool === 'CAMERA' ? null : 'CAMERA'); setRulerSeed(null); }}>📷 كاميرا</ToolBtn>
            <ToolBtn armed={armedTool === 'TEXT'} onClick={() => { setArmedTool(armedTool === 'TEXT' ? null : 'TEXT'); setRulerSeed(null); }}>🔤 نص (اسم مكان)</ToolBtn>
            <ToolBtn armed={armedTool === 'DIMENSION'} onClick={() => { setArmedTool(armedTool === 'DIMENSION' ? null : 'DIMENSION'); setRulerSeed(null); }}>📏 مقاس</ToolBtn>
            <ToolBtn armed={armedTool === 'RULER'} onClick={() => { setArmedTool(armedTool === 'RULER' ? null : 'RULER'); setRulerSeed(null); }}>📐 مسطرة (مسافة)</ToolBtn>
          </div>
        </div>

        {interiorTools.length > 0 && (
          <ToolGroup label="🏠 إنشائيات داخلية" kinds={interiorTools} armed={armedTool} setArmed={(t) => { setArmedTool(t); setRulerSeed(null); }} />
        )}
        <ToolGroup label="🌳 ديكور خارجي" kinds={exteriorTools} armed={armedTool} setArmed={(t) => { setArmedTool(t); setRulerSeed(null); }} />

        {armedTool && (
          <div className="bg-clay/10 border border-clay/30 rounded-lg p-2 text-xs text-navy">
            ✏️ {armedTool === 'RULER'
              ? rulerSeed
                ? 'انقر النقطة الثانية لرسم المسطرة. Esc للإلغاء.'
                : 'انقر النقطة الأولى لبداية المسطرة.'
              : <>اضغط على المكان المرغوب لوضع <strong>{toolLabel(armedTool)}</strong>. الأداة تبقى فعّالة لإضافة المزيد. Esc للإلغاء.</>}
          </div>
        )}
      </div>

      {/* Canvas + Inspector */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-3">
        <div className="space-y-2">
          {/* Zoom controls bar */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-gray-500">🔍 التكبير:</span>
            <button onClick={() => setZoom((z) => clamp(z - 0.25, 0.5, 3))} className="w-7 h-7 rounded-full bg-white border border-gray-200 hover:border-clay text-navy font-black">−</button>
            <span className="font-bold text-navy min-w-[44px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => clamp(z + 0.25, 0.5, 3))} className="w-7 h-7 rounded-full bg-white border border-gray-200 hover:border-clay text-navy font-black">+</button>
            <button onClick={() => setZoom(1)} className="px-2 h-7 rounded-full bg-white border border-gray-200 hover:border-clay text-navy text-[11px]">100%</button>
            <input
              type="range" min={0.5} max={3} step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-clay"
            />
          </div>

          {/* Scrollable wrapper */}
          <div className="rounded-2xl border-2 border-gray-200 bg-cream/30 overflow-auto" style={{ maxHeight: '75vh' }}>
            <div
              ref={containerRef}
              onClick={handleStageClick}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative select-none ${
                armedTool ? 'cursor-crosshair' : ''
              }`}
              style={{
                touchAction: 'none',
                width: `${100 * zoom}%`,
                minHeight: 200,
                outline: armedTool ? '2px dashed #a8896d' : 'none',
                outlineOffset: -2,
              }}
            >
              {imgError ? (
                <div className="p-8 text-center text-sm text-red-600 bg-red-50 rounded">
                  ⚠️ تعذّر تحميل صورة الاسكتش. تحقّق من الرابط أو أعد رفع الصورة.
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={sketchUrl}
                  alt="sketch"
                  onLoad={(e) => {
                    const t = e.currentTarget;
                    setImgDims({ w: t.naturalWidth, h: t.naturalHeight });
                    setImgError(false);
                  }}
                  onError={() => setImgError(true)}
                  className="w-full h-auto block pointer-events-none"
                  draggable={false}
                />
              )}

              {/* Ruler seed indicator */}
              {rulerSeed && armedTool === 'RULER' && (
                <div
                  className="absolute w-3 h-3 rounded-full bg-clay border-2 border-white shadow pointer-events-none animate-pulse"
                  style={{ left: `${rulerSeed.xPct}%`, top: `${rulerSeed.yPct}%`, transform: 'translate(-50%, -50%)' }}
                />
              )}

              {/* Markers overlay */}
              {markers.map((m) => (
                <MarkerView
                  key={m.id}
                  marker={m}
                  isSelected={selectedId === m.id}
                  onMoveStart={(e) => startMove(e, m.id)}
                  onSelect={() => setSelectedId(m.id)}
                  onRotateStart={(e) => startRotate(e, m)}
                  onResizeStart={(e, c) => startResize(e, m.id, c)}
                  onEndpointStart={(e, w) => startEndpoint(e, m.id, w)}
                />
              ))}

              {/* Bottom-right zoom grip */}
              <div
                onPointerDown={startZoomDrag}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-1 right-1 w-9 h-9 cursor-nwse-resize bg-white border-2 border-clay rounded-md shadow-md flex items-center justify-center text-clay-dark text-base font-black hover:bg-clay/5"
                style={{ zIndex: 50, touchAction: 'none' }}
                title="اسحب من هذه الزاوية لتكبير/تصغير الاسكتش"
              >↘</div>
            </div>
          </div>
        </div>

        {/* Inspector */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3 lg:max-h-[80vh] lg:overflow-auto">
          {selected ? (
            <Inspector
              marker={selected}
              onChange={updateSelected}
              onDelete={removeSelected}
              onDuplicate={duplicateSelected}
            />
          ) : (
            <div className="text-center text-gray-400 text-xs py-8 px-3 leading-relaxed">
              📌 اختر أداة من الأعلى ثم انقر على الاسكتش لوضعها.
              <br />الأداة تبقى مفعَّلة فيمكنك إضافة عدّة عناصر من نفس النوع.
              <br />انقر على عنصر لتحرير بياناته أو سحب أركانه لتغيير مقاسه.
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
            عناصر: {markers.length} {imgDims ? `· ${imgDims.w}×${imgDims.h} px` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
function isInputFocused() {
  const ae = document.activeElement;
  return ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT');
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
  if (k === 'RULER') return 'مسطرة';
  return ELEMENT_TYPES[k as ElementKind].label;
}

function MarkerView({
  marker, isSelected,
  onMoveStart, onSelect, onRotateStart, onResizeStart, onEndpointStart,
}: {
  marker: SketchMarker;
  isSelected: boolean;
  onMoveStart: (e: React.PointerEvent) => void;
  onSelect: () => void;
  onRotateStart: (e: React.PointerEvent) => void;
  onResizeStart: (e: React.PointerEvent, c: 'NW' | 'NE' | 'SW' | 'SE') => void;
  onEndpointStart: (e: React.PointerEvent, which: 'A' | 'B') => void;
}) {
  // ── RULER ────────────────────────────────────────────────────
  if (marker.kind === 'RULER' && marker.x2Pct !== undefined && marker.y2Pct !== undefined) {
    const cx = (marker.xPct + marker.x2Pct) / 2;
    const cy = (marker.yPct + marker.y2Pct) / 2;
    return (
      <>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: isSelected ? 25 : 8 }}
        >
          <line
            x1={`${marker.xPct}%`} y1={`${marker.yPct}%`} x2={`${marker.x2Pct}%`} y2={`${marker.y2Pct}%`}
            stroke={isSelected ? '#a8896d' : '#7d6450'}
            strokeWidth={isSelected ? 2.5 : 1.8}
            strokeDasharray="6 3"
          />
          {/* Arrow heads at both endpoints */}
          {arrowHead(marker.xPct, marker.yPct, marker.x2Pct, marker.y2Pct, true)}
          {arrowHead(marker.x2Pct, marker.y2Pct, marker.xPct, marker.yPct, true)}
        </svg>
        {/* Endpoint A */}
        <div
          onPointerDown={(e) => onEndpointStart(e, 'A')}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-clay shadow cursor-grab"
          style={{ left: `${marker.xPct}%`, top: `${marker.yPct}%`, transform: 'translate(-50%, -50%)', touchAction: 'none', zIndex: 26 }}
        />
        {/* Endpoint B */}
        <div
          onPointerDown={(e) => onEndpointStart(e, 'B')}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="absolute w-4 h-4 rounded-full bg-white border-2 border-clay shadow cursor-grab"
          style={{ left: `${marker.x2Pct}%`, top: `${marker.y2Pct}%`, transform: 'translate(-50%, -50%)', touchAction: 'none', zIndex: 26 }}
        />
        {/* Distance label */}
        <div
          onPointerDown={onMoveStart}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={`absolute bg-white border-2 ${isSelected ? 'border-clay ring-2 ring-clay/30' : 'border-clay/60'} rounded-lg px-2 py-0.5 text-xs font-bold text-clay-dark shadow cursor-move whitespace-nowrap`}
          style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%, -50%)', touchAction: 'none', zIndex: 27 }}
        >
          📐 {marker.text || `${Math.hypot(marker.x2Pct - marker.xPct, marker.y2Pct - marker.yPct).toFixed(0)}%`}
        </div>
      </>
    );
  }

  // ── CAMERA ───────────────────────────────────────────────────
  if (marker.kind === 'CAMERA') {
    const rot = marker.rotationDeg ?? 0;
    return (
      <div
        style={{ position: 'absolute', left: `${marker.xPct}%`, top: `${marker.yPct}%`, transform: 'translate(-50%, -50%)', cursor: 'move', touchAction: 'none', zIndex: isSelected ? 30 : 12 }}
      >
        <div className={`relative ${isSelected ? 'ring-2 ring-clay ring-offset-2 ring-offset-white rounded-full' : ''}`}>
          <div onPointerDown={onMoveStart} onClick={(e) => { e.stopPropagation(); onSelect(); }} className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-black shadow-md">📷</div>
          <div className="absolute top-1/2 left-1/2 origin-left pointer-events-none" style={{ transform: `translateY(-50%) rotate(${rot}deg)`, width: 56 }}>
            <div className="h-0.5 bg-clay-dark w-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[8px] border-l-clay-dark border-y-[5px] border-y-transparent" />
          </div>
          {isSelected && (
            <div
              onPointerDown={onRotateStart}
              className="absolute top-1/2 left-1/2 w-3.5 h-3.5 rounded-full bg-clay border-2 border-white cursor-grab shadow"
              style={{ transform: `translate(-50%, -50%) rotate(${rot}deg) translateX(56px) rotate(-${rot}deg)`, touchAction: 'none' }}
              title="دوّر الكاميرا"
            />
          )}
        </div>
      </div>
    );
  }

  // ── DIMENSION ────────────────────────────────────────────────
  if (marker.kind === 'DIMENSION') {
    return (
      <div
        onPointerDown={onMoveStart}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        style={{ position: 'absolute', left: `${marker.xPct}%`, top: `${marker.yPct}%`, transform: 'translate(-50%, -50%)', cursor: 'move', touchAction: 'none', zIndex: isSelected ? 30 : 13 }}
      >
        <div className={`bg-white border-2 border-clay rounded-lg px-2 py-0.5 text-xs font-bold text-clay-dark shadow ${isSelected ? 'ring-2 ring-clay/30' : ''}`}>
          📏 {marker.text || '—'}
        </div>
      </div>
    );
  }

  // ── TEXT label (free text — like writing space names) ────────
  if (marker.kind === 'TEXT') {
    return (
      <div
        onPointerDown={onMoveStart}
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
        style={{ position: 'absolute', left: `${marker.xPct}%`, top: `${marker.yPct}%`, transform: 'translate(-50%, -50%)', cursor: 'move', touchAction: 'none', zIndex: isSelected ? 30 : 14 }}
      >
        <div className={`bg-white border ${isSelected ? 'border-clay ring-2 ring-clay/30' : 'border-gray-300'} rounded-md px-2 py-0.5 text-sm font-black text-navy shadow whitespace-nowrap`}>
          {marker.text || 'اسم'}
        </div>
      </div>
    );
  }

  // ── RECT element marker ──────────────────────────────────────
  const t = ELEMENT_TYPES[marker.kind as ElementKind];
  if (!t) return null;

  if (isRectKind(marker.kind) && marker.wPct !== undefined && marker.hPct !== undefined) {
    return (
      <>
        <div
          onPointerDown={onMoveStart}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          style={{ position: 'absolute', left: `${marker.xPct}%`, top: `${marker.yPct}%`, width: `${marker.wPct}%`, height: `${marker.hPct}%`, cursor: 'move', touchAction: 'none', zIndex: isSelected ? 25 : 10 }}
          className={`rounded-md ${isSelected ? 'border-2 border-clay bg-clay/15' : 'border-2 border-dashed border-clay/60 bg-clay/8 hover:bg-clay/12'} transition-colors`}
        >
          <div className="absolute top-1 right-1 bg-white/95 border border-clay/40 rounded px-1.5 py-0.5 text-[10px] font-bold text-navy whitespace-nowrap shadow-sm pointer-events-none flex items-center gap-1">
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </div>
          {marker.elevationMeters !== undefined && (
            <div className="absolute bottom-1 left-1 bg-navy text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none">
              ↑ {marker.elevationMeters} م عن الأرض
            </div>
          )}
        </div>
        {/* Resize handles when selected */}
        {isSelected && (
          <>
            {(['NW', 'NE', 'SW', 'SE'] as const).map((c) => {
              const x = c.endsWith('W') ? marker.xPct : marker.xPct + (marker.wPct ?? 0);
              const y = c.startsWith('N') ? marker.yPct : marker.yPct + (marker.hPct ?? 0);
              const cur = c === 'NW' || c === 'SE' ? 'nwse-resize' : 'nesw-resize';
              return (
                <div
                  key={c}
                  onPointerDown={(e) => onResizeStart(e, c)}
                  className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-clay shadow"
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', cursor: cur, touchAction: 'none', zIndex: 28 }}
                />
              );
            })}
          </>
        )}
      </>
    );
  }

  // ── Point element marker (HANDRAIL, EXTERIOR_FACADE, GATE) ───
  return (
    <div
      onPointerDown={onMoveStart}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      style={{ position: 'absolute', left: `${marker.xPct}%`, top: `${marker.yPct}%`, transform: 'translate(-50%, -50%)', cursor: 'move', touchAction: 'none', zIndex: isSelected ? 30 : 11 }}
    >
      <div className={`flex items-center gap-1.5 bg-white/95 border-2 ${isSelected ? 'border-clay ring-2 ring-clay/30' : 'border-clay/60'} rounded-xl px-2 py-1 shadow`}>
        <span className="text-base leading-none">{t.icon}</span>
        <span className="text-[11px] font-bold text-navy whitespace-nowrap">{t.label}</span>
      </div>
    </div>
  );
}

function arrowHead(fromX: number, fromY: number, toX: number, toY: number, atFrom: boolean) {
  // Render an arrowhead at (fromX, fromY) pointing toward (toX, toY) — % coords
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const len = 2.2;
  const w = 1.2;
  const tipX = fromX, tipY = fromY;
  const baseX = fromX + Math.cos(angle) * len;
  const baseY = fromY + Math.sin(angle) * len;
  const lx = baseX + Math.cos(angle + Math.PI / 2) * w;
  const ly = baseY + Math.sin(angle + Math.PI / 2) * w;
  const rx = baseX + Math.cos(angle - Math.PI / 2) * w;
  const ry = baseY + Math.sin(angle - Math.PI / 2) * w;
  return (
    <polygon
      key={`arrow-${atFrom ? 'a' : 'b'}-${tipX.toFixed(1)}-${tipY.toFixed(1)}`}
      points={`${tipX}%,${tipY}% ${lx}%,${ly}% ${rx}%,${ry}%`}
      fill="#7d6450"
    />
  );
}

function Inspector({
  marker, onChange, onDelete, onDuplicate,
}: {
  marker: SketchMarker;
  onChange: (patch: Partial<SketchMarker>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  if (marker.kind === 'CAMERA') {
    return (
      <Wrap title="📷 كاميرا" onDelete={onDelete} onDuplicate={onDuplicate}>
        <div>
          <label className="block text-[11px] text-gray-600 mb-1">زاوية الدوران: <strong>{marker.rotationDeg ?? 0}°</strong></label>
          <input type="range" min={-180} max={180} step={5} value={marker.rotationDeg ?? 0}
                 onChange={(e) => onChange({ rotationDeg: Number(e.target.value) })}
                 className="w-full accent-clay" />
        </div>
        <Field label="وصف للذكاء" value={marker.text ?? ''} onChange={(v) => onChange({ text: v.slice(0, 200) })} placeholder="عدسة عريضة، تنظر للحديقة" />
      </Wrap>
    );
  }
  if (marker.kind === 'DIMENSION') {
    return (
      <Wrap title="📏 مقاس" onDelete={onDelete} onDuplicate={onDuplicate}>
        <Field label="النص (مثال: 5×4 م)" value={marker.text ?? ''} onChange={(v) => onChange({ text: v.slice(0, 80) })} />
        <div className="grid grid-cols-3 gap-1.5">
          <NumField label="طول م" value={marker.lengthMeters} onChange={(v) => onChange({ lengthMeters: v })} />
          <NumField label="عرض م" value={marker.widthMeters} onChange={(v) => onChange({ widthMeters: v })} />
          <NumField label="ارتفاع م" value={marker.heightMeters} onChange={(v) => onChange({ heightMeters: v })} />
        </div>
      </Wrap>
    );
  }
  if (marker.kind === 'TEXT') {
    const presets = ['مجلس', 'صالة', 'مطبخ', 'نوم', 'حمام', 'ممر', 'مدخل', 'حديقة', 'درج', 'مغسلة ايدي', 'بيت شعر', 'مسبح', 'ملحق', 'بوّابة'];
    return (
      <Wrap title="🔤 اسم/نص" onDelete={onDelete} onDuplicate={onDuplicate}>
        <Field label="النص" value={marker.text ?? ''} onChange={(v) => onChange({ text: v.slice(0, 80) })} placeholder="اكتب اسم المساحة أو ملاحظة" />
        <div>
          <div className="text-[10px] text-gray-500 mb-1">اقتراحات سريعة:</div>
          <div className="flex flex-wrap gap-1">
            {presets.map((p) => (
              <button key={p} type="button" onClick={() => onChange({ text: p })}
                      className="px-2 py-0.5 rounded-full bg-cream text-navy text-[11px] border border-gray-200 hover:border-clay">
                {p}
              </button>
            ))}
          </div>
        </div>
      </Wrap>
    );
  }
  if (marker.kind === 'RULER') {
    return (
      <Wrap title="📐 مسطرة (مسافة)" onDelete={onDelete} onDuplicate={onDuplicate}>
        <Field label="القيمة المعروضة" value={marker.text ?? ''} onChange={(v) => onChange({ text: v.slice(0, 40) })} placeholder="مثال: 3.5 م" />
        <NumField label="المسافة الفعلية (متر)" value={marker.lengthMeters} onChange={(v) => onChange({ lengthMeters: v, text: v ? `${v} م` : marker.text })} />
        <p className="text-[10px] text-gray-500 leading-relaxed">اسحب أيّ من النقطتَين لتحريك طرف المسطرة، أو اسحب التسمية في الوسط لتحريك المسطرة كاملةً.</p>
      </Wrap>
    );
  }

  const t = ELEMENT_TYPES[marker.kind as ElementKind];
  if (!t) return null;
  const isRect = isRectKind(marker.kind);
  const supportsElevation = SUPPORTS_ELEVATION.includes(marker.kind);
  const supportsWallAttach = SUPPORTS_WALL_ATTACH.includes(marker.kind);

  return (
    <Wrap title={`${t.icon} ${t.label}`} onDelete={onDelete} onDuplicate={onDuplicate}>
      <div>
        <label className="block text-[11px] text-gray-600 mb-1">النوع</label>
        <select className="input text-xs" value={marker.variant ?? t.variants[0]} onChange={(e) => onChange({ variant: e.target.value })}>
          {t.variants.map((v) => <option key={v}>{v}</option>)}
          <option value="مخصّص">مخصّص…</option>
        </select>
      </div>
      {marker.variant === 'مخصّص' && (
        <input type="text" className="input text-xs" placeholder="اكتب نوعاً مخصّصاً"
               onChange={(e) => onChange({ variant: e.target.value })} />
      )}

      <div className="grid grid-cols-2 gap-1.5">
        {t.askLength && <NumField label={t.lengthLabel ?? '📏 طول م'} value={marker.lengthMeters} onChange={(v) => onChange({ lengthMeters: v })} />}
        {t.askWidth && <NumField label="↔️ عرض م" value={marker.widthMeters} onChange={(v) => onChange({ widthMeters: v })} />}
        {t.askHeight && <NumField label={t.heightLabel ?? '↕️ ارتفاع م'} value={marker.heightMeters} onChange={(v) => onChange({ heightMeters: v })} />}
        {t.askArea && <NumField label="📐 مساحة م²" value={marker.areaSqm} onChange={(v) => onChange({ areaSqm: v })} />}
        {t.askGlassPercent && <NumField label="🪟 زجاج %" value={marker.glassPercent} onChange={(v) => onChange({ glassPercent: v })} max={100} step={5} />}
        {supportsElevation && (
          <NumField label="⬆️ عن الأرض م" value={marker.elevationMeters} onChange={(v) => onChange({ elevationMeters: v })} step={0.1}
                    placeholder="مثال: 2.4" />
        )}
      </div>

      {supportsWallAttach && (
        <label className="inline-flex items-center gap-2 text-xs text-navy bg-cream/60 rounded-lg px-2 py-1.5">
          <input type="checkbox" className="accent-clay"
                 checked={!!marker.attachedToWallTop}
                 onChange={(e) => onChange({ attachedToWallTop: e.target.checked })} />
          <span>ملاصق لحافة الجدار من الأعلى</span>
        </label>
      )}

      {isRect && marker.wPct !== undefined && marker.hPct !== undefined && (
        <div className="text-[10px] text-gray-500 bg-cream/40 rounded px-2 py-1">
          📍 على الاسكتش: {marker.wPct.toFixed(0)}% × {marker.hPct.toFixed(0)}%
          <span className="block opacity-80">اسحب الأركان الأربعة لتغيير المقاس بصرياً.</span>
        </div>
      )}

      <Field label="ملاحظات" value={marker.text ?? ''} onChange={(v) => onChange({ text: v.slice(0, 200) })} placeholder={t.notesPlaceholder} />
    </Wrap>
  );
}

function Wrap({
  title, children, onDelete, onDuplicate,
}: { title: string; children: React.ReactNode; onDelete: () => void; onDuplicate: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-navy text-sm">{title}</div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <button onClick={onDuplicate} className="text-clay-dark hover:underline">📋 تكرار</button>
          <button onClick={onDelete} className="text-red-500 hover:underline">🗑️ حذف</button>
        </div>
      </div>
      <div className="space-y-2 text-xs">{children}</div>
    </>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-[11px] text-gray-600 mb-1">{label}</span>
      <input type="text" className="input text-xs" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

function NumField({
  label, value, onChange, step = 0.5, max, placeholder,
}: { label: string; value: number | undefined; onChange: (v: number | undefined) => void; step?: number; max?: number; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-[10px] text-gray-500 mb-0.5">{label}</span>
      <input type="number" min={0} step={step} max={max}
             value={value ?? ''}
             onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
             placeholder={placeholder}
             className="input ltr text-xs py-1" />
    </label>
  );
}

// ── PNG export ──────────────────────────────────────────────────

async function renderToPng(stage: HTMLDivElement, imgUrl: string): Promise<string> {
  const img = await loadImage(imgUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || stage.clientWidth;
  canvas.height = img.naturalHeight || stage.clientHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas2d unavailable');

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const stageRect = stage.getBoundingClientRect();
  const sx = canvas.width / stageRect.width;
  const sy = canvas.height / stageRect.height;
  const allChildren = Array.from(stage.querySelectorAll('div[style*="position: absolute"]')) as HTMLElement[];
  for (const el of allChildren) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const x = (r.left - stageRect.left) * sx;
    const y = (r.top - stageRect.top) * sy;
    const w = r.width * sx;
    const h = r.height * sy;
    const text = el.textContent?.trim() ?? '';
    if (!text) continue;

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.strokeStyle = '#a8896d';
    ctx.lineWidth = 2 * Math.min(sx, sy);
    roundRect(ctx, x, y, w, h, 10 * Math.min(sx, sy));
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2c2e3a';
    ctx.font = `bold ${Math.max(11, h * 0.4)}px Cairo, Tajawal, sans-serif`;
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
