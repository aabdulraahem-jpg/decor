import 'package:flutter/material.dart';

class LanguageScreen extends StatelessWidget {
  const LanguageScreen({super.key});

  // TODO(stub): تبديل ar/en + حفظ في SharedPreferences

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('اللغة')),
      body: const Center(child: Text('قيد البناء')),
    );
  }
}
