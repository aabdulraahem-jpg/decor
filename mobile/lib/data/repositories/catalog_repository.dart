import 'package:dio/dio.dart';

import '../../core/network/api_endpoints.dart';
import '../../core/network/api_exception.dart';
import '../models/color_palette.dart';
import '../models/decor_element.dart';
import '../models/furniture_item.dart';
import '../models/tile_option.dart';
import '../models/wall_option.dart';

class CatalogRepository {
  CatalogRepository(this._dio);
  final Dio _dio;

  Future<List<FurnitureItem>> furniture({String? style, String? category}) =>
      _list(
        ApiEndpoints.catalogFurniture,
        FurnitureItem.fromJson,
        query: {
          if (style != null) 'style': style,
          if (category != null) 'category': category,
        },
      );

  Future<List<DecorElement>> decor() =>
      _list(ApiEndpoints.catalogDecor, DecorElement.fromJson);

  Future<List<TileOption>> tiles() =>
      _list(ApiEndpoints.catalogTiles, TileOption.fromJson);

  Future<List<WallOption>> walls() =>
      _list(ApiEndpoints.catalogWalls, WallOption.fromJson);

  Future<List<ColorPalette>> colorPalettes() =>
      _list(ApiEndpoints.catalogColors, ColorPalette.fromJson);

  Future<List<T>> _list<T>(
    String path,
    T Function(Map<String, dynamic>) fromJson, {
    Map<String, dynamic>? query,
  }) async {
    try {
      final res = await _dio.get(path, queryParameters: query);
      final items = ((res.data as Map<String, dynamic>)['items'] as List? ?? [])
          .cast<Map<String, dynamic>>();
      return items.map(fromJson).toList();
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}
