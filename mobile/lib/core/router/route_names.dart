// أسماء المسارات — استعمل هذه الثوابت بدل النصوص الحرفية.

class Routes {
  Routes._();

  // Auth flow
  static const splash = '/';
  static const onboarding = '/onboarding';
  static const login = '/login';
  static const signup = '/signup';
  static const otp = '/otp';
  static const forgot = '/forgot';

  // Main shell
  static const home = '/home';
  static const history = '/history';
  static const newProject = '/new-project';
  static const packages = '/packages';
  static const profile = '/profile';

  // New project flow
  static const newProjectStep1 = '/new-project/step-1';
  static const newProjectStep2 = '/new-project/step-2';
  static const newProjectStep3 = '/new-project/step-3';
  static const newProjectStep4 = '/new-project/step-4';
  static const newProjectStep5 = '/new-project/step-5';
  static const newProjectStep6 = '/new-project/step-6';
  static const newProjectStep7 = '/new-project/step-7';
  static const generationLoading = '/new-project/generating';

  // Detail
  static String project(String id) => '/project/$id';
  static String design(String id) => '/design/$id';
  static String designResult(String id) => '/design-result/$id';

  // Settings
  static const settings = '/settings';
  static