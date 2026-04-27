import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/controllers/auth_controller.dart';
import '../../features/auth/presentation/email_signup_screen.dart';
import '../../features/auth/presentation/forgot_password_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/onboarding_screen.dart';
import '../../features/auth/presentation/otp_verify_screen.dart';
import '../../features/auth/presentation/splash_screen.dart';
import '../../features/history/history_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/home/widgets/main_shell.dart';
import '../../features/packages/packages_screen.dart';
import '../../features/profile/about_screen.dart';
import '../../features/profile/change_password_screen.dart';
import '../../features/profile/edit_profile_screen.dart';
import '../../features/profile/language_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/profile/settings_screen.dart';
import '../../features/project/design_detail_screen.dart';
import '../../features/project/design_result_screen.dart';
import '../../features/project/generation_loading_screen.dart';
import '../../features/project/new_project_step1.dart';
import '../../features/project/new_project_step2.dart';
import '../../features/project/new_project_step3.dart';
import '../../features/project/new_project_step4.dart';
import '../../features/project/new_project_step5.dart';
import '../../features/project/new_project_step6.dart';
import '../../features/project/new_project_step7.dart';
import '../../features/project/project_detail_screen.dart';
import 'route_names.dart';

/// Provider للـ GoRouter — يُعيد توجيه المستخدم بناءً على حالة المصادقة.
final routerProvider = Provider<GoRouter>((ref) {
  final notifier = _RouterNotifier(ref);
  return GoRouter(
    initialLocation: Routes.splash,
    debugLogDiagnostics: false,
    refreshListenable: notifier,
    redirect: notifier.redirect,
    routes: [
      GoRoute(
        path: Routes.splash,
        builder: (_, __) => const SplashScreen(),
      ),
      GoRoute(
        path: Routes.onboarding,
        builder: (_, __) => const OnboardingScreen(),
      ),
      GoRoute(path: Routes.login, builder: (_, __) => const LoginScreen()),
      GoRoute(
          path: Routes.signup, builder: (_, __) => const EmailSignupScreen()),
      GoRoute(path: Routes.otp, builder: (_, __) => const OtpVerifyScreen()),
      GoRoute(
          path: Routes.forgot,
          builder: (_, __) => const ForgotPasswordScreen()),

      // Shell with bottom nav
      ShellRoute(
        builder: (context, state, child) =>
            MainShell(currentLocation: state.uri.toString(), child: child),
        routes: [
          GoRoute(path: Routes.home, builder: (_, __) => const HomeScreen()),
          GoRoute(
              path: Routes.history,
              builder: (_, __) => const HistoryScreen()),
          GoRoute(
              path: Routes.packages,
              builder: (_, __) => const PackagesScreen()),
          GoRoute(
              path: Routes.profile,
              builder: (_, __) => const ProfileScreen()),
        ],
      ),

      // New project flow
      GoRoute(
          path: Routes.newProject,
          redirect: (_, __) => Routes.newProjectStep1),
      GoRoute(
          path: Routes.newProjectStep1,
          builder: (_, __) => const NewProjectStep1()),
      GoRoute(
          path: Routes.newProjectStep2,
          builder: (_, __) => const NewProjectStep2()),
      GoRoute(
          path: Routes.newProjectStep3,
          builder: (_, __) => const NewProjectStep3()),
      GoRoute(
          path: Routes.newProjectStep4,
          builder: (_, __) => const NewProjectStep4()),
      GoRoute(
          path: Routes.newProjectStep5,
          builder: (_, __) => const NewProjectStep5()),
      GoRoute(
          path: Routes.newProjectStep6,
          builder: (_, __) => const NewProjectStep6()),
      GoRoute(
          path: Routes.newProjectStep7,
          builder: (_, __) => const NewProjectStep7()),
      GoRoute(
          path: Routes.generationLoading,
          builder: (_, __) => const GenerationLoadingScreen()),
      GoRoute(
        path: '/design-result/:id',
        builder: (_, state) => DesignResultScreen(
          designId: state.pathParameters['id']!,
        ),
      ),

      GoRoute(
        path: '/project/:id',
        builder: (_, state) => ProjectDetailScreen(
          projectId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/design/:id',
        builder: (_, state) => DesignDetailScreen(
          designId: state.pathParameters['id']!,
        ),
      ),

      GoRoute(
          path: Routes.settings, builder: (_, __) => const SettingsScreen()),
      GoRoute(
          path: Routes.editProfile,
          builder: (_, __) => const EditProfileScreen()),
      GoRoute(
          path: Routes.changePassword,
          builder: (_, __) => const ChangePasswordScreen()),
      GoRoute(
          path: Routes.language, builder: (_, __) => const LanguageScreen()),
      GoRoute(path: Routes.about, builder: (_, __) => const AboutScreen()),
    ],
    errorBuilder: (_, state) => Scaffold(
      appBar: AppBar(title: const Text('خطأ')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text('المسار غير معروف:\n${state.uri}'),
        ),
      ),
    ),
  );
});

class _RouterNotifier extends ChangeNotifier {
  _RouterNotifier(this.ref) {
    ref.listen<AuthState>(authControllerProvider, (_, __) => notifyListeners());
  }
  final Ref ref;

  String? redirect(BuildContext context, GoRouterState state) {
    final auth = ref.read(authControllerProvider);
    final loc = state.uri.toString();

    // مسارات لا تتطلّب مصادقة
    final isPublic = loc == Routes.splash ||
        loc == Routes.onboarding ||
        loc == Routes.login ||
        loc == Routes.signup ||
        loc == Routes.otp ||
        loc == Routes.forgot;

    // أثناء Initial/Loading: لا توجيه — Splash يتولّى الأمر.
    if (auth is 