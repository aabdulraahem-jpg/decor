import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// شارة صغيرة تُعرض رصيد النقاط للمستخدم.
class PointsBadge extends StatelessWidget {
  const PointsBadge({
    super.key,
    required this.points,
    this.icon = Icons.stars_rounded,
    this.compact = false,
  });

  final int points;
  final IconData icon;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? AppSpacing.sm : AppSpacing.md,
        vertical: compact ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.15),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(
          color: AppColors.primary.withOpacity(0.4),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: compact ? 14 : 16, color: AppColors.primary),
          const SizedBox(width: 4),
          Text(
            '$points',
            style: TextStyle(
              fontFamily: 'Cairo',
              fontWeight: FontWeight.w700,
              fontSize: compact ? 12 : 13,
              color: AppColors.primary,
            ),
          ),
          if (!compact) ...[
            const SizedBox(width: 2),
            const Text(
              'نقطة',
              style: TextStyle(
                fontFamily: 'Cairo',
                fontWeight: FontWeight.w500,
                fontSize: 12,
                color: AppColors.primary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
