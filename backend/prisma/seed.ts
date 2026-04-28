/**
 * Prisma Seed Script — سُفُف
 * يُنشئ: مستخدم أدمن + باقات النقاط + عناصر الكاتالوج
 *
 * تشغيل: npx prisma db seed
 * أو:    npx ts-node prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Simple argon2id-compatible hash using built-in crypto
// (At runtime NestJS uses the argon2 npm package; for seed we use crypto directly)
async function hashPassword(password: string): Promise<string> {
  // We import argon2 dynamically since it's available in devDependencies context
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const argon2 = require('argon2') as typeof import('argon2');
  return argon2.hash(password, { type: argon2.argon2id });
}

async function main() {
  console.log('🌱  Starting seed...');

  // ── Admin User ─────────────────────────────────────────────────────────
  const adminEmail = 'support@sufuf.pro';
  const adminPassword = 'Notouchall0)';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin صفوف رايقة',
        authProvider: 'LOCAL',
        passwordHash,
        role: 'ADMIN',
        emailVerified: true,
        pointsBalance: 9999,
      },
    });
    console.log(`✅  Admin user created: ${adminEmail}`);
  } else {
    console.log(`ℹ️   Admin user already exists: ${adminEmail}`);
  }

  // ── Points Packages ────────────────────────────────────────────────────
  const packages = [
    { name: 'باقة البداية', pointsAmount: 10, priceSar: 9.99, profitMargin: 30, sortOrder: 1 },
    { name: 'باقة الأساسية', pointsAmount: 25, priceSar: 19.99, profitMargin: 35, sortOrder: 2 },
    { name: 'باقة الاحترافية', pointsAmount: 60, priceSar: 39.99, profitMargin: 40, sortOrder: 3 },
    { name: 'باقة المتميزة', pointsAmount: 130, priceSar: 74.99, profitMargin: 45, sortOrder: 4 },
    { name: 'باقة الأعمال', pointsAmount: 300, priceSar: 149.99, profitMargin: 50, sortOrder: 5 },
  ];

  for (const pkg of packages) {
    const existing = await prisma.package.findFirst({ where: { name: pkg.name } });
    if (!existing) {
      await prisma.package.create({ data: { ...pkg, isActive: true } });
      console.log(`✅  Package: ${pkg.name} (${pkg.pointsAmount} نقطة / ${pkg.priceSar} ريال)`);
    }
  }

  // ── Decor Styles (used as design styles) ──────────────────────────────
  const styles = [
    {
      name: 'العصري',
      description: 'تصميم نظيف وبسيط بخطوط أنيقة',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
      category: 'style',
      styleTags: ['modern', 'minimal'],
    },
    {
      name: 'الكلاسيكي',
      description: 'فخامة الطراز الكلاسيكي مع تفاصيل دقيقة',
      imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      category: 'style',
      styleTags: ['classic', 'luxury'],
    },
    {
      name: 'الريفي الدافئ',
      description: 'أجواء دافئة بلمسات طبيعية وخشبية',
      imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800',
      category: 'style',
      styleTags: ['rustic', 'warm', 'natural'],
    },
    {
      name: 'المعاصر المفتوح',
      description: 'مساحات مفتوحة بألوان محايدة',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      category: 'style',
      styleTags: ['contemporary', 'open'],
    },
    {
      name: 'البوهيمي',
      description: 'مزيج جريء من الألوان والأنماط',
      imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800',
      category: 'style',
      styleTags: ['bohemian', 'colorful'],
    },
    {
      name: 'الصناعي',
      description: 'أسلوب المصانع بالمعادن والخرسانة',
      imageUrl: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=800',
      category: 'style',
      styleTags: ['industrial', 'urban'],
    },
  ];

  for (const style of styles) {
    const existing = await prisma.decorElement.findFirst({ where: { name: style.name } });
    if (!existing) {
      await prisma.decorElement.create({ data: { ...style, isActive: true } });
      console.log(`✅  Style: ${style.name}`);
    }
  }

  // ── Color Palettes ────────────────────────────────────────────────────
  const palettes = [
    {
      name: 'الذهبي الدافئ',
      colorsJson: ['#C9A876', '#E8DCC4', '#1A1F2E', '#FFFFFF', '#8B7355'],
    },
    {
      name: 'الأزرق الهادئ',
      colorsJson: ['#2C3E6B', '#5B8DB8', '#A8C5DA', '#F5F5F0', '#1A2540'],
    },
    {
      name: 'الأخضر الطبيعي',
      colorsJson: ['#4A6741', '#8BA888', '#C5D5C0', '#F0EDE6', '#2D4028'],
    },
    {
      name: 'الرمادي المعاصر',
      colorsJson: ['#3D3D3D', '#7A7A7A', '#B8B8B8', '#E8E8E8', '#F5F5F5'],
    },
    {
      name: 'الوردي الأنيق',
      colorsJson: ['#8B4560', '#C27B8A', '#E2B4B4', '#F5E8E8', '#4A2030'],
    },
    {
      name: 'البرتقالي الدافئ',
      colorsJson: ['#8B4513', '#CD853F', '#DEB887', '#F5DEB3', '#F0E6D3'],
    },
  ];

  for (const palette of palettes) {
    const existing = await prisma.colorPalette.findFirst({ where: { name: palette.name } });
    if (!existing) {
      await prisma.colorPalette.create({ data: { ...palette, isActive: true } });
      console.log(`✅  Palette: ${palette.name}`);
    }
  }

  // ── Furniture Items ───────────────────────────────────────────────────
  const furniture = [
    { name: 'أريكة حديثة', description: 'أريكة بتصميم عصري', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', category: 'seating', styleTags: ['modern'] },
    { name: 'طاولة قهوة', description: 'طاولة مركزية أنيقة', imageUrl: 'https://images.unsplash.com/photo-1581428982868-e410dd047a90?w=400', category: 'tables', styleTags: ['modern'] },
    { name: 'خزانة ملابس', description: 'خزانة واسعة متعددة الأدراج', imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400', category: 'storage', styleTags: ['classic'] },
    { name: 'سرير ملكي', description: 'سرير فاخر بتصميم كلاسيكي', imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400', category: 'bedroom', styleTags: ['luxury'] },
    { name: 'مكتب عمل', description: 'مكتب بتصميم عملي وأنيق', imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400', category: 'office', styleTags: ['modern'] },
    { name: 'كرسي مريح', description: 'كرسي أريكة للراحة', imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400', category: 'seating', styleTags: ['cozy'] },
    { name: 'رف كتب', description: 'رف جداري أنيق للكتب', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', category: 'storage', styleTags: ['modern'] },
    { name: 'طاولة طعام', description: 'طاولة طعام عائلية', imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400', category: 'dining', styleTags: ['classic'] },
    { name: 'كرسي بذراعين', description: 'كرسي كلاسيكي فخم', imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400', category: 'seating', styleTags: ['classic'] },
    { name: 'خزانة تلفزيون', description: 'وحدة تلفزيون عصرية', imageUrl: 'https://images.unsplash.com/photo-1585567678815-dc6d2c3a5c07?w=400', category: 'storage', styleTags: ['modern'] },
  ];

  for (const item of furniture) {
    const existing = await prisma.furnitureItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.furnitureItem.create({ data: { ...item, isActive: true } });
      console.log(`✅  Furniture: ${item.name}`);
    }
  }

  // ── Wall Options ──────────────────────────────────────────────────────
  const walls = [
    { name: 'طلاء أبيض ناصع', description: 'لون أبيض نقي', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'paint', styleTags: ['modern'] },
    { name: 'ورق حائط هندسي', description: 'أنماط هندسية عصرية', imageUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400', category: 'wallpaper', styleTags: ['geometric'] },
    { name: 'تأثير الجدار الحجري', description: 'مظهر حجر طبيعي', imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400', category: 'texture', styleTags: ['rustic'] },
    { name: 'لوح خشب داكن', description: 'ألواح خشبية بلون داكن', imageUrl: 'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=400', category: 'wood', styleTags: ['rustic', 'warm'] },
    { name: 'طلاء رمادي معاصر', description: 'رمادي أنيق وعصري', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400', category: 'paint', styleTags: ['contemporary'] },
    { name: 'ورق حائط زهور', description: 'نقوش زهور أنيقة', imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400', category: 'wallpaper', styleTags: ['classic', 'floral'] },
  ];

  for (const wall of walls) {
    const existing = await prisma.wallOption.findFirst({ where: { name: wall.name } });
    if (!existing) {
      await prisma.wallOption.create({ data: { ...wall, isActive: true } });
      console.log(`✅  Wall: ${wall.name}`);
    }
  }

  // ── Tile Options ──────────────────────────────────────────────────────
  const tiles = [
    { name: 'بلاط أبيض لامع', description: 'بلاط ناصع البياض', imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400', category: 'ceramic', styleTags: ['modern'] },
    { name: 'بلاط رخامي', description: 'تأثير رخام فاخر', imageUrl: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=400', category: 'marble', styleTags: ['luxury'] },
    { name: 'بلاط هندسي ملون', description: 'أشكال هندسية ملونة', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', category: 'geometric', styleTags: ['bohemian'] },
    { name: 'خشب طبيعي', description: 'أرضية خشب دافئة', imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400', category: 'wood', styleTags: ['rustic', 'warm'] },
    { name: 'بلاط رمادي حديث', description: 'بلاط رمادي متجانس', imageUrl: 'https://images.unsplash.com/photo-1562516710-a1e7c4de5538?w=400', category: 'ceramic', styleTags: ['industrial'] },
    { name: 'بلاط صخري داكن', description: 'مظهر صخري عصري', imageUrl: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400', category: 'stone', styleTags: ['industrial', 'modern'] },
  ];

  for (const tile of tiles) {
    const existing = await prisma.tileOption.findFirst({ where: { name: tile.name } });
    if (!existing) {
      await prisma.tileOption.create({ data: { ...tile, isActive: true } });
      console.log(`✅  Tile: ${tile.name}`);
    }
  }

  console.log('\n🎉  Seed completed successfully!');
  console.log(`\n📧  Admin login: ${adminEmail}`);
  console.log(`🔑  Admin password: ${adminPassword}`);
  console.log('\n⚠️   Change the admin password after first login!');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
