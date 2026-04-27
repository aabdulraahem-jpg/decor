import 'package:flutter/material.dart';

import '../models/color_palette.dart';
import '../models/design.dart';
import '../models/furniture_item.dart';
import '../models/package.dart';
import '../models/project.dart';
import '../models/tile_option.dart';
import '../models/wall_option.dart';

/// نموذج وهمي لنوع الغرفة لعرضه في الواجهة.
class MockRoomType {
  const MockRoomType({
    required this.key,
    required this.labelAr,
    required this.icon,
  });

  final String key;
  final String labelAr;
  final IconData icon;
}

/// نموذج وهمي لنمط التصميم.
class MockStyle {
  const MockStyle({
    required this.key,
    required this.labelAr,
    required this.imageUrl,
    required this.descAr,
  });

  final String key;
  final String labelAr;
  final String imageUrl;
  final String descAr;
}

// ───────────────────────── Color Palettes ─────────────────────────

final List<ColorPalette> mockColorPalettes = const [
  ColorPalette(
    id: 'pal_beige_gold',
    name: 'بيج وذهبي',
    colorsList: ['#E8DCC4', '#C9A876', '#A0825B', '#FAF7F2', '#1A1F2E'],
  ),
  ColorPalette(
    id: 'pal_gray_white',
    name: 'رمادي وأبيض',
    colorsList: ['#FFFFFF', '#E5E5E5', '#A0AEC0', '#4A5568', '#1A202C'],
  ),
  ColorPalette(
    id: 'pal_blue_cream',
    name: 'أزرق وكريمي',
    colorsList: ['#F5EFE0', '#D8C9A8', '#5C7A92', '#2C4A63', '#0F1F2C'],
  ),
  ColorPalette(
    id: 'pal_green_natural',
    name: 'أخضر طبيعي',
    colorsList: ['#F0EDE3', '#C8B68A', '#8FA376', '#4F6B47', '#2A3D26'],
  ),
  ColorPalette(
    id: 'pal_pink_gold',
    name: 'وردي وذهبي',
    colorsList: ['#FBF2EE', '#F3D5C9', '#D89F8E', '#C9A876', '#5A3E36'],
  ),
  ColorPalette(
    id: 'pal_earth',
    name: 'ترابي',
    colorsList: ['#E8DCC4', '#B89968', '#8B6F47', '#5A3E2B', '#2A1B10'],
  ),
  ColorPalette(
    id: 'pal_ivory_navy',
    name: 'عاجي وكحلي',
    colorsList: ['#FFFFF0', '#E8DCC4', '#7A8FA6', '#1A2B4A', '#0A1428'],
  ),
  ColorPalette(
    id: 'pal_warm_sunset',
    name: 'غروب دافئ',
    colorsList: ['#FFE8C8', '#F5B97D', '#D87842', '#8B3A2A', '#3A1810'],
  ),
];

// ───────────────────────── Furniture ─────────────────────────

