import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/gold_button.dart';
import '../../core/widgets/secondary_button.dart';
import '../../data/mocks/catalog_mock.dart';
import '../../data/providers/project_draft_provider.dart';

class DesignResultScreen extends ConsumerWidget {
  const DesignResultScreen({super.key, required this.designId});

  final String designId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final design = findMockDesignById(designId);
    return Scaffold(
      appBar: AppBar(
        title: const Text('التصميم الجاهز'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            tooltip: 'مشاركة',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('قيد التطوير: مشاركة')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.download_outlined),
            tooltip: 'تنزيل',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('تم حفظ الصورة')),
              );
            },
          ),
        ],
      ),
      body: design == null
          ? const EmptyState(
              icon: Icons.image_not_supported_outlined,
              message: 'لم يُعثر على التصميم',
            )
          : SafeArea(
              child: Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          AspectRatio(
                            aspectRatio: 4 / 3,
                            child: CachedNetworkImage(
                              imageUrl: design.generatedImageUrl,
                              fit: BoxFit.cover,
                              placeholder: (_, __) => Container(
                                color: AppColors.tertiary,
                                child: const Center(
                                  child: CircularProgressIndicator(),
                                ),
                              ),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(AppSpacing.lg),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'تصميمك جاهز',
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineSmall,
                                ),
                                AppSpacing.vXs,
                                Text(
                                  'استهلكنا ${design.pointsConsumed} نقاط لإنتاج هذه الصورة',
                                  style:
                                      Theme.of(context).textTheme.bodySmall,
                                ),
                                AppSpacing.vLg,
                                Wrap(
                                  spacing: AppSpacing.sm,
                                  runSpacing: AppSpacing.sm,
                                  children: [
                                    _ActionChip(
                                      icon: Icons.refresh_rounded,
                                      label: 'توليد آخر',
                                      onTap: () {
                                        context.go(Routes.generationLoading);
                                      },
                                    ),
                                    _ActionChip(
                                      icon: Icons.tune,
                                      label: 'تعديل الإعدادات',
                                      onTap: () =>
                                          context.go(Routes.newProjectStep7),
                                    ),
                                    _ActionChip(
                                      icon: Icons.bookmark_added_outlined,
                                      label: 'حفظ في المشروع',
                                      onTap: () {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          const SnackBar(
                                              content:
                                                  Text('تمّ الحفظ')),
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Row(
                      children: [
                        Expanded(
                          child: SecondaryButton(
                            label: 'العودة للرئيسية',
                            icon: Icons.home_outlined,
                            onPressed: () {
                              ref
                                  .read(projectDraftProvider.notifier)
                                  .reset();
                              context.go(Routes.home);
                            },
                          ),
                        ),
                        AppSpacing.hMd,
                        Expanded(
                          child: GoldButton(
                            label: 'مشروع جديد',
                            icon: Icons.add,
                            onPressed: () {
                              ref
                                  .read(projectDraftProvider.notifier)
                                  .reset();
                              context.go(Routes.newProjectStep1);
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

class _ActionChip extends StatelessWidget {
  const _ActionChip({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.12),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: AppColors.primary.withOpacity(0.4),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: AppColors.primary),
            AppSpacing.hSm,
            Text(
              label,
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
                fontFamily: 'Cairo',
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
