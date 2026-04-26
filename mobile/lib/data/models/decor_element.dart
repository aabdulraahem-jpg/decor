import 'package:freezed_annotation/freezed_annotation.dart';

part 'decor_element.freezed.dart';
part 'decor_element.g.dart';

@freezed
class DecorElement with _$DecorElement {
  const factory DecorElement({
    required String id,
    required String name,
    @Default('') String description,
    required String imageUrl,
    @Default('') String category,
    @Default([]) List<String> styleTags,
  }) = _DecorElement;

  factory DecorElement.fromJson(Map<String, dynamic> json) =>
      _$DecorElementFromJson(json);
}
