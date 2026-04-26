import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/controllers/auth_controller.dart';

/// Helpers للوصول السريع لحالة المصادقة من خارج Router.
class AuthGuard {
  AuthGuard(this.ref);
  final Ref ref;

  bool get isAuthenticated =>
      ref.read(authControllerProvider) is AuthAuthenticated;

  bool get isLoading {
    final s = ref.read(authControllerProvider);
    return s is AuthInitial || s is AuthLoading;
  }
}
