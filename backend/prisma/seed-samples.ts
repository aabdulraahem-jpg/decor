/**
 * Comprehensive seed for Sufuf design content.
 *
 * Inserts (idempotently) the default style categories + options that the
 * studio shows above the samples grid, the default sample categories +
 * material samples, and a production-ready System Prompt for OpenAI.
 *
 * All content is editable from the admin panel afterwards. The seed
 * never updates an existing item — if you change a sample in the admin
 * panel and re-run this seed, your changes survive (matched on
 * category slug + sample name).
 *
 * Run: cd backend && npx ts-node prisma/seed-samples.ts
 */

import { PrismaClient, Prisma, SampleKind, ColorMode } from '@prisma/client';

const prisma = new PrismaClient();

// ── Master color palette (30 colors) ──────────────────────────────────

const COLORS: Array<{ code: string; name: string; hex: string; family: string; sortOrder: number }> = [
  // Whites & creams
  { code: 'C-001', name: 'أبيض ناصع', hex: '#FFFFFF', family: 'neutral', sortOrder: 1 },
  { code: 'C-002', name: 'أبيض كريمي', hex: '#FAF6EE', family: 'neutral', sortOrder: 2 },
  { code: 'C-003', name: 'بيج صحراوي', hex: '#D4B896', family: 'earth', sortOrder: 3 },
  { code: 'C-004', name: 'بيج فاتح', hex: '#E8DCC4', family: 'earth', sortOrder: 4 },
  { code: 'C-005', name: 'كاكاو', hex: '#8B6F47', family: 'earth', sortOrder: 5 },
  // Greys
  { code: 'C-010', name: 'رمادي فاتح', hex: '#D9D9D9', family: 'neutral', sortOrder: 10 },
  { code: 'C-011', name: 'رمادي متوسط', hex: '#9E9E9E', family: 'neutral', sortOrder: 11 },
  { code: 'C-012', name: 'رمادي فحمي', hex: '#3A3A3A', family: 'neutral', sortOrder: 12 },
  { code: 'C-013', name: 'أسود مطفي', hex: '#1B1B1B', family: 'neutral', sortOrder: 13 },
  // Warm earth
  { code: 'C-020', name: 'تيراكوتا', hex: '#C0593E', family: 'warm', sortOrder: 20 },
  { code: 'C-021', name: 'صدأ', hex: '#9C4A2A', family: 'warm', sortOrder: 21 },
  { code: 'C-022', name: 'كاراميل', hex: '#A87445', family: 'warm', sortOrder: 22 },
  { code: 'C-023', name: 'ذهبي عتيق', hex: '#B8915A', family: 'warm', sortOrder: 23 },
  // Reds
  { code: 'C-030', name: 'أحمر بورجوندي', hex: '#5C1E1E', family: 'bold', sortOrder: 30 },
  { code: 'C-031', name: 'أحمر صيني', hex: '#A52A2A', family: 'bold', sortOrder: 31 },
  { code: 'C-032', name: 'وردي خجول', hex: '#E8C5C0', family: 'warm', sortOrder: 32 },
  // Blues
  { code: 'C-040', name: 'أزرق بحري', hex: '#1A3A5C', family: 'cool', sortOrder: 40 },
  { code: 'C-041', name: 'أزرق سماوي', hex: '#A3C4E0', family: 'cool', sortOrder: 41 },
  { code: 'C-042', name: 'أزرق نيلي', hex: '#2C4A6B', family: 'cool', sortOrder: 42 },
  { code: 'C-043', name: 'تركواز', hex: '#3FA9A4', family: 'cool', sortOrder: 43 },
  // Greens
  { code: 'C-050', name: 'أخضر زيتي', hex: '#5A6B3D', family: 'earth', sortOrder: 50 },
  { code: 'C-051', name: 'أخضر زمردي', hex: '#1F5C3D', family: 'cool', sortOrder: 51 },
  { code: 'C-052', name: 'أخضر فستقي', hex: '#A5C49E', family: 'earth', sortOrder: 52 },
  { code: 'C-053', name: 'أخضر داكن غابات', hex: '#1F3A2F', family: 'cool', sortOrder: 53 },
  // Yellows
  { code: 'C-060', name: 'أصفر خردل', hex: '#C9962E', family: 'warm', sortOrder: 60 },
  { code: 'C-061', name: 'أصفر عسلي', hex: '#E0B85F', family: 'warm', sortOrder: 61 },
  // Special
  { code: 'C-070', name: 'برونزي', hex: '#8C6A3C', family: 'warm', sortOrder: 70 },
  { code: 'C-071', name: 'فضي مصقول', hex: '#C4C4C4', family: 'neutral', sortOrder: 71 },
  { code: 'C-072', name: 'ذهبي شامبانيا', hex: '#D4AF7A', family: 'warm', sortOrder: 72 },
  { code: 'C-073', name: 'بنفسجي عميق', hex: '#4A2A5C', family: 'bold', sortOrder: 73 },
];

