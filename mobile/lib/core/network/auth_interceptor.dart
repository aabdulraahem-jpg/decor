import 'dart:async';

import 'package:dio/dio.dart';

import '../config/app_constants.dart';
import '../storage/secure_storage.dart';
import 'api_endpoints.dart';

typedef OnAuthFailure = Future<void> Function();

/// Interceptor يربط Bearer لكل طلب، وعند 401 يحاول refresh ويُعيد الطلب.
class AuthInterceptor extends QueuedInterceptorsWrapper {
  AuthInterceptor({
    required Dio dio,
    required SecureStorage storage,
    required this.onAuthFailure,
  })  : _dio = dio,
        _storage = storage;

  final Dio _dio;
  final SecureStorage _storage;
  final OnAuthFailure onAuthFailure;

  bool _isRefreshing = false;
  Completer<String?>? _refreshCompleter;

  static const _skipAuthPaths = <String>[
    ApiEndpoints.authLogin,
    ApiEndpoints.authRegister,
    ApiEndpoints.authRefresh,
    ApiEndpoints.authGoogle,
    ApiEndpoints.authApple,
    ApiEndpoints.authForgotPassword,
    ApiEndpoints.authResetPassword,
  ];

  bool _shouldSkip(RequestOptions o) =>
      _skipAuthPaths.any((p) => o.path.endsWith(p));

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (!_shouldSkip(options)) {
      final token = await _storage.getAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }
    options.headers['Accept'] = 'application/json';
    options.headers['Accept-Language'] ??= AppConstants.defaultLocale;
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    final response = err.response;
    final isAuthCall = _shouldSkip(err.requestOptions);

    if (response?.statusCode == 401 && !isAuthCall) {
      try {
        final newToken = await _refreshToken();
        if (newToken != null) {
          // إعادة الطلب الأصلي بالتوكن الجديد
          final retry = err.requestOptions
            ..headers['Authorization'] = 'Bearer $newToken';
          final cloned = await _dio.fetch(retry);
          return handler.resolve(cloned);
        }
      } catch (_) {
        // تُترك الأخطاء تنزل لـ handler.next
      }
      await onAuthFailure();
    }
    handler.next(err);
  }

  Future<String?> _refreshToken() async {
    if (_isRefreshing && _refreshCompleter != null) {
      return _refreshCompleter!.future;
    }
    _isRefreshing = true;
    _refreshCompleter = Completer<String?>();
    try {
      final refresh = await _storage.getRefreshToken();
      if (refresh == null || refresh.isEmpty) {
        _refreshCompleter!.complete(null);
        return null;
      }
      final res = await Dio(BaseOptions(baseUrl: _dio.options.baseUrl)).post(
        ApiEndpoints.authRefresh,
        data: {'refreshToken': refresh},
      );
      final tokens = res.data is Map<String, dynamic>
          ? (res.data['tokens'] as Map<String, dynamic>?)
          : null;
      if (tokens == null) {
        _refreshCompleter!.complete(null);
        return null;
      }
      final access = tokens['accessToken'] as String?;
      final newRefresh = tokens['refreshToken'] as String? ?? refresh;
      final expiresStr = tokens['expiresAt'] as String?;
      if (access != null) {
        await _storage.saveTokens(
          accessToken: access,
          refreshToken: newRefresh,
          expiresAt:
              expiresStr != null ? DateTime.tryParse(expiresStr) : null,
        );
      }
      _refreshCompleter!.complete(access);
      return access;
    } catch (e) {
      await _storage.clear();
      _refreshCompleter!.complete(null);
      return null;
    } finally {
      _isRefreshing = false;
    }
