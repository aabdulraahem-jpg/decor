import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/points_badge.dart';
import '../auth/controllers/auth_controller.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final user = auth is AuthAuthenticated ? auth.user : null;
    final initial = (user?.name?.isNotEmpty ?? false)
        ? user!.name![0].toUpperCase()
        : 'م';

    return Scaffold(
      appBar: AppBar(
        title: const Text('حسابي'),
        automaticallyImplyLeading: false,
      ),
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg,
              vertical: AppSpacing.xxl,
            ),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.secondary, AppColors.alternate],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              children: [
                Container(
                  width: 88,
                  height: 88,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.primary, width: 3),
                    color: AppColors.tertiary,
                  ),
                  child: Center(
                    child: Text(
                      initial,
                      style: const TextStyle(
                        fontFamily: 'Cairo',
                        fontWeight: FontWeight.w800,
                        fontSize: 36,
                        color: AppColors.secondary,
                      ),
                    ),
                  ),
                ),
                AppSpacing.vMd,
                Text(
                  user?.name ?? 'مستخدم سُفُف',
                  style: const TextStyle(
                    fontFamily: 'Cairo',
                  