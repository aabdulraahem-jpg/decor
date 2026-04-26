import 'package:freezed_annotation/freezed_annotation.dart';

part 'wall_option.freezed.dart';
part 'wall_option.g.dart';

@freezed
class WallOption with _$WallOption {
  const factory WallOption({
    required String id,
    required String name,
    @Default('') String description,
    required String imageUrl,
    @Default('') String category,
    @Default([]) List<String> styleTags,
    @Default('paint') String finishType, // paint | wallpaper | wood
  }) = _WallOption;

  factory WallOption.fromJson(Map<String, dynamic> json) =>
      _$WallOptionFromJson(json);
}