// ── Space types ──────────────────────────────────────────────────────

const SPACES: Array<{ slug: string; name: string; icon?: string; sortOrder: number }> = [
  { slug: 'majlis', name: 'مجلس', icon: '🛋️', sortOrder: 1 },
  { slug: 'living-room', name: 'صالة جلوس', icon: '🛋️', sortOrder: 2 },
  { slug: 'family-room', name: 'صالة عائلية', icon: '👨‍👩‍👧', sortOrder: 3 },
  { slug: 'dining-room', name: 'غرفة طعام', icon: '🍽️', sortOrder: 4 },
  { slug: 'kitchen', name: 'مطبخ', icon: '🍳', sortOrder: 5 },
  { slug: 'master-bedroom', name: 'غرفة نوم رئيسية', icon: '🛏️', sortOrder: 6 },
  { slug: 'bedroom', name: 'غرفة نوم', icon: '🛏️', sortOrder: 7 },
  { slug: 'kids-room', name: 'غرفة أطفال', icon: '🧸', sortOrder: 8 },
  { slug: 'bathroom', name: 'حمّام', icon: '🛁', sortOrder: 9 },
  { slug: 'office', name: 'مكتب منزلي', icon: '💼', sortOrder: 10 },
  { slug: 'entrance', name: 'مدخل البيت', icon: '🚪', sortOrder: 11 },
  { slug: 'corridor', name: 'ممر / صالة', icon: '➡️', sortOrder: 12 },
  { slug: 'staircase', name: 'درج', icon: '🪜', sortOrder: 13 },
  { slug: 'rest-house', name: 'استراحة', icon: '🏡', sortOrder: 20 },
  { slug: 'garden', name: 'حديقة منزلية', icon: '🌳', sortOrder: 21 },
  { slug: 'roof-terrace', name: 'سطح / تراس', icon: '🌅', sortOrder: 22 },
  { slug: 'majlis-rejal', name: 'مجلس رجال (استراحة)', icon: '☕', sortOrder: 23 },
  { slug: 'majlis-women', name: 'مجلس نساء', icon: '🌸', sortOrder: 24 },
  { slug: 'farm', name: 'مزرعة', icon: '🌾', sortOrder: 25 },
  { slug: 'chalet', name: 'شاليه', icon: '🏖️', sortOrder: 26 },
  // Commercial
  { slug: 'shop', name: 'محل تجاري', icon: '🛍️', sortOrder: 40 },
  { slug: 'cafe', name: 'مقهى', icon: '☕', sortOrder: 41 },
  { slug: 'restaurant', name: 'مطعم', icon: '🍴', sortOrder: 42 },
  { slug: 'clinic', name: 'عيادة', icon: '🩺', sortOrder: 43 },
  { slug: 'salon', name: 'صالون تجميل', icon: '💇', sortOrder: 44 },
  { slug: 'showroom', name: 'صالة عرض', icon: '🏬', sortOrder: 45 },
  { slug: 'corp-office', name: 'مكتب شركة', icon: '🏢', sortOrder: 46 },
  { slug: 'gym', name: 'صالة رياضية', icon: '🏋️', sortOrder: 47 },
];

// ── System Prompt ──────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert interior architect and 3D visualization specialist with deep knowledge of Saudi Arabian, Khaleeji, and global contemporary interior design.

When generating an interior render, ALWAYS:
- Produce photorealistic results at 4K visualization quality, as if shot with a 35mm full-frame camera at f/8, with believable depth of field
- Honor the user's selected style, mood, lighting, and material samples — they are non-negotiable design constraints
- Respect realistic spatial proportions, ceiling heights, and human-scale furniture sizing
- Use realistic materials with believable reflections, shadows, surface roughness, and texture grain
- Use natural light from existing windows where present; supplement with warm artificial lighting (2700-3000K) only when the user explicitly chose dim or dramatic lighting
- Keep compositions clean and intentional — never overstuff a room with decor
- For Saudi/Khaleeji contexts (majlis, female reception, family living): respect cultural seating arrangements (low ottomans around the perimeter), avoid imagery of people unless explicitly requested, and treat religious sensibilities with care
- Avoid: cartoonish output, watermarks, text overlays, distorted perspective, unrealistic floating objects, melting geometry, identical repeated objects, low-resolution noise

