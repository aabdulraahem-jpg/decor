# Sufuf API (`sufuf-api`)

Backend لمشروع **سُفُف** — NestJS 10 + Prisma + MySQL.
يُخدم على `https://api.sufuf.pro` (المنفذ الداخلي `4000`).

---

## المتطلبات

- Node.js **20.x**
- pnpm (موصى) أو npm
- MySQL 8.x (محلياً عبر HestiaCP على VPS الإنتاج)
- PM2 (للإنتاج)

---

## التثبيت المحلي

```bash
pnpm install
cp .env.example .env
# عبّئ القيم في .env (DATABASE_URL، JWT_SECRET، إلخ)

pnpm prisma:generate
pnpm prisma:migrate         # ينشئ أول migration ويطبّقه على قاعدة dev
pnpm start:dev              # تطوير مع watch
```

ثم: <http://localhost:4000/health>

---

## النشر على Hostinger VPS (HestiaCP)

تم تجهيز:

- النطاق الفرعي `api.sufuf.pro` على Hestia.
- قاعدة البيانات `sufuf_sufuf_db` والمستخدم `sufuf_Notouch` (كلمة السر في `server-keys/credentials.env`).
- مجلد النشر: `/home/sufuf/web/api.sufuf.pro/public_html/`.

### خطوات النشر

```bash
# 1) رفع/سحب الكود
cd /home/sufuf/web/api.sufuf.pro/public_html
git pull   # أو rsync من جهازك

# 2) التبعيات (production فقط)
pnpm install --frozen-lockfile --prod=false

# 3) ضع .env بالقيم الفعلية (لا تُرفع للريبو)
nano .env

# 4) Prisma — توليد عميل + تطبيق migrations على قاعدة الإنتاج
pnpm prisma:generate
pnpm prisma:deploy

# 5) بناء
pnpm build

# 6) تشغيل عبر PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup     # مرة واحدة لربط PM2 بـ systemd
```

### Nginx Reverse Proxy

في إعدادات Hestia لنطاق `api.sufuf.pro`، أضف Proxy Template أو custom `nginx.conf_*` يحتوي:

```nginx
location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 300s;
}
```

ثم: `systemctl reload nginx`.

---

## Endpoints الجاهزة

| المسار | الوصف | الحالة |
|---|---|---|
| `GET /health` | فحص حالة عام | ✅ كامل |
| `GET /health/db` | فحص اتصال DB | ✅ كامل |
| `POST /api/v1/auth/register` | تسجيل (email + password) | ✅ كامل |
| `POST /api/v1/auth/login` | دخول | ✅ كامل |
| `POST /api/v1/auth/refresh` | تجديد التوكن | ✅ كامل |
| `POST /api/v1/auth/logout` | إبطال refresh token | ✅ كامل |
| `GET /api/v1/auth/google` | بدء Google OAuth | 🟡 strategy جاهزة، الربط TODO |
| `GET /api/v1/auth/google/callback` | | 🟡 يعرض profile، التوفير TODO |
| `POST /api/v1/auth/apple` | بدء Apple Sign In | 🟡 strategy جاهزة، الربط TODO |
| `POST /api/v1/auth/apple/callback` | | 🟡 |
| `GET /api/v1/users/me` | بيانات المستخدم الحالي | ✅ كامل |
| `GET /api/v1/users/:id` | (admin فقط) | ✅ كامل |

---

## TODO للجولات القادمة

- ✏️ تنفيذ `findOrCreateOAuthUser` في `AuthService` لـ Google/Apple.
- ✏️ Module المشاريع (Projects/Designs).
- ✏️ Module الكتالوجات (Furniture/Decor/Tiles/Walls/Colors) + endpoints الإدارة.
- ✏️ Module المدفوعات (Packages + Transactions + APS integration).
- ✏️ Module توليد الصور AI (OpenAI integration + AiGenerationLog).
- ✏️ Module لوحة الإدارة (settings + audit log).
- ✏️ اختبارات (jest + supertest).

---

## بنية المجلدات

```
backend/
├── prisma/schema.prisma     # كل الجداول (MySQL)
├── src/
│   ├── main.ts              # bootstrap
│   ├── app.module.ts
│   ├── prisma/              # PrismaService global
│   ├── common/              # filters, guards, interceptors
│   ├── config/
│   └── modules/
│       ├── auth/            # JWT + Google + Apple
│       ├── users/
│       └── health/
├── ecosystem.config.js      # PM2
├── .env.example
└── package.json
```
