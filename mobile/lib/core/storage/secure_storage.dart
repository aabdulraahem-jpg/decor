import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../config/app_constants.dart';

/// Wrapper حول flutter_secure_storage لتخزين توكنز الجلسة.
/// تُستخدم على iOS Keychain و Android Encrypted SharedPreferences.
class SecureStorage {
  SecureStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
              iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
            );

  final FlutterSecureStorage _storage;

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    DateTime? expiresAt,
  }) async {
    await _storage.write(key: AppConstants.kAccessToken, value: accessToken);
    await _storage.write(key: AppConstants.kRefreshToken, value: refreshToken);
    if (expiresAt != null) {
      await _storage.write(
        key: AppConstants.kTokenExpiresAt,
        value: expiresAt.toIso8601String(),
      );
    }
  }

  Future<String?> getAccessToken() =>
      _storage.read(key: AppConstants.kAccessToken);

  Future<String?> getRefreshToken() =>
      _storage.read(key: AppConstants.kRefreshToken);

  Future<DateTime?> getExpiresAt() async {
    final raw = await _storage.read(key: AppConstants.kTokenExpiresAt);
    if (raw == null) return null;
    return DateTime.tryParse(raw);
  }

  Future<void> clear() async {
    await _storage.delete(key: AppConstants.kAccessToken);
    await _storage.delete(key: AppConstants.kRefreshToken);
    await _storage.delete(key: AppConstants.kTokenExpiresAt);
    await _storage.delete(key: AppConstants.kUserJson);
  }

  Future<void> writeUserJson(String json) =>
      _storage.write(key: AppConstants.kUserJson, value: json);

  Future<String?> readUserJson() =>
      _storage.read(key: AppConstants.kUserJson);
}
