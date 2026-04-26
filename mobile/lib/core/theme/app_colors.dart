import 'package:flutter/material.dart';

/// نظام ألوان Sufuf — مشتق من `flutterflow-guide/02_theme_colors.md`.
class AppColors {
  AppColors._();

  // Brand
  static const Color primary = Color(0xFFC9A876); // ذهبي
  static const Color secondary = Color(0xFF1A1F2E); // كحلي
  static const Color tertiary = Color(0xFFE8DCC4); // بيج
  static const Color alternate = Color(0xFF2A3142);

  // Light
  static const Color backgroundLight = Color(0xFFFAF7F2);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color outlineLight = Color(0xFFE5E0D8);

  // Dark
  static const Color backgroundDark = Color(0xFF0F1419);
  static const Color surfaceDark = Color(0xFF1A1F2E);
  static const Color outlineDark = Color(0xFF2A3142);

  // Status
  static const Color errorLight = Color(0xFFDC2626);
  static const Color errorDark = Color(0xFFEF4444);
  static const Color successLight = Color(0xFF16A34A);
  static const Color successDark = Color(0xFF22C55E);
  static const Color warningLight = Color(0xFFF59E0B);
  static const Color warningDark = Color(0xFFFBBF24);
  static const Color infoLight = Color(0xFF0EA5E9);
  static const Color infoDark = Color(0xFF38BDF8);

  // Text
  static const Color textPrimaryLight = Color(0xFF1A1F2E);
  static const Color textPrimaryDark = Color(0xFFF5F1E8);
  static const Color textSecondaryLight = Color(0xFF4A5568);
  static const Color textSecondaryDark = Color(0xFFA0AEC0);
  static const Color textTertiaryLight = Color(0xFF718096);
  static const Color textTertiaryDark = Color(0xFF6B7280);
}
