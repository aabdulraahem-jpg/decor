import 'package:flutter/material.dart';

import '../../core/theme/app_spacing.dart';
import '../../core/widgets/gold_button.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _oldCtrl = TextEditingController();
  final 