final List<FurnitureItem> mockFurnitureItems = const [
  FurnitureItem(
    id: 'fur_sofa',
    name: 'كنب',
    description: 'كنب فاخر مريح',
    imageUrl: 'https://picsum.photos/seed/sofa/400/300',
    category: 'living',
  ),
  FurnitureItem(
    id: 'fur_dining_table',
    name: 'طاولة طعام',
    description: 'طاولة طعام عائلية',
    imageUrl: 'https://picsum.photos/seed/diningtable/400/300',
    category: 'dining',
  ),
  FurnitureItem(
    id: 'fur_bed',
    name: 'سرير',
    description: 'سرير مزدوج',
    imageUrl: 'https://picsum.photos/seed/bed/400/300',
    category: 'bedroom',
  ),
  FurnitureItem(
    id: 'fur_wardrobe',
    name: 'خزانة ملابس',
    description: 'خزانة واسعة',
    imageUrl: 'https://picsum.photos/seed/wardrobe/400/300',
    category: 'bedroom',
  ),
  FurnitureItem(
    id: 'fur_desk',
    name: 'مكتب',
    description: 'مكتب عمل',
    imageUrl: 'https://picsum.photos/seed/desk/400/300',
    category: 'office',
  ),
  FurnitureItem(
    id: 'fur_coffee_table',
    name: 'طاولة قهوة',
    description: 'طاولة قهوة منخفضة',
    imageUrl: 'https://picsum.photos/seed/coffeetable/400/300',
    category: 'living',
  ),
  FurnitureItem(
    id: 'fur_chair',
    name: 'كرسي مفرد',
    description: 'كرسي ارتخاء',
    imageUrl: 'https://picsum.photos/seed/chair/400/300',
    category: 'living',
  ),
  FurnitureItem(
    id: 'fur_bookshelf',
    name: 'رف كتب',
    description: 'مكتبة كتب',
    imageUrl: 'https://picsum.photos/seed/bookshelf/400/300',
    category: 'living',
  ),
  FurnitureItem(
    id: 'fur_tv_console',
    name: 'تلفزيون كنسول',
    description: 'طاولة تلفزيون',
    imageUrl: 'https://picsum.photos/seed/tvconsole/400/300',
    category: 'living',
  ),
  FurnitureItem(
    id: 'fur_lighting',
    name: 'إضاءة',
    description: 'وحدة إضاءة فاخرة',
    imageUrl: 'https://picsum.photos/seed/lighting/400/300',
    category: 'decor',
  ),
  FurnitureItem(
    id: 'fur_plants',
    name: 'نباتات',
    description: 'نباتات داخلية',
    imageUrl: 'https://picsum.photos/seed/plants/400/300',
    category: 'decor',
  ),
  FurnitureItem(
    id: 'fur_artwork',
    name: 'لوحة فنية',
    description: 'لوحة جدارية',
    imageUrl: 'https://picsum.photos/seed/artwork/400/300',
    category: 'decor',
  ),
];

// ───────────────────────── Tile Options ─────────────────────────

final List<TileOption> mockTileOptions = const [
  TileOption(
    id: 'tile_ceramic_beige',
    name: 'سيراميك بيج',
    description: 'سيراميك دافئ بيج',
    imageUrl: 'https://picsum.photos/seed/tilebeige/400/300',
    category: 'ceramic',
  ),
  TileOption(
    id: 'tile_marble_white',
    name: 'رخام أبيض',
    description: 'رخام فاخر',
    imageUrl: 'https://picsum.photos/seed/marblewhite/400/300',
    category: 'marble',
  ),
  TileOption(
    id: 'tile_oak_wood',
    name: 'خشب بلوط',
    description: 'باركيه بلوط',
    imageUrl: 'https://picsum.photos/seed/oakwood/400/300',
    category: 'wood',
  ),
  TileOption(
    id: 'tile_walnut_wood',
    name: 'خشب جوز',
    description: 'باركيه جوز داكن',
    imageUrl: 'https://picsum.photos/seed/walnut/400/300',
    category: 'wood',
  ),
  TileOption(
    id: 'tile_pink_carpet',
    name: 'سجاد وردي',
    description: 'سجاد ناعم بلون وردي',
    imageUrl: 'https://picsum.photos/seed/pinkcarpet/400/300',
    category: 'carpet',
  ),
  TileOption(
    id: 'tile_natural_stone',
    name: 'حجر طبيعي',
    description: 'بلاط حجر طبيعي',
    imageUrl: 'https://picsum.photos/seed/naturalstone/400/300',
    category: 'stone',
  ),
];

// ───────────────────────── Wall Options ─────────────────────────

