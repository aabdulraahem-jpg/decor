import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  // TODO(history): قائمة كل المشاريع + Pagination + فلترة بنوع الغرفة/التاريخ.

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('سجل المشاريع'),
        automaticallyImplyLeading: false,
      ),
      body: const Center(child: Text('قيد البناء')),
    );
  }
}
