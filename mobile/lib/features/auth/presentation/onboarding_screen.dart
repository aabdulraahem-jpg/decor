import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../core/config/app_constants.dart';
import '../../../core/router/route_names.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _index = 0;

  static const _slides = <_Slide>[
    _Slide(
      icon: Icons.smart_toy_outlined,
      title: 'صمّم منزلك بذكاء',
      subtitle:
          'اختر صورة غرفتك ودَع الذكاء الاصطناعي يقترح عليك تصاميم متعددة بأنماط مختلفة.',
    ),
    _Slide(
      icon: Icons.chair_outlined,
      title: 'اختر من آلاف العناصر',
      subtitle:
          'مكتبة ضخمة من الأثاث والديكور والبلاط والجدران والألوان لتُخصّص تصميمك بدقة.',
    ),
    _Slide(
      icon: Icons.bolt_outlined,
      title: 'ولّد تصاميم خلال ثوانٍ',
      subtitle:
          'احصل على تصاميم احترافية فورياً، احفظها وشاركها مع من تحب أو نفّذها مع المختصين.',
    ),
  ];

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConstants.kIsOnboardingComplete, true);
    if (!mounted) return;
    context.go(Routes.login);
  }

  @override
  Widget build(BuildContext context) {
    final isLast = _index == _slides.length - 1;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  TextButton(
                    onPressed: _finish,
                    child: const Text('تخطي'),
                  ),
                  Text(
                    '${_index + 1} / ${_slides.length}',
                    style: context.text.labelMedium,
                  ),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _slides.length,
                onPageChanged: (i) => setState(() => _index = i),
                itemBuilder: (_, i) => _SlideView(slide: _slides[i]),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.xl),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_slides.length, (i) {
                      final selected = i == _index;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: selected ? 24 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: selected
                              ? AppColors.primary
                              : context.colors.outline,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      );
                    }),
                  ),
                  AppSpacing.vXl,
                  ElevatedButton(
                    onPressed: () {
                      if (isLast) {
                        _finish();
                      } else {
                        _controller.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeOut,
                        );
                      }
                    },
                    child: Text(isLast ? 'ابدأ الآن' : 'التالي'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Slide {
  const _Slide({
    required this.icon,
    required this.title,
    required this.subtitle,
  });
  final IconData icon;
  final String title;
  final String subtitle;
}

class _SlideView extends StatelessWidget {
  const _SlideView({required this.slide});
  final _Slide slide;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxl),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 220,
            height: 220,
            decoration: BoxDecoration(
              color: AppColors.tertiary.withOpacity(0.4),
              shape: BoxShape.circle,
            ),
            child: Icon(slide.icon, size: 96, color: AppColors.primary),
          ),
          AppSpacing.vXxxl,
          Text(
            slide.title,
            style: context.text.headlineLarge,
            textAlign: TextAlign.center,
          ),
          AppSpacing.vMd,
          Text(
            slide.subtitle,
            style: context.text.bodyLarge?.copyWith(
              color: context.text.bodySmall?.color,
              height: 1.6,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
