// ثوابت التطبيق العامة.

class AppConstants {
  AppConstants._();

  static const String appName = 'سُفُف';
  static const String appNameEn = 'Sufuf';

  // مفاتيح SharedPreferences
  static const String kIsOnboardingComplete = 'is_onboarding_complete';
  static const String kSelectedLanguage = 'selected_language';
  static const String kThemeMode = 'theme_mode';

  // مفاتيح SecureStorage
  static const String kAccessToken = 'access_token';
  static const String kRefreshToken = 'refresh_token';
  static const String kTokenExpiresAt = 'token_expires_at';
  static const String kUserJson = 'cached_user_json';

  // قيم افتراضية
  static const String defaultLocale = 'ar';
  static const List<String> supportedLocales = ['ar', 'en'];

  // أبعاد عامة
  static const double maxContentWidth = 600;
  static const double splashDelayMs = 800;

  // Pagination
  static const int defaultPageSize = 20;
}
