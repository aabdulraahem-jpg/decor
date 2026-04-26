import 'package:freezed_annotation/freezed_annotation.dart';

import 'design.dart';

part 'project.freezed.dart';
part 'project.g.dart';

@freezed
class Project with _$Project {
  const factory Project({
    required String id,
    required String userId,
    required String name,
    required String roomType,
    required String originalImageUrl,
    DateTime? createdAt,
    @Default(0) int designsCount,
    @Default([]) List<Design> designs,
  }) = _Project;

  factory Project.fromJson(Map<String, dynamic> json) =>
      _$ProjectFromJson(json);
}
