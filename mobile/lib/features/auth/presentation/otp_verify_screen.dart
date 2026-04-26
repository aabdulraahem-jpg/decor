import 'package:flutter/material.dart';

class OtpVerifyScreen extends StatelessWidget {
  const OtpVerifyScreen({super.key});

  // TODO(otp): إدخال 6 أرقام، مؤقّت 60 ثانية لإعادة الإرسال،
  // استدعاء POST /auth/verify-otp ثم التوجيه لـ /home.

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تأكيد الرمز')),
      body: const Center(child: Text('قيد البناء')),
    );
  }
}
