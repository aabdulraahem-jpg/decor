import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';

class GenerationLoadingScreen extends ConsumerStatefulWidget {
  const GenerationLoadingScreen({super.key});

  @override
  ConsumerState<GenerationLoadingScreen> createState() =>
      _GenerationLoadingScreenState();
}

class _GenerationLoadingScreenState
    extends ConsumerState<GenerationLoadingScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  Timer? _timer;
  int _stage = 0;

  static const _stages = [
    'نُجهّز الصورة الأصلية...',
    'نحلّل النمط والألوان...',
    'نُولّد التصميم بأحدث نماذج الذكاء...',
    'نُضيف اللمسات النهائية...',
  ];

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
    _timer = Timer.periodic(const Duration(milliseconds: 1500), (t) {
      if (!mounted) return;
      setState(() {
        if (_stage < _stages.length - 1) {
          _stage++;
        } else {
          t.cancel();
          // Demo: انتقل بعد ثانية إلى نتيجة وهمية.
          Future.delayed(const Duration(milliseconds: 900), () {
            if (!mounted) return;
            context.go(Routes.designResult('des_1_1'));
          });
        }
      });
    });
  }

  @override
  void dispose() {
    _ctrl.dispose();
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.xxl),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Center(
                child: AnimatedBuilder(
                  animation: _ctrl,
                  builder: (_, __) {
                    return Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 140,
                          height: 140,
                          child: CircularProgressIndicator(
                            strokeWidth: 6,
                            value: null,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              AppColors.primary
                                  .withOpacity(0.6 + 0.4 * _ctrl.value),
                            ),
                          ),
                        ),
                        Container(
                          width: 96,
                          height: 96,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: RadialGradient(
                              colors: [
                                AppColors.primary
                                    .withOpacity(0.4 + 0.3 * _ctrl.value),
                                AppColors.primary.withOpacity(0.05),
                              ],
                            ),
                          ),
                          child: const Icon(
                            Icons.auto_awesome,
                            size: 48,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
              AppSpacing.vXxxl,
              Text(
                'جارٍ توليد التصميم',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              AppSpacing.vSm,
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 350),
                child: Text(
                  _stages[_stage],
                  key: ValueKey(_stage),
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              AppSpacing.vXl,
              LinearProgressIndicator(
                value: (_stage + 1) / _stages.length,
                color: AppColors.primary,
                backgroundColor:
                    AppColors.primary.withOpacity(0.15),
                minHeight: 6,
              ),
              const Spacer(),
              Text(
                'يستغرق ذلك بضع ثوان — لا تُغلق التطبيق',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
