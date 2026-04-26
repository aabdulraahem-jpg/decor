import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'core/storage/secure_storage.dart';
import 'data/providers/api_providers.dart';
import 'features/auth/controllers/auth_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setPreferredOrientations(
      [DeviceOrientation.portraitUp]);

  final storage = SecureStorage();

  runApp(
    ProviderScope(
      overrides: [
        secureStorageProvider.overrideWithValue(storage),
        // عند فشل refresh، اضغط زر AuthController لمسح الجلسة.
        onAuthFailureProvider.overrideWith((ref) {
          return () async {
            await ref.read(authControllerProvider.notifier).handleAuthFailure();
          };
        }),
      ],
      child: const SufufApp(),
    ),
  );
}
