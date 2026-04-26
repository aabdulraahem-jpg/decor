import 'package:freezed_annotation/freezed_annotation.dart';

import 'enums.dart';

part 'transaction.freezed.dart';
part 'transaction.g.dart';

@freezed
class Transaction with _$Transaction {
  const factory Transaction({
    required String id,
    required String userId,
    required String packageId,
    required double amountPaid,
    required int pointsAdded,
    @JsonKey(
        fromJson: transactionStatusFromJson, toJson: transactionStatusToJson)
    @Default(TransactionStatus.pending)
    TransactionStatus status,
    String? apsTransactionId,
    String? paymentMethod,
    DateTime? createdAt,
  }) = _Transaction;

  factory Transaction.fromJson(Map<String, dynamic> json) =>
      _$TransactionFromJson(json);
}
