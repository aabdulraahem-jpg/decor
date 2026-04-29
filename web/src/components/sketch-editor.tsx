'use client';

import { useEffect, useRef, useState } from 'react';
import { ELEMENT_TYPES, ElementKind, getAllElementKinds, getElementType } from '@/lib/elements';
import { uploadReferenceImage } from '@/lib/api';
import DrawClassifyPopover, { PendingDraw, ClassifyResult } from './draw-classify-popover';

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

export type MarkerKind = ElementKind | 'CAMERA' | 'DIMENSION' | 'RULER' | 'TEXT' | 'IMAGE_DECAL' | 'WALL_FREE';

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
  /** Display unit for this marker's dimensions ('m' default, 'cm', 'in') */
  unit?: 'm' | 'cm' | 'in';
  /** STAIRS — number of treads. */
  stepCount?: number;
  /** STAIRS — total rise from base floor to top of upper landing (m). */
  totalRiseMeters?: number;
  /** ELEVATOR — door direction in compass form (relative to plan north). */
  doorDirection?: 'N' | 'E' | 'S' | 'W';
  /** Wall thickness in meters (WALL_FREE / INTERIOR_WALL custom). */
  thicknessMeters?: number;
  /** Hex color for floor surface (PLATFORM, STAIRS). */
  floorColorHex?: string;
  /** Floor material/tile name (PLATFORM, STAIRS). */
  floorMaterial?: string;
  /** Marker is "stacked" on top of another marker (e.g. on a PLATFORM).
   * AI prompt then includes elevation + parent context. */
  parentMarkerId?: string;
  /** IMAGE_DECAL — hosted image URL (uploaded via /uploads/reference). */
  imageUrl?: string;
  /** Free description for the decal — placement intent, attachment. */
  decalAttachment?: string;
}

const UNITS = ['m', 'cm', 'in'] as const;
type Unit = typeof UNITS[number];

function unitLabel(u: Unit): string {
  if (u === 'cm') return 'سم';
  if (u === 'in') return 'بوصة';
  return 'م';
}
/** Convert a value entered in user-facing unit → meters for storage. */
function fromUnit(v: number | undefined, u: Unit | undefined): number | undefined {
  if (v === undefined || v === null || Number.isNaN(v)) return undefined;
  if (u === 'cm') return v / 100;
  if (u === 'in') return v / 39.3701;
  return v;
}
/** Convert a meters value → user-facing unit for display. */
function toUnit(v: number | undefined, u: Unit | undefined): number | undefined {
  if (v === undefined || v === null) return undefined;
  if (u === 'cm') return Math.round(v * 100);
  if (u === 'in') return Math.round(v * 39.3701 * 10) / 10;
  return Math.round(v * 100) / 100;
}

const RECT_KINDS: ReadonlyArray<ElementKind> = [
  'ANNEX', 'PERGOLA', 'POOL', 'CARPORT', 'COURTYARD', 'GRASS', 'BAIT_SHAR',
  'FENCE', 'WALKWAY', 'BOUNDARY_WALL', 'WALL_TOPPER',
  // Architectural
  'INTERIOR_WALL', 'WINDOW', 'STAIRS', 'CORRIDOR',
  // Doors — promoted so they have rotation + length/width handles
  'DOOR_GAP', 'DOOR_ARC',
  // Columns (rect-shape; round columns also use rect bbox so dragging size = diameter)
  'COLUMN_RECT', 'COLUMN_ROUND',
  // Levels + elevators
  'PLATFORM', 'ELEVATOR',
];
const SUPPORTS_ELEVATION: ReadonlyArray<ElementKind> = [
  'PERGOLA', 'CARPORT', 'WALL_TOPPER', 'BAIT_SHAR',
];
const SUPPORTS_WALL_ATTACH: ReadonlyArray<ElementKind> = [
  'WALL_TOPPER', 'PERGOLA', 'CARPORT',
];

/** Rect kinds beyond ElementKind — IMAGE_DECAL is a free-form pasted image. */
const NON_ELEMENT_RECT_KINDS: ReadonlyArray<MarkerKind> = ['IMAGE_DECAL', 'WALL_FREE'];
function isRectKind(k: MarkerKind): boolean {
  return RECT_KINDS.includes(k as ElementKind) || NON_ELEMENT_RECT_KINDS.includes(k);
}
/** Markers that support rect rotation (rotationDeg drives a CSS transform). */
function supportsRectRotation(k: MarkerKind): boolean {
  return isRectKind(k) && k !== 'COLUMN_ROUND';
}

/** "Container" elements — large bounded areas the user typically wants to
 * place children INSIDE (sur, ملحق, ساحة, عشب, مسبح…). When a tool is armed,
 * their fill goes pointer-events:none so the click falls through to the stage
 * and the new element drops INSIDE the container. The container's label badge
 * stays clickable so the user can still select the container itself. */
const CONTAINER_KINDS: ReadonlyArray<MarkerKind> = [
  'BOUNDARY_WALL', 'ANNEX', 'COURTYARD', 'GRASS', 'PLATFORM',
  'PERGOLA', 'BAIT_SHAR', 'POOL', 'CARPORT', 'FENCE', 'WALKWAY',
];
function isContainerKind(k: MarkerKind): boolean {
  return CONTAINER_KINDS.includes(k);
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
    case 'INTERIOR_WALL': return { w: 18, h: 2 };
    case 'WINDOW': return { w: 12, h: 2 };
    case 'STAIRS': return { w: 10, h: 14 };
    case 'CORRIDOR': return { w: 22, h: 5 };
    case 'COLUMN_ROUND': return { w: 4, h: 4 };
    case 'COLUMN_RECT': return { w: 4, h: 4 };
    case 'PLATFORM': return { w: 18, h: 12 };
    case 'ELEVATOR': return { w: 6, h: 6 };
    case 'DOOR_GAP': return { w: 6, h: 1.6 };
    case 'DOOR_ARC': return { w: 6, h: 1.6 };
    case 'IMAGE_DECAL': return { w: 14, h: 14 };
    case 'WALL_FREE': return { w: 22, h: 2 };
    default: return { w: 12, h: 8 };
  }
}

/** Snapping: when a moving rect's edge is within `THRESHOLD%` of any other
 * marker's edge OR of a page edge (0%, 50%, 100%), snap to it. */
