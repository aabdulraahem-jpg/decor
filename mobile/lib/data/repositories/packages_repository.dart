import 'package:dio/dio.dart';

import '../../core/network/api_endpoints.dart';
import '../../core/network/api_exception.dart';
import '../models/package.dart' as model;
import '../models/transaction.dart';

class InitiatePurchaseResult {
  InitiatePurchaseResult({
    required this.redirectUrl,
    required this.transactionId,
  });
  final String redirectUrl;
  final String transactionId;
}

class ConfirmPurchaseResult {
  ConfirmPurchaseResult({
    required this.transaction,
    required this.pointsRemaining,
  });
  final Transaction transaction;
  final int pointsRemaining;
}

class PackagesRepository {
  PackagesRepository(this._dio);
  final Dio _dio;

  Future<List<model.Package>> list() async {
    try {
      final res = await _dio.get(ApiEndpoints.packages);
      final items = ((res.data as Map<String, dynamic>)['items'] as List? ?? [])
          .cast<Map<String, dynamic>>();
      return items.map(model.Package.fromJson).toList();
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<InitiatePurchaseResult> initiate(String packageId) async {
    try {
      final res = await _dio.post(
        ApiEndpoints.transactionsInitiate,
        data: {'packageId': packageId},
      );
      final data = res.data as Map<String, dynamic>;
      return InitiatePurchaseResult(
        redirectUrl: data['redirectUrl'] as String,
        transactionId: data['transactionId'] as String,
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }

  Future<ConfirmPurchaseResult> confirm({
    required String transactionId,
    required String apsResponse,
  }) async {
    try {
      final res = await _dio.post(
        ApiEndpoints.transactionsConfirm,
        data: {
          'transactionId': transactionId,
          'apsResponse': apsResponse,
        },
      );
      final data = res.data as Map<String, dynamic>;
      return ConfirmPurchaseResult(
        transaction:
            Transaction.fromJson(data['transaction'] as Map<String, dynamic>),
        pointsRemaining: (data['pointsRemaining'] as num?)?.toInt() ?? 0,
      );
    } on DioException catch (e) {
      throw ApiException.fromDio(e);
    }
  }
}
