// مدققات الحقول — يستخدمها FormField عبر validator.

class Validators {
  Validators._();

  static String? required(String? value, {String message = 'حقل مطلوب'}) {
    if (value == null || value.trim().isEmpty) return message;
    return null;
  }

  static String? email(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'البريد الإلكتروني مطلوب';
    final regex = RegExp(r'^[\w\.\-+]+@[\w\-]+\.[\w\.\-]+$');
    if (!regex.hasMatch(v)) return 'بريد إلكتروني غير صالح';
    return null;
  }

  static String? password(String? value) {
    final v = value ?? '';
    if (v.isEmpty) return 'كلمة السر مطلوبة';
    if (v.length < 8) return 'كلمة السر يجب أن تكون 8 أحرف على الأقل';
    return null;
  }

  static String? confirmPassword(String? value, String original) {
    if (value != original) return 'كلمتا السر غير متطابقتين';
    return null;
  }

  static String? name(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'الاسم مطلوب';
    if (v.length < 2) return 'الاسم قصير جداً';
    return null;
  }

  static String? phone(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'رقم الجوال مطلوب';
    if (!RegExp(r'^\+?[0-9]{8,15}$').hasMatch(v)) {
      return 'رقم جوال غير صالح';
    }
    return null;
  }
}