const SNAP_THRESHOLD = 1.5; // percent
function snapMove(
  movedId: string,
  candidate: { x: number; y: number; w: number; h: number },
  others: SketchMarker[],
): { x: number; y: number; snappedX: boolean; snappedY: boolean } {
  let { x, y } = candidate;
  let snappedX = false;
  let snappedY = false;
  // Page edges + center are always-on snap targets so the user can hug the
  // canvas borders or center an element with no other reference markers.
  const pageGuides = [0, 50, 100];
  for (const g of pageGuides) {
    if (!snappedX) {
      if (Math.abs(x - g) < SNAP_THRESHOLD) { x = g; snappedX = true; }
      else if (Math.abs((x + candidate.w) - g) < SNAP_THRESHOLD) { x = g - candidate.w; snappedX = true; }
    }
    if (!snappedY) {
      if (Math.abs(y - g) < SNAP_THRESHOLD) { y = g; snappedY = true; }
      else if (Math.abs((y + candidate.h) - g) < SNAP_THRESHOLD) { y = g - candidate.h; snappedY = true; }
    }
  }
  const right = x + candidate.w;
  const bottom = y + candidate.h;
  for (const o of others) {
    if (o.id === movedId) continue;
    if (o.wPct === undefined || o.hPct === undefined) continue;
    const ol = o.xPct, or = o.xPct + o.wPct, ot = o.yPct, ob = o.yPct + o.hPct;
    // X-axis snaps
    if (!snappedX) {
      if (Math.abs(x - or) < SNAP_THRESHOLD) { x = or; snappedX = true; }
      else if (Math.abs(right - ol) < SNAP_THRESHOLD) { x = ol - candidate.w; snappedX = true; }
      else if (Math.abs(x - ol) < SNAP_THRESHOLD) { x = ol; snappedX = true; }
      else if (Math.abs(right - or) < SNAP_THRESHOLD) { x = or - candidate.w; snappedX = true; }
    }
    // Y-axis snaps
    if (!snappedY) {
      if (Math.abs(y - ob) < SNAP_THRESHOLD) { y = ob; snappedY = true; }
      else if (Math.abs(bottom - ot) < SNAP_THRESHOLD) { y = ot - candidate.h; snappedY = true; }
      else if (Math.abs(y - ot) < SNAP_THRESHOLD) { y = ot; snappedY = true; }
      else if (Math.abs(bottom - ob) < SNAP_THRESHOLD) { y = ob - candidate.h; snappedY = true; }
    }
    if (snappedX && snappedY) break;
  }
  return { x, y, snappedX, snappedY };
}

interface Props {
  sketchUrl: string;
  markers: SketchMarker[];
  onChange: (next: SketchMarker[]) => void;
  onExport?: (dataUrl: string) => void;
  /** When provided, an extra "use as sketch" button appears that exports the
   * current canvas (image + markers) to PNG and hands it to the parent. */
  onUseAsSketch?: (dataUrl: string) => void | Promise<void>;
  /** When the editor is hosting a generated grid background (canvas-studio
   * mode), the export should NOT include the grid — just markers on white. */
  blankCanvasMode?: boolean;
}

type DragState =
  | { kind: 'move'; id: string; offsetXPct: number; offsetYPct: number }
  | { kind: 'rotate'; id: string; cxPx: number; cyPx: number }
  | { kind: 'resize'; id: string; corner: 'NW' | 'NE' | 'SW' | 'SE' }
  | { kind: 'endpoint'; id: string; which: 'A' | 'B' }
  | { kind: 'zoom'; startX: number; startY: number; startZoom: number };

