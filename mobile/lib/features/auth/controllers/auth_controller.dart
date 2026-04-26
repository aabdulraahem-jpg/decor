import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../data/models/user.dart';
import '../../../data/providers/api_providers.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../data/repositories/users_repository.dart';

sealed class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthAuthenticated extends AuthState {
  const AuthAuthenticated(this.user);
  final User user;
}

class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

class AuthError extends AuthState {
  const AuthError(this.message, {this.statusCode});
  final String message;
  final int? statusCode;
}

class AuthController extends StateNotifier<AuthState> {
  AuthController({
    required AuthRepository authRepository,
    required UsersRepository usersRepository,
    required SecureStorage storage,
  })  : _auth = authRepository,
        _users = usersRepository,
        _storage = storage,
        super(const AuthInitial());

  final AuthRepository _auth;
  final UsersRepository _users;
  final SecureStorage _storage;

  /// يُستدعى من Splash — يحاول استرجاع الجلسة من Secure Storage.
  Future<void> restoreSession() async {
    state = const AuthLoading();
    try {
      final access = await _storage.getAccessToken();
      if (access == null || access.isEmpty) {
        state = const AuthUnauthenticated();
        return;
      }
      // محاولة جلب المستخدم — تُحدّث التوكن تلقائياً عبر AuthInterceptor.
      final user = await _users.getMe();
      await _storage.writeUserJson(jsonEncode(user.toJson()));
      state = AuthAuthenticated(user);
    } on ApiException catch (e) {
      if (e.isUnauthorized) {
        await _storage.clear();
        state = const AuthUnauthenticated();
      } else {
        // خطأ شبكة — نحاول من النسخة المخزّنة محلياً.
        final cached = await _storage.readUserJson();
        if (cached != null) {
          try {
            state = AuthAuthenticated(
              User.fromJson(jsonDecode(cached) as Map<String, dynamic>),
            );
            return;
          } catch (_) {}
        }
        state = const AuthUnauthenticated();
      }
    } catch (_) {
      state = const AuthUnauthenticated();
    }
  }

  Future<bool> login({
    required String email,
    required String password,
  }) =>
      _runAuth(() => _auth.login(email: email, password: password));

  Future<bool> register({
    required String email,
    required String password,
    required String name,
  }) =>
      _runAuth(
          () => _auth.register(email: email, password: password, name: name));

  Future<bool> loginWithGoogle(String idToken) =>
      _runAuth(() => _auth.loginWithGoogle(idToken));

  Future<bool> loginWithApple({
    required String identityToken,
    required String authorizationCode,
    String? fullName,
  }) =>
      _runAuth(() => _auth.loginWithApple(
            identityToken: identityToken,
            authorizationCode: authorizationCode,
            fullName: fullName,
          ));

  Future<void> logout() async {
    final refresh = await _storage.getRefreshToken();
    if (refresh != null) {
      try {
        await _auth.logout(refresh);
      } catch (_) {}
    }
    await _storage.clear();
    state = const AuthUnauthenticated();
  }

  /// يُستدعى من AuthInterceptor عند فشل refresh.
  Future<void> handleAuthFailure() async {
    await _storage.clear();
    state = const AuthUnauthenticated();
  }

  Future<bool> _runAuth(Future<AuthResult> Function() op) async {
    state = const AuthLoading();
    try {
      final result = await op();
      await _storage.saveTokens(
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresAt: result.tokens.expiresAt,
      );
      await _storage.writeUserJson(jsonEncode(result.user.toJson()));
      state = AuthAuthenticated(result.user);
      return true;
    } on ApiException catch (e) {
      state = AuthError(e.message, statusCode: e.statusCode);
      return false;
    } catch (e) {
      state = AuthError(e.toString());
      return false;
    }
  }

  bool get isAuthenticated => state is AuthAuthenticated;
  User? get currentUser =>
      state is AuthAuthenticated ? (state as AuthAuthenticated).user : null;
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(
    authRepository: ref.watch(authRepositoryProvider),
    usersRepository: ref.watch(usersRepositoryProvider),
    storage: ref.watch(secureStorageProvider),
  );
});
