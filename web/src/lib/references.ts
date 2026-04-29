/**
 * Reference image model — extra photos the user attaches to influence
 * the AI: opposite-angle context, style boards, or sources of specific
 * elements they want transferred into the new design.
 */

export type ReferenceRole =
  | 'opposite_angle'   // same room from another corner — keep decor consistent
  | 'right_side'       // view of the right side of the same space (with camera arrow)
  | 'left_side'        // view of the left side of the same space (with camera arrow)
  | 'context'          // generic "look at this for context"
  | 'style'            // adopt this style/material
  | 'element_source';  // take a specific element from this and place it

export interface ReferenceSelection {
  /** Bounding rect of the highlighted element on the reference (percent). */
  xPct: number; yPct: number; wPct: number; hPct: number;
}

/** A user-drawn ruler on a reference image: two endpoints in % + label/length. */
export interface ReferenceRuler {
  id: string;
  x1Pct: number; y1Pct: number;
  x2Pct: number; y2Pct: number;
  /** Length in canonical meters. Display rendered in `unit`. */
  lengthMeters?: number;
  unit?: 'm' | 'cm' | 'in';
  /** Optional label (what does this ruler measure? e.g., "عرض الجدار"). */
  label?: string;
}

export interface ReferenceImage {
  id: string;
  url: string;
  label?: string;
  role: ReferenceRole;
  /** Optional crop on the reference highlighting the element of interest. */
  selection?: ReferenceSelection;
  /** Where on the new design the element should land (percent). */
  targetXPct?: number;
  targetYPct?: number;
  /** Camera-direction arrow placed BY THE USER on this reference image,
   * pointing in the direction the lens of THIS reference is facing.
   * The AI uses this to relate the reference to the main view's geometry. */
  cameraXPct?: number;
  cameraYPct?: number;
  cameraRotationDeg?: number;
  /** User-drawn rulers on this reference (exact known distances). */
  rulers?: ReferenceRuler[];
  /** Free-text user instruction translated into the prompt verbatim. */
  instruction?: string;
}

/** Flatten all user-provided ruler measurements (across all references) into
 * Arabic strings that buildMeasuredFirstPrompt() injects as exact values. */
export function collectUserRulerStrings(refs: ReferenceImage[]): string[] {
  const out: string[] = [];
  for (const r of refs) {
    if (!r.rulers || r.rulers.length === 0) continue;
    for (const ru of r.rulers) {
      if (ru.lengthMeters === undefined) continue;
      const unit = ru.unit ?? 'm';
      const v = unit === 'cm' ? Math.round(ru.lengthMeters * 100)
        : unit === 'in' ? Math.round(ru.lengthMeters * 39.3701 * 10) / 10
        : Math.round(ru.lengthMeters * 100) / 100;
      const u = unit === 'cm' ? 'سم' : unit === 'in' ? 'بوصة' : 'م';
      const tag = ru.label ? `${ru.label}: ` : '';
      out.push(`${tag}${v} ${u} (مرجع ${r.role.replace('_', ' ')})`);
    }
  }
  return out;
}

