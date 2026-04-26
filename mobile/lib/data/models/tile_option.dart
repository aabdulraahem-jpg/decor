import 'package:freezed_annotation/freezed_annotation.dart';

part 'tile_option.freezed.dart';
part 'tile_option.g.dart';

@freezed
class TileOption with _$TileOption {
  const factory TileOption({
    required String id,
    required String name,
    @Default('') String description,
    required String imageUrl,
    @Default('') String category,
    @Default([]) List<String> styleTags,
    String? textureUrl,
  }) = _TileOption;

  factory TileOption.fromJson(Map<String, dynamic> json) =>
      _$TileOptionFromJson(json);
}
