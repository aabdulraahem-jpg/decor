import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class DesignDetailScreen extends ConsumerWidget {
  const DesignDetailScreen({super.key, required this.designId});

  final String designId;

  // TODO(design-detail): صورة كبيرة + parameters JSON + خيار حذف/مشاركة.

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: Text('التصميم $designId')),
      body: const Center(child: Text('قيد البناء')),
    );
  }
}