export const ROLE_LABELS: Record<ReferenceRole, { label: string; color: string; emoji: string; hint: string }> = {
  opposite_angle: { label: 'زاوية معاكسة', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', emoji: '🔄', hint: 'نفس الغرفة من الجدار المقابل — حافظ على الأثاث والإضاءة' },
  right_side:     { label: 'الجهة اليمنى',   color: 'bg-sky-100 text-sky-700 border-sky-300',           emoji: '➡️', hint: 'مرجع للجزء الأيمن من المساحة — ضع سهماً يحدّد اتجاه الكاميرا' },
  left_side:      { label: 'الجهة اليسرى',   color: 'bg-violet-100 text-violet-700 border-violet-300',  emoji: '⬅️', hint: 'مرجع للجزء الأيسر من المساحة — ضع سهماً يحدّد اتجاه الكاميرا' },
  context:        { label: 'سياق',         color: 'bg-blue-100 text-blue-700 border-blue-300',         emoji: '🧭', hint: 'مرجع عام لفهم المساحة' },
  style:          { label: 'نمط/خامات',     color: 'bg-amber-100 text-amber-700 border-amber-300',     emoji: '🎨', hint: 'تبنّى الستايل أو الخامات الظاهرة فيها' },
  element_source: { label: 'مصدر عنصر',    color: 'bg-rose-100 text-rose-700 border-rose-300',         emoji: '🎯', hint: 'خذ عنصراً محدّداً من هذه الصورة وضعه في التصميم الجديد' },
};

/** Build the structured English prompt fragment the backend appends to AI input. */
export function buildReferencesPrompt(refs: ReferenceImage[]): string {
  if (!refs || refs.length === 0) return '';
  const lines = refs.map((r, i) => {
    const role = r.role.replace('_', ' ');
    const tag = r.label ? ` "${r.label}"` : '';
    const sel = r.selection
      ? ` selection inside the reference: x=${r.selection.xPct.toFixed(0)}%, y=${r.selection.yPct.toFixed(0)}%, w=${r.selection.wPct.toFixed(0)}%, h=${r.selection.hPct.toFixed(0)}%`
      : '';
    const target = (r.targetXPct !== undefined && r.targetYPct !== undefined)
      ? ` → place at target ~(${r.targetXPct.toFixed(0)}%, ${r.targetYPct.toFixed(0)}%) of the new design`
      : '';
    // Camera-direction arrow drawn by the user on the reference itself —
    // tells the AI which way the lens of THIS reference is facing so it can
    // align it with the main view's geometry.
    const cam = (r.cameraXPct !== undefined && r.cameraYPct !== undefined)
      ? ` Camera direction marker placed at (${r.cameraXPct.toFixed(0)}%, ${r.cameraYPct.toFixed(0)}%) on this reference, pointing at ${r.cameraRotationDeg ?? 0}° (0°=right, 90°=down, -90°=up, ±180°=left).`
      : '';
    const instr = r.instruction ? ` — user note: "${r.instruction}"` : '';
    let directive = '';
    if (r.role === 'opposite_angle') {
      directive = ' Treat as the same room from the opposite camera angle: keep all furniture, materials, color palette, lighting and finishes consistent — only the camera viewpoint differs, plus any newly placed elements.';
    } else if (r.role === 'right_side') {
      directive = ' This reference shows the right-hand side of the same space. Use it to understand what continues to the right of the main view, and reproduce repeated decor elements (furniture, fixtures, materials) consistently when the new view extends in that direction.';
    } else if (r.role === 'left_side') {
      directive = ' This reference shows the left-hand side of the same space. Use it to understand what continues to the left of the main view, and reproduce repeated decor elements consistently when the new view extends in that direction.';
    } else if (r.role === 'style') {
      directive = ' Adopt the materials, palette, mood and finish style visible in this image.';
    } else if (r.role === 'element_source') {
      directive = ' Extract the element inside the selection (or the dominant subject if no selection) and composite it into the new design at the target position; preserve its proportions and silhouette while adapting its lighting to the new scene.';
    } else {
      directive = ' Use as supplementary context.';
    }
    return `Reference #${i + 1} [${role}]${tag} URL: ${r.url}.${sel}${target}${cam}${instr}${directive}`;
  });
  return `Additional reference images (cross-image element matching: when the same furniture / fixtures / decor appears in MULTIPLE references, treat them as the SAME object viewed from different angles and reproduce it consistently in the generated image):\n${lines.join('\n')}`;
}

/** Quick preset: append "render from the opposite angle" directive without a second photo. */
export const OPPOSITE_ANGLE_PROMPT =
  'Render the same room from the OPPOSITE camera angle (180° rotation around the room center). The viewer is now standing at the wall facing the original viewpoint. Keep ALL existing furniture, materials, palette, lighting, fixtures and finishes consistent — only show what would be visible from this reverse direction. Reveal walls, windows, ceiling and floor that the original frame did not capture, but inferred from the existing geometry. Do not invent new style — match the original photo strictly.';

/** Build the directive that asks the AI to overlay dimension callouts on every
 * visible structural element + major furniture, in the user's preferred unit.
 * Exact values from user-provided rulers are used verbatim; everything else is
 * prefixed with the Arabic word "تقريباً ~" to mark it as an estimate. */
export function buildMeasuredFirstPrompt(unit: 'm' | 'cm' | 'in', userRulers: string[] = []): string {
  const unitLabel = unit === 'm' ? 'meters (م)' : unit === 'cm' ? 'centimeters (سم)' : 'inches (بوصة)';
  const userKnown = userRulers.length > 0
    ? ` The user has provided these EXACT measured distances (use these verbatim with no prefix):\n${userRulers.map((r) => `  • ${r}`).join('\n')}\n`
    : '';
  return `MEASURED-IMAGE MODE: Render the design WITH DIMENSION CALLOUTS overlaid on every visible structural element (walls, openings, doors, windows, ceiling height) and every major furniture piece (sofas, beds, tables, cabinets, rugs, lighting fixtures, etc.).${userKnown}
Annotation rules:
1) Display each dimension as a small clean pill / tag in ${unitLabel}, formatted with one decimal place when needed.
2) For dimensions PROVIDED BY THE USER (rulers / known distances above): show the EXACT value with NO prefix.
3) For ALL OTHER dimensions: prefix with the Arabic word "تقريباً ~" (which means "approximately") so the user knows it's an estimate. Example: "تقريباً ~ 2.4 م".
4) Visual style: each pill uses a SUBTLE color — semi-transparent white background with a navy-blue (#2c2e3a) or clay (#a8896d) text/border. Keep the pill ≤ 14% of the element's smaller dimension so it never obscures the design.
5) Connect the pill to its element with a thin (≤1px) line ending in tiny tick marks at both ends of the measured span, when the pill cannot sit directly on the element.
6) Place every pill so the design BEHIND it stays clearly readable. Cluster small pills neatly near corners. Never block faces, key textures, focal points, or important furniture details.
7) Include both width and height for openings (doors, windows). Include floor footprint (W×D) for furniture. Include wall heights / lengths labeled clearly.
8) Use a unified visual language across all callouts (same font, same pill style) so the result looks like a clean architectural overlay, not random labels.`;
}
