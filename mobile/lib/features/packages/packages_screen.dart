import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/gold_button.dart';
import '../../core/widgets/points_badge.dart';
import '../../data/mocks/catalog_mock.dart';
import '../../data/models/package.dart';
import '../auth/controllers/auth_controller.dart';

class PackagesScreen extends ConsumerWidget {
  const PackagesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef