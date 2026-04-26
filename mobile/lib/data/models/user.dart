import 'package:freezed_annotation/freezed_annotation.dart';

import 'enums.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String email,
    String? name,
    String? phoneNumber,
    @JsonKey(fromJson: authProviderFromJson, toJson: authProviderToJson)
    @Default(AuthProvider.local)
    AuthProvider authProvider,
    @Default(0) int pointsBalance,
    @JsonKey(fromJson: userRoleFromJson, toJson: userRoleToJson)
    @Default(UserRole.user)
    UserRole role,
    String? avatarUrl,
    @Default(false) bool emailVerified,
    @Default(false) bool phoneVerified,
    DateTime? createdAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
