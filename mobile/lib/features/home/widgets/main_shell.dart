import 'package:flutter/material.dart';

import 'bottom_nav.dart';

/// Shell يحتوي الصفحات داخل bottom nav.
class MainShell extends StatelessWidget {
  const MainShell({
    super.key,
    required this.child,
    required this.currentLocation,
  });

  final Widget child;
  final String currentLocation;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: SufufBottomNav(currentLocation: currentLocation),
    );
  }
}
