import 'package:freezed_annotation/freezed_annotation.dart';

part 'furniture_item.freezed.dart';
part 'furniture_item.g.dart';

@freezed
class FurnitureItem with _$FurnitureItem {
  const factory FurnitureItem({
    required String id,
    required String name,
    @Default('') String description,
    required String imageUrl,
    @Default('') String category,
    @Default([]) List<String> styleTags,
  }) = _FurnitureItem;

  factory FurnitureItem.fromJson(Map<String, dynamic> json) =>
      _$FurnitureItemFromJson(json);
}
