import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';

/// شريط تنقل سفلي مخصّص بـ 5 عناصر — العنصر الأوسط بارز.
class SufufBottomNav extends StatelessWidget {
  const SufufBottomNav({
    super.key,
    required this.currentLocation,
  });

  final String currentLocation;

  static const _items = <_NavItem>[
    _NavItem(
        icon: Icons.home_outlined,
        activeIcon: Icons.home,
        label: 'الرئيسية',
        path: Routes.home),
    _NavItem(
        icon: Icons.history_outlined,
        activeIcon: Icons.history,
        label: 'السجل',
        path: Routes.history),
    _NavItem(
        icon: Icons.add,
        activeIcon: Icons.add,
        label: 'جديد',
        path: Routes.newProjectStep1,
        prominent: true),
    _NavItem(
        icon: Icons.diamond_outlined,
        activeIcon: Icons.diamond,
        label: 'الباقات',
        path: Routes.packages),
    _NavItem(
        icon: Icons.person_outline,
        activeIcon: Icons.person,
        label: 'حسابي',
        path: Routes.profile),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      decoration: BoxDecoration(
        color: theme.bottomNavigationBarTheme.backgroundColor,
        border: Border(
          top: BorderSide(color: theme.colorScheme.outline, width: 0.5),
        ),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 72,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: _items.map((item) {
              final isActive = currentLocation.startsWith(item.path);
              return Expanded(
                child: InkWell(
                  onTap: () => context.go(item.path),
                  child: item.prominent
                      ? _buildProminent(item)
                      : _buildRegular(item, isActive, theme),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  Widget _buildRegular(_NavItem item, bool active, ThemeData theme) {
    final color = active
        ? AppColors.primary
        : theme.bottomNavigationBarTheme.unselectedItemColor;
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(active ? item.activeIcon : item.icon, color: color, size: 24),
        const SizedBox(height: 4),
        Text(
          item.label,
          style: TextStyle(
              fontFamily: 'Cairo',
              fontSize: 11,
              color: color,
              fontWeight: active ? FontWeight.w600 : FontWeight.w500),
        ),
      ],
    );
  }

  Widget _buildProminent(_NavItem item) {
    return Center(
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: AppColors.primary,
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withOpacity(0.4),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Icon(Icons.add, color: AppColors.secondary, size: 28),
      ),
    );
  }
}

class _NavItem {
  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.path,
    this.prominent = false,
  });
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String path;
  final bool prominent;
}
