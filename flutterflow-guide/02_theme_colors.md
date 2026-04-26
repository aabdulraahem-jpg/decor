# 02 — Theme Colors و Typography

> الإعدادات تُدخل في **Theme Settings** على لوحة FlutterFlow. الألوان والخطوط بالكامل أدناه جاهزة للنسخ.

## 1) Brand Colors

**المسار:** `Theme Settings → Colors → Add Custom Color`

| Token | HEX | الاستخدام |
|---|---|---|
| Primary | `#C9A876` | الأزرار الأساسية، التمييز الذهبي، CTAs |
| Secondary | `#1A1F2E` | الخلفيات الكحلية الداكنة، Headers |
| Tertiary | `#E8DCC4` | البيج الفاتح للإبراز الناعم، Highlights |
| Alternate | `#2A3142` | عناصر ثانوية، Cards على الخلفية الداكنة |

## 2) System Colors (Light + Dark)

**المسار:** `Theme Settings → Colors → System` — أدخل قيمتين لكل Token (Light / Dark).

| Token | Light HEX | Dark HEX |
|---|---|---|
| Background | `#FAF7F2` | `#0F1419` |
| Surface | `#FFFFFF` | `#1A1F2E` |
| Outline | `#E5E0D8` | `#2A3142` |
| Error | `#DC2626` | `#EF4444` |
| Success | `#16A34A` | `#22C55E` |
| Warning | `#F59E0B` | `#FBBF24` |
| Info | `#0EA5E9` | `#38BDF8` |

## 3) Text Colors

**المسار:** `Theme Settings → Colors → Custom` — أنشئ ثلاث Tokens مع نسختين Light/Dark.

| Token | Light | Dark |
|---|---|---|
| Primary Text | `#1A1F2E` | `#F5F1E8` |
| Secondary Text | `#4A5568` | `#A0AEC0` |
| Tertiary Text | `#718096` | `#6B7280` |

## 4) Typography — Fonts

**المسار:** `Theme Settings → Typography → Use Custom Theme`

| الإعداد | القيمة |
|---|---|
| Heading Font | **Cairo** (Google Fonts) |
| Body Font | **Cairo** (Google Fonts) |
| English Fallback | **Inter** (Google Fonts) |

> Cairo يدعم العربية والإنجليزية بشكل ممتاز. اختر **Use Google Font** ثم ابحث عن `Cairo`. لإضافة Inter كاحتياطية: `Add Custom Font Family → Inter`.

## 5) Typography — Sizes & Weights

**المسار:** `Theme Settings → Typography → Edit Each Style`

| Token | Size | Weight | Font | الاستخدام |
|---|---|---|---|---|
| Display Large | 32 sp | 700 | Cairo | شاشات الترحيب الكبرى |
| Display Medium | 28 sp | 700 | Cairo | عناوين الصفحات الرئيسية |
| Headline Large | 24 sp | 600 | Cairo | عناوين الأقسام |
| Headline Medium | 20 sp | 600 | Cairo | عناوين البطاقات |
| Title Large | 18 sp | 600 | Cairo | عناوين الـ AppBar |
| Title Medium | 16 sp | 500 | Cairo | عناوين عناصر القائمة |
| Body Large | 16 sp | 400 | Cairo | النص الأساسي |
| Body Medium | 14 sp | 400 | Cairo | النص الثانوي |
| Body Small | 12 sp | 400 | Cairo | النصوص الصغيرة، التوضيحات |
| Label Medium | 12 sp | 500 | Cairo | تسميات الأزرار، Chips |

## 6) كيفية الإدخال في FlutterFlow — خطوات

### إدخال لون مخصص:
1. افتح `Theme Settings` من الشريط الجانبي.
2. انتقل لتبويب `Colors`.
3. اضغط `Add Color` → أعطه اسم Token (مثل `Primary`).
4. أدخل قيمة HEX في خانة Light Mode.
5. فعّل خيار `Different color for Dark Mode` ثم أدخل قيمة Dark HEX.
6. احفظ.

### إدخال خط مخصص:
1. افتح `Theme Settings → Typography`.
2. فعّل `Use Custom Theme`.
3. اضغط على Style ترغب بتعديله (مثلاً Headline Large).
4. اختر `Use Google Font` → اكتب `Cairo` → اختر الوزن المطلوب.
5. حدّد Size و Weight و Color (اربط Color بـ Token من الخطوة السابقة).
6. كرّر لكل Style في الجدول أعلاه.

## 7) ملاحظات تطبيقية

- **التباين (Contrast):** الذهبي `#C9A876` على الكحلي `#1A1F2E` يحقّق نسبة تباين WCAG AA للنصوص الكبيرة. لا تستخدم Primary Gold كلون نصّ على Light Background — استخدم Primary Text بدلاً منه.
- **Dark First:** التطبيق Dark Default، فاحرص أثناء التصميم على معاينة Dark Mode أولاً.
- **استخدام Tokens فقط:** لا تكتب HEX يدوياً داخل أي ويدجت. اربط دائماً بـ Token من Theme، حتى يصبح تغيير الألوان لاحقاً سهلاً.

## الخطوة التالية

[`03_data_types.md`](./03_data_types.md) — تعريف Custom Data Types و Enums.
