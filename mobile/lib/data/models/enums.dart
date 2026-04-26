// Enums متطابقة مع `backend/prisma/schema.prisma` و `flutterflow-guide/03_data_types.md`.
// قيم تُسلسل/تُفك كنصوص UPPER_SNAKE_CASE.

enum AuthProvider { local, google, apple }

enum UserRole { user, admin }

enum RoomType {
  majlis,
  bedroom,
  kitchen,
  bathroom,
  livingRoom,
  diningRoom,
  office,
  entryway,
}

enum Style {
  modern,
  classic,
  minimal,
  arabicContemporary,
  industrial,
  bohemian,
  scandinavian,
}

enum TransactionStatus { pending, success, failed, refunded }

enum PaymentMethod { visa, mastercard, mada, applePay, googlePay, stcPay }

enum ApiProviderEnum { openai, aps }

// ───── helpers: from/to wire (UPPER_SNAKE_CASE) ─────

String _toWire(Enum e) {
  // converts e.g. livingRoom -> LIVING_ROOM
  final s = e.name;
  final buf = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    final c = s[i];
    final isUpper = c == c.toUpperCase() && c != c.toLowerCase();
    if (isUpper && i > 0) buf.write('_');
    buf.write(c.toUpperCase());
  }
  return buf.toString();
}

T _fromWire<T extends Enum>(List<T> values, String? raw, T fallback) {
  if (raw == null) return fallback;
  final n = raw.toUpperCase();
  for (final v in values) {
    if (_toWire(v) == n) return v;
  }
  return fallback;
}

// AuthProvider
String authProviderToJson(AuthProvider e) => _toWire(e);
AuthProvider authProviderFromJson(String? raw) =>
    _fromWire(AuthProvider.values, raw, AuthProvider.local);

// UserRole
String userRoleToJson(UserRole e) => _toWire(e);
UserRole userRoleFromJson(String? raw) =>
    _fromWire(UserRole.values, raw, UserRole.user);

// RoomType
String roomTypeToJson(RoomType e) => _toWire(e);
RoomType roomTypeFromJson(String? raw) =>
    _fromWire(RoomType.values, raw, RoomType.majlis);

// Style
String styleToJson(Style e) => _toWire(e);
Style styleFromJson(String? raw) =>
    _fromWire(Style.values, raw, Style.modern);

// TransactionStatus
String transactionStatusToJson(TransactionStatus e) => _toWire(e);
TransactionStatus transactionStatusFromJson(String? raw) =>
    _fromWire(TransactionStatus.values, raw, TransactionStatus.pending);

// PaymentMethod
String paymentMethodToJson(PaymentMethod e) => _toWire(e);
PaymentMethod paymentMethodFromJson(String? raw) =>
    _fromWire(PaymentMethod.values, raw, PaymentMethod.visa);

// تسميات عربية لـ RoomType و Style — للعرض في الواجهة.
extension RoomTypeArabic on RoomType {
  String get arabicLabel {
    switch (this) {
      case RoomType.majlis:
        return 'مجلس';
      case RoomType.bedroom:
        return 'غرفة نوم';
      case RoomType.kitchen:
        return 'مطبخ';
      case RoomType.bathroom:
        return 'حمام';
      case RoomType.livingRoom:
        return 'صالة';
      case RoomType.diningRoom:
        return 'غرفة طعام';
      case RoomType.office:
        return 'مكتب';
      case RoomType.entryway:
        return 'مدخل';
    }
  }
}

extension StyleArabic on Style {
  String get arabicLabel {
    switch (this) {
      case Style.modern:
        return 'حديث';
      case Style.classic:
        return 'كلاسيكي';
      case Style.minimal:
        return 'بسيط';
      case Style.arabicContemporary:
        return 'عربي معاصر';
      case Style.industrial:
        return 'صناعي';
      case Style.bohemian:
        return 'بوهيمي';
      case Style.scandinavian:
        return 'اسكندنافي';
    }
  }
}