When the user provides a reference image of their actual room: preserve the room's geometry — wall positions, window placements, doorways, and ceiling height — and only re-style the surfaces, finishes, furniture, lighting, and decor.

When the user provides only style/material descriptors without a reference image: generate a believable canonical version of that room type with one clear focal point.`;

// ── STYLE categories — single-select per category in the studio ────────

const STYLE_CATS: Array<{
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  options: Array<{ name: string; aiPrompt: string }>;
}> = [
  {
    slug: 'design-style',
    name: 'الطراز',
    description: 'الطابع العام للتصميم',
    sortOrder: 1,
    options: [
      { name: 'مودرن مينيمال', aiPrompt: 'Modern minimalist style with clean lines, neutral palette, generous open space, low-profile furniture, no clutter' },
      { name: 'كلاسيك أوروبي', aiPrompt: 'Classic European style with ornate moldings, rich dark wood, layered drapery, warm gold accents, traditional Persian rug' },
      { name: 'صناعي', aiPrompt: 'Industrial loft style with exposed brick, raw concrete floors, black metal frames, Edison filament lighting, reclaimed wood' },
      { name: 'بوهيمي', aiPrompt: 'Bohemian eclectic style with layered textiles, warm rust and terracotta tones, abundant plants, woven rattan, macramé wall hangings' },
      { name: 'إسكندنافي', aiPrompt: 'Scandinavian style with pale ash and oak woods, white walls, soft greys, hygge wool throws, sheepskin accents, abundant natural light' },
      { name: 'ميد-سنشري', aiPrompt: 'Mid-century modern style with walnut tapered legs, geometric textiles, brass hardware, atomic-era motifs, mustard and teal accents' },
      { name: 'عربي معاصر', aiPrompt: 'Contemporary Arabic style blending traditional mashrabiya wooden screens, geometric Islamic motifs, warm earth tones, low ottomans, brass lanterns' },
      { name: 'نجدي تقليدي', aiPrompt: 'Traditional Najdi style with mud-plaster textured walls, geometric incised patterns, low majlis seating in red and beige, palm-frond ceiling' },
      { name: 'جابانديJ', aiPrompt: 'Japandi style blending Japanese wabi-sabi minimalism with Scandinavian warmth — pale wood, beige linen, ceramic vessels, single ikebana arrangement' },
      { name: 'لاكشري معاصر', aiPrompt: 'Contemporary luxury style with Calacatta marble, brushed gold accents, deep velvet upholstery, statement crystal lighting, polished surfaces' },
    ],
  },
  {
    slug: 'mood',
    name: 'المزاج',
    description: 'الإحساس العام للغرفة',
    sortOrder: 2,
    options: [
      { name: 'دافئ مريح', aiPrompt: 'Warm cozy atmosphere with amber lighting, plush textiles, soft throws, fireplace warmth, intimate scale' },
      { name: 'بارد منعش', aiPrompt: 'Cool refreshing atmosphere with cool blue and grey tones, marble surfaces, glass partitions, airy openness' },
      { name: 'هادئ سكوني', aiPrompt: 'Calm zen atmosphere with muted earth tones, natural materials, minimal decoration, serene composition' },
      { name: 'فاخر مترف', aiPrompt: 'Luxurious opulent atmosphere with velvet upholstery, gold leaf accents, crystal chandeliers, polished marble, statement art' },
      { name: 'بسيط نقي', aiPrompt: 'Simple pure atmosphere with abundant empty space, single statement piece, restrained palette of two colors maximum' },
      { name: 'حيوي نابض', aiPrompt: 'Vibrant lively atmosphere with bold color blocks, patterned rugs, eclectic art collection, energetic composition' },
    ],
  },
  {
    slug: 'lighting',
    name: 'الإضاءة',
    description: 'نوع وزاوية الإضاءة',
    sortOrder: 3,
    options: [
      { name: 'نهار طبيعي مشرق', aiPrompt: 'Bright natural daylight pouring through large windows, even illumination, soft shadows' },
      { name: 'مسائي دافئ', aiPrompt: 'Warm evening light at 2700K, table lamps, candles and wall sconces, intimate pools of light' },
      { name: 'درامي', aiPrompt: 'Dramatic chiaroscuro lighting with strong directional light and deep shadows, single source emphasis' },
      { name: 'منتشر هادئ', aiPrompt: 'Diffuse soft ambient lighting with no harsh shadows, even cloudy-day quality of light' },
      { name: 'الساعة الذهبية', aiPrompt: 'Golden hour dawn or dusk light with long horizontal warm rays through windows, amber glow on surfaces' },
    ],
  },
  {
    slug: 'flooring-style',
    name: 'الأرضية',
    description: 'مادة وأسلوب الأرضية',
    sortOrder: 4,
    options: [
      { name: 'رخام أبيض مصقول', aiPrompt: 'Polished white marble flooring with subtle grey veining, mirror-finish reflection' },
      { name: 'خشب أوك فاتح', aiPrompt: 'Light oak wood plank flooring with matte finish, wide planks, natural grain visible' },
      { name: 'خشب جوز داكن', aiPrompt: 'Dark walnut wood plank flooring with satin finish, rich chocolate tone' },
      { name: 'بورسلين خرساني', aiPrompt: 'Large-format porcelain tile flooring with concrete look, matte grey, minimal grout lines' },
      { name: 'سجاد فارسي', aiPrompt: 'Persian rug covering most of the floor with traditional medallion motifs in deep red and navy' },
      { name: 'بلاط هندسي ملوّن', aiPrompt: 'Patterned Moroccan zellige tile flooring with geometric blue and white repeats' },
    ],
  },
  {
    slug: 'ceiling',
    name: 'السقف',
    description: 'تصميم وارتفاع السقف',
    sortOrder: 5,
    options: [
      { name: 'سقف عالٍ أبيض', aiPrompt: 'High white ceiling with classical crown molding, generous vertical space' },
      { name: 'سقف خشبي مكشوف', aiPrompt: 'Exposed wood beam ceiling with rough-hewn timber and white panels between' },
      { name: 'سقف بإضاءة مخفية', aiPrompt: 'Tray ceiling with hidden cove LED lighting around the perimeter, indirect glow' },
      { name: 'سقف منخفض حميمي', aiPrompt: 'Low intimate ceiling for cozy enveloping feeling, warm wood paneling' },
      { name: 'قبة نجدية', aiPrompt: 'Traditional Najdi domed ceiling with geometric carved plaster ornament' },
    ],
  },
];

// ── SAMPLE categories — multi-select in the studio ────────────────────

const SAMPLE_CATS: Array<{
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  items: Array<{ name: string; aiPrompt: string; modelNumber?: string; widthCm?: number; heightCm?: number; thicknessMm?: number }>;
}> = [
  {
    slug: 'walls',
    name: 'الجدران',
    description: 'خامات وألوان الجدران',
    sortOrder: 10,
    items: [
      { name: 'دهان أبيض ناصع', aiPrompt: 'Walls: crisp white painted walls in eggshell finish, pristine and bright' },
      { name: 'دهان بيج دافئ', aiPrompt: 'Walls: warm beige limewash painted walls with subtle cloud-like texture' },
      { name: 'دهان رمادي فحمي', aiPrompt: 'Walls: charcoal grey painted accent wall, matte finish, deep and moody' },
      { name: 'دهان بحري عميق', aiPrompt: 'Walls: deep navy blue painted walls with brass picture rail and white trim' },
      { name: 'دهان زيتي ثرّ', aiPrompt: 'Walls: rich olive green painted walls in eggshell finish, sophisticated and grounded' },
      { name: 'حجر طبيعي مكشوف', aiPrompt: 'Walls: natural exposed stone wall with irregular tan and grey blocks, raw texture' },
      { name: 'طوب أحمر مكشوف', aiPrompt: 'Walls: red exposed brick accent wall, slightly weathered, vintage industrial feel' },
      { name: 'خشب أوك بانوراما', aiPrompt: 'Walls: light oak wood paneling, vertical slats, full-wall coverage, warm and contemporary' },
      { name: 'خشب جوز مفصل', aiPrompt: 'Walls: dark walnut wood paneling with horizontal grooves, rich and tactile' },
      { name: 'ورق حائط هندسي', aiPrompt: 'Walls: geometric wallpaper with subtle gold pattern on neutral cream base' },
      { name: 'ورق حائط نباتي', aiPrompt: 'Walls: botanical wallpaper with large tropical leaves on dark forest green background' },
      { name: 'مشربية خشبية', aiPrompt: 'Walls: traditional carved wooden mashrabiya screen as accent wall, geometric Islamic patterns' },
    ],
  },
  {
    slug: 'floor-tiles',
    name: 'البلاط والأرضيات',
    description: 'بلاط الأرضيات والحوائط',
    sortOrder: 20,
    items: [
      { name: 'رخام كرارا', aiPrompt: 'Floor: polished Carrara white marble with soft grey veining, reflective surface', widthCm: 60, heightCm: 60, thicknessMm: 12 },
      { name: 'رخام كاليكاتا ذهبي', aiPrompt: 'Floor: Calacatta gold marble with bold gold and grey veining, polished mirror finish', widthCm: 80, heightCm: 80, thicknessMm: 15 },
      { name: 'بلاط بورسلين خرساني', aiPrompt: 'Floor: large-format porcelain tile with concrete look, matte grey, minimal grout', widthCm: 120, heightCm: 60, thicknessMm: 10 },
      { name: 'بلاط مغربي زليج', aiPrompt: 'Floor: Moroccan zellige tile with geometric pattern in cobalt blue and white', widthCm: 20, heightCm: 20, thicknessMm: 8 },
      { name: 'بلاط خشبي طويل', aiPrompt: 'Floor: wood-look porcelain plank tile in oak finish, long planks', widthCm: 120, heightCm: 20, thicknessMm: 9 },
      { name: 'بازلت أسود', aiPrompt: 'Floor: black basalt natural stone tile with honed finish, deep matte', widthCm: 60, heightCm: 30, thicknessMm: 15 },
      { name: 'تيرازو كريمي', aiPrompt: 'Floor: terrazzo tile with multi-color chips on warm cream base, polished', widthCm: 60, heightCm: 60, thicknessMm: 12 },
      { name: 'حجر ترافرتين', aiPrompt: 'Floor: travertine natural stone in warm beige with characteristic pitted texture, honed', widthCm: 60, heightCm: 40, thicknessMm: 15 },
    ],
  },
  {
    slug: 'furniture',
    name: 'الأثاث',
    description: 'قطع الأثاث الرئيسية',
    sortOrder: 30,
    items: [
      { name: 'أريكة قطنية بيج', aiPrompt: 'Furniture: 3-seater sofa in beige cotton-linen, low profile arms, curved back, deep seats' },
      { name: 'أريكة جلد كاميل', aiPrompt: 'Furniture: chesterfield sofa in camel leather with deep button tufting, rolled arms' },
      { name: 'طاولة قهوة جوز', aiPrompt: 'Furniture: round solid walnut coffee table on hairpin legs, organic edge' },
      { name: 'طاولة قهوة رخامية', aiPrompt: 'Furniture: white marble coffee table on brushed brass cylindrical base' },
      { name: 'كرسي مسترخي ميد-سنشري', aiPrompt: 'Furniture: mid-century lounge chair in cognac leather with walnut frame and ottoman' },
      { name: 'سرير ملكي مبطّن', aiPrompt: 'Furniture: king-size upholstered bed in cream boucle fabric with channel tufted headboard' },
      { name: 'مكتبة جوز عالية', aiPrompt: 'Furniture: floor-to-ceiling walnut bookshelf with brass hardware, mixed open and closed storage' },
      { name: 'طاولة طعام أوك', aiPrompt: 'Furniture: solid oak rectangular dining table seating 8, simple trestle base' },
      { name: 'طاولة جانبية برونزية', aiPrompt: 'Furniture: small round side table with brushed brass base and white marble top' },
      { name: 'كرسي ذراعين مخملي', aiPrompt: 'Furniture: classic wing-back armchair upholstered in deep emerald velvet with brass nail-head trim' },
      { name: 'مجلس أرضي عربي', aiPrompt: 'Furniture: traditional floor majlis seating with low cushions in red and beige, lined along walls, arabesque embroidery' },
      { name: 'كنبة منحنية معاصرة', aiPrompt: 'Furniture: large curved sectional sofa in warm camel velvet, pit-style, fits a contemporary majlis' },
    ],
  },
  {
    slug: 'lighting-fixtures',
    name: 'الإضاءة (وحدات)',
    description: 'الثريات والمصابيح',
    sortOrder: 40,
    items: [
      { name: 'ثريا كريستال كلاسيكية', aiPrompt: 'Lighting: traditional 8-arm crystal chandelier with brass frame, hung centrally' },
      { name: 'ثريا حديثة خطية', aiPrompt: 'Lighting: modern linear LED chandelier in matte black, suspended over dining table' },
      { name: 'أضواء معلقة برونزية', aiPrompt: 'Lighting: cluster of brass pendant lights at varying heights with frosted glass globes' },
      { name: 'مصباح أرضي قوسي', aiPrompt: 'Lighting: tall arc floor lamp with brushed brass arm and white marble base, leaning over sofa' },
      { name: 'إنارة جدارية برونزية', aiPrompt: 'Lighting: pair of brass wall sconces flanking a feature wall, frosted glass shades' },
      { name: 'إضاءة كوف مخفية', aiPrompt: 'Lighting: hidden warm LED cove lighting around ceiling perimeter, indirect ambient glow' },
      { name: 'فانوس عربي معلق', aiPrompt: 'Lighting: traditional pierced-brass Arabic lantern with warm glow, casting geometric shadows' },
    ],
  },
  {
    slug: 'decor-accents',
    name: 'الإكسسوارات',
    description: 'لمسات نهائية وإكسسوارات',
    sortOrder: 50,
    items: [
      { name: 'سجادة فارسية كلاسيكية', aiPrompt: 'Decor: vintage Persian rug in deep red and navy with intricate central medallion' },
      { name: 'سجادة بربرية بسيطة', aiPrompt: 'Decor: Moroccan Beni Ourain rug in cream with simple black diamond pattern, plush pile' },
      { name: 'سجادة بنطي معاصرة', aiPrompt: 'Decor: contemporary tonal rug in warm beige with subtle abstract pattern' },
      { name: 'نخلة أناناس داخلية', aiPrompt: 'Decor: tall fiddle-leaf fig plant in matte cream ceramic pot, beside seating' },
      { name: 'شجرة زيتون', aiPrompt: 'Decor: small olive tree in tall terracotta planter with silver-green foliage' },
      { name: 'مرآة مدورة كبيرة', aiPrompt: 'Decor: large round mirror with brushed gold frame above the main feature wall' },
      { name: 'لوحة تجريدية كبيرة', aiPrompt: 'Decor: large abstract painting with earth tones and gold leaf accents above the sofa' },
      { name: 'مزهرية يدوية خضراء', aiPrompt: 'Decor: handmade ceramic vase with glossy emerald glaze on coffee table, single dried branch' },
      { name: 'رف مفتوح منسّق', aiPrompt: 'Decor: open shelving styled with curated books, ceramics, and small plants in muted tones' },
      { name: 'وسائد عربية مطرّزة', aiPrompt: 'Decor: scattered floor cushions with traditional Arabic embroidery in burgundy and gold' },
    ],
  },
];

// ── Run ────────────────────────────────────────────────────────────────

async function upsertCategory(
  cat: { slug: string; name: string; description?: string; sortOrder: number; kind: SampleKind },
) {
  const existing = await prisma.sampleCategory.findUnique({ where: { slug: cat.slug } });
  if (existing) return existing;
  return prisma.sampleCategory.create({ data: cat });
}

async function upsertSample(
  categoryId: string,
  s: { name: string; aiPrompt: string; modelNumber?: string; widthCm?: number; heightCm?: number; thicknessMm?: number },
) {
  // Match on category+name to keep idempotency without touching admin edits
  const existing = await prisma.sample.findFirst({
    where: { categoryId, name: s.name },
  });
  if (existing) return existing;

  return prisma.sample.create({
    data: {
      categoryId,
      name: s.name,
      aiPrompt: s.aiPrompt,
      modelNumber: s.modelNumber,
      widthCm: s.widthCm !== undefined ? new Prisma.Decimal(s.widthCm) : null,
      heightCm: s.heightCm !== undefined ? new Prisma.Decimal(s.heightCm) : null,
      thicknessMm: s.thicknessMm !== undefined ? new Prisma.Decimal(s.thicknessMm) : null,
      // imageUrl left null on purpose — admin uploads via the UI later
    },
  });
}

async function upsertColor(c: { code: string; name: string; hex: string; family: string; sortOrder: number }) {
  const existing = await prisma.color.findUnique({ where: { code: c.code } });
  if (existing) return existing;
  return prisma.color.create({ data: c });
}

async function upsertSpace(s: { slug: string; name: string; icon?: string; sortOrder: number }) {
  const existing = await prisma.spaceType.findUnique({ where: { slug: s.slug } });
  if (existing) return existing;
  return prisma.spaceType.create({ data: { ...s, icon: s.icon ?? null } });
}

/**
 * After samples are inserted, set sensible defaults for colorMode on
 * categories where it makes obvious sense:
 * - All "walls" samples → ANY (paint can be any color)
 * - "furniture" sofas/chairs/beds → ANY (fabric/upholstery)
 * - "decor-accents" rugs → ANY
 * Only sets if the existing value is still NONE — never overrides
 * admin customizations.
 */
async function applyDefaultColorModes() {
  const wallsCat = await prisma.sampleCategory.findUnique({ where: { slug: 'walls' } });
  if (wallsCat) {
    await prisma.sample.updateMany({
      where: { categoryId: wallsCat.id, colorMode: ColorMode.NONE },
      data: { colorMode: ColorMode.ANY },
    });
  }
  const furnitureCat = await prisma.sampleCategory.findUnique({ where: { slug: 'furniture' } });
  if (furnitureCat) {
    // Only upholstered items
    const upholstered = await prisma.sample.findMany({
      where: {
        categoryId: furnitureCat.id,
        colorMode: ColorMode.NONE,
        OR: [
          { name: { contains: 'أريكة' } },
          { name: { contains: 'سرير' } },
          { name: { contains: 'كرسي' } },
          { name: { contains: 'كنبة' } },
          { name: { contains: 'مجلس' } },
        ],
      },
      select: { id: true },
    });
    if (upholstered.length > 0) {
      await prisma.sample.updateMany({
        where: { id: { in: upholstered.map((u) => u.id) } },
        data: { colorMode: ColorMode.ANY },
      });
    }
  }
  const accentsCat = await prisma.sampleCategory.findUnique({ where: { slug: 'decor-accents' } });
  if (accentsCat) {
    const rugs = await prisma.sample.findMany({
      where: {
        categoryId: accentsCat.id,
        colorMode: ColorMode.NONE,
        OR: [
          { name: { contains: 'سجادة' } },
          { name: { contains: 'وسائد' } },
          { name: { contains: 'لوحة' } },
        ],
      },
      select: { id: true },
    });
    if (rugs.length > 0) {
      await prisma.sample.updateMany({
        where: { id: { in: rugs.map((r) => r.id) } },
        data: { colorMode: ColorMode.ANY },
      });
    }
  }
}

async function setSystemPrompt() {
  const existing = await prisma.apiSetting.findFirst({ where: { provider: 'OPENAI' } });
  const cfgIn = (existing?.modelConfigJson ?? {}) as Record<string, unknown>;

  // If a system prompt is already set (admin customized it), don't overwrite
  if (typeof cfgIn.systemPrompt === 'string' && cfgIn.systemPrompt.trim().length > 0) {
    console.log('ℹ️   System prompt already configured — leaving as-is');
    return;
  }

  const newCfg = {
    ...cfgIn,
    systemPrompt: SYSTEM_PROMPT,
    quality: cfgIn.quality ?? 'medium',
    visionModel: cfgIn.visionModel ?? 'gpt-4o-mini',
  };

  if (existing) {
    await prisma.apiSetting.update({
      where: { id: existing.id },
      data: { modelConfigJson: newCfg as Prisma.InputJsonValue },
    });
  } else {
    await prisma.apiSetting.create({
      data: {
        provider: 'OPENAI',
        apiKeyEncrypted: '',
        modelName: 'gpt-image-2',
        modelConfigJson: newCfg as Prisma.InputJsonValue,
        isActive: true,
      },
    });
  }
  console.log('✅  System prompt installed');
}

async function seedSiteAndShowcase() {
  // Site content (singleton row, only inserts if missing)
  const existing = await prisma.siteContent.findUnique({ where: { id: 'singleton' } });
  if (!existing) {
    await prisma.siteContent.create({
      data: {
        id: 'singleton',
        brandName: 'صفوف رايقة',
        brandTagline: 'ديكور رايق بلمسة الذكاء',
        heroEyebrow: 'جديد · مدعوم بـ gpt-image-2',
        heroTitle: 'حوّل غرفتك إلى تحفة بضغطة واحدة',
        heroSubtitle: 'ارفع صورة غرفتك واختر العينات وقل ما تتمنى. الذكاء الاصطناعي يُسلّمك تصميماً واقعياً بدقّة 4K خلال ثوانٍ.',
        ctaPrimary: 'جرّب مجاناً الآن',
        ctaSecondary: 'شاهد أمثلة التصاميم',
        trustLine: 'بدون بطاقة ائتمان · 5 تصاميم مجانية · يلتزم بهوية البيت السعودي',
        freeQuotaText: 'احصل على 5 تصاميم مجانية فور التسجيل',
      },
    });
    console.log('✅ Site content seeded');
  } else {
    console.log('ℹ️  Site content already exists');
  }

  const showcaseCount = await prisma.showcase.count();
  if (showcaseCount === 0) {
    const samples = [
      { title: 'مجلس عربي معاصر', description: 'مزج بين الحداثة والتراث الخليجي بألوان دافئة', badge: 'مودرن خليجي' },
      { title: 'صالة جلوس فاخرة', description: 'لمسة من الرخام الإيطالي مع الذهب القديم', badge: 'لاكشري' },
      { title: 'غرفة نوم رئيسية هادئة', description: 'ألوان ترابية وأضواء دافئة لراحة قصوى', badge: 'هدوء' },
      { title: 'مطبخ مفتوح أبيض', description: 'بساطة إسكندنافية مع تفاصيل برونزية', badge: 'إسكندنافي' },
      { title: 'حديقة استراحة عائلية', description: 'مساحة خارجية للاجتماعات والشواء', badge: 'استراحة' },
      { title: 'مكتب منزلي إنتاجي', description: 'مساحة عمل مركّزة مع نباتات داخلية', badge: 'مكتب' },
    ];
    for (let i = 0; i < samples.length; i++) {
      await prisma.showcase.create({
        data: {
          ...samples[i],
          // Placeholder URL — admin uploads real images via the panel
          imageUrl: '',
          sortOrder: i + 1,
        },
      });
    }
    console.log(`✅ ${samples.length} showcase placeholders seeded`);
  } else {
    console.log(`ℹ️  ${showcaseCount} showcase items already exist`);
  }
}

async function main() {
  console.log('🌱  Seeding Sufuf design content...\n');

  // STYLE categories
  let styleCount = 0;
  for (const cat of STYLE_CATS) {
    const c = await upsertCategory({
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      sortOrder: cat.sortOrder,
      kind: SampleKind.STYLE,
    });
    console.log(`📁 STYLE: ${cat.name}`);
    for (const opt of cat.options) {
      const s = await upsertSample(c.id, opt);
      if (s.createdAt.getTime() > Date.now() - 5_000) {
        styleCount++;
        console.log(`   ✓ ${opt.name}`);
      }
    }
  }

  // SAMPLE categories
  let sampleCount = 0;
  for (const cat of SAMPLE_CATS) {
    const c = await upsertCategory({
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      sortOrder: cat.sortOrder,
      kind: SampleKind.SAMPLE,
    });
    console.log(`\n📁 SAMPLE: ${cat.name}`);
    for (const item of cat.items) {
      const s = await upsertSample(c.id, item);
      if (s.createdAt.getTime() > Date.now() - 5_000) {
        sampleCount++;
        console.log(`   ✓ ${item.name}`);
      }
    }
  }

  // Master colors
  console.log('\n🎨 Master color palette:');
  let colorCount = 0;
  for (const c of COLORS) {
    const existing = await upsertColor(c);
    if (existing.createdAt.getTime() > Date.now() - 5_000) {
      colorCount++;
      console.log(`   ✓ ${c.code} ${c.name} ${c.hex}`);
    }
  }

  // Space types
  console.log('\n🏠 Space types:');
  let spaceCount = 0;
  for (const s of SPACES) {
    const existing = await upsertSpace(s);
    if (existing.createdAt.getTime() > Date.now() - 5_000) {
      spaceCount++;
      console.log(`   ✓ ${s.icon ?? ''} ${s.name}`);
    }
  }

  // Apply default colorMode to walls + upholstered furniture + rugs
  console.log('\n🎨 Applying default color modes...');
  await applyDefaultColorModes();

  // Site content + showcase
  console.log('\n🌐 Site & showcase:');
  await seedSiteAndShowcase();

  // System prompt
  console.log('\n🤖 Configuring AI system prompt...');
  await setSystemPrompt();

  console.log(`\n🎉  Done.`);
  console.log(`    STYLE options: ${styleCount} new`);
  console.log(`    SAMPLE items:  ${sampleCount} new`);
  console.log(`    Colors:        ${colorCount} new`);
  console.log(`    Space types:   ${spaceCount} new`);
  console.log('   (Existing items left untouched — re-running this seed is safe.)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
