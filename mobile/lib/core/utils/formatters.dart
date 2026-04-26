import 'package:intl/intl.dart';

/// منسّقات للأرقام والتواريخ — تستخدم locale الحالي.

class Formatters {
  Formatters._();

  static String points(int value, {String locale = 'ar'}) {
    final f = NumberFormat.decimalPattern(locale);
    return '${f.format(value)} ${locale == 'ar' ? 'نقطة' : 'pts'}';
  }

  static String currencySar(num value, {String locale = 'ar'}) {
    final f = NumberFormat.currency(
      locale: locale == 'ar' ? 'ar_SA' : 'en_US',
      symbol: locale == 'ar' ? 'ر.س ' : 'SAR ',
      decimalDigits: 2,
    );
    return f.format(value);
  }

  static String dateLong(DateTime dt, {String locale = 'ar'}) {
    return DateFormat.yMMMMd(locale).format(dt);
  }

  static String dateShort(DateTime dt, {String locale = 'ar'}) {
    return DateFormat.yMd(locale).format(dt);
  }

  static String timeAgo(DateTime dt, {String locale = 'ar'}) {
    final diff = DateTime.now().difference(dt);
    if (locale == 'ar') {
      if (diff.inMinutes < 1) return 'الآن';
      if (diff.inMinutes < 60) return 'منذ ${diff.inMinutes} دقيقة';
      if (diff.inHours < 24) return 'منذ ${diff.inHours} ساعة';
      if (diff.inDays < 30) return 'منذ ${diff.inDays} يوم';
      return dateShort(dt, locale: 'ar');
    }
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 30) return '${diff.inDays}d ago';
    return dateShort(dt, locale: 'en');
  }
}
