# 05 — API Library

> **المسار في FlutterFlow:** `API Calls (الشريط الجانبي) → + Create API Call` (أو `Create API Group` لتجميع المرتبطة).
> الـ Base URL: `[apiBase]` = `https://api.sufuf.pro` (مُعرَّف كـ Constant — راجع `01_project_setup.md`).
> اللغة الافتراضية للأمثلة: العربية مع المصطلحات التقنية بالإنجليزية.

## Headers افتراضية لكل Call (إلا حيث يُذكر خلاف ذلك)

| Header | Value |
|---|---|
| `Authorization` | `Bearer [authTokens.accessToken]` |
| `Content-Type` | `application/json` |
| `Accept-Language` | `[selectedLanguage]` |
| `Accept` | `application/json` |

> أنشئ **API Group** باسم `Sufuf API` يحوي هذه الـ Headers افتراضياً. الـ calls التي لا تحتاج Authorization (مثل Login/Register) — احذف Authorization header منها صراحةً.

---

## 1) Auth Group — مجموعة المصادقة (6 calls)

> **Group Name:** `Auth`. لا تضمّن `Authorization` header افتراضياً في هذه المجموعة (إضافته فقط لـ logout).

### 1.1 `authRegister`
| الحقل | القيمة |
|---|---|
| Method | POST |
| URL | `[apiBase]/auth/register` |

**Body (JSON):**
```json
{
  "email": "[email]",
  "password": "[password]",
  "name": "[name]"
}
```
**Response:**
```json
{
  "user": { "id": "...", "email": "...", "name": "...", "pointsBalance": 0, "role": "USER", "authProvider": "LOCAL" },
  "tokens": { "accessToken": "...", "refreshToken": "...", "expiresAt": "..." }
}
```
**JSON Paths:**
- `$.user` → User
- `$.tokens` → AuthTokens

### 1.2 `authLogin`
| الحقل | القيمة |
|---|---|
| Method | POST |
| URL | `[apiBase]/auth/login` |

**Body:**
```json
{ "email": "[email]", "password": "[password]" }
```
**Response:** نفس بنية `authRegister`.

### 1.3 `authRefresh`
| الحقل | القيمة |
|---|---|
| Method | POST |
| URL | `[apiBase]/auth/refresh` |

**Body:**
```json
{ "refreshToken": "[refreshToken]" }
```
**Response:**
```json
{ "tokens": { "accessToken": "...", "refreshToken": "...", "expiresAt": "..." } }
```
**JSON Path:** `$.tokens` → AuthTokens.

### 1.4 `authGoogle`
| الحقل | القيمة |
|---|---|
| Method | POST |
| URL | `[apiBase]/auth/google/callback` |

**Body:**
```json
{ "idToken": "[idToken]" }
```
**Response:** نفس بنية `authLogin`.

### 1.5 `authApple`
| الحقل | القيمة |
|---|---|
| Method | POST |
| URL | `[apiBase]/auth/apple/callback` |

**Body:**
```json
{
  "identityToken": "[identityToken]",
  "authorizationCode": "[authorizationCode]",
  "fullName": "[fullName]"
}
```
**Response:** نفس بنية `authLogin`.

### 1.6 `authLogout`
| الحقل | القيمة |
|---|---|
| Method | POST |
| URL | `[apiBase]/auth/logout` |
| Auth Header | مطلوب |

**Body:**
```json
{ "refreshToken": "[refreshToken]" }
```
**Response:**
```json
{ "success": true }
```

---

## 2) Users — مستخدم (3 calls)

> Group: `Users`. كلها تتطلب Bearer.

### 2.1 `getMe`
- Method: GET
- URL: `[apiBase]/users/me`
- Response: User
- JSON Path: `$` → User

### 2.2 `updateMe`
- Method: PATCH
- URL: `[apiBase]/users/me`
- Body:
```json
{ "name": "[name]", "phoneNumber": "[phoneNumber]", "avatarUrl": "[avatarUrl]" }
```
- Response: User

### 2.3 `deleteMyAccount`
- Method: DELETE
- URL: `[apiBase]/users/me`
- Response: `{ "success": true }`

---

## 3) Projects — مشاريع (5 calls)

> Group: `Projects`. كلها تتطلب Bearer.

