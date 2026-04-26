import 'package:flutter/material.dart';

class ForgotPasswordScreen extends StatelessWidget {
  const ForgotPasswordScreen({super.key});

  // TODO(forgot): حقل بريد + استدعاء AuthRepository.forgotPassword
  // ثم رسالة نجاح + زر للعودة لـ /login.

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('استعادة كلمة السر')),
      body: const Center(child: Text('قيد البناء')),
    );
  }
}
