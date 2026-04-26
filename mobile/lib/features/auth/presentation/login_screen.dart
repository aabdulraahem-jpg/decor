import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/validators.dart';
import '../controllers/auth_controller.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    await context.hideKeyboard();
    final ok = await ref.read(authControllerProvider.notifier).login(
          email: _emailCtrl.text.trim(),
          password: _passwordCtrl.text,
        );
    if (!mounted) return;
    if (ok) {
      context.go(Routes.home);
    } else {
      final state = ref.read(authControllerProvider);
      if (state is AuthError) {
        context.showSnack(state.message, isError: true);
      }
    }
  }

  Future<void> _onGoogle() async {
    // TODO(google): دمج google_sign_in واستدعاء loginWithGoogle عبر AuthController.
    context.showSnack('Google Sign-In قيد التهيئة', isError: false);
  }

  Future<void> _onApple() async {
    // TODO(apple): دمج sign_in_with_apple واستدعاء loginWithApple.
    context.showSnack('Apple Sign-In قيد التهيئة', isError: false);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authControllerProvider);
    final isLoading = state is AuthLoading;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AppSpacing.vXxxl,
                    Center(
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius:
                              BorderRadius.circular(AppSpacing.radiusLg),
                        ),
                        child: const Icon(Icons.architecture_outlined,
                            color: AppColors.secondary, size: 40),
                      ),
                    ),
                    AppSpacing.vLg,
                    Text(
                      'مرحباً بعودتك',
                      textAlign: TextAlign.center,
                      style: context.text.headlineLarge,
                    ),
                    AppSpacing.vXs,
                    Text(
                      'سجّل الدخول لمتابعة تصاميمك',
                      textAlign: TextAlign.center,
                      style: context.text.bodyMedium?.copyWith(
                        color: context.text.bodySmall?.color,
                      ),
                    ),
                    AppSpacing.vXxxl,
                    TextFormField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      autofillHints: const [AutofillHints.email],
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        labelText: 'البريد الإلكتروني',
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                      validator: Validators.email,
                    ),
                    AppSpacing.vMd,
                    TextFormField(
                      controller: _passwordCtrl,
                      obscureText: _obscurePassword,
                      autofillHints: const [AutofillHints.password],
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _submit(),
                      decoration: InputDecoration(
                        labelText: 'كلمة السر',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_off_outlined
                                : Icons.visibility_outlined,
                          ),
                          onPressed: () => setState(
                              () => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                      validator: Validators.password,
                    ),
                    Align(
                      alignment: AlignmentDirectional.centerEnd,
                      child: TextButton(
                        onPressed: () => context.push(Routes.forgot),
                        child: const Text('نسيت كلمة السر؟'),
                      ),
                    ),
                    AppSpacing.vSm,
                    ElevatedButton(
                      onPressed: isLoading ? null : _submit,
                      child: isLoading
                          ? const SizedBox(
                              height: 22,
                              width: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor:
                                    AlwaysStoppedAnimation(AppColors.secondary),
                              ),
                            )
                          : const Text('تسجيل الدخول'),
                    ),
                    AppSpacing.vXl,
                    Row(
                      children: [
                        const Expanded(child: Divider()),
                        Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md),
                          child: Text('أو',
                              style: context.text.labelMedium),
                        ),
                        const Expanded(child: Divider()),
                      ],
                    ),
                    AppSpacing.vXl,
                    OutlinedButton.icon(
                      onPressed: isLoading ? null : _onGoogle,
                      icon: const Icon(Icons.g_mobiledata, size: 28),
                      label: const Text('متابعة بـ Google'),
                    ),
                    AppSpacing.vMd,
                    OutlinedButton.icon(
                      onPressed: isLoading ? null : _onApple,
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.black,
                        foregroundColor: Colors.white,
                        side: BorderSide.none,
                      ),
                      icon: const Icon(Icons.apple),
                      label: const Text('متابعة بـ Apple'),
                    ),
                    AppSpacing.vXxxl,
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('ليس لديك حساب؟',
                            style: context.text.bodyMedium),
                        TextButton(
                          onPressed: () => context.push(Routes.signup),
                          child: const Text('أنشئ حساب'),
                        ),
                      ],
                    ),
                    AppSpacing.vLg,
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
