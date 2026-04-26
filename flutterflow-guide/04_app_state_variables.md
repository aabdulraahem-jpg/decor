# 04 — App State Variables

> **المسار:** `App State (الشريط الجانبي) → + Add Field`.
> لكل متغيّر: أدخل الاسم، اختر النوع، فعّل Persisted إذا كان يجب أن يبقى بعد إغلاق التطبيق، وحدّد القيمة الافتراضية.

## الجدول الكامل

| Variable | Type | Persisted | Default |
|---|---|---|---|
| `currentUser` | User (Custom DataType) | yes | null |
| `authTokens` | AuthTokens (Custom DataType) | yes | null |
| `pointsBalance` | Integer | no | 0 |
| `selectedLanguage` | String | yes | `'ar'` |
| `themeMode` | String | yes | `'dark'` |
| `isOnboardingComplete` | Boolean | yes | false |
| `projectDraft_imageUrl` | String | no | `''` |
| `projectDraft_roomType` | String | no | `''` |
| `projectDraft_style` | String | no | `''` |
| `projectDraft_colorPaletteId` | String | no | `''` |
| `projectDraft_furnitureIds` | List\<String\> | no | `[]` |
| `projectDraft_tileId` | String | no | `''` |
| `projectDraft_wallId` | String | no | `''` |
| `lastApiError` | String | no | `''` |

## التصنيفات والاستخدام

### المصادقة (Auth)
- `currentUser` — بيانات المستخدم الحالي. تُملأ بعد `authLogin` / `authRegister` / `getMe`.
- `authTokens` — التوكنز. تُحدَّث بعد `authLogin` / `authRefresh`. تُمسح عند `authLogout`.
- `pointsBalance` — مزدوج مع `currentUser.pointsBalance` لكن منفصل لتسهيل الـ binding في AppBar وعند الدفع. يُحدَّث بعد كل `generateDesign` و `confirmPurchase`.

### التفضيلات (Preferences) — Persisted
- `selectedLanguage` — `'ar'` أو `'en'`. يُمرَّر كـ `Accept-Language` header لكل API call.
- `themeMode` — `'dark'` أو `'light'`. يُربط بـ Theme Mode في FlutterFlow.
- `isOnboardingComplete` — هل أكمل المستخدم شاشات Onboarding أول مرة. تستخدمه شاشة Splash لتقرير الوجهة.

### مسوّدة المشروع (Project Draft) — غير Persisted
> هذه المتغيّرات تُملأ خطوة بخطوة في Project Wizard، ثم تُمسح بعد الإرسال الناجح لـ `createProject` + `generateDesign`.

- `projectDraft_imageUrl` — URL للصورة المرفوعة (نتيجة `uploadImage`).
- `projectDraft_roomType` — قيمة من `RoomType` Enum كنص.
- `projectDraft_style` — قيمة من `Style` Enum كنص.
- `projectDraft_colorPaletteId` — id لوحة الألوان المختارة.
- `projectDraft_furnitureIds` — قائمة ids لقطع الأثاث.
- `projectDraft_tileId` — id خيار البلاط.
- `projectDraft_wallId` — id خيار الجدار.

### الأخطاء
- `lastApiError` — رسالة الخطأ الأخيرة من API. تُملأ في On Failure Callback لأي API call، وتُعرض في Snackbar / Dialog.

## القواعد العامة

- **Persisted = نعم** فقط للقيم التي يجب أن تنجو بعد إغلاق التطبيق (Auth, Preferences).
- **Persisted = لا** للقيم المؤقتة (مسوّدات، أخطاء، رصيد النقاط الذي يُحدَّث من الـ API عند كل تشغيل).
- **التهيئة:** عند فتح التطبيق:
  1. اقرأ `authTokens` المخزّنة.
  2. إذا موجودة وغير منتهية: استدعِ `getMe` لجلب `currentUser` و `pointsBalance` المُحدّثَين.
  3. إذا منتهية: استدعِ `authRefresh`.
  4. إذا فشل: امسح `authTokens` و `currentUser` ووجّه لـ Login.

## كيفية الإدخال — مثال خطوة بخطوة

لإنشاء `currentUser`:
1. `App State → + Add Field`.
2. Field Name: `currentUser`.
3. Type: `Data Type` → اختر `User` من القائمة.
4. Default Value: اتركه فارغاً (null).
5. فعّل `Persisted`.
6. احفظ.

لإنشاء `projectDraft_furnitureIds`:
1. Field Name: `projectDraft_furnitureIds`.
2. Type: `String` → فعّل خيار `Is List`.
3. Default Value: قائمة فارغة `[]`.
4. اترك Persisted معطّلاً.
5. احفظ.

## الخطوة التالية

[`05_api_library.md`](./05_api_library.md) — تعريف جميع API Calls.
