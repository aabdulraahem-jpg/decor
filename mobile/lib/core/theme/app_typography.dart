import 'package:flutter/material.dart';

/// أحجام النصوص — تُطبَّق عبر TextTheme داخل AppTheme.
/// المرجع: `flutterflow-guide/02_theme_colors.md` — جدول Sizes & Weights.
class AppTypography {
  AppTypography._();

  static const String fontFamily = 'Cairo';
  static const String fontFamilyFallback = 'Inter';

  static TextTheme buildTextTheme(Color primaryText, Color secondaryText) {
    return TextTheme(
      displayLarge: _t(32, FontWeight.w700, primaryText),
      displayMedium: _t(28, FontWeight.w700, primaryText),
      displaySmall: _t(24, FontWeight.w700, primaryText),
      headlineLarge: _t(24, FontWeight.w600, primaryText),
      headlineMedium: _t(20, FontWeight.w600, primaryText),
      headlineSmall: _t(18, FontWeight.w600, primaryText),
      titleLarge: _t(18, FontWeight.w600, primaryText),
      titleMedium: _t(16, FontWeight.w500, primaryText),
      titleSmall: _t(14, FontWeight.w500, primaryText),
      bodyLarge: _t(16, FontWeight.w400, primaryText),
      bodyMedium: _t(14, FontWeight.w400, primaryText),
      bodySmall: _t(12, FontWeight.w400, secondaryText),
      labelLarge: _t(14, FontWeight.w500, primaryText),
      labelMedium: _t(12, FontWeight.w500, secondaryText),
      labelSmall: _t(11, FontWeight.w500, secondaryText),
    );
  }

  static TextStyle _t(double size, FontWeight weight, Color color) =>
      TextStyle(
        fontFamily: fontFamily,
        fontFamilyFallback: const [fontFamilyFallback],
        fontSize: size,
        fontWeight: weight,
        color: color,
        height: 1.4,
      );
}
