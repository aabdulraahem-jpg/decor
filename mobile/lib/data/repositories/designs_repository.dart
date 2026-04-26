import 'package:dio/dio.dart';

import '../../core/network/api_endpoints.dart';
import '../../core/network/api_exception.dart';
import '../models/design.dart';

class GenerateDesignResult {
  GenerateDesignResult({required this.design, required this.pointsRemaining});
  final Design design;
  final int pointsRemaining;
}

class DesignsRepository {
  DesignsRepository(this._dio);
  final Dio _dio;

  Future<GenerateDesignResult> generate({
    required String projectId,
    required String style,
    String? colorPaletteId,
    List<String> furnitureIds = const [],
    String? tileId,
    String? wallId,
    String? additionalPrompt,
  }) async {
    try {
      final res = await _dio.post(
        ApiEndpoints.projectDesigns(projectId),
        data: {
          'style': style,
          if (colorPaletteId != null) 'colorPaletteId': colorPaletteId,
          if (furnitureIds.isNotEmpty) 'furnitureIds': furnitureIds,
          if (tileId != null) 'tileId': tileId,
          if (wallId != null) 'wallId': wallId,
          if (additionalPrompt != null) 'additionalPrompt': additionalPrompt,
        },
        options: Options(
          sendTimeout: const Duration(seconds: 120),
          receiveTimeout: const Duration(seconds: 120),
        ),
      );
      final data = res.data as Map<String, dynamic>;
      return GenerateDesignResult(
        design: Design.fromJson(data['design'] as Map<String, dynamic>),
        pointsRemaining: (data['pointsRemaining'] as num?)?.toInt() ?? 0,
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<List<Design>> listForProject(String projectId) async {
    try {
      final res = await _dio.get(ApiEndpoints.projectDesigns(projectId));
      final items = ((res.data as Map<String, dynamic>)['items'] as List? ?? [])
          .cast<Map<String, dynamic>>();
      return items.map(Design.fromJson).toList();
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<Design> get(String id) async {
    try {
      final res = await _dio.get(ApiEndpoints.design(id));
      return Design.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<void> delete(String id) async {
    try {
      await _dio.delete(ApiEndpoints.design(id));
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}
