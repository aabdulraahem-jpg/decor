import 'package:flutter/material.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  // TODO(stub): إصدار + روابط الشروط والخصوصية

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('عن التطبيق')),
      body: const Center(child: Text('قيد البناء')),
    );
  }
}
