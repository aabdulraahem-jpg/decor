import 'package:freezed_annotation/freezed_annotation.dart';

part 'color_palette.freezed.dart';
part 'color_palette.g.dart';

@freezed
class ColorPalette with _$ColorPalette {
  const factory ColorPalette({
    required String id,
    required String name,
    @Default([]) List<String> colorsList,
  }) = _ColorPalette;

  factory ColorPalette.fromJson(Map<String, dynamic> json) =>
      _$ColorPaletteFromJson(json);
}
