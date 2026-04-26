import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_client.dart';
import '../../core/storage/secure_storage.dart';
import '../repositories/auth_repository.dart';
import '../repositories/catalog_repository.dart';
import '../repositories/designs_repository.dart';
import '../repositories/packages_repository.dart';
import '../repositories/projects_repository.dart';
import '../repositories/users_repository.dart';

/// Riverpod providers لـ Storage و Dio و Repositories.
/// onAuthFailure يُستبدَل في `app.dart` ليُحرّك AuthController.

final secureStorageProvider = Provider<SecureStorage>((ref) {
  return SecureStorage();
});

/// يُعرَّف هذا داخل ProviderScope override في `main.dart`.
/// callback يُستدعى عندما يفشل refresh — يُمسح الجلسة في AuthController.
final onAuthFailureProvider = Provider<Future<void> Function()>((ref) {
  return () async {};
});

final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(secureStorageProvider);
  final onFail = ref.watch(onAuthFailureProvider);
  return DioClient.create(
    storage: storage,
    onAuthFailure: onFail,
  );
});

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(ref.watch(dioProvider)),
);

final usersRepositoryProvider = Provider<UsersRepository>(
  (ref) => UsersRepository(ref.watch(dioProvider)),
);

final projectsRepositoryProvider = Provider<ProjectsRepository>(
  (ref) => ProjectsRepository(ref.watch(dioProvider)),
);

final designsRepositoryProvider = Provider<DesignsRepository>(
  (ref) => DesignsRepository(ref.watch(dioProvider)),
);

final catalogRepositoryProvider = Provider<CatalogRepository>(
  (ref) => CatalogRepository(ref.watch(dioProvider)),
);

final packagesRepositoryProvider = Provider<PackagesRepository>(
  (ref) => PackagesRepository(ref.watch(dioProvider)),
);

/// قائمة آخر مشاريع المستخدم — تُستخدم في Home.
final userProjectsProvider = FutureProvider.autoDispose((ref) async {
  final repo = ref.watch(projectsRepositoryProvider);
  return repo.list(page: 1, limit: 10);
});

/// لغة العرض الحالية — تتغيّر من Settings لاحقاً.
final localeProvider = StateProvider<String>((_) => 'ar');
