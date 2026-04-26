import 'package:freezed_annotation/freezed_annotation.dart';

part 'design.freezed.dart';
part 'design.g.dart';

@freezed
class Design with _$Design {
  const factory Design({
    required String id,
    required String projectId,
    required String generatedImageUrl,
    @Default('') String promptUsed,
    Map<String, dynamic>? parametersJson,
    @Default('') String modelUsed,
    @Default(0) int pointsConsumed,
    DateTime? createdAt,
  }) = _Design;

  factory Design.fromJson(Map<String, dynamic> json) =>
      _$DesignFromJson(json);
}
