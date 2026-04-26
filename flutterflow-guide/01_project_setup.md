# 01 — إعدادات المشروع في FlutterFlow

> طبّق الخطوات بالترتيب داخل **Settings and Integrations** ثم **Project Settings** في لوحة FlutterFlow.

## 1) معلومات التطبيق الأساسية

**المسار:** `Settings and Integrations → General → App Details`

| الحقل | القيمة |
|---|---|
| App Name (Arabic) | سُفُف |
| App Name (English) | Sufuf Design |
| Package Name (Android) | `pro.sufuf.app` |
| Bundle Identifier (iOS) | `pro.sufuf.app` |
| App Description | تطبيق إعادة تصميم الفراغات الداخلية بالذكاء الاصطناعي |

> **مهم:** Bundle ID و Package Name يجب أن يكونا متطابقين على iOS و Android: `pro.sufuf.app`.

## 2) اللغات و RTL

**المسار:** `Settings and Integrations → App Settings → Languages`

| الإعداد | القيمة |
|---|---|
| Primary Language | Arabic (ar) |
| Additional Languages | English (en) |
| RTL Support | تلقائي مع ar — لا يحتاج تفعيل يدوي |
| Default Locale | ar |

> FlutterFlow يحوّل اتجاه الواجهة تلقائياً عند اختيار اللغة العربية كأساسية.

## 3) إصدارات النظام الأدنى

**المسار:** `Settings and Integrations → Platform Settings`

| المنصّة | الحد الأدنى |
|---|---|
| iOS | 13.0 |
| Android Min SDK | 21 (Android 5.0 Lollipop) |
| Android Target SDK | الأحدث المتاح في FlutterFlow |

## 4) Theme Mode الافتراضي

**المسار:** `Theme Settings → Theme Mode`

| الإعداد | القيمة |
|---|---|
| Default Theme Mode | Dark |
| Allow User to Switch | Yes (سيُربط بمتغيّر `themeMode` في App State) |

## 5) Authentication

**المسار:** `Settings and Integrations → Authentication`

| الإعداد | القيمة |
|---|---|
| Authentication Type | **Custom** |
| Initial Page (Authenticated) | Home |
| Initial Page (Unauthenticated) | Onboarding أو Login |
| Logged In State Variable | يُربط بوجود `authTokens.accessToken` في App State |

> **لا تُفعّل Firebase Auth.** التطبيق يعتمد كلياً على الـ API الخاص بنا (`api.sufuf.pro`). تفاصيل الـ Auth Flow في `05_api_library.md` قسم Auth Group.

## 6) App Icon و Splash Screen

**المسار:** `Settings and Integrations → App Assets`

| العنصر | المتطلبات | المكان في FlutterFlow |
|---|---|---|
| App Icon | PNG 1024×1024 مربع، خلفية صلبة (لا شفافية لـ iOS) | App Icon → Upload |
| Splash Image | PNG 1080×1920 (Portrait) | Splash Screen → Image |
| Splash Background Color | `#0F1419` (الكحلي الداكن — مطابق للثيم) | Splash Screen → Background |

> ضع ملفات الأيقونة تحت `assets/branding/` في مستودع المشروع للمرجعية، ثم ارفعها عبر FlutterFlow.

## 7) Permissions المطلوبة

**المسار:** `Settings and Integrations → Permissions`

| الإذن | السبب | iOS Plist Key | Android Permission |
|---|---|---|---|
| Camera | تصوير الغرفة | `NSCameraUsageDescription` | `android.permission.CAMERA` |
| Photo Library | اختيار صورة من المعرض | `NSPhotoLibraryUsageDescription` | `READ_MEDIA_IMAGES` (API 33+) / `READ_EXTERNAL_STORAGE` |
| Internet | استدعاء الـ API | — (افتراضي على iOS) | `android.permission.INTERNET` (افتراضي) |

**نصوص الإذن (iOS Usage Descriptions):**

| المفتاح | النص العربي |
|---|---|
| `NSCameraUsageDescription` | يحتاج سُفُف الوصول للكاميرا لتصوير غرفتك وإعادة تصميمها. |
| `NSPhotoLibraryUsageDescription` | يحتاج سُفُف الوصول لصورك لاختيار صورة الغرفة المراد تصميمها. |

## 8) Push Notifications

**المسار:** `Settings and Integrations → Push Notifications`

> **لاحقاً.** اتركها معطّلة في هذه المرحلة. ستُضاف بعد إطلاق النسخة الأولى.

## 9) Constants

**المسار:** `App Values → Constants`

| Constant Name | Type | Value |
|---|---|---|
| `apiBase` | String | `https://api.sufuf.pro` |
| `apiVersion` | String | `v1` |
| `supportEmail` | String | `support@sufuf.pro` |
| `marketingUrl` | String | `https://sufuf.pro` |
| `privacyPolicyUrl` | String | `https://sufuf.pro/privacy` |
| `termsUrl` | String | `https://sufuf.pro/terms` |

> `apiBase` يُستخدم في كل API Call تحت `${apiBase}/...` — تفاصيل في `05_api_library.md`.

## 10) Custom Functions الأساسية (Placeholders)

**المسار:** `Custom Code → Custom Functions → Add Function`

أنشئ التواقيع التالية الآن (الكود يُكتب لاحقاً عند ربط الواجهات):

| اسم الدالة | الإرجاع | الباراميترات | الغرض |
|---|---|---|---|
| `formatPoints` | String | `points: int` | تنسيق الرقم بفواصل عربية |
| `isTokenExpired` | bool | `expiresAt: DateTime` | فحص انتهاء الـ access token |
| `parseStyleTags` | List\<String\> | `jsonString: String` | تحويل JSON من الـ API لقائمة |
| `buildAuthHeader` | String | `accessToken: String` | إرجاع `"Bearer ${accessToken}"` |
| `getRoomTypeLabel` | String | `roomType: String, lang: String` | ترجمة `MAJLIS` → "مجلس" / "Majlis" |
| `getStyleLabel` | String | `style: String, lang: String` | ترجمة `MODERN` → "حديث" / "Modern" |

> الكود الفعلي لكل دالة سيُكتب في مرحلة بناء الواجهات.

## الخطوة التالية

[`02_theme_colors.md`](./02_theme_colors.md) — إدخال الألوان والخطوط في Theme Settings.
