import 'package:dio/dio.dart';

import '../../core/network/api_endpoints.dart';
import '../../core/network/api_exception.dart';
import '../models/project.dart';

class ProjectsPage {
  ProjectsPage({
    required this.items,
    required this.total,
    required this.page,
    required this.limit,
  });
  final List<Project> items;
  final int total;
  final int page;
  final int limit;
}

class ProjectsRepository {
  ProjectsRepository(this._dio);
  final Dio _dio;

  Future<ProjectsPage> list({int page = 1, int limit = 20}) async {
    try {
      final res = await _dio.get(
        ApiEndpoints.projects,
        queryParameters: {'page': page, 'limit': limit},
      );
      final data = res.data as Map<String, dynamic>;
      final items = (data['items'] as List? ?? [])
          .cast<Map<String, dynamic>>()
          .map(Project.fromJson)
          .toList();
      return ProjectsPage(
        items: items,
        total: (data['total'] as num?)?.toInt() ?? items.length,
        page: (data['page'] as num?)?.toInt() ?? page,
        limit: (data['limit'] as num?)?.toInt() ?? limit,
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<Project> create({
    required String name,
    required String roomType,
    required String originalImageUrl,
  }) async {
    try {
      final res = await _dio.post(
        ApiEndpoints.projects,
        data: {
          'name': name,
          'roomType': roomType,
          'originalImageUrl': originalImageUrl,
        },
      );
      return Project.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<Project> get(String id) async {
    try {
      final res = await _dio.get(ApiEndpoints.project(id));
      return Project.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<Project> update(String id, {required String name}) async {
    try {
      final res = await _dio.patch(
        ApiEndpoints.project(id),
        data: {'name': name},
      );
      return Project.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<void> delete(String id) async {
    try {
      await _dio.delete(ApiEndpoints.project(id));
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}