### 3.1 `listProjects`
- Method: GET
- URL: `[apiBase]/projects?page=[page]&limit=[limit]`
- Query Params: `page` (Integer, default 1), `limit` (Integer, default 20)
- Response:
```json
{ "items": [Project, ...], "total": 0, "page": 1, "limit": 20 }
```
- JSON Path: `$.items[:]` → List\<Project\>

### 3.2 `createProject`
- Method: POST
- URL: `[apiBase]/projects`
- Body:
```json
{ "name": "[name]", "roomType": "[roomType]", "originalImageUrl": "[originalImageUrl]" }
```
- Response: Project

### 3.3 `getProject`
- Method: GET
- URL: `[apiBase]/projects/[projectId]`
- Path Param: `projectId`
- Response: Project (مع `designs` مضمّنة)

### 3.4 `updateProject`
- Method: PATCH
- URL: `[apiBase]/projects/[projectId]`
- Body:
```json
{ "name": "[name]" }
```
- Response: Project

### 3.5 `deleteProject`
- Method: DELETE
- URL: `[apiBase]/projects/[projectId]`
- Response: `{ "success": true }`

---

## 4) Designs — تصاميم (4 calls)

> Group: `Designs`. كلها تتطلب Bearer.

### 4.1 `generateDesign`
- Method: POST
- URL: `[apiBase]/projects/[projectId]/designs`
- Body:
```json
{
  "style": "[style]",
  "colorPaletteId": "[colorPaletteId]",
  "furnitureIds": ["[id1]", "[id2]"],
  "tileId": "[tileId]",
  "wallId": "[wallId]",
  "additionalPrompt": "[additionalPrompt]"
}
```
- Response:
```json
{
  "design": Design,
  "pointsRemaining": 0
}
```
- JSON Paths:
  - `$.design` → Design
  - `$.pointsRemaining` → Integer (يُكتب في `pointsBalance` App State)
- ملاحظة: قد يستغرق هذا الاستدعاء عدة ثوانٍ. اعرض Loading State.

### 4.2 `listDesigns`
- Method: GET
- URL: `[apiBase]/projects/[projectId]/designs`
- Response: `{ "items": [Design, ...] }`

### 4.3 `getDesign`
- Method: GET
- URL: `[apiBase]/designs/[designId]`
- Response: Design

### 4.4 `deleteDesign`
- Method: DELETE
- URL: `[apiBase]/designs/[designId]`
- Response: `{ "success": true }`

---

## 5) Catalog — فهرس (5 calls)

> Group: `Catalog`. تتطلب Bearer (للتخصيص حسب المستخدم).

### 5.1 `listFurniture`
- Method: GET
- URL: `[apiBase]/catalog/furniture?style=[style]&category=[category]`
- Query Params: `style` (optional), `category` (optional)
- Response: `{ "items": [FurnitureItem, ...] }`

### 5.2 `listDecor`
- Method: GET
- URL: `[apiBase]/catalog/decor`
- Response: `{ "items": [DecorElement, ...] }`

### 5.3 `listTiles`
- Method: GET
- URL: `[apiBase]/catalog/tiles`
- Response: `{ "items": [TileOption, ...] }`

### 5.4 `listWalls`
- Method: GET
- URL: `[apiBase]/catalog/walls`
- Response: `{ "items": [WallOption, ...] }`

### 5.5 `listColorPalettes`
- Method: GET
- URL: `[apiBase]/catalog/colors`
- Response: `{ "items": [ColorPalette, ...] }`

---

## 6) Uploads — رفع (1 call)

### 6.1 `uploadImage`
- Method: POST
- URL: `[apiBase]/uploads`
- Body Type: **multipart/form-data** (وليس JSON)
- Body Field: `file` → الصورة المختارة
- Headers: `Authorization: Bearer [authTokens.accessToken]` (احذف Content-Type — FlutterFlow يضبطه تلقائياً للـ multipart)
- Response:
```json
{ "url": "https://cdn.sufuf.pro/uploads/abc123.jpg" }
```
- JSON Path: `$.url` → String (يُكتب في `projectDraft_imageUrl`)

> في FlutterFlow: API Call Type → اختر `Upload File`.

---

## 7) Packages & Transactions — باقات ودفع (3 calls)

> Group: `Payments`. تتطلب Bearer.

### 7.1 `listPackages`
- Method: GET
- URL: `[apiBase]/packages`
- Response: `{ "items": [Package, ...] }`

