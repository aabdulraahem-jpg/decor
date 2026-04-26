import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PackagesScreen extends ConsumerWidget {
  const PackagesScreen({super.key});

  // TODO(packages): جلب /packages، عرض بطاقات، عند الشراء initiate ثم WebView لـ APS، ثم confirm.

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('باقات النقاط'),
        automaticallyImplyLeading: false,
      ),
      body: const Center(child: Text('قيد البناء')),
    );
  }
}
