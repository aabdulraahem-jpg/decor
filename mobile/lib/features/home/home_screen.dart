import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/utils/extensions.dart';
import '../../core/utils/formatters.dart';
import '../../data/providers/api_providers.dart';
import '../auth/controllers/auth_controller.dart';
import 'widgets/project_card.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    final user = auth is AuthAuthenticated ? auth.user : null;
    final projectsAsync = ref.watch(userProjectsProvider);

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: AppColors.tertiary,
              child: Text(
                (user?.name?.isNotEmpty ?? false)
                    ? user!.name![0].toUpperCase()
                    : 'م',
                style: const TextStyle(
                    color: AppColors.secondary, fontWeight: FontWeight.bold),
              ),
            ),
            AppSpacing.hMd,
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'مرحباً، ${user?.name ?? 'صديقي'}',
                    style: context.text.titleMedium,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    'لنُبدع تصميماً اليوم',
                    style: context.text.bodySmall,
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none),
            onPressed: () {},
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(Routes.newProjectStep1),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.secondary,
        icon: const Icon(Icons.add),
        label: const Text('مشروع جديد'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(userProjectsProvider);
          await ref.read(userProjectsProvider.future);
        },
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            _PointsCard(points: user?.pointsBalance ?? 0),
            AppSpacing.vXl,
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('مشاريعي', style: context.text.headlineMedium),
                TextButton(
                  onPressed: () => context.go(Routes.history),
                  child: const Text('عرض الكل'),
                ),
              ],
            ),
            AppSpacing.vSm,
            projectsAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.symmetric(vertical: 32),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => _ErrorTile(
                message: 'تعذّر جلب المشاريع: $e',
                onRetry: () => ref.invalidate(userProjectsProvider),
              ),
              data: (page) {
                if (page.items.isEmpty) {
                  return const _EmptyState();
                }
                return Column(
                  children: [
                    for (final p in page.items.take(5)) ...[
                      ProjectCard(
                        project: p,
                        onTap: () => context.push(Routes.project(p.id)),
                      ),
                      AppSpacing.vMd,
                    ],
                  ],
                );
              },
            ),
            AppSpacing.vXxxl,
          ],
        ),
      ),
    );
  }
}

class _PointsCard extends StatelessWidget {
  const _PointsCard({required this.points});
  final int points;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.secondary, AppColors.alternate],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
            ),
            child: const Icon(Icons.stars,
                color: AppColors.secondary, size: 32),
          ),
          AppSpacing.hLg,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'رصيدك',
                  style: TextStyle(
                    fontFamily: 'Cairo',
                    color: AppColors.tertiary,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  Formatters.points(points),
                  style: const TextStyle(
                    fontFamily: 'Cairo',
                    color: AppColors.tertiary,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => GoRouter.of(context).go(Routes.packages),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.secondary,
              minimumSize: const Size(0, 40),
            ),
            child: const Text('شراء المزيد'),
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: context.theme.cardTheme.color,
        borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        border: Border.all(color: context.colors.outline),
      ),
      child: Column(
        children: [
          Icon(Icons.image_search,
              size: 64, color: context.colors.outline),
          AppSpacing.vMd,
          Text('لا توجد مشاريع بعد',
              style: context.text.titleMedium),
          AppSpacing.vXs,
          Text(
            'اضغط "مشروع جديد" لتبدأ أول تصميم لك.',
            style: context.text.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _ErrorTile extends StatelessWidget {
  const _ErrorTile({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: context.colors.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: context.colors.error),
          AppSpacing.hSm,
          Expanded(
            child: Text(message, style: context.text.bodySmall),
          ),
          TextButton(onPressed: onRetry, child: const Text('إعادة')),
        ],
      ),
    );
  }
}