final List<WallOption> mockWallOptions = const [
  WallOption(
    id: 'wall_white_paint',
    name: 'دهان أبيض',
    description: 'دهان نظيف',
    imageUrl: 'https://picsum.photos/seed/whitepaint/400/300',
    finishType: 'paint',
  ),
  WallOption(
    id: 'wall_pink_wallpaper',
    name: 'ورق جدران زهري',
    description: 'ورق جدران أنيق',
    imageUrl: 'https://picsum.photos/seed/pinkwallpaper/400/300',
    finishType: 'wallpaper',
  ),
  WallOption(
    id: 'wall_natural_wood',
    name: 'خشب طبيعي',
    description: 'تكسية خشبية',
    imageUrl: 'https://picsum.photos/seed/naturalwood/400/300',
    finishType: 'wood',
  ),
  WallOption(
    id: 'wall_brick',
    name: 'طوب ظاهر',
    description: 'جدار طوب صناعي',
    imageUrl: 'https://picsum.photos/seed/brickwall/400/300',
    finishType: 'wood',
  ),
  WallOption(
    id: 'wall_luxury_stone',
    name: 'حجر فاخر',
    description: 'تكسية حجر فاخر',
    imageUrl: 'https://picsum.photos/seed/luxurystone/400/300',
    finishType: 'wallpaper',
  ),
  WallOption(
    id: 'wall_gray_paint',
    name: 'دهان رمادي',
    description: 'دهان رمادي عصري',
    imageUrl: 'https://picsum.photos/seed/graypaint/400/300',
    finishType: 'paint',
  ),
];

// ───────────────────────── Room Types ─────────────────────────

final List<MockRoomType> mockRoomTypes = const [
  MockRoomType(key: 'majlis', labelAr: 'مجلس', icon: Icons.weekend_outlined),
  MockRoomType(key: 'bedroom', labelAr: 'غرفة نوم', icon: Icons.bed_outlined),
  MockRoomType(
      key: 'kitchen', labelAr: 'مطبخ', icon: Icons.kitchen_outlined),
  MockRoomType(
      key: 'bathroom', labelAr: 'حمام', icon: Icons.bathtub_outlined),
  MockRoomType(
      key: 'livingRoom', labelAr: 'صالة', icon: Icons.chair_outlined),
  MockRoomType(
      key: 'diningRoom',
      labelAr: 'غرفة طعام',
      icon: Icons.restaurant_outlined),
  MockRoomType(key: 'office', labelAr: 'مكتب', icon: Icons.work_outline),
  MockRoomType(
      key: 'entryway', labelAr: 'مدخل', icon: Icons.door_front_door_outlined),
];

// ───────────────────────── Styles ─────────────────────────

final List<MockStyle> mockStyles = const [
  MockStyle(
    key: 'modern',
    labelAr: 'حديث',
    imageUrl: 'https://picsum.photos/seed/modernstyle/600/400',
    descAr: 'خطوط نظيفة وألوان محايدة',
  ),
  MockStyle(
    key: 'classic',
    labelAr: 'كلاسيكي',
    imageUrl: 'https://picsum.photos/seed/classicstyle/600/400',
    descAr: 'تفاصيل غنيّة وفخامة تقليدية',
  ),
  MockStyle(
    key: 'minimal',
    labelAr: 'بسيط',
    imageUrl: 'https://picsum.photos/seed/minimalstyle/600/400',
    descAr: 'الأقل هو الأكثر',
  ),
  MockStyle(
    key: 'arabicContemporary',
    labelAr: 'عربي معاصر',
    imageUrl: 'https://picsum.photos/seed/arabicstyle/600/400',
    descAr: 'لمسة شرقية بروح حديثة',
  ),
  MockStyle(
    key: 'industrial',
    labelAr: 'صناعي',
    imageUrl: 'https://picsum.photos/seed/industrial/600/400',
    descAr: 'معدن وخرسانة وطابع جريء',
  ),
  MockStyle(
    key: 'bohemian',
    labelAr: 'بوهيمي',
    imageUrl: 'https://picsum.photos/seed/bohemian/600/400',
    descAr: 'ألوان حيوية وتنوّع غني',
  ),
  MockStyle(
    key: 'scandinavian',
    labelAr: 'اسكندنافي',
    imageUrl: 'https://picsum.photos/seed/scandinavian/600/400',
    descAr: 'دفء وبساطة شمالية',
  ),
];

// ───────────────────────── Packages ─────────────────────────