export default function SketchEditor({ sketchUrl, markers, onChange, onExport, onUseAsSketch, blankCanvasMode }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [armedTool, setArmedTool] = useState<MarkerKind | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imgDims, setImgDims] = useState<{ w: number; h: number } | null>(null);
  const [imgError, setImgError] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [exporting, setExporting] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [decalUploading, setDecalUploading] = useState(false);

  // ── Freehand classification flow ─────────────────────────────────
  // The user picks a draw tool (LINE / RECT), draws a shape via two clicks,
  // then a popover appears to classify the shape into an element kind with
  // default dimensions, unit, angle, and notes — all editable.
  const [drawTool, setDrawTool] = useState<'LINE' | 'RECT' | null>(null);
  const [drawSeed, setDrawSeed] = useState<{ xPct: number; yPct: number } | null>(null);
  const [pendingDraw, setPendingDraw] = useState<PendingDraw | null>(null);

  // ── Undo/redo history ─────────────────────────────────────
  // We maintain a snapshot stack of `markers` arrays. New markers state is
  // pushed by an effect after every external change. Undo/redo replay through
  // the parent's onChange so the parent stays the source of truth.
  const undoStack = useRef<SketchMarker[][]>([]);
  const redoStack = useRef<SketchMarker[][]>([]);
  const lastSnapshot = useRef<SketchMarker[]>(markers);
  useEffect(() => {
    if (markers !== lastSnapshot.current) {
      undoStack.current.push(lastSnapshot.current);
      // Cap history to last 50 entries to avoid memory creep.
      if (undoStack.current.length > 50) undoStack.current.shift();
      redoStack.current = [];
      lastSnapshot.current = markers;
    }
  }, [markers]);
  function doUndo() {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push(lastSnapshot.current);
    lastSnapshot.current = prev;
    onChange(prev);
  }
  function doRedo() {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(lastSnapshot.current);
    lastSnapshot.current = next;
    onChange(next);
  }
  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;
  /** Default unit for newly placed markers. Each marker carries its own. */
  const [defaultUnit, setDefaultUnit] = useState<Unit>('m');
  /** While placing a RULER: the first click endpoint in % */
  const [rulerSeed, setRulerSeed] = useState<{ xPct: number; yPct: number } | null>(null);

  const newId = () => Math.random().toString(36).slice(2, 9);

  // ── Place tool on image click ───────────────────────────────────
  function handleStageClick(e: React.MouseEvent) {
    // Critical: only place when the click was on the stage itself (or the
    // image which has pointer-events:none). Clicks bubbling up from a
    // marker, handle, or zoom grip would otherwise wrongly place duplicates.
    if (e.target !== e.currentTarget) return;
    // ── Draw-tool flow takes priority over the regular armed-tool flow ──
    // (both handled below from the same xPct/yPct since draw tools also use
    // a two-click model.)
    if (drawTool && containerRef.current) {
      const rectD = containerRef.current.getBoundingClientRect();
      const xPctD = ((e.clientX - rectD.left) / rectD.width) * 100;
      const yPctD = ((e.clientY - rectD.top) / rectD.height) * 100;
      if (xPctD < 0 || xPctD > 100 || yPctD < 0 || yPctD > 100) return;
      if (!drawSeed) {
        setDrawSeed({ xPct: xPctD, yPct: yPctD });
        return;
      }
      // Second click — finalize the shape
      if (drawTool === 'LINE') {
        setPendingDraw({
          shape: 'line',
          xPct: drawSeed.xPct, yPct: drawSeed.yPct,
          x2Pct: xPctD, y2Pct: yPctD,
        });
      } else {
        const x = Math.min(drawSeed.xPct, xPctD);
        const y = Math.min(drawSeed.yPct, yPctD);
        const w = Math.max(2, Math.abs(xPctD - drawSeed.xPct));
        const h = Math.max(2, Math.abs(yPctD - drawSeed.yPct));
        setPendingDraw({ shape: 'rect', xPct: x, yPct: y, wPct: w, hPct: h });
      }
      setDrawSeed(null);
      setDrawTool(null);
      return;
    }

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
      setArmedTool(null); // disarm after placing one — to add another, pick the tool again
      return;
    }

    if (armedTool === 'IMAGE_DECAL') return; // upload-driven, not placement-driven
    const id = newId();
    const marker: SketchMarker = {
      id,
      kind: armedTool,
      xPct, yPct,
      rotationDeg:
        armedTool === 'CAMERA' || supportsRectRotation(armedTool) ? 0 : undefined,
      variant:
        armedTool === 'CAMERA' || armedTool === 'DIMENSION' || armedTool === 'TEXT' || armedTool === 'WALL_FREE'
          ? undefined
          : getElementType(armedTool as ElementKind)?.variants[0],
      text: armedTool === 'DIMENSION' ? `5×4 ${unitLabel(defaultUnit)}`
          : armedTool === 'TEXT' ? 'مجلس'
          : '',
      unit: defaultUnit,
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
    // One-shot: tool auto-disarms after a single placement so a stray click
    // doesn't add an unwanted duplicate. To add another, re-pick the tool.
    setArmedTool(null);
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
        let newX = clamp(p.xPct - drag.offsetXPct, 1, Math.max(1, 99 - w));
        let newY = clamp(p.yPct - drag.offsetYPct, 1, Math.max(1, 99 - h));
        // Snap rect markers to neighbours' edges for fast precise alignment.
        if (isRectKind(m.kind) && w > 0 && h > 0) {
          const s = snapMove(m.id, { x: newX, y: newY, w, h }, markers);
          newX = s.x; newY = s.y;
        }
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
        const w = m.wPct ?? 0, h = m.hPct ?? 0;
        if (w === 0 || h === 0) return m;
        const minSize = 2;
        const rot = m.rotationDeg ?? 0;
        const rad = (rot * Math.PI) / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const cx = m.xPct + w / 2;
        const cy = m.yPct + h / 2;
        // Opposite corner in the local (unrotated) frame, relative to center.
        const halfW = w / 2, halfH = h / 2;
        const oppLocal = (drag.corner === 'NW' ? { x: halfW, y: halfH }
          : drag.corner === 'NE' ? { x: -halfW, y: halfH }
          : drag.corner === 'SW' ? { x: halfW, y: -halfH }
          : { x: -halfW, y: -halfH });
        // Opposite corner in canvas coords (apply rotation around center).
        const oppCanvasX = cx + oppLocal.x * cos - oppLocal.y * sin;
        const oppCanvasY = cy + oppLocal.x * sin + oppLocal.y * cos;
        // Pointer in canvas % = drag corner's new position.
        const dragX = clamp(p.xPct, 0, 100);
        const dragY = clamp(p.yPct, 0, 100);
        // Diagonal vector in canvas, then inverse-rotate to local frame.
        const vx = dragX - oppCanvasX;
        const vy = dragY - oppCanvasY;
        const lvx =  vx * cos + vy * sin;
        const lvy = -vx * sin + vy * cos;
        const newW = Math.max(minSize, Math.abs(lvx));
        const newH = Math.max(minSize, Math.abs(lvy));
        // New AABB top-left (un-rotated bbox); rotation re-applied via CSS.
        const newCx = (oppCanvasX + dragX) / 2;
        const newCy = (oppCanvasY + dragY) / 2;
        const newX = clamp(newCx - newW / 2, 0, 100 - newW);
        const newY = clamp(newCy - newH / 2, 0, 100 - newH);
        return { ...m, xPct: newX, yPct: newY, wPct: newW, hPct: newH };
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
        setDrawTool(null);
        setDrawSeed(null);
        setPendingDraw(null);
        return;
      }
      // Ctrl/Cmd+Z = undo, Ctrl/Cmd+Shift+Z or Ctrl+Y = redo
      if ((e.ctrlKey || e.metaKey) && !isInputFocused()) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          if (e.shiftKey) doRedo(); else doUndo();
          return;
        }
        if (e.key === 'y' || e.key === 'Y') { e.preventDefault(); doRedo(); return; }
      }
      if (!selectedId || isInputFocused()) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onChange(markers.filter((m) => m.id !== selectedId));
        setSelectedId(null);
        return;
      }
      // Arrow-key nudge (selected marker): 0.5% step, 5% with Shift
      const step = e.shiftKey ? 5 : 0.5;
      const arrowDelta: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0], ArrowRight: [step, 0],
        ArrowUp: [0, -step], ArrowDown: [0, step],
      };
      const d = arrowDelta[e.key];
      if (d) {
        e.preventDefault();
        onChange(markers.map((m) => m.id === selectedId
          ? { ...m, xPct: clamp(m.xPct + d[0], 0, 100), yPct: clamp(m.yPct + d[1], 0, 100) }
          : m));
        return;
      }
      // R / Shift+R = rotate ±5° on selected (rect kinds)
      if ((e.key === 'r' || e.key === 'R')) {
        const m = markers.find((x) => x.id === selectedId);
        if (m && (supportsRectRotation(m.kind) || m.kind === 'CAMERA')) {
          e.preventDefault();
          const dRot = e.shiftKey ? -5 : 5;
          onChange(markers.map((x) => x.id === selectedId
            ? { ...x, rotationDeg: ((x.rotationDeg ?? 0) + dRot) }
            : x));
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const allKinds = getAllElementKinds();
  const interiorTools = allKinds.filter((k) => getElementType(k)?.category === 'INTERIOR');
  const exteriorTools = allKinds.filter((k) => getElementType(k)?.category === 'EXTERIOR');

  return (
    <div className="space-y-1.5">
      {/* Toolbar — placed directly above the canvas with minimal spacing so the
          element buttons stay close to the paper. Sticky so they remain in
          reach while the user scrolls within the editor's tall canvas. */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2.5 space-y-1.5 shadow-sm sticky top-2 z-30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm font-bold text-navy">🎯 ضع العناصر مباشرة على الاسكتش</div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-gray-500">📐 الوحدة:</span>
            <div className="flex bg-cream rounded-full p-0.5 gap-0.5">
              {UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setDefaultUnit(u)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] transition-colors ${
                    defaultUnit === u ? 'bg-clay text-white' : 'text-navy hover:bg-white'
                  }`}
                >
                  {unitLabel(u)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="text-[11px] text-gray-500">
          ضع عنصراً واحداً بكل اختيار — لإضافة عنصر آخر اختر الأداة من جديد · Esc للإلغاء · Delete لحذف العنصر المحدّد
        </div>

        {/* Special tools */}
        <div>
          <div className="text-[11px] font-bold text-gray-500 mb-1">🛠️ أدوات</div>
          <div className="flex flex-wrap gap-1.5">
            <ToolBtn armed={armedTool === 'CAMERA'} onClick={() => { setArmedTool(armedTool === 'CAMERA' ? null : 'CAMERA'); setRulerSeed(null); }}>📷 كاميرا</ToolBtn>
            <ToolBtn armed={armedTool === 'TEXT'} onClick={() => { setArmedTool(armedTool === 'TEXT' ? null : 'TEXT'); setRulerSeed(null); }}>🔤 نص (اسم مكان)</ToolBtn>
            <ToolBtn armed={armedTool === 'DIMENSION'} onClick={() => { setArmedTool(armedTool === 'DIMENSION' ? null : 'DIMENSION'); setRulerSeed(null); }}>📏 مقاس</ToolBtn>
            <ToolBtn armed={armedTool === 'RULER'} onClick={() => { setArmedTool(armedTool === 'RULER' ? null : 'RULER'); setRulerSeed(null); setDrawTool(null); setDrawSeed(null); }}>📐 مسطرة (مسافة)</ToolBtn>
            <ToolBtn armed={armedTool === 'WALL_FREE'} onClick={() => { setArmedTool(armedTool === 'WALL_FREE' ? null : 'WALL_FREE'); setRulerSeed(null); setDrawTool(null); setDrawSeed(null); }}>🧱 جدار حر</ToolBtn>
            {/* Draw → classify flow: draw a line / rect, then a popover lets the
                user pick which element kind it represents with default dims. */}
            <button
              type="button"
              onClick={() => { setDrawTool(drawTool === 'LINE' ? null : 'LINE'); setDrawSeed(null); setArmedTool(null); setRulerSeed(null); }}
              className={`px-2.5 py-1 rounded-full text-[12px] border-2 transition-colors ${
                drawTool === 'LINE' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-400 hover:bg-emerald-50'
              }`}
            >✏️ ارسم خطّاً</button>
            <button
              type="button"
              onClick={() => { setDrawTool(drawTool === 'RECT' ? null : 'RECT'); setDrawSeed(null); setArmedTool(null); setRulerSeed(null); }}
              className={`px-2.5 py-1 rounded-full text-[12px] border-2 transition-colors ${
                drawTool === 'RECT' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-400 hover:bg-emerald-50'
              }`}
            >▭ ارسم مستطيلاً</button>
            <label className={`px-2.5 py-1 rounded-full text-[12px] border cursor-pointer transition-colors ${
              decalUploading ? 'bg-clay/30 text-white border-clay' : 'bg-white text-navy border-gray-200 hover:border-clay/40 hover:text-clay-dark'
            }`}>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (ev) => {
                  const f = ev.target.files?.[0];
                  ev.target.value = '';
                  if (!f) return;
                  setDecalUploading(true);
                  try {
                    const { url } = await uploadReferenceImage(f);
                    const id = newId();
                    const ds = defaultSizePct('IMAGE_DECAL');
                    const newMarker: SketchMarker = {
                      id, kind: 'IMAGE_DECAL',
                      xPct: 50 - ds.w / 2, yPct: 50 - ds.h / 2,
                      wPct: ds.w, hPct: ds.h,
                      imageUrl: url, rotationDeg: 0, unit: defaultUnit,
                      decalAttachment: '',
                    };
                    onChange([...markers, newMarker]);
                    setSelectedId(id);
                  } catch {/* swallow — UI shows nothing changed */} finally {
                    setDecalUploading(false);
                  }
                }}
              />
              {decalUploading ? '⏳ يُرفَع...' : '🖼️ ألصق صورة'}
            </label>
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
              : <>اضغط على المكان المرغوب لوضع <strong>{toolLabel(armedTool)}</strong> (مرّة واحدة فقط — للمزيد اختر الأداة من جديد). Esc للإلغاء.</>}
          </div>
        )}
        {drawTool && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-xs text-emerald-800">
            {drawTool === 'LINE' ? '✏️ ارسم خطّاً: ' : '▭ ارسم مستطيلاً: '}
            {drawSeed ? 'انقر النقطة الثانية لإكمال الرسم.' : 'انقر النقطة الأولى للبدء.'}
            {' '}بعد الرسم ستفتح نافذة لاختيار نوع العنصر مع المقاسات الافتراضية. Esc للإلغاء.
          </div>
        )}
      </div>

      {/* Canvas + Inspector */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-3">
        <div className="space-y-2">
          {/* Zoom + history controls */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* Undo / Redo */}
            <div className="flex items-center gap-1 border-l border-gray-200 pl-2 mr-1">
              <button
                onClick={doUndo}
                disabled={!canUndo}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 hover:border-clay text-navy disabled:opacity-30"
                title="تراجع (Ctrl+Z)"
              >↶</button>
              <button
                onClick={doRedo}
                disabled={!canRedo}
                className="w-7 h-7 rounded-full bg-white border border-gray-200 hover:border-clay text-navy disabled:opacity-30"
                title="إعادة (Ctrl+Y أو Ctrl+Shift+Z)"
              >↷</button>
            </div>
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
          <div className="text-[10px] text-gray-500 leading-relaxed">
            ⌨️ اختصارات: أسهم = حرّك (Shift = خطوة كبيرة) · R = دوّر 5° (Shift+R = -5°) · Del = حذف · Ctrl+Z/Y = تراجع/إعادة · Esc = إلغاء
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
              {/* Draw seed indicator (line or rect — first click) */}
              {drawSeed && drawTool && (
                <div
                  className="absolute w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow pointer-events-none animate-pulse"
                  style={{ left: `${drawSeed.xPct}%`, top: `${drawSeed.yPct}%`, transform: 'translate(-50%, -50%)' }}
                />
              )}

              {/* Markers overlay — each marker decides its own pointer-events based
                  on the armed tool's kind. A container only passes clicks through when the
                  armed tool is a DIFFERENT kind (so you can place children inside without
                  duplicating). Clicking/dragging the label badge always selects/moves. */}
              {markers.map((m) => (
                <MarkerView
                  key={m.id}
                  marker={m}
                  isSelected={selectedId === m.id}
                  armedKind={armedTool}
                  onMoveStart={(e) => startMove(e, m.id)}
                  onSelect={() => setSelectedId(m.id)}
                  onRotateStart={(e, pivot) => startRotate(e, pivot ?? m)}
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
              allMarkers={markers}
              onAddRelated={(parent, kind) => {
                const id = newId();
                const ds = defaultSizePct(kind);
                // Drop the new marker on the parent's center so it aligns visually
                const cx = parent.xPct + (parent.wPct ?? 0) / 2;
                const cy = parent.yPct + (parent.hPct ?? 0) / 2;
                const next: SketchMarker = {
                  id,
                  kind,
                  xPct: clamp(cx - ds.w / 2, 0, 100 - ds.w),
                  yPct: clamp(cy - ds.h / 2, 0, 100 - ds.h),
                  wPct: ds.w,
                  hPct: ds.h,
                  rotationDeg: parent.rotationDeg ?? 0,
                  parentMarkerId: parent.id,
                  variant: getElementType(kind as ElementKind)?.variants[0],
                  unit: parent.unit ?? 'm',
                };
                onChange([...markers, next]);
                setSelectedId(id);
              }}
            />
          ) : (
            <div className="text-center text-gray-400 text-xs py-8 px-3 leading-relaxed">
              📌 اختر أداة من الأعلى ثم انقر على الاسكتش لوضعها.
              <br />الأداة تنطفئ بعد إضافة عنصر واحد — لإضافة آخر اختر الأداة من جديد.
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
            {onUseAsSketch && (
              <button
                type="button"
                onClick={async () => {
                  if (!containerRef.current) return;
                  setExporting(true);
                  try {
                    const dataUrl = await renderToPng(containerRef.current, sketchUrl);
                    await onUseAsSketch(dataUrl);
                  } finally { setExporting(false); }
                }}
                disabled={exporting || markers.length === 0}
                className="btn-primary text-xs flex-1 disabled:opacity-50"
              >
                {exporting ? '⏳ يحضّر...' : '🚀 استخدمه كاسكتش'}
              </button>
            )}
          </div>
          <div className="text-[10px] text-gray-400 mt-2 leading-relaxed">
            عناصر: {markers.length} {imgDims ? `· ${imgDims.w}×${imgDims.h} px` : ''}
          </div>
        </div>
      </div>

      {/* Draw → classify popover (mobile-friendly bottom-sheet, desktop modal) */}
      {pendingDraw && (
        <DrawClassifyPopover
          pending={pendingDraw}
          defaultUnit={defaultUnit}
          onConfirm={(r) => {
            const id = newId();
            const marker = drawResultToMarker(id, pendingDraw, r);
            onChange([...markers, marker]);
            setSelectedId(id);
            setPendingDraw(null);
          }}
          onCancel={() => setPendingDraw(null)}
        />
      )}
    </div>
  );
}

/** Convert a freshly-drawn shape + classification into a SketchMarker. */
function drawResultToMarker(id: string, p: PendingDraw, r: ClassifyResult): SketchMarker {
  // Compute the marker's AABB and rotation from the drawn shape:
  // - LINE: thin rect along the line's axis, with the line as its long side
  // - RECT: the AABB the user dragged out
  if (p.shape === 'line' && p.x2Pct !== undefined && p.y2Pct !== undefined) {
    const dx = p.x2Pct - p.xPct;
    const dy = p.y2Pct - p.yPct;
    const len = Math.max(2, Math.hypot(dx, dy));
    const cx = (p.xPct + p.x2Pct) / 2;
    const cy = (p.yPct + p.y2Pct) / 2;
    // Line elements get a small thickness so they're visible after rotation.
    const thickness = 2.5;
    return {
      id,
      kind: r.kind,
      xPct: clamp(cx - len / 2, 0, 100 - len),
      yPct: clamp(cy - thickness / 2, 0, 100 - thickness),
      wPct: len,
      hPct: thickness,
      rotationDeg: r.rotationDeg ?? Math.round((Math.atan2(dy, dx) * 180) / Math.PI),
      variant: r.variant,
      lengthMeters: r.lengthMeters,
      widthMeters: r.widthMeters,
      heightMeters: r.heightMeters,
      areaSqm: r.areaSqm,
      text: r.notes,
      unit: r.unit,
    };
  }
  // RECT
  return {
    id,
    kind: r.kind,
    xPct: p.xPct,
    yPct: p.yPct,
    wPct: p.wPct ?? 12,
    hPct: p.hPct ?? 8,
    rotationDeg: r.rotationDeg ?? 0,
    variant: r.variant,
    lengthMeters: r.lengthMeters,
    widthMeters: r.widthMeters,
    heightMeters: r.heightMeters,
    areaSqm: r.areaSqm,
    text: r.notes,
    unit: r.unit,
  };
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
          const t = getElementType(k);
          if (!t) return null;
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
  return getElementType(k as ElementKind)?.label ?? String(k);
}

function MarkerView({
  marker, isSelected, armedKind,
  onMoveStart, onSelect, onRotateStart, onResizeStart, onEndpointStart,
}: {
  marker: SketchMarker;
  isSelected: boolean;
  /** Currently-armed tool kind (or null). Used to decide pass-through behaviour:
   * containers only pass clicks through when the armed kind is DIFFERENT
   * from the container's own kind, so you can drop a column inside a courtyard
   * but clicking your own courtyard selects/moves it instead of duplicating. */
  armedKind: MarkerKind | null;
  onMoveStart: (e: React.PointerEvent) => void;
  onSelect: () => void;
  onRotateStart: (e: React.PointerEvent, pivot?: SketchMarker) => void;
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

  // ── RECT element marker (incl. IMAGE_DECAL, WALL_FREE) ──────
  const isDecal = marker.kind === 'IMAGE_DECAL';
  const isWallFree = marker.kind === 'WALL_FREE';
  const t = !isDecal && !isWallFree ? getElementType(marker.kind as ElementKind) : null;
  if (!t && !isDecal && !isWallFree) return null;

  if (isRectKind(marker.kind) && marker.wPct !== undefined && marker.hPct !== undefined) {
    const isRound = marker.kind === 'COLUMN_ROUND';
    const rot = marker.rotationDeg ?? 0;
    const rotatable = supportsRectRotation(marker.kind);
    const labelText = t ? t.label : isDecal ? 'صورة' : 'جدار';
    const labelIcon = t ? t.icon : isDecal ? '🖼️' : '🧱';
    const elevTag =
      marker.elevationMeters !== undefined ? `↑ ${marker.elevationMeters} م`
        : (marker.kind === 'PLATFORM' && marker.heightMeters !== undefined) ? `↑ ${marker.heightMeters} م`
        : null;
    // Containers pass clicks through ONLY when a different-kind tool is armed
    // — this lets the user drop CHILDREN inside a courtyard without duplicating
    // the courtyard itself. Clicking the container's own kind = select/move.
    const isContainer = isContainerKind(marker.kind);
    const passThrough = !!armedKind && isContainer && armedKind !== marker.kind;
    return (
      <>
        <div
          onPointerDown={passThrough ? undefined : onMoveStart}
          onClick={passThrough ? undefined : (e) => { e.stopPropagation(); onSelect(); }}
          style={{
            position: 'absolute',
            left: `${marker.xPct}%`, top: `${marker.yPct}%`,
            width: `${marker.wPct}%`, height: `${marker.hPct}%`,
            cursor: passThrough ? 'crosshair' : 'move',
            touchAction: 'none',
            zIndex: isSelected ? 25 : (isDecal ? 9 : 10),
            transform: rotatable && rot ? `rotate(${rot}deg)` : undefined,
            transformOrigin: 'center',
            transition: isSelected ? 'none' : 'transform 140ms cubic-bezier(0.4, 0, 0.2, 1), left 100ms ease-out, top 100ms ease-out',
            background: isDecal ? undefined
              : marker.floorColorHex ? `${marker.floorColorHex}33` : undefined,
            pointerEvents: passThrough ? 'none' : undefined,
          }}
          className={`${isRound ? 'rounded-full' : 'rounded-md'} ${
            isSelected ? 'border-2 border-clay ring-2 ring-clay/30' : 'border-2 border-dashed border-clay/60 hover:border-clay'
          } ${isDecal ? 'overflow-hidden bg-white' : isWallFree ? 'bg-navy/40' : marker.floorColorHex ? '' : 'bg-clay/8 hover:bg-clay/12'} transition-colors`}
        >
          {isDecal && marker.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={marker.imageUrl}
              alt=""
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          )}
          {!isDecal && (
            <div
              onPointerDown={(e) => { e.stopPropagation(); onMoveStart(e); }}
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className="absolute top-1 right-1 bg-white/95 border border-clay/40 rounded px-1.5 py-0.5 text-[10px] font-bold text-navy whitespace-nowrap shadow-sm hover:bg-clay hover:text-white transition-colors flex items-center gap-1 cursor-move select-none"
              style={{ pointerEvents: 'auto', zIndex: 26, touchAction: 'none' }}
              title="اسحب لتحريك العنصر — انقر لتحديده · للتكرار اختر العنصر من شريط الأدوات"
            >
              <span>{labelIcon}</span>
              <span>{labelText}</span>
              {marker.parentMarkerId && <span className="text-[9px] text-emerald-700">⤴</span>}
            </div>
          )}
          {marker.kind === 'ELEVATOR' && marker.doorDirection && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none">
              باب: {({ N: 'شمال', E: 'شرق', S: 'جنوب', W: 'غرب' } as Record<string, string>)[marker.doorDirection]}
            </div>
          )}
          {elevTag && (
            <div className="absolute bottom-1 left-1 bg-navy text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none">
              {elevTag}
            </div>
          )}
        </div>
        {/* Resize + rotation handles — wrapped in a rotation container so they
         * sit at the visually rotated corners of the shape, not at AABB corners. */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              left: `${marker.xPct}%`,
              top: `${marker.yPct}%`,
              width: `${marker.wPct}%`,
              height: `${marker.hPct}%`,
              transform: rotatable && rot ? `rotate(${rot}deg)` : undefined,
              transformOrigin: 'center',
              pointerEvents: 'none',
              zIndex: 28,
            }}
          >
            {(['NW', 'NE', 'SW', 'SE'] as const).map((c) => {
              const lx = c.endsWith('W') ? '0%' : '100%';
              const ly = c.startsWith('N') ? '0%' : '100%';
              const cur = c === 'NW' || c === 'SE' ? 'nwse-resize' : 'nesw-resize';
              return (
                <div
                  key={c}
                  onPointerDown={(e) => onResizeStart(e, c)}
                  className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-clay shadow"
                  style={{
                    left: lx, top: ly,
                    transform: 'translate(-50%, -50%)',
                    cursor: cur, touchAction: 'none',
                    pointerEvents: 'auto',
                  }}
                />
              );
            })}
            {/* Rotation handle — above top-center of the rect, in local frame */}
            {rotatable && (
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const cx = marker.xPct + (marker.wPct ?? 0) / 2;
                  const cy = marker.yPct + (marker.hPct ?? 0) / 2;
                  onRotateStart(e, { ...marker, xPct: cx, yPct: cy });
                }}
                className="absolute w-4 h-4 rounded-full bg-clay border-2 border-white cursor-grab shadow-md"
                style={{
                  left: '50%',
                  top: '-14px',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto',
                  touchAction: 'none',
                }}
                title="دوّر العنصر"
              />
            )}
          </div>
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
        <span className="text-base leading-none">{t?.icon ?? '📍'}</span>
        <span className="text-[11px] font-bold text-navy whitespace-nowrap">{t?.label ?? String(marker.kind)}</span>
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
  marker, onChange, onDelete, allMarkers, onAddRelated,
}: {
  marker: SketchMarker;
  onChange: (patch: Partial<SketchMarker>) => void;
  onDelete: () => void;
  allMarkers: SketchMarker[];
  /** Quick-add a child element anchored to this marker (e.g. door on wall). */
  onAddRelated: (parent: SketchMarker, kind: MarkerKind) => void;
}) {
  // ── IMAGE_DECAL ──
  if (marker.kind === 'IMAGE_DECAL') {
    const platforms = allMarkers.filter((m) => m.kind === 'PLATFORM');
    return (
      <Wrap title="🖼️ صورة ملصقة" onDelete={onDelete}>
        {marker.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={marker.imageUrl} alt="" className="w-full max-h-32 object-contain rounded-lg bg-cream" />
        )}
        <div>
          <label className="block text-[11px] text-gray-600 mb-1">زاوية الدوران: <strong>{marker.rotationDeg ?? 0}°</strong></label>
          <input type="range" min={-180} max={180} step={5} value={marker.rotationDeg ?? 0}
                 onChange={(e) => onChange({ rotationDeg: Number(e.target.value) })}
                 className="w-full accent-clay" />
        </div>
        <Field
          label="الالتصاق (للذكاء)"
          value={marker.decalAttachment ?? ''}
          onChange={(v) => onChange({ decalAttachment: v.slice(0, 200) })}
          placeholder="مثال: الصق على الجدار الشمالي · بجانب الكنبة · فوق الطاولة"
        />
        <ParentPicker marker={marker} candidates={platforms} onChange={onChange} />
        <p className="text-[10px] text-gray-500 leading-relaxed">
          الذكاء سيستخدم هذه الصورة كمرجع بصري ويضعها في المكان المحدّد على التصميم النهائي.
        </p>
      </Wrap>
    );
  }
  // ── WALL_FREE ──
  if (marker.kind === 'WALL_FREE') {
    const u = marker.unit ?? 'm';
    const ul = unitLabel(u);
    return (
      <Wrap title="🧱 جدار حر" onDelete={onDelete}>
        <div className="grid grid-cols-3 gap-1.5">
          <UnitNumField label="↔️ الطول" unit={ul} unitKey={u} value={marker.lengthMeters} onChange={(v) => onChange({ lengthMeters: v })} />
          <UnitNumField label="📐 السمك" unit={ul} unitKey={u} value={marker.thicknessMeters} onChange={(v) => onChange({ thicknessMeters: v })} />
          <UnitNumField label="↕️ الارتفاع" unit={ul} unitKey={u} value={marker.heightMeters} onChange={(v) => onChange({ heightMeters: v })} />
        </div>
        <div>
          <label className="block text-[11px] text-gray-600 mb-1">زاوية الجدار: <strong>{marker.rotationDeg ?? 0}°</strong></label>
          <input type="range" min={-180} max={180} step={1} value={marker.rotationDeg ?? 0}
                 onChange={(e) => onChange({ rotationDeg: Number(e.target.value) })}
                 className="w-full accent-clay" />
        </div>
        <Field label="مادة الجدار" value={marker.variant ?? ''} onChange={(v) => onChange({ variant: v.slice(0, 80) })} placeholder="مثال: بلوك ٢٠ سم، طلاء أبيض" />
        <WallQuickAdd parent={marker} onAddRelated={onAddRelated} kindHint="wall" />
      </Wrap>
    );
  }
  if (marker.kind === 'CAMERA') {
    return (
      <Wrap title="📷 كاميرا" onDelete={onDelete}>
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
      <Wrap title="📏 مقاس" onDelete={onDelete}>
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
      <Wrap title="🔤 اسم/نص" onDelete={onDelete}>
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
      <Wrap title="📐 مسطرة (مسافة)" onDelete={onDelete}>
        <Field label="القيمة المعروضة" value={marker.text ?? ''} onChange={(v) => onChange({ text: v.slice(0, 40) })} placeholder="مثال: 3.5 م" />
        <NumField label="المسافة الفعلية (متر)" value={marker.lengthMeters} onChange={(v) => onChange({ lengthMeters: v, text: v ? `${v} م` : marker.text })} />
        <p className="text-[10px] text-gray-500 leading-relaxed">اسحب أيّ من النقطتَين لتحريك طرف المسطرة، أو اسحب التسمية في الوسط لتحريك المسطرة كاملةً.</p>
      </Wrap>
    );
  }

  const t = getElementType(marker.kind as ElementKind);
  if (!t) return null;
  const isRect = isRectKind(marker.kind);
  const supportsElevation = SUPPORTS_ELEVATION.includes(marker.kind);
  const supportsWallAttach = SUPPORTS_WALL_ATTACH.includes(marker.kind);
  const u = marker.unit ?? 'm';
  const ul = unitLabel(u);

  return (
    <Wrap title={`${t.icon} ${t.label}`} onDelete={onDelete}>
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

      {/* Per-marker unit override */}
      <div className="flex items-center gap-2 text-[11px]">
        <span className="text-gray-500">وحدة المقاس:</span>
        <div className="flex bg-cream rounded-full p-0.5 gap-0.5">
          {UNITS.map((un) => (
            <button
              key={un} type="button"
              onClick={() => onChange({ unit: un })}
              className={`px-2.5 py-0.5 rounded-full text-[11px] transition-colors ${u === un ? 'bg-clay text-white' : 'text-navy hover:bg-white'}`}
            >
              {unitLabel(un)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {t.askLength && <UnitNumField label={`${(t.lengthLabel ?? '📏 الطول').replace(/\s*\(?[مﻡ]\)?$/,'')}`} unit={ul} value={marker.lengthMeters} unitKey={u} onChange={(v) => onChange({ lengthMeters: v })} />}
        {t.askWidth && <UnitNumField label="↔️ العرض" unit={ul} value={marker.widthMeters} unitKey={u} onChange={(v) => onChange({ widthMeters: v })} />}
        {t.askHeight && <UnitNumField label={`${(t.heightLabel ?? '↕️ الارتفاع').replace(/\s*\(?[مﻡ]\)?$/,'')}`} unit={ul} value={marker.heightMeters} unitKey={u} onChange={(v) => onChange({ heightMeters: v })} />}
        {t.askArea && <NumField label="📐 المساحة (م²)" value={marker.areaSqm} onChange={(v) => onChange({ areaSqm: v })} placeholder="بالمتر المربع" />}
        {t.askGlassPercent && <NumField label="🪟 زجاج %" value={marker.glassPercent} onChange={(v) => onChange({ glassPercent: v })} max={100} step={5} />}
        {supportsElevation && (
          <UnitNumField label="⬆️ عن الأرض" unit={ul} unitKey={u} value={marker.elevationMeters} onChange={(v) => onChange({ elevationMeters: v })}
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

      {/* Stairs-specific: step count + total rise + floor color */}
      {marker.kind === 'STAIRS' && (
        <div className="rounded-lg bg-cream/50 border border-clay/20 p-2 space-y-1.5">
          <div className="text-[11px] font-bold text-navy">🪜 تفاصيل الدرج</div>
          <div className="grid grid-cols-2 gap-1.5">
            <NumField label="عدد الدرجات" value={marker.stepCount} step={1} onChange={(v) => onChange({ stepCount: v })} placeholder="مثال: 12" />
            <UnitNumField label="↕️ الارتفاع الكلّي" unit={ul} unitKey={u}
                          value={marker.totalRiseMeters} onChange={(v) => onChange({ totalRiseMeters: v })}
                          placeholder="من الأرض حتى المستوى الأعلى" />
          </div>
          <FloorPicker marker={marker} onChange={onChange} />
        </div>
      )}

      {/* Platform-specific: floor color/material + parent → links elements above it */}
      {marker.kind === 'PLATFORM' && (
        <div className="rounded-lg bg-emerald-50/60 border border-emerald-200 p-2 space-y-1.5">
          <div className="text-[11px] font-bold text-emerald-700">🟫 المستوى المرتفع</div>
          <p className="text-[10px] text-gray-600 leading-relaxed">
            أيّ عنصر تضعه فوق هذا المستوى يمكن ربطه به (انقر العنصر ثم اختر هذا المستوى من «على مستوى»).
            الذكاء سيُولّده على ارتفاع المستوى تلقائياً.
          </p>
          <FloorPicker marker={marker} onChange={onChange} />
        </div>
      )}

      {/* Elevator-specific: door direction + width */}
      {marker.kind === 'ELEVATOR' && (
        <div className="rounded-lg bg-blue-50/50 border border-blue-200 p-2 space-y-1.5">
          <div className="text-[11px] font-bold text-blue-700">🛗 اتجاه باب المصعد</div>
          <div className="grid grid-cols-4 gap-1">
            {(['N', 'E', 'S', 'W'] as const).map((d) => {
              const labels: Record<string, string> = { N: '⬆️ شمال', E: '➡️ شرق', S: '⬇️ جنوب', W: '⬅️ غرب' };
              const sel = marker.doorDirection === d;
              return (
                <button key={d} type="button" onClick={() => onChange({ doorDirection: d })}
                        className={`px-1.5 py-1 rounded text-[10px] border transition-colors ${sel ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200 hover:border-blue-400'}`}>
                  {labels[d]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Rotation slider — for any rect that supports rotation */}
      {isRect && supportsRectRotation(marker.kind) && (
        <div>
          <label className="block text-[11px] text-gray-600 mb-1">زاوية الدوران: <strong>{marker.rotationDeg ?? 0}°</strong></label>
          <input type="range" min={-180} max={180} step={1} value={marker.rotationDeg ?? 0}
                 onChange={(e) => onChange({ rotationDeg: Number(e.target.value) })}
                 className="w-full accent-clay" />
        </div>
      )}

      {/* Parent linker — place this marker on top of a PLATFORM. */}
      <ParentPicker marker={marker} candidates={allMarkers.filter((x) => x.id !== marker.id && x.kind === 'PLATFORM')} onChange={onChange} />

      {isRect && marker.wPct !== undefined && marker.hPct !== undefined && (
        <div className="text-[10px] text-gray-500 bg-cream/40 rounded px-2 py-1">
          📍 على الاسكتش: {marker.wPct.toFixed(0)}% × {marker.hPct.toFixed(0)}%
          <span className="block opacity-80">اسحب الأركان الأربعة لتغيير المقاس بصرياً، أو الدائرة العلويّة لتدوير العنصر.</span>
        </div>
      )}

      <Field label="ملاحظات" value={marker.text ?? ''} onChange={(v) => onChange({ text: v.slice(0, 200) })} placeholder={t.notesPlaceholder} />

      {/* Quick-add helpers — wall/sur/fence/platform get contextual buttons. */}
      <WallQuickAdd
        parent={marker}
        onAddRelated={onAddRelated}
        kindHint={
          marker.kind === 'INTERIOR_WALL' ? 'wall'
            : marker.kind === 'BOUNDARY_WALL' ? 'boundary'
            : marker.kind === 'FENCE' ? 'fence'
            : marker.kind === 'PLATFORM' ? 'platform'
            : null
        }
      />
    </Wrap>
  );
}

function Wrap({
  title, children, onDelete,
}: { title: string; children: React.ReactNode; onDelete: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold text-navy text-sm">{title}</div>
        <div className="flex items-center gap-1.5 text-[11px]">
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

/** Numeric field that displays in the user's chosen unit but stores in meters. */
function UnitNumField({
  label, unit, unitKey, value, onChange, placeholder,
}: {
  label: string;
  unit: string;            // user-facing label (سم/م/بوصة)
  unitKey: Unit;           // 'm' | 'cm' | 'in'
  value: number | undefined; // stored in meters
  onChange: (metersValue: number | undefined) => void;
  placeholder?: string;
}) {
  const display = value === undefined ? '' : String(toUnit(value, unitKey));
  const step = unitKey === 'cm' ? 5 : unitKey === 'in' ? 0.5 : 0.1;
  return (
    <label className="block">
      <span className="block text-[10px] text-gray-500 mb-0.5">{label} ({unit})</span>
      <input type="number" min={0} step={step}
             value={display}
             onChange={(e) => {
               if (e.target.value === '') return onChange(undefined);
               const meters = fromUnit(Number(e.target.value), unitKey);
               onChange(meters);
             }}
             placeholder={placeholder}
             className="input ltr text-xs py-1" />
    </label>
  );
}

function WallQuickAdd({
  parent, onAddRelated, kindHint,
}: {
  parent: SketchMarker;
  onAddRelated: (parent: SketchMarker, kind: MarkerKind) => void;
  /** Determines which buttons to show (wall vs boundary wall vs fence vs platform). */
  kindHint: 'wall' | 'boundary' | 'fence' | 'platform' | null;
}) {
  if (!kindHint) return null;
  // Each button creates a new marker centered on the parent that inherits
  // rotation + parentMarkerId so the AI prompt + visual stay aligned.
  const groups: Record<typeof kindHint, Array<{ kind: MarkerKind; emoji: string; label: string }>> = {
    wall: [
      { kind: 'DOOR_GAP', emoji: '🚪', label: 'باب' },
      { kind: 'DOOR_ARC', emoji: '🚪', label: 'باب بقوس' },
      { kind: 'WINDOW', emoji: '🪟', label: 'نافذة' },
      { kind: 'COLUMN_RECT', emoji: '⬛', label: 'عمود' },
    ],
    boundary: [
      { kind: 'GATE', emoji: '🚪', label: 'بوّابة' },
      { kind: 'CARPORT', emoji: '🚗', label: 'كراج/مظلة سيارة' },
      { kind: 'DOOR_GAP', emoji: '🚶', label: 'باب مشاة' },
      { kind: 'WINDOW', emoji: '🪟', label: 'نافذة' },
      { kind: 'WALL_TOPPER', emoji: '🌿', label: 'حاجز فوق السور' },
    ],
    fence: [
      { kind: 'GATE', emoji: '🚪', label: 'بوّابة حديقة' },
      { kind: 'WALL_TOPPER', emoji: '🌿', label: 'حاجز علوي' },
    ],
    platform: [
      { kind: 'STAIRS', emoji: '🪜', label: 'درج للمستوى' },
      { kind: 'HANDRAIL', emoji: '🪜', label: 'دربزين' },
      { kind: 'COLUMN_RECT', emoji: '⬛', label: 'عمود مستطيل' },
      { kind: 'COLUMN_ROUND', emoji: '⚪', label: 'عمود دائري' },
    ],
  };
  const items = groups[kindHint];
  return (
    <div className="rounded-xl bg-clay/5 border border-clay/30 p-2.5 space-y-1.5">
      <div className="text-[11px] font-bold text-clay-dark flex items-center gap-1.5">
        <span>✨</span>
        <span>أضف على هذا {kindHint === 'wall' ? 'الجدار' : kindHint === 'boundary' ? 'السور' : kindHint === 'fence' ? 'الحاجز' : 'المستوى'} (مع المحاذاة التلقائية)</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <button
            key={it.kind}
            type="button"
            onClick={() => onAddRelated(parent, it.kind)}
            className="px-2.5 py-1 rounded-full bg-white text-navy border border-clay/40 hover:bg-clay/10 hover:border-clay text-[11px] font-bold transition-colors"
            title={`إضافة ${it.label} مرتبطة، تحاكي زاوية ${kindHint === 'wall' ? 'الجدار' : 'السور'} ويمكن سحبها بعد ذلك`}
          >
            + {it.emoji} {it.label}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-500 leading-relaxed">
        العنصر الجديد يُربَط تلقائياً بهذا {kindHint === 'wall' ? 'الجدار' : kindHint === 'boundary' ? 'السور' : 'العنصر'} وينسخ زاويته،
        فيظهر للذكاء كأنه ملاصق له. اسحبه لتحريكه على طوله.
      </p>
    </div>
  );
}

function FloorPicker({
  marker, onChange,
}: {
  marker: SketchMarker;
  onChange: (patch: Partial<SketchMarker>) => void;
}) {
  const swatches = ['#a8896d', '#7d6450', '#2c2e3a', '#cdb89a', '#e7d6c2', '#8a9a7b', '#5d6e5b', '#d9c5a0', '#f5efe7'];
  return (
    <div className="space-y-1">
      <div className="text-[11px] font-bold text-gray-600">🎨 الأرضية / البلاط</div>
      <Field
        label=""
        value={marker.floorMaterial ?? ''}
        onChange={(v) => onChange({ floorMaterial: v.slice(0, 80) })}
        placeholder="مثال: بورسلين 60×60، رخام كريمي، خشب أوك"
      />
      <div className="flex flex-wrap gap-1">
        {swatches.map((c) => {
          const sel = marker.floorColorHex === c;
          return (
            <button
              key={c} type="button"
              onClick={() => onChange({ floorColorHex: sel ? undefined : c })}
              className={`w-6 h-6 rounded-md border-2 transition-all ${sel ? 'border-clay ring-2 ring-clay/30 scale-110' : 'border-white shadow-sm hover:scale-105'}`}
              style={{ background: c }}
              title={c}
            />
          );
        })}
        <input
          type="color"
          value={marker.floorColorHex ?? '#a8896d'}
          onChange={(e) => onChange({ floorColorHex: e.target.value })}
          className="w-6 h-6 rounded-md border-2 border-gray-200 cursor-pointer"
          title="لون مخصّص"
        />
      </div>
    </div>
  );
}

function ParentPicker({
  marker, candidates, onChange,
}: {
  marker: SketchMarker;
  candidates: SketchMarker[];
  onChange: (patch: Partial<SketchMarker>) => void;
}) {
  if (candidates.length === 0) return null;
  return (
    <div className="rounded-lg bg-cream/40 border border-gray-200 p-2">
      <div className="text-[11px] font-bold text-gray-600 mb-1">⤴ على مستوى (اختياري)</div>
      <select
        className="input text-xs"
        value={marker.parentMarkerId ?? ''}
        onChange={(e) => onChange({ parentMarkerId: e.target.value || undefined })}
      >
        <option value="">— لا شيء (على الأرض) —</option>
        {candidates.map((c, i) => (
          <option key={c.id} value={c.id}>
            🟫 مستوى #{i + 1}{c.heightMeters ? ` (${c.heightMeters} م)` : ''}{c.floorMaterial ? ` · ${c.floorMaterial}` : ''}
          </option>
        ))}
      </select>
      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
        لو ربطت العنصر بمستوى مرتفع، الذكاء سيُدرجه فوق المستوى بنفس الارتفاع لا على الأرض.
      </p>
    </div>
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
