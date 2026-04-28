/**
 * Structural element catalog — shared between the picker UI and the AI
 * prompt-building backend. Each element has a small set of curated
 * variants the user picks from (or "مخصّص" for free text), optional
 * dimension fields, and a draw-symbol explanation for the sketch.
 */

export type ElementKind = 'HANDRAIL' | 'FENCE' | 'PERGOLA' | 'CARPORT' | 'WALL_TOPPER';

export interface ElementType {
  kind: ElementKind;
  label: string;            // Arabic display label
  icon: string;             // emoji shown in chips
  hint: string;             // when does this apply
  variants: string[];       // curated options
  askLength: boolean;
  askHeight: boolean;
  /** Default placeholder text for the notes textarea. */
  notesPlaceholder: string;
  /** How to draw this in the sketch (Arabic). */
  drawHint: string;
}

export const ELEMENT_TYPES: Record<ElementKind, ElementType> = {
  HANDRAIL: {
    kind: 'HANDRAIL',
    label: 'دربزين الدرج',
    icon: '🪜',
    hint: 'يُستخدَم على جانب الدرج للأمان والشكل',
    variants: [
      'حديد مشغول (فورجيه)',
      'خشب طبيعي',
      'زجاج مع إطار ألومنيوم',
      'ستيل ستينلس مودرن',
      'حبال معدنية أفقية',
      'حديد بسيط أسود',
    ],
    askLength: false,
    askHeight: false,
    notesPlaceholder: 'مثال: نقوش هندسية، لون أسود مطفي، مزاج كلاسيك',
    drawHint:
      'ارسم سلسلة من الخطوط العمودية القصيرة (3-6 خطوط) على جانب الدرج، أو خط أفقي علوي يصل القوائم.',
  },
  FENCE: {
    kind: 'FENCE',
    label: 'حاجز حديقة',
    icon: '🪴',
    hint: 'يفصل أجزاء الحديقة أو يحيط بمنطقة الجلوس',
    variants: [
      'خشب أفقي',
      'خشب عمودي',
      'حديد + نباتات متسلّقة',
      'كتل خرسانية ديكورية',
      'تشبيك زراعي معدني',
      'بامبو طبيعي',
    ],
    askLength: true,
    askHeight: true,
    notesPlaceholder: 'مثال: لون داكن، مع إضاءة LED سفلية',
    drawHint:
      'ارسم خطّين متوازيين قصيرَين (طول الحاجز) مع شُرَط عمودية صغيرة بينهما تمثّل الألواح/القضبان.',
  },
  PERGOLA: {
    kind: 'PERGOLA',
    label: 'مظلة جلوس',
    icon: '🏡',
    hint: 'تظليل منطقة الجلوس في الحديقة أو السطح',
    variants: [
      'خشب طبيعي بحبال إنارة',
      'ألومنيوم متحرّك (لوفر)',
      'قماش امتداد ملوَّن',
      'معدني أسود بسيط',
      'حصير قصب طبيعي',
      'زجاج عازل',
    ],
    askLength: true,
    askHeight: false,
    notesPlaceholder: 'مثال: 4×3 م، نباتات معلّقة، إضاءة دافئة',
    drawHint:
      'ارسم مربعاً/مستطيلاً يمثّل البقعة المظلَّلة، وضع داخله علامة × أو شبكة خطوط متقاطعة (تمثّل العوارض).',
  },
  CARPORT: {
    kind: 'CARPORT',
    label: 'مظلة سيارة',
    icon: '🚗',
    hint: 'مظلَّة وقوف السيارات قبل المنزل',
    variants: [
      'بولي كربونات شفّاف',
      'قماش PVC',
      'معدني صلب',
      'خشب وأعمدة معدنية',
      'مظلة مستوحاة من الخيمة',
    ],
    askLength: true,
    askHeight: false,
    notesPlaceholder: 'مثال: تتّسع لسيارتَين (6×6 م)، لون أبيض',
    drawHint:
      'ارسم مستطيلاً واسعاً عند مدخل المبنى الرئيسي، وضع داخله رمز سيارة 🚗 أو كلمة "مظلة سيارة".',
  },
  WALL_TOPPER: {
    kind: 'WALL_TOPPER',
    label: 'حاجز فوق السور',
    icon: '🌿',
    hint: 'يُضاف أعلى جدار السور لزيادة الخصوصية أو التصميم',
    variants: [
      'شيش حديد ديكوري',
      'نباتات سياج (سرو/تويا)',
      'زجاج شفّاف',
      'خشب أفقي',
      'لوحات معدنية مفرّغة',
      'مزيج معدن + نبات',
    ],
    askLength: true,
    askHeight: true,
    notesPlaceholder: 'مثال: ارتفاع 80 سم فوق سور 2.5 م',
    drawHint:
      'فوق خط السور الخارجي، ارسم خطاً متموّجاً أو سلسلة دوائر صغيرة (نباتات) أو شُرَط عمودية متباعدة.',
  },
};

export const ELEMENT_KINDS: ElementKind[] = ['HANDRAIL', 'FENCE', 'PERGOLA', 'CARPORT', 'WALL_TOPPER'];

export interface SpaceElement {
  kind: ElementKind;
  variant: string;
  lengthMeters?: number;
  heightMeters?: number;
  notes?: string;
}

/** Build an English prompt fragment for AI from a single element. */
export function elementToPrompt(e: SpaceElement): string {
  const t = ELEMENT_TYPES[e.kind];
  const parts: string[] = [`${t.label} (${t.kind.toLowerCase()}): ${e.variant}`];
  const dim: string[] = [];
  if (e.lengthMeters) dim.push(`length ~${e.lengthMeters}m`);
  if (e.heightMeters) dim.push(`height ~${e.heightMeters}m`);
  if (dim.length) parts.push(`[${dim.join(', ')}]`);
  if (e.notes && e.notes.trim()) parts.push(`note: ${e.notes.trim()}`);
  return parts.join(' ');
}
