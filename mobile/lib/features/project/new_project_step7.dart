import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/widgets/gold_button.dart';
import '../../core/widgets/progress_steps.dart';
import '../../data/mocks/catalog_mock.dart';
import '../../data/providers/project_draft_provider.dart';

class NewProjectStep7 extends ConsumerWidget {
  const NewProjectStep7({super.key});

  String _roomLabel(String? key) {
    if (key == null) return '—';
    final m = mockRoomTypes.where((r) => r.key == key).toList();
    return m.isEmpty ? key : m.first.labelAr;
  }

  String _styleLabel(String? key) {
    if (key == null) return '—';
    final m = mockStyles.where((s) => s.key == key).toList();
    return m.isEmpty ? key : m.first.labelAr;
  }

  String _paletteLabel(String? id) {
    if (id == null) return '—';
    final m = mockColorPalettes.where((p) => p.id == id).toList();
    return m.isEmpty ? id : m.first.name;
  }

  String _wallLabel(String? id) {
    if (id == null) return '—';
    final m = mockWallOptions.where((w) => w.id == id).toList();
    return m.isEmpty ? id : m.first.name;
  }

  String _tileLabel(String? id) {
    if (id == null) return '—';
    final m = mockTileOptions.where((t) => t.id == id).toList();
    return m.isEmpty ? id : m.first.name;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draft = ref.watch(projectDraftProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('مراجعة وتوليد')),
      body: SafeArea(
        child: Column(
          children: [
            const ProgressSteps(total: 7, current: 7),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'تأكّد من الإعدادات قبل التوليد',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    AppSpacing.vLg,
                    if (draft.hasImage)
                      ClipRRect(
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radiusLg),
                        child: AspectRatio(
                          aspectRatio: 16 / 9,
                          child: draft.imagePath != null
                              ? Image.file(File(draft.imagePath!),
                                  fit: BoxFit.cover)
                              : CachedNetworkImage(
                                  imageUrl: draft.imageUrl!,
                                  fit: BoxFit.cover,
                                ),
                        ),
                      ),
                    AppSpacing.vLg,
                    _SummaryRow(
                      icon: Icons.label_outline,
                      label: 'الاسم',
                      value: draft.name.isEmpty ? '—' : draft.name,
                    ),
                    _SummaryRow(
                      icon: Icons.home_outlined,
                      label: 'نوع الغرفة',
                      value: _roomLabel(draft.roomType),
                    ),
                    _SummaryRow(
                      icon: Icons.style_outlined,
                      label: 'النمط',
                      value: _styleLabel(draft.style),
                    ),
                    _SummaryRow(
                      icon: Icons.palette_outlined,
                      label: 'لوحة الألوان',
                      value: _paletteLabel(draft.colorPaletteId),
                    ),
                    _SummaryRow(
                      icon: Icons.chair_outlined,
                      label: 'قطع الأثاث',
                      value: '${draft.furnitureIds.length} قطعة',
                    ),
                    _SummaryRow(
                      icon: Icons.wallpaper_outlined,
                      label: 'الجدران',
                      value: _wallLabel(draft.wallId),
                    ),
                    _SummaryRow(
                      icon: Icons.grid_view_outlined,
                      label: 'الأرضيات',
                      value: _tileLabel(draft.tileId),
                    ),
                    AppSpacing.vLg,
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.12),
                        borderRadius:
                            BorderRadius.circular(AppSpacing.radiusMd),
                        border: Border.all(
                          color: AppColors.primary.withOpacity(0.4),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.info_outline,
                              color: AppColors.primary),
                          AppSpacing.hSm,
                          Expanded(
                            child: Text(
                              'سيستهلك التوليد 5 نقاط من رصيدك',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
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
                    child: OutlinedButton(
                      onPressed: () => context.go(Routes.newProjectStep6),
                      child: const Text('السابق'),
                    ),
                  ),
                  AppSpacing.hMd,
                  Expanded(
                    flex: 2,
                    child: GoldButton(
                      label: 'توليد التصميم',
                      icon: Icons.auto_awesome,
                      onPressed: () => context.go(Routes.generationLoading),
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

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 22),
          AppSpacing.hMd,
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const Spacer(),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: Theme.of(context).textTheme.titleSmall,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}
