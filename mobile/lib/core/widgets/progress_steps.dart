import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// شريط مراحل أفقي يُظهِر التقدّم في تدفّق متعدد الخطوات.
class ProgressSteps extends StatelessWidget {
  const ProgressSteps({
    super.key,
    required this.total,
    required this.current,
  });

  /// عدد المراحل الإجمالي (1-based).
  final int total;

  /// المرحلة الحالية (1-based).
  final int current;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.md,
      ),
      child: Row(
        children: [
          for (int i = 1; i <= total; i++) ...[
            Expanded(
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                height: 6,
                decoration: BoxDecoration(
                  color: i <= current
                      ? AppColors.primary
                      : Theme.of(context)
                          .dividerColor
                          .withOpacity(0.3),
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),
            if (i < total) const SizedBox(width: 4),
          ],
          AppSpacing.hMd,
          Text(
            '$current / $total',
            style: Theme.of(context).textTheme.labelMedium,
          ),
        ],
      ),
    );
  }
}
