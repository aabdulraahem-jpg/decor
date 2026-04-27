import 'package:flutter_riverpod/flutter_riverpod.dart';

/// مسودّة مشروع جديد — تُحفظ مؤقتاً عبر خطوات التدفّق.
class ProjectDraft {
  const ProjectDraft({
    this.imagePath,
    this.imageUrl,
    this.name = '',
    this.roomType,
    this.style,
    this.colorPaletteId,
    this.furnitureIds = const [],
    this.tileId,
    this.wallId,
  });

  final String? imagePath;
  final String? imageUrl;
  final String name;
  final String? roomType;
  final String? style;
  final String? colorPaletteId;
  final List<String> furnitureIds;
  final String? tileId;
  final String? wallId;

  bool get hasImage => imagePath != null || imageUrl != null;

  ProjectDraft copyWith({
    String? imagePath,
    String? imageUrl,
    String? name,
    String? roomType,
    String? style,
    String? colorPaletteId,
    List<String>? furnitureIds,
    String? tileId,
    String? wallId,
  }) {
    return ProjectDraft(
      imagePath: imagePath ?? this.imagePath,
      imageUrl: imageUrl ?? this.imageUrl,
      name: name ?? this.name,
      roomType: roomType ?? this.roomType,
      style: style ?? this.style,
      colorPaletteId: colorPaletteId ?? this.colorPaletteId,
      furnitureIds: furnitureIds ?? this.furnitureIds,
      tileId: tileId ?? this.tileId,
      wallId: wallId ?? this.wallId,
    );
  }
}

class ProjectDraftNotifier extends StateNotifier<ProjectDraft> {
  ProjectDraftNotifier() : super(const ProjectDraft());

  void setImage({String? path, String? url}) {
    state = state.copyWith(imagePath: path, imageUrl: url);
  }

  void setName(String value) {
    state = state.copyWith(name: value);
  }

  void setRoomType(String key) {
    state = state.copyWith(roomType: key);
  }

  void setStyle(String key) {
    state = state.copyWith(style: key);
  }

  void setColorPalette(String id) {
    state = state.copyWith(colorPaletteId: id);
  }

  void toggleFurniture(String id) {
    final list = List<String>.from(state.furnitureIds);
    if (list.contains(id)) {
      list.remove(id);
    } else {
      list.add(id);
    }
    state = state.copyWith(furnitureIds: list);
  }

  void setTile(String id) {
    state = state.copyWith(tileId: id);
  }

  void setWall(String id) {
    state = state.copyWith(wallId: id);
  }

  void reset() {
    state = const ProjectDraft();
  }
}

final projectDraftProvider =
    StateNotifierProvider<ProjectDraftNotifier, ProjectDraft>(
  (ref) => ProjectDraftNotifier(),
);
