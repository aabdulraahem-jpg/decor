# دليل بناء تطبيق سُفُف في FlutterFlow

> الجزء الأساسي — الإعدادات، الثيم، البيانات، الـ State، و API Library.

## نظرة عامة على المشروع

**سُفُف (Sufuf Design)** تطبيق ذكاء اصطناعي لإعادة تصميم الفراغات الداخلية (مجالس، غرف نوم، مطابخ…) بهوية سعودية معاصرة. المستخدم يصوّر غرفته → يختار النمط والأثاث والألوان → يولّد الذكاء الاصطناعي صورة جديدة. النظام يعمل بنقاط تُشترى عبر باقات.

| العنصر | الرابط |
|---|---|
| Marketing Site | https://sufuf.pro |
| Backend API | https://api.sufuf.pro |
| FlutterFlow Project | https://app.flutterflow.io/project/sufuf-design-mk1fzi |

## ترتيب القراءة الموصى به

اتبع الملفات بالترتيب من الأعلى للأسفل — كل ملف يفترض أن السابق قد طُبّق:

| # | الملف | الموضوع |
|---|---|---|
| 1 | [`01_project_setup.md`](./01_project_setup.md) | إعدادات المشروع الأساسية في FlutterFlow |
| 2 | [`02_theme_colors.md`](./02_theme_colors.md) | لوحة الألوان والخطوط (Theme) |
| 3 | [`03_data_types.md`](./03_data_types.md) | Custom Data Types و Enums |
| 4 | [`04_app_state_variables.md`](./04_app_state_variables.md) | App State Variables |
| 5 | [`05_api_library.md`](./05_api_library.md) | جميع API Calls (Auth, Projects, Designs, Catalog, Payments, Admin) |

## ملخّص ما هو مكتمل

- Backend API جاهز ومنشور على `api.sufuf.pro` مع Prisma schema موثّق في `backend/prisma/schema.prisma`.
- Marketing site منشور على `sufuf.pro`.
- مشروع FlutterFlow أُنشئ تحت اسم `sufuf-design-mk1fzi`.
- هذا الدليل يغطي **الجزء الأساسي**: الإعدادات + الثيم + البيانات + الـ State + الـ API.

## ما المطلوب من المستخدم

اتبع كل ملف بالترتيب وطبّق الخطوات داخل لوحة FlutterFlow. كل قسم يحتوي:
- جدول قيم جاهز للنسخ.
- مكان الإدخال داخل واجهة FlutterFlow (Project Settings, Theme Settings, Build, App State, API Library).

بعد اكتمال هذا الجزء الأساسي ننتقل إلى:
1. تصميم الـ Pages (Onboarding, Auth, Home, Project Wizard, Result, Profile, Packages).
2. Components قابلة لإعادة الاستخدام (PointsBadge, RoomCard, StyleChip…).
3. ربط الـ Actions بالـ API Calls المعرَّفة في الملف الخامس.
4. اختبار وبناء iOS و Android.

## ملاحظات عامة

- اللغة الافتراضية: **العربية** مع دعم RTL، ثم **الإنجليزية** كاحتياطية.
- الخط الأساسي: **Cairo** من Google Fonts للعربي والإنجليزي.
- الثيم الافتراضي: **داكن** (Dark Default).
- المصادقة: **Custom Auth** عبر API الخاص بنا — **لا** نستخدم Firebase Auth.
- جميع المسارات في الـ API نسبية لـ `https://api.sufuf.pro` المعرّف كـ Constant باسم `apiBase`.
