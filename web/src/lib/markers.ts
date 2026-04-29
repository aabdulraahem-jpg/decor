import type { SketchMarker } from '@/components/sketch-editor';
import { ElementKind, getElementType } from './elements';

/**
 * Convert visual markers placed on an uploaded image (sketch OR photo) into
 * a structured English prompt fragment the backend appends to the AI prompt.
 */
export function buildMarkersPrompt(markers: SketchMarker[]): string {
  if (!markers || markers.length === 0) return '';
  const lines: string[] = [];
  for (const m of markers) {
    if (m.kind === 'CAMERA') {
      const dir = m.rotationDeg === undefined ? '' : ` (rotation ${m.rotationDeg}°)`;
      const note = m.text ? ` — ${m.text}` : '';
      lines.push(`Camera viewpoint at ~(${m.xPct.toFixed(0)}%, ${m.yPct.toFixed(0)}%)${dir}${note}.`);
    } else if (m.kind === 'DIMENSION') {
      const dimBits: string[] = [];
      if (m.lengthMeters) dimBits.push(`L=${m.lengthMeters}m`);
      if (m.widthMeters) dimBits.push(`W=${m.widthMeters}m`);
      if (m.heightMeters) dimBits.push(`H=${m.heightMeters}m`);
      const dim = dimBits.length > 0 ? ` [${dimBits.join(', ')}]` : '';
      lines.push(`Dimension marker "${m.text ?? ''}"${dim} at ~(${m.xPct.toFixed(0)}%, ${m.yPct.toFixed(0)}%).`);
    } else if (m.kind === 'RULER') {
      const meters = m.lengthMeters ? ` (~${m.lengthMeters}m)` : (m.text ? ` (label "${m.text}")` : '');
      lines.push(`Ruler / distance${meters} from ~(${m.xPct.toFixed(0)}%, ${m.yPct.toFixed(0)}%) to ~(${(m.x2Pct ?? 0).toFixed(0)}%, ${(m.y2Pct ?? 0).toFixed(0)}%).`);
    } else if (m.kind === 'TEXT') {
      lines.push(`User-written label "${m.text ?? ''}" at ~(${m.xPct.toFixed(0)}%, ${m.yPct.toFixed(0)}%).`);
    } else if (m.kind === 'IMAGE_DECAL') {
      const rot = m.rotationDeg ? `, rotated ${m.rotationDeg}°` : '';
      const attach = m.decalAttachment ? `, attachment intent: "${m.decalAttachment}"` : '';
      const parent = m.parentMarkerId ? ` (placed on top of platform/marker #${m.parentMarkerId})` : '';
      const sz = (m.wPct !== undefined && m.hPct !== undefined)
        ? ` (footprint ${m.wPct.toFixed(0)}%×${m.hPct.toFixed(0)}%)`
        : '';
      lines.push(
        `Image decal — composite the user-supplied image at ~(${m.xPct.toFixed(0)}%, ${m.yPct.toFixed(0)}%)${sz}${rot}${attach}${parent}. Use it as a strict visual reference for this region. Image URL: ${m.imageUrl ?? ''}.`,
      );
    } else if (m.kind === 'WALL_FREE') {
      const dimBits: string[] = [];
      if (m.lengthMeters) dimBits.push(`L=${m.lengthMeters}m`);
      if (m.thicknessMeters) dimBits.push(`thickness=${m.thicknessMeters}m`);
      if (m.heightMeters) dimBits.push(`H=${m.heightMeters}m`);
      if (m.rotationDeg !== undefined) dimBits.push(`angle=${m.rotationDeg}°`);
      const dim = dimBits.length ? ` [${dimBits.join(', ')}]` : '';
      const mat = m.variant ? ` material: ${m.variant}.` : '';
      lines.push(`Free-form wall${dim} at ~(${m.xPct.toFixed(0)}%, ${m.yPct.toFixed(0)}%).${mat}`);
    } else {
      const t = getElementType(m.kind as ElementKind);
      if (!t) continue;
      const dimBits: string[] = [];
      if (m.lengthMeters) dimBits.push(`L=${m.lengthMeters}m`);
      if (m.widthMeters) dimBits.push(`W=${m.widthMeters}m`);
      if (m.heightMeters) dimBits.push(`H=${m.heightMeters}m`);
      if (m.thicknessMeters) dimBits.push(`thickness=${m.thicknessMeters}m`);
      if (m.areaSqm) dimBits.push(`area ${m.areaSqm}m²`);
      if (m.glassPercent !== undefined) dimBits.push(`glass ${m.glassPercent}%`);
      if (m.elevationMeters !== undefined) dimBits.push(`elevation ${m.elevationMeters}m above ground`);
      if (m.attachedToWallTop) dimBits.push('mounted flush to top of wall');
      if (m.stepCount) dimBits.push(`${m.stepCount} steps`);
      if (m.totalRiseMeters) dimBits.push(`total rise ${m.totalRiseMeters}m to upper landing`);
      if (m.doorDirection) dimBits.push(`door faces ${m.doorDirection}`);
      if (m.rotationDeg !== undefined) dimBits.push(`angle ${m.rotationDeg}°`);
      const dim = dimBits.length > 0 ? ` [${dimBits.join(', ')}]` : '';
      const sketchSize = (m.wPct !== undefined && m.hPct !== undefined)
        ? ` (image footprint ${m.wPct.toFixed(0)}%×${m.hPct.toFixed(0)}%)`
        : '';
      const floor = m.floorMaterial || m.floorColorHex
        ? ` floor: ${[m.floorMaterial, m.floorColorHex].filter(Boolean).join(' / ')}.`
        : '';
      const parent = m.parentMarkerId
        ? ` Placed ON TOP of raised platform #${m.parentMarkerId} — render at platform's elevation, not floor level.`
        : '';
      const note = m.text ? ` — ${m.text}` : '';
      lines.push(`${t.label} (${m.variant ?? t.variants[0]})${dim} at ~(${m.xPct.toFixed(0)}%, ${m.yPct.toFixed(0)}%)${sketchSize}${note}.${floor}${parent}`);
    }
  }
  return `Visual annotations placed by the user on the uploaded image:\n${lines.join('\n')}`;
}
