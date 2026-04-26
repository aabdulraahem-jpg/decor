# Sufuf — تطبيق Flutter

تطبيق سُفُف للديكور الذكي — Phase 1 scaffold.

## المتطلبات

- Flutter `>= 3.22`
- Dart `>= 3.4`
- Android SDK / Xcode (للنشر على iOS) / متصفح حديث (للتشغيل على الويب)

## التشغيل المحلي

```bash
cd mobile
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter run -d chrome   # أو -d windows / -d <device-id>
```

> ملاحظة: ملفات `*.g.dart` و `*.freezed.dart` تُولَّد محلياً ولم تُدفَع إلى Git
> (راجع `.gitignore`). لا بد من تشغيل `dart run build_runner build` بعد `pub get`.

## بناء النسخ النهائية

```bash
flutter build apk --release        # Android
flutter build ipa --release        # iOS (يحتاج Xcode + شهادات)
flutter build web --release        # Web (الإخراج في build/web)
```

## بنية المشروع

```
lib/
├── main.dart              نقطة الدخول
├── app.dart               MaterialApp + Router + Theme
├── core/
│   ├── config/            متغيّرات البيئة والثوابت
│   ├── theme/             الألوان والخطوط والثيم
│   ├── router/            go_router + auth guard
│   ├── network/           Dio + interceptors + endpoints
│   ├── storage/           flutter_secure_storage wrapper
│   └── utils/             validators / formatters / extensions
├── data/
│   ├── models/            Freezed models لكل DataType
│   ├── repositories/      وحدات الوصول لكل API group
│   └── providers/         Riverpod providers
├── features/
│   ├── auth/              splash, onboarding, login, signup, otp, forgot
│   ├── home/              home + bottom nav
│   ├── project/           إنشاء مشروع (6 خطوات) + تفاصيل
│   ├── history/           سجل المشاريع
│   ├── packages/          باقات النقاط
│   ├── profile/           حسابي + إعدادات الملف
│   └── settings/          الإعدادات العامة
└── l10n/                  ar + en (.arb)
```

## نقاط الاتصال بالـ Backend

- Base URL الافتراضي: `https://api.sufuf.pro/api/v1`
- يمكن تجاوزها عبر `--dart-define=API_BASE_URL=https://staging.sufuf.pro/api/v1`
- التوكن يُحفظ في Keychain/Encrypted SharedPreferences عبر `flutter_secure_storage`.
- Refresh تلقائي عند 401 يتم في `core/network/auth_interceptor.dart`.

## الشاشات المنجزة (Phase 1)

تفصيلية بالكامل: **Splash، Onboarding، Login، Email Signup، Home**.

Stubs (هيكل + AppBar + "قيد البناء"): OTP، Forgot Password، 6 خطوات إنشاء مشروع،
Project Detail، Design Detail، History، Packages، Profile، Edit Profile،
Change Password، Language، Settings، About.

## Linting

```bash
flutter analyze
```

القواعد محدّدة في `analysis_options.yaml`.

## License

Private — © Sufuf.
