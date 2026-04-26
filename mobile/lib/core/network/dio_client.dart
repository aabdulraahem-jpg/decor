import 'package:dio/dio.dart';
import 'package:pretty_dio_logger/pretty_dio_logger.dart';

import '../config/app_constants.dart';
import '../config/env.dart';
import '../storage/secure_storage.dart';
import 'auth_interceptor.dart';

/// مصنع Dio: ينشئ Instance مع interceptors جاهزة.
class DioClient {
  DioClient._();

  static Dio create({
    required SecureStorage storage,
    required Future<void> Function() onAuthFailure,
    String locale = AppConstants.defaultLocale,
  }) {
    final dio = Dio(
      BaseOptions(
        baseUrl: Env.apiBaseUrl,
        connectTimeout: const Duration(seconds: Env.networkTimeoutSeconds),
        sendTimeout: const Duration(seconds: Env.networkTimeoutSeconds),
        receiveTimeout: const Duration(seconds: Env.networkTimeoutSeconds),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': locale,
        },
        followRedirects: true,
        validateStatus: (s) => s != null && s < 500,
      ),
    );

    dio.interceptors.add(
      AuthInterceptor(
        dio: dio,
        storage: storage,
        onAuthFailure: onAuthFailure,
      ),
    );

    if (Env.isDev) {
      dio.interceptors.add(
        PrettyDioLogger(
          requestHeader: false,
          requestBody: true,
          responseBody: true,
          responseHeader: false,
          error: true,
          compact: true,
          maxWidth: 100,
        ),
      );
    }

    return dio;
  }
}