### 7.2 `initiatePurchase`
- Method: POST
- URL: `[apiBase]/transactions/initiate`
- Body:
```json
{ "packageId": "[packageId]" }
```
- Response:
```json
{ "redirectUrl": "https://sbcheckout.payfort.com/...", "transactionId": "..." }
```
- ملاحظة: افتح `redirectUrl` في WebView لإكمال الدفع عبر APS.

### 7.3 `confirmPurchase`
- Method: POST
- URL: `[apiBase]/transactions/confirm`
- Body:
```json
{ "transactionId": "[transactionId]", "apsResponse": "[apsResponse]" }
```
- Response:
```json
{ "transaction": Transaction, "pointsRemaining": 0 }
```

---

## 8) Admin — لوحة الأدمن (12 calls — ملخّصة)

> Group: `Admin`. تتطلب Bearer لمستخدم بدور `ADMIN`. كلها تستخدم نفس الـ Headers الافتراضية.

| # | الاسم | Method | URL | Body / Query |
|---|---|---|---|---|
| 1 | `adminListUsers` | GET | `/admin/users?page=[page]&search=[search]` | — |
| 2 | `adminUpdateUser` | PATCH | `/admin/users/[userId]` | `{ role, pointsBalance, name }` |
| 3 | `adminBanUser` | POST | `/admin/users/[userId]/ban` | `{ reason }` |
| 4 | `adminCrudFurniture` | GET/POST/PATCH/DELETE | `/admin/catalog/furniture[/id]` | حقول FurnitureItem |
| 5 | `adminCrudDecor` | GET/POST/PATCH/DELETE | `/admin/catalog/decor[/id]` | حقول DecorElement |
| 6 | `adminCrudTiles` | GET/POST/PATCH/DELETE | `/admin/catalog/tiles[/id]` | حقول TileOption |
| 7 | `adminCrudWalls` | GET/POST/PATCH/DELETE | `/admin/catalog/walls[/id]` | حقول WallOption |
| 8 | `adminCrudColors` | GET/POST/PATCH/DELETE | `/admin/catalog/colors[/id]` | `{ name, colorsList }` |
| 9 | `adminCrudPackages` | GET/POST/PATCH/DELETE | `/admin/packages[/id]` | حقول Package |
| 10 | `adminListTransactions` | GET | `/admin/transactions?status=[status]&page=[page]` | — |
| 11 | `adminApiSettings` | GET / PATCH | `/admin/settings/api[/id]` | `{ apiKey, modelName, modelConfigJson, isActive }` |
| 12 | `adminDashboardStats` | GET | `/admin/dashboard/stats` | — |
| 13 | `adminListAuditLogs` | GET | `/admin/audit-logs?page=[page]&action=[action]` | — |

> CRUD الموحّد: لكل مورد كتالوجي (Furniture/Decor/Tiles/Walls/Colors/Packages) أنشئ 4 calls منفصلة في FlutterFlow: `adminListX`, `adminCreateX`, `adminUpdateX`, `adminDeleteX`. الجدول أعلاه ملخّص لتوفير المساحة.

---

## ملاحظات تنفيذية مهمة

- **معالجة 401:** عند استلام 401 من أي Call، نفّذ `authRefresh`. إذا فشل: امسح `authTokens` ووجّه لـ Login.
- **Loading State:** للـ calls الثقيلة (`generateDesign`, `uploadImage`) اعرض Progress Indicator.
- **Error Handling:** في On Failure لكل Call، اضبط `lastApiError` في App State بـ `[apiCallResponse.statusCode]: [apiCallResponse.bodyText]` ثم اعرض Snackbar.
- **Pagination:** أي Call يدعم `?page=&limit=` يجب التعامل معه عبر ListView مع Infinite Scroll.
- **Body Variables:** في FlutterFlow، استبدل القيم الديناميكية في الـ JSON بـ `<varName>` ثم عرّفها في تبويب Variables للـ Call.
- **الترجمة في Headers:** `Accept-Language` يُمرَّر تلقائياً ليعيد الـ API الرسائل بلغة المستخدم (يدعم البكاند `ar` و `en`).

## نهاية الجزء الأساسي

بعد اكتمال هذه الملفات الخمسة (إعدادات + ثيم + Data Types + App State + API)، تكون البنية جاهزة لبناء الواجهات. الخطوة التالية التي سيتم توثيقها لاحقاً: تصميم Pages و Components وربط Actions بهذه الـ APIs.
