import 'package:dio/dio.dart';

import '../../core/network/api_endpoints.dart';
import '../../core/network/api_exception.dart';
import '../models/user.dart';

class UsersRepository {
  UsersRepository(this._dio);
  final Dio _dio;

  Future<User> getMe() async {
    try {
      final res = await _dio.get(ApiEndpoints.usersMe);
      return User.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<User> updateMe({
    String? name,
    String? phoneNumber,
    String? avatarUrl,
  }) async {
    try {
      final res = await _dio.patch(
        ApiEndpoints.usersMe,
        data: {
          if (name != null) 'name': name,
          if (phoneNumber != null) 'phoneNumber': phoneNumber,
          if (avatarUrl != null) 'avatarUrl': avatarUrl,
        },
      );
      return User.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<void> deleteMyAccount() async {
    try {
      await _dio.delete(ApiEndpoints.usersMe);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}
