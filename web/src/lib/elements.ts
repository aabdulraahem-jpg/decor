/**
 * Structural / decor element catalog — shared between the picker UI and
 * the AI prompt-building backend. Each element has a small set of curated
 * variants the user picks from (or "مخصّص" for free text), optional
 * dimension fields, and a draw-symbol explanation for the sketch.
 */

export type ElementCategory = 'INTERIOR' | 'EXTERIOR';

export type ElementKind =
  | 'HANDRAIL'
  | 'FENCE'
  | 'PERGOLA'
  | 'CARPORT'
  | 'WALL_TOPPER'
  | 'EXTERIOR_FACADE'
  | 'ANNEX'
  | 'BOUNDARY_WALL'
  | 'GATE'
  | 'GRASS'
  | 'WALKWAY'
  | 'POOL'
  | 'COURTYARD'
  | 'BAIT_SHAR';

export interface ElementType {
  kind: ElementKind;
  category: ElementCategory;
  label: string;
  icon: string;
  hint: string;
  variants: string[];
  askLength: boolean;
  askWidth: boolean;
  askHeight: boolean;
  askArea: boolean;          // m² rather than linear length
  askGlassPercent: boolean;  // for annex façade
  lengthLabel?: string;      // override default "📏 الطول (متر)"
  heightLabel?: string;
  notesPlaceholder: string;
  drawHint: string;
}

const T = (
  kind: ElementKind,
  category: ElementCategory,
  base: Omit<ElementType, 'kind' | 'category' | 'askLength' | 'askWidth' | 'askHeight' | 'askArea' | 'askGlassPercent'> &
    Partial<Pick<ElementType, 'askLength' | 'askWidth' | 'askHeight' | 'askArea' | 'askGlassPercent' | 'lengthLabel' | 'heightLabel'>>,
): ElementType => ({
  kind,
  category,
  askLength: false,
  askWidth: false,
  askHeight: false,
  askArea: false,
  askGlassPercent: false,
  ...base,
});

