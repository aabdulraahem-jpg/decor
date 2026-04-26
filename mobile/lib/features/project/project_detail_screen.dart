import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ProjectDetailScreen extends ConsumerWidget {
  const ProjectDetailScreen({super.key, required this.projectId});

  final String projectId;

  // TODO(project-detail): جلب /projects/:id + قائمة Designs + زر "+ توليد جديد".

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: Text('المشروع $projectId')),
      body: const Center(child: Text('قيد البناء')),
    );
  }
}
