import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/utils/extensions.dart';
import '../../../core/utils/validators.dart';
import '../controllers/auth_controller.dart';

class EmailSignupScreen extends ConsumerStatefulWidget {
  const EmailSignupScreen({super.key});

  @override
  ConsumerState<EmailSignupScreen> createState() => _EmailSignupScreenState();
}

class _EmailSignupScreenState extends ConsumerState<EmailSignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscure1 = true;
  bool _obscure2 = true;
  bool _agreeTerms = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_agreeTerms) {
      context.showSnack('يجب الموافقة على الشروط والأحكام', isError: true);
      return;
    }
    await context.hideKeyboard();
    final ok = await ref.read(authControllerProvider.notifier).register(
          email: _emailCtrl.text.trim(),
          password: _passwordCtrl.text,
          name: _nameCtrl.text.trim(),
        );
    if (!mounted) return;
    if (ok) {
      context.go(Routes.home);
    } else {
      final state = ref.read(authControllerProvider);
      if (state is AuthError) {
        final msg = state.statusCode == 409
            ? 'هذا البريد مسجّل مسبقاً — جرّب تسجيل الدخول'
            : state.message;
        context.showSnack(msg, isError: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authControllerProvider);
    final isLoading = state is AuthLoading;

    return Scaffold(
      appBar: AppBar(
        title: const Text('إنشاء حساب جديد'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.canPop() ? context.pop() : context.go(Routes.login),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.xl, vertical: AppSpacing.lg),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'انضم إلينا اليوم',
                    style: context.text.headlineMedium,
                  ),
                  AppSpacing.vXs,
                  Text(
                    'أنشئ حسابك واحصل على نقاط مجانية لبدء أول تصميم.',
                    style: context.text.bodyMedium?.copyWith(
                      color: context.text.bodySmall?.color,
                    ),
                  ),
                  AppSpacing.vXxl,
                  TextFormField(
                    controller: _nameCtrl,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.name],
                    decoration: const InputDecoration(
                      labelText: 'الاسم الكامل',
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                    validator: Validators.name,
                  ),
                  AppSpacing.vMd,
                  TextFormField(
                    controller: _emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    autofillHints: const [AutofillHints.email],
                    decoration: const InputDecoration(
                      labelText: 'البريد الإلكتروني',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                    validator: Validators.email,
                  ),
                  AppSpacing.vMd,
                  TextFormField(
                    controller: _passwordCtrl,
                    obscureText: _obscure1,
                    textInputAction: TextInputAction.next,
                    decoration: InputDecoration(
                      labelText: 'كلمة السر',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(_obscure1
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined),
                        onPressed: () =>
                            setState(() => _obscure1 = !_obscure1),
                      ),
                    ),
                    validator: Validators.password,
                  ),
                  AppSpacing.vMd,
                  TextFormField(
                    controller: _confirmCtrl,
                    obscureText: _obscure2,
                    textInputAction: TextInputAction.done,
                    onFieldSubmitted: (_) => _submit(),
                    decoration: InputDecoration(
                      labelText: 'تأكيد كلمة السر',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(_obscure2
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined),
                        onPressed: () =>
                            setState(() => _obscure2 = !_obscure2),
                      ),
                    ),
                    validator: (v) =>
                        Validators.confirmPassword(v, _passwordCtrl.text),
                  ),
                  AppSpacing.vMd,
                  CheckboxListTile(
                    value: _agreeTerms,
                    onChanged: (v) => setState(() => _agreeTerms = v ?? false),
                    contentPadding: EdgeInsets.zero,
                    controlAffinity: ListTileControlAffinity.leading,
                    title: Text(
                      'أوافق على الشروط والأحكام وسياسة الخصوصية',
                      style: context.text.bodySmall,
                    ),
                  ),
                  AppSpacing.vMd,
                  ElevatedButton(
                    onPressed: isLoading ? null : _submit,
                    child: isLoading
                        ? const SizedBox(
                            height: 22,
                            width: 22,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('إنشاء حساب'),
                  ),
                  AppSpacing.vXl,
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('لديك حساب؟', style: context.text.bodyMedium),
                      TextButton(
                        onPressed: () => context.go(Routes.login),
                        child: const Text('سجّل الدخول'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
