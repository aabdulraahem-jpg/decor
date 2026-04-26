import 'package:flutter/material.dart';

class EditProfileScreen extends StatelessWidget {
  const EditProfileScreen({super.key});

  // TODO(stub): حقول name/phoneNumber/avatar + استدعاء updateMe

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تعديل الملف الشخصي')),
      body: const Center(child: Text('قيد البناء')),
    );
  }
}