final List<Package> mockPackages = const [
  Package(
    id: 'pkg_starter',
    name: 'الباقة المبدئية',
    pointsAmount: 10,
    priceSar: 19.0,
    sortOrder: 1,
  ),
  Package(
    id: 'pkg_basic',
    name: 'الباقة الأساسية',
    pointsAmount: 30,
    priceSar: 49.0,
    sortOrder: 2,
  ),
  Package(
    id: 'pkg_pro',
    name: 'الباقة الاحترافية',
    pointsAmount: 80,
    priceSar: 119.0,
    sortOrder: 3,
  ),
  Package(
    id: 'pkg_premium',
    name: 'الباقة الفاخرة',
    pointsAmount: 200,
    priceSar: 249.0,
    sortOrder: 4,
  ),
];

/// id الباقة الأكثر شعبية — تُعرض شارة عليها.
const String mostPopularPackageId = 'pkg_pro';

// ───────────────────────── Sample Projects ─────────────────────────

List<Project> getMockProjects() {
  final now = DateTime.now();
  return [
    Project(
      id: 'proj_1',
      userId: 'me',
      name: 'مجلس البيت',
      roomType: 'MAJLIS',
      originalImageUrl: 'https://picsum.photos/seed/proj1orig/800/600',
      createdAt: now.subtract(const Duration(days: 1)),
      designsCount: 3,
      designs: [
        Design(
          id: 'des_1_1',
          projectId: 'proj_1',
          generatedImageUrl: 'https://picsum.photos/seed/proj1d1/800/600',
          createdAt: now.subtract(const Duration(days: 1)),
          pointsConsumed: 5,
        ),
        Design(
          id: 'des_1_2',
          projectId: 'proj_1',
          generatedImageUrl: 'https://picsum.photos/seed/proj1d2/800/600',
          createdAt: now.subtract(const Duration(days: 1)),
          pointsConsumed: 5,
        ),
        Design(
          id: 'des_1_3',
          projectId: 'proj_1',
          generatedImageUrl: 'https://picsum.photos/seed/proj1d3/800/600',
          createdAt: now.subtract(const Duration(days: 1)),
          pointsConsumed: 5,
        ),
      ],
    ),
    Project(
      id: 'proj_2',
      userId: 'me',
      name: 'غرفة نوم رئيسية',
      roomType: 'BEDROOM',
      originalImageUrl: 'https://picsum.photos/seed/proj2orig/800/600',
      createdAt: now.subtract(const Duration(days: 5)),
      designsCount: 2,
      designs: [
        Design(
          id: 'des_2_1',
          projectId: 'proj_2',
          generatedImageUrl: 'https://picsum.photos/seed/proj2d1/800/600',
          createdAt: now.subtract(const Duration(days: 5)),
          pointsConsumed: 5,
        ),
        Design(
          id: 'des_2_2',
          projectId: 'proj_2',
          generatedImageUrl: 'https://picsum.photos/seed/proj2d2/800/600',
          createdAt: now.subtract(const Duration(days: 5)),
          pointsConsumed: 5,
        ),
      ],
    ),
    Project(
      id: 'proj_3',
      userId: 'me',
      name: 'صالة الجلوس',
      roomType: 'LIVING_ROOM',
      originalImageUrl: 'https://picsum.photos/seed/proj3orig/800/600',
      createdAt: now.subtract(const Duration(days: 12)),
      designsCount: 1,
      designs: [
        Design(
          id: 'des_3_1',
          projectId: 'proj_3',
          generatedImageUrl: 'https://picsum.photos/seed/proj3d1/800/600',
          createdAt: now.subtract(const Duration(days: 12)),
          pointsConsumed: 5,
        ),
      ],
    ),
  ];
}

/// يبحث عن مشروع بحسب id ضمن البيانات الوهمية.
Project? findMockProjectById(String id) {
  for (final p in getMockProjects()) {
    if (p.id == id) return p;
  }
  return null;
}

/// يبحث عن تصميم بحسب id ضمن البيانات الوهمية.
Design? findMockDesignById(String id) {
  for (final p in getMockProjects()) {
    for (final d in p.designs) {
      if (d.id == id) return d;
    }
  }
  return null;
}