export const ELEMENT_TYPES: Record<ElementKind, ElementType> = {
  HANDRAIL: T('HANDRAIL', 'INTERIOR', {
    label: 'دربزين الدرج',
    icon: '🪜',
    hint: 'يُستخدَم على جانب الدرج للأمان والشكل',
    variants: ['حديد مشغول (فورجيه)', 'خشب طبيعي', 'زجاج مع إطار ألومنيوم', 'ستيل ستينلس مودرن', 'حبال معدنية أفقية', 'حديد بسيط أسود'],
    notesPlaceholder: 'مثال: نقوش هندسية، لون أسود مطفي',
    drawHint: 'سلسلة من الخطوط العمودية القصيرة (3-6 خطوط) على جانب الدرج، أو خط أفقي علوي يصل القوائم.',
  }),

  // ── Exterior structural ─────────────────────────────────────────────
  EXTERIOR_FACADE: T('EXTERIOR_FACADE', 'EXTERIOR', {
    label: 'واجهة المبنى الخارجية',
    icon: '🏛️',
    hint: 'مادة وتشطيب الواجهة الرئيسية',
    variants: [
      'حجر طبيعي رياض/الكاظمية',
      'حجر صناعي / كلادينج',
      'خرسانة مكشوفة (Brutalist)',
      'خشب طبيعي معالَج',
      'ألومنيوم وزجاج (مودرن)',
      'جبس متعرّج بأسلوب نجدي',
      'مزيج حجر + خشب',
      'طوب مكشوف (Brick)',
    ],
    askHeight: true,
    notesPlaceholder: 'مثال: ألوان ترابية، إضاءة سفلية على الواجهة',
    drawHint: 'ضع سهماً صغيراً على الجدار الخارجي مكتوب عليه "واجهة" — سيُحدِّد التشطيب من خياراتك.',
  }),

  ANNEX: T('ANNEX', 'EXTERIOR', {
    label: 'ملحق خارجي',
    icon: '🏠',
    hint: 'غرفة منفصلة في الفناء أو الحديقة',
    variants: [
      'ملحق ضيوف (مجلس مستقل)',
      'ملحق نوم بسيط',
      'ملحق خادمة',
      'مكتب مستقل / ستوديو',
      'مطبخ خارجي',
      'صالة رياضة / يوغا',
      'ملحق متعدّد الاستخدام',
    ],
    askLength: true,
    askWidth: true,
    askHeight: true,
    askGlassPercent: true,
    notesPlaceholder: 'مثال: واجهة شمالية، باب قابل للطيّ',
    drawHint: 'ارسم مستطيلاً منفصلاً عن المبنى الأساسي، اكتب داخله "ملحق" + اسمه (ضيوف، خادمة، مكتب...).',
  }),

  BOUNDARY_WALL: T('BOUNDARY_WALL', 'EXTERIOR', {
    label: 'سور خارجي',
    icon: '🧱',
    hint: 'الجدار المحيط بالأرض',
    variants: [
      'خرسانة مدهونة',
      'حجر طبيعي',
      'بلوك بطلاء معماري',
      'حديد + خرسانة (نصف ونصف)',
      'حديد فقط (شفّاف)',
      'خشب طبيعي',
    ],
    askLength: true,
    askHeight: true,
    notesPlaceholder: 'مثال: لون كريمي، ارتفاع 2.8 م',
    drawHint: 'ارسم خطّاً سميكاً يحيط بالأرض كاملةً، واكتب "سور" بجانب أحد جوانبه.',
  }),

  GATE: T('GATE', 'EXTERIOR', {
    label: 'بوّابة (سيّارة/مشاة)',
    icon: '🚪',
    hint: 'بوّابة في السور أو لباب الملحق',
    variants: [
      'حديد كهربائية منزلقة',
      'حديد يدوية',
      'خشب طبيعي مع نقوش',
      'معدن مع زجاج (مودرن)',
      'بوّابة مشاة جانبية',
      'بوّابة مزدوجة (سيارة + مشاة)',
      'بوّابة طيّ كهربائي',
    ],
    askWidth: true,
    askHeight: true,
    notesPlaceholder: 'مثال: لون أسود مع شعار العائلة، عرض 4 م',
    drawHint: 'اترك فجوة في خط السور بمكان البوّابة، اكتب "بوّابة" أو 🚪، وحدّد العرض على المخطط.',
  }),

  CARPORT: T('CARPORT', 'EXTERIOR', {
    label: 'مظلة سيارة',
    icon: '🚗',
    hint: 'مظلَّة وقوف السيارات قبل المنزل',
    variants: ['بولي كربونات شفّاف', 'قماش PVC', 'معدني صلب', 'خشب وأعمدة معدنية', 'مظلة مستوحاة من الخيمة', 'لوفر ألومنيوم متحرّك'],
    askLength: true,
    askWidth: true,
    notesPlaceholder: 'مثال: تتّسع لسيارتَين 6×6 م، لون أبيض',
    drawHint: 'مستطيل واسع عند مدخل المبنى الرئيسي، وضع داخله رمز سيارة 🚗 أو كلمة "مظلة سيارة".',
  }),

  PERGOLA: T('PERGOLA', 'EXTERIOR', {
    label: 'مظلة جلوس (بيرجولا)',
    icon: '🏡',
    hint: 'تظليل منطقة الجلوس في الحديقة أو السطح',
    variants: ['خشب طبيعي بحبال إنارة', 'ألومنيوم متحرّك (لوفر)', 'قماش امتداد ملوَّن', 'معدني أسود بسيط', 'حصير قصب طبيعي', 'زجاج عازل'],
    askLength: true,
    askWidth: true,
    notesPlaceholder: 'مثال: 4×3 م، نباتات معلّقة، إضاءة دافئة',
    drawHint: 'مربعاً/مستطيلاً يمثّل البقعة المظلَّلة، علامة × أو شبكة خطوط متقاطعة (تمثّل العوارض).',
  }),

  BAIT_SHAR: T('BAIT_SHAR', 'EXTERIOR', {
    label: 'بيت الشَّعر / خيمة',
    icon: '🛖',
    hint: 'مجلس بدوي تقليدي خارجي',
    variants: [
      'بيت شعر تقليدي بأعمدة خشب',
      'خيمة قماش حديثة',
      'خيمة ملكية مع جلسات أرضية',
      'مزيج بيت شعر مع زجاج جانبي',
      'خيمة مجوسَّة (نجدية)',
    ],
    askLength: true,
    askWidth: true,
    askHeight: true,
    notesPlaceholder: 'مثال: 5×4 م، فُرُش عربية، إضاءة فوانيس',
    drawHint: 'ارسم خيمة بقمم متعدّدة (شكل قبّة مموّجة لها 2-3 قمم) أو شبه منحرف، واكتب "بيت شعر" أو 🛖 داخله. الشكل المتموّج أقرب لبيت الشعر الحقيقي من المثلث.',
  }),

  FENCE: T('FENCE', 'EXTERIOR', {
    label: 'حاجز حديقة',
    icon: '🪴',
    hint: 'يفصل أجزاء الحديقة أو يحيط بمنطقة الجلوس',
    variants: ['خشب أفقي', 'خشب عمودي', 'حديد + نباتات متسلّقة', 'كتل خرسانية ديكورية', 'تشبيك زراعي معدني', 'بامبو طبيعي'],
    askLength: true,
    askHeight: true,
    notesPlaceholder: 'مثال: لون داكن، مع إضاءة LED سفلية',
    drawHint: 'خطّان متوازيان قصيران (طول الحاجز) مع شُرَط عمودية صغيرة بينهما.',
  }),

  WALL_TOPPER: T('WALL_TOPPER', 'EXTERIOR', {
    label: 'حاجز فوق السور',
    icon: '🌿',
    hint: 'يُضاف أعلى جدار السور لزيادة الخصوصية',
    variants: ['شيش حديد ديكوري', 'نباتات سياج (سرو/تويا)', 'زجاج شفّاف', 'خشب أفقي', 'لوحات معدنية مفرّغة', 'مزيج معدن + نبات'],
    askLength: true,
    askHeight: true,
    notesPlaceholder: 'مثال: ارتفاع 80 سم فوق سور 2.5 م',
    drawHint: 'فوق خط السور الخارجي، خطّ متموّج أو سلسلة دوائر صغيرة (نباتات) أو شُرَط عمودية متباعدة.',
  }),

  // ── Outdoor surfaces ──────────────────────────────────────────────
  GRASS: T('GRASS', 'EXTERIOR', {
    label: 'عشب / مساحة خضراء',
    icon: '🌱',
    hint: 'الأرضية الخضراء في الحديقة',
    variants: [
      'عشب طبيعي (بَريموة)',
      'عشب صناعي عالي الجودة',
      'عشب طبيعي + حصى ديكوري',
      'مساحات عشب + ممرات حجرية',
      'عشب بدلاً من حصى صحراوي',
    ],
    askArea: true,
    notesPlaceholder: 'مثال: عشب طبيعي مع ري ذكي، 60 م²',
    drawHint: 'مساحة من نقاط صغيرة كثيفة أو خربشات أفقية قصيرة (••• أو ٠٠٠) مع كلمة "عشب".',
  }),

  WALKWAY: T('WALKWAY', 'EXTERIOR', {
    label: 'ممشى / مسار',
    icon: '👣',
    hint: 'مسار يربط بين أجزاء الحديقة',
    variants: [
      'بلاط حجري طبيعي',
      'بلاط مصبوب (Stamped)',
      'حصى مرصوف',
      'خشب مقاوم للماء (Decking)',
      'بلاط دائري متباعد بين العشب',
      'إنترلوك ديكوري',
    ],
    askLength: true,
    askWidth: true,
    notesPlaceholder: 'مثال: عرض 1.2 م، مع إضاءة سفلية',
    drawHint: 'خطّان متوازيان منحنيان أو مستقيمان يربطان بين منطقتَين، اكتب "ممشى" بين الخطّين.',
  }),

  POOL: T('POOL', 'EXTERIOR', {
    label: 'مسبح',
    icon: '🏊',
    hint: 'حوض سباحة في الحديقة',
    variants: [
      'مسبح مستطيل كلاسيك',
      'مسبح لانهائي (Infinity)',
      'مسبح صغير مدمج',
      'مسبح بأطراف منحنية',
      'مسبح مع جاكوزي ملحَق',
      'مسبح أطفال ضحل',
    ],
    askLength: true,
    askWidth: true,
    askHeight: true,
    heightLabel: '↕️ العمق (متر)',
    notesPlaceholder: 'مثال: 6×3 م، عمق 1.4، حافة بلاط أزرق',
    drawHint: 'ارسم مستطيلاً (أو شكلاً منحنياً) واكتب "مسبح"، وأضف خطوط متموّجة 〰️ داخله للإيحاء بالماء.',
  }),

  COURTYARD: T('COURTYARD', 'EXTERIOR', {
    label: 'ساحة / مسيح خارجي',
    icon: '⬛',
    hint: 'مساحة مرصوفة مفتوحة للجلوس أو الاستخدام',
    variants: [
      'بلاط حجري كبير',
      'بورسلين خارجي 60×60',
      'إنترلوك ملوَّن',
      'حجر صحراوي طبيعي',
      'خرسانة مصقولة',
      'مزيج: بلاط + شرائط عشب',
    ],
    askLength: true,
    askWidth: true,
    notesPlaceholder: 'مثال: 8×6 م، حول المسبح',
    drawHint: 'مستطيل/شكل مرصوف بشبكة خطوط تمثّل البلاط (#####)، اكتب "ساحة" أو "مسيح".',
  }),
};

