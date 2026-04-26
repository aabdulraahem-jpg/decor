import 'package:dio/dio.dart';

import '../../core/network/api_endpoints.dart';
import '../../core/network/api_exception.dart';
import '../models/auth_tokens.dart';
import '../models/user.dart';

class AuthResult {
  AuthResult({required this.user, required this.tokens});
  final User user;
  final AuthTokens tokens;
}

class AuthRepository {
  AuthRepository(this._dio);
  final Dio _dio;

  Future<AuthResult> register({
    required String email,
    required String password,
    required String name,
  }) =>
      _authCall(ApiEndpoints.authRegister, {
        'email': email,
        'password': password,
        'name': name,
      });

  Future<AuthResult> login({
    required String email,
    required String password,
  }) =>
      _authCall(ApiEndpoints.authLogin, {
        'email': email,
        'password': password,
      });

  Future<AuthTokens> refresh(String refreshToken) async {
    try {
      final res = await _dio.post(
        ApiEndpoints.authRefresh,
        data: {'refreshToken': refreshToken},
      );
      final data = res.data as Map<String, dynamic>;
      return AuthTokens.fromJson(data['tokens'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<void> logout(String refreshToken) async {
    try {
      await _dio.post(
        ApiEndpoints.authLogout,
        data: {'refreshToken': refreshToken},
      );
    } on DioException catch (_) {
      // غير حرج — يكفي مسح التوكن المحلي.
    }
  }

  Future<AuthResult> loginWithGoogle(String idToken) =>
      _authCall(ApiEndpoints.authGoogle, {'idToken': idToken});

  Future<AuthResult> loginWithApple({
    required String identityToken,
    required String authorizationCode,
    String? fullName,
  }) =>
      _authCall(ApiEndpoints.authApple, {
        'identityToken': identityToken,
        'authorizationCode': authorizationCode,
        if (fullName != null) 'fullName': fullName,
      });

  Future<void> forgotPassword(String email) async {
    try {
      await _dio.post(
        ApiEndpoints.authForgotPassword,
        data: {'email': email},
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<AuthResult> _authCall(String path, Map<String, dynamic> body) async {
    try {
      final res = await _dio.post(path, data: body);
      final data = res.data as Map<String, dynamic>;
      final user = User.fromJson(data['user'] as Map<String, dynamic>);
      final tokens =
          AuthTokens.fromJson(data['tokens'] as Map<String, dynamic>);
      return AuthResult(user: user, tokens: tokens);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}
