# Sufuf — سُفُف

تطبيق ديكور ذكي يولّد تصاميم داخلية لغرف المستخدم بالذكاء الصناعي، مع كتالوج للأثاث والألوان والبلاط والجدران، ونظام نقاط للدفع.

## البنية

| المجلد | الوصف |
|---|---|
| `backend/` | NestJS API + Prisma + MySQL |
| `mobile/` | تطبيق Flutter (iOS + Android + Web) — قيد البناء |
| `web-admin/` | لوحة تحكم الأدمن (لاحقاً) |
| `deploy/` | سكربتات نشر الـ backend على VPS |
| `docs/` | الوثائق والمخططات |
| `flutterflow-guide/` | دليل مرجعي (محفوظ للمراجعة) |

## التقنيات

- **Backend:** Node.js 20 + NestJS 10 + Prisma + MySQL + JWT + Argon2
- **Mobile:** Flutter (Dart) + Riverpod + Dio + go_router
- **AI:** OpenAI gpt-image-1
- **Payments:** Amazon Payment Services (APS)
- **Hosting:** Hostinger VPS (Ubuntu 24.04 + HestiaCP) — `sufuf.pro`
- **Auth:** Google + Apple Sign-In + Email/Password

## النطاقات

- `https://sufuf.pro` — الموقع الرئيسي (Flutter Web)
- `https://app.sufuf.pro` — تطبيق الويب
- `https://api.sufuf.pro` — REST API
- `https://admin.sufuf.pro` — لوحة الأدمن

## الترخيص

خاص — جميع الحقوق محفوظة © 2026
