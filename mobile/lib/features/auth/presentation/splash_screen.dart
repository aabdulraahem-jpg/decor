import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/config/app_constants.dart';
import '../../../core/router/route_names.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../controllers/auth_controller.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  Future<void> _bootstrap() async {
    final start = DateTime.now();
    await ref.read(authControllerProvider.notifier).restoreSession();

    final elapsed = DateTime.now().difference(start).inMilliseconds;
    if (elapsed < AppConstants.splashDelayMs) {
      await Future<void>.delayed(
        Duration(milliseconds: (AppConstants.splashDelayMs - elapsed).toInt()),
      );
    }

    if (!mounted) return;

    final state = ref.read(authControllerProvider);
    if (state is AuthAuthenticated) {
      context.go(Routes.home);
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final onboardingDone =
        prefs.getBool(AppConstants.kIsOnboardingComplete) ?? false;
    if (!mounted) return;
    context.go(onboardingDone ? Routes.login : Routes.onboarding);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.secondary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
              ),
              child: const Icon(
                Icons.architecture_outlined,
                color: AppColors.secondary,
                size: 64,
              ),
            ),
            AppSpacing.vXl,
            const Text(
              'سُفُف',
              style: TextStyle(
                fontFamily: 'Cairo',
                color: AppColors.tertiary,
                fontSize: 36,
                fontWeight: FontWeight.w700,
                letterSpacing: 2,
              ),
            ),
            AppSpacing.vSm,
            const Text(
              'ديكور ذكي ومُلهَم',
              style: TextStyle(
                fontFamily: 'Cairo',
                color: AppColors.primary,
                fontSize: 14,
                fontWeight: FontWeight.w400,
              ),
            ),
            AppSpacing.vXxxl,
            const SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                valueColor: AlwaysStoppedAnimation(AppColors.primary),
              ),
            ),
          ],
        ),
      ),
   