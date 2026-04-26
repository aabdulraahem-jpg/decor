import 'package:flutter/material.dart';

extension ContextX on BuildContext {
  ThemeData get theme => Theme.of(this);
  TextTheme get text => Theme.of(this).textTheme;
  ColorScheme get colors => Theme.of(this).colorScheme;
  MediaQueryData get media => MediaQuery.of(this);
  Size get screenSize => MediaQuery.of(this).size;
  bool get isRtl => Directionality.of(this) == TextDirection.rtl;

  void showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(this)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(msg),
          backgroundColor: isError ? colors.error : null,
        ),
      );
  }

  Future<void> hideKeyboard() async {
    FocusScope.of(this).unfocus();
  }
}

extension StringX on String {
  String get capitalize =>
      isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';
  bool get isBlank => trim().isEmpty;
  String? get nullIfEmpty => isBlank ? null : this;
}

extension NullableStringX on String? {
  bool get isNullOrBlank => this == null || this!.trim().isEmpty;
}
