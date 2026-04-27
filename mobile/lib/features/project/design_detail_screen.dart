import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/empty_state.dart';
import '../../core/widgets/secondary_button.dart';
import '../../data/mocks/catalog_mock.dart';

class DesignDetailScreen extends ConsumerWidget {
  const DesignDetailScreen({super.key, required this.designId});

  final St