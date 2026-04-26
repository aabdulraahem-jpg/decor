// إعدادات البيئة — Sufuf
// عدّل القيم هنا حسب البيئة (dev / staging / prod).

class Env {
  Env._();

  /// عنوان واجهة الـ Backend الأساسية.
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.sufuf.pro/api/v1',
  );

  /// عنوان البكاند الجذر — يُستخدم لمسارات لا تبدأ بـ /api/v1.
  static const String apiRootUrl = String.fromEnvironment(
    'API_ROOT_URL',
    defaultValue: 'https://api.sufuf.pro',
  );

  /// عنوان الـ CDN للصور المرفوعة.
  static const String cdnBaseUrl = String.fromEnvironment(
    'CDN_BASE_URL',
    defaultValue: 'https://cdn.sufuf.pro',
  );

  /// Google Sign-In client ID (Web). على iOS/Android يُقرأ من ملفات الخدمة.
  static const String googleWebClientId = String.fromEnvironment(
    'GOOGLE_WEB_CLIENT_ID',
    defaultValue: '',
  );

  /// مدة المهلة الزمنية لطلبات الشبكة بالثواني.
  static const int networkTimeoutSeconds = 30;

  /// مدة طلبات الـ AI الثقيلة (مثل توليد التصميم).
  static const int aiTimeoutSeconds = 120;

  /// تشغيل وضع التطوير (Logger، تفاصيل الأخطاء، …).
  static const bool isDev = bool.fromEnvironment('DEV', defaultValue: true);
}
