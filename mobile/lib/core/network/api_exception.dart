import 'package:dio/dio.dart';

/// Exception موحّدة للـ UI — تُحوّل DioException إلى رسائل قابلة للعرض.
class ApiException implements Exception {
  ApiException({
    required this.message,
    this.statusCode,
    this.code,
    this.details,
  });

  final String message;
  final int? statusCode;
  final String? code;
  final Map<String, dynamic>? details;

  bool get isUnauthorized => statusCode == 401;
  bool get isConflict => statusCode == 409;
  bool get isValidation => statusCode == 422 || statusCode == 400;
  bool get isServer => statusCode != null && statusCode! >= 500;
  bool get isNetwork => statusCode == null;

  factory ApiException.fromDio(DioException e) {
    final res = e.response;
    if (res != null) {
      final data = res.data;
      String message = 'حدث خطأ غير متوقع';
      String? code;
      Map<String, dynamic>? details;
      if (data is Map<String, dynamic>) {
        message = (data['message'] ?? data['error'] ?? message).toString();
        code = data['code']?.toString();
        if (data['details'] is Map<String, dynamic>) {
          details = data['details'] as Map<String, dynamic>;
        }
      }
      return ApiException(
        message: message,
        statusCode: res.statusCode,
        code: code,
        details: details,
      );
    }

    final isTimeout = e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout;
    return ApiException(
      message: isTimeout
          ? 'انتهت مهلة الاتصال — تحقق من الإنترنت'
          : 'تعذّر الاتصال بالخادم',
    );
  }

  @override
  String toString() =>
      'ApiException(${statusCode ?? '-'}): $message${code != null ? ' [$code]' : ''}';
}
