import 'package:flutter/material.dart';

class NewProjectStep1 extends StatelessWidget {
  const NewProjectStep1({super.key});

  // TODO(stub): Grid لـ RoomType مع أيقونات

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('اختر نوع الغرفة')),
      body: const Center(child: Text('قيد البناء')),
    );
  }
}