// Order matters for the UI — keep semantic groupings adjacent.
export const ELEMENT_KINDS: ElementKind[] = [
  // Interior
  'HANDRAIL',
  // Exterior — building/structure
  'EXTERIOR_FACADE', 'ANNEX', 'BOUNDARY_WALL', 'GATE', 'CARPORT', 'PERGOLA', 'BAIT_SHAR',
  // Exterior — barriers
  'FENCE', 'WALL_TOPPER',
  // Exterior — surfaces
  'GRASS', 'WALKWAY', 'POOL', 'COURTYARD',
];

export interface SpaceElement {
  kind: ElementKind;
  variant: string;
  lengthMeters?: number;
  widthMeters?: number;
  heightMeters?: number;
  areaSqm?: number;
  glassPercent?: number;
  notes?: string;
}

/** Build an English prompt fragment for AI from a single element. */
export function elementToPrompt(e: SpaceElement): string {
  const t = ELEMENT_TYPES[e.kind];
  const parts: string[] = [`${t.label} (${t.kind.toLowerCase()}): ${e.variant}`];
  const dim: string[] = [];
  if (e.lengthMeters) dim.push(`length ~${e.lengthMeters}m`);
  if (e.widthMeters) dim.push(`width ~${e.widthMeters}m`);
  if (e.heightMeters) dim.push(`height ~${e.heightMeters}m`);
  if (e.areaSqm) dim.push(`area ~${e.areaSqm}m²`);
  if (e.glassPercent) dim.push(`glass façade ~${e.glassPercent}%`);
  if (dim.length) parts.push(`[${dim.join(', ')}]`);
  if (e.notes && e.notes.trim()) parts.push(`note: ${e.notes.trim()}`);
  return parts.join(' ');
}
