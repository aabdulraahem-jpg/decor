# سُفُف — Project Context for Claude Code

## Project Overview
**Sufuf** (سُفُف) — AI-powered interior design app.
- **Mobile**: Flutter iOS app → `mobile/`
- **Backend**: NestJS + Prisma + MySQL → `backend/`
- **Admin Panel**: Next.js 14 → `admin/`
- **GitHub**: https://github.com/aabdulraahem-jpg/decor.git
- **Production domain**: sufuf.pro | api.sufuf.pro | admin.sufuf.pro
- **Database**: MySQL on Hostinger (HestiaCP)
- **Payments**: Amazon Payment Services (APS / PayFort)
- **AI**: OpenAI DALL-E 3 (5 points per design)

## Admin Credentials (seeded in DB)
- Email: noinvolveme@gmail.com
- Role: ADMIN
- Default password set in seed script (change after first login)

## Current Build Status

### Backend `backend/` — COMPLETE ✅
All NestJS modules built and wired in `app.module.ts`:
- `AuthModule` — register, login, refresh, logout, JWT strategy
- `PackagesModule` — list active packages + admin CRUD (`/packages`, `/packages/admin/all`)
- `PaymentsModule` — APS checkout initiation, webhook, return verify, user history
- `ProjectsModule` — CRUD scoped to authenticated user
- `DesignsModule` — OpenAI DALL-E 3 generation, deducts 5 points per design
- `CatalogModule` — furniture, styles, walls, tiles, colors (read from DB)
- `AdminModule` — stats, users, transactions, APS settings, AI settings
- Common: `JwtAuthGuard`, `AdminGuard`, `CurrentUser` decorator

API prefix: `/api/v1` (except `/health`)

### Admin Panel `admin/` — COMPLETE ✅
Next.js 14 App Router, Tailwind CSS, RTL Arabic.
- `/login` — admin auth, checks role=ADMIN
- `/dashboard` — stats overview
- `/packages` — full CRUD with modal form
- `/users` — table with search + adjust points
- `/transactions` — filter by status
- `/settings/aps` — Amazon Payment Services credentials
- `/settings/ai` — OpenAI API key + model selection

### Mobile `mobile/` — UI COMPLETE, API NOT CONNECTED YET ⚠️
All screens built. Repositories exist but still use mock data.
**Next step**: replace mock data in repositories with real API calls.
Key files:
- `lib/data/repositories/` — connect to `https://api.sufuf.pro/api/v1`
- `lib/data/mocks/catalog_mock.dart` — replace with API calls
- `lib/core/network/api_client.dart` — Dio client already configured

### Seed Script `backend/prisma/seed.ts` — READY ✅
Creates: admin user + 5 packages + 6 styles + 6 palettes + 10 furniture + 6 walls + 6 tiles

## Deployment Steps (on this server)

```bash
# 1. Clone repo
git clone https://github.com/aabdulraahem-jpg/decor.git /home/sufuf
cd /home/sufuf/backend

# 2. Create .env from example
cp .env.example .env
# Edit: DATABASE_URL, JWT_SECRET, APS_*, OPENAI_API_KEY, CORS_ORIGINS

# 3. Install, migrate, seed
npm install
npx prisma migrate deploy
npm run seed

# 4. Build and run
npm run build
pm2 start ecosystem.config.js --env production

# 5. Admin panel
cd /home/sufuf/admin
npm install
npm run build
pm2 start "npm run start" --name sufuf-admin
```

## Key Environment Variables Needed (`backend/.env`)
```
DATABASE_URL=mysql://sufuf_Notouch:PASSWORD@localhost:3306/sufuf_sufuf_db
JWT_SECRET=<strong-random-string>
APS_MERCHANT_ID=           # from admin panel later
APS_ACCESS_CODE=           # from admin panel later
APS_SHA_REQUEST=           # from admin panel later
APS_SHA_RESPONSE=          # from admin panel later
APS_BASE_URL=https://checkout.paymentservices.amazon.com/FortAPI/paymentPage
OPENAI_API_KEY=            # set via admin panel /settings/ai
CORS_ORIGINS=https://sufuf.pro,https://admin.sufuf.pro
```

## APS Integration Notes
- APS credentials stored in `api_settings` DB table (admin-managed, not just env vars)
- Signature: HMAC-SHA256 of sorted params wrapped in sha_request_phrase
- Webhook endpoint: `POST /api/v1/payments/webhook`
- Return endpoint: `POST /api/v1/payments/return`
- APS success status code: `'14'`

## What's Left To Do
1. **Connect mobile repositories to real API** (replace mock data)
2. **iOS App Store setup** (Bundle ID, Apple Developer account, provisioning)
3. **Deploy to Hostinger** (backend + admin panel)
4. **Enter APS credentials** via admin panel after deployment
5. **Enter OpenAI API key** via admin panel

## Project Folder Structure
```
مشروع ديكور/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── packages/
│   │   │   ├── payments/    # APS integration
│   │   │   ├── projects/
│   │   │   ├── designs/     # OpenAI
│   │   │   ├── catalog/
│   │   │   └── admin/
│   │   └── common/
│   │       ├── guards/      # JwtAuthGuard, AdminGuard
│   │       └── decorators/  # CurrentUser
│   └── prisma/
│       ├── schema.prisma    # Full DB schema
│       └── seed.ts          # Initial data
├── admin/            # Next.js admin panel
│   └── src/
│       ├── app/      # All pages
│       ├── components/
│       └── lib/      # api.ts, auth.ts
└── mobile/           # Flutter iOS app
    └── lib/
        ├── core/
        ├── data/
        └── features/
```
