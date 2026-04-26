import 'package:freezed_annotation/freezed_annotation.dart';

part 'package.freezed.dart';
part 'package.g.dart';

@freezed
class Package with _$Package {
  const factory Package({
    required String id,
    required String name,
    required int pointsAmount,
    required double priceSar,
    double? profitMarginPercent,
    @Default(true) bool isActive,
    @Default(0) int sortOrder,
  }) = _Package;

  factory Package.fromJson(Map<String, dynamic> json) =>
      _$PackageFromJson(json);
}
