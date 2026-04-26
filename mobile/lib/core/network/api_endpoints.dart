// كل المسارات في مكان واحد — مرجعها `flutterflow-guide/05_api_library.md`.

class ApiEndpoints {
  ApiEndpoints._();

  // Auth
  static const String authRegister = '/auth/register';
  static const String authLogin = '/auth/login';
  static const String authRefresh = '/auth/refresh';
  static const String authLogout = '/auth/logout';
  static const String authGoogle = '/auth/google/callback';
  static const String authApple = '/auth/apple/callback';
  static const String authForgotPassword = '/auth/forgot-password';
  static const String authResetPassword = '/auth/reset-password';

  // Users
  static const String usersMe = '/users/me';

  // Projects
  static const String projects = '/projects';
  static String project(String id) => '/projects/$id';
  static String projectDesigns(String id) => '/projects/$id/designs';

  // Designs
  static String design(String id) => '/designs/$id';

  // Catalog
  static const String catalogFurniture = '/catalog/furniture';
  static const String catalogDecor = '/catalog/decor';
  static const String catalogTiles = '/catalog/tiles';
  static const String catalogWalls = '/catalog/walls';
  static const String catalogColors = '/catalog/colors';

  // Uploads
  static const String uploads = '/uploads';

  // Packages & Transactions
  static const String packages = '/packages';
  static const String transactionsInitiate = '/transactions/initiate';
  static const String transactionsConfirm = '/transactions/confirm';
}
