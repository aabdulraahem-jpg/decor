import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/router/route_names.dart';
import '../../core/theme/app_colors.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notifications = true;
  bool _autoSync = true;
  bool _saveHistory = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الإعدادات')),
      body: ListView(
        children: [
          const _SectionTitle('التنبيهات'),
          SwitchListTile(
            value: _notifications,
            onChanged: (v) => setState(() => _notifications = v),
            title: const Text('تفعيل الإشعارات'),
            subtitle:
                const Text('تلقَّ تنبيهات عند انتهاء توليد التصاميم'),
            secondary: const Icon(Icons.notifications_active_outlined),
            activeColor: AppColors.primary,
          ),
          const Divider(),
          const _SectionTitle('المزامنة'),
          SwitchListTile(
            value: _autoSync,
            onChanged: (v) => setState(() => _autoSync = v),
            title: const Text('مزامنة تلقائية'),
            subtitle: const Text('احفظ المشاريع مع السحابة'),
            secondary: const Icon(Icons.sync),
            activeColor: AppColors.primary,
          ),
          SwitchListTile(
            value: _saveHistory,
            onChanged: (v) => setState(() => _saveHistory = v),
            title: const Text('حفظ السجل'),
            subtitle: const Text('احتفظ بسجل المشاريع المُولّدة'),
            secondary: const Icon(Icons.history),
            activeColor: AppColors.primary,
          ),
          const Divider(),
          const _SectionTitle('عام'),
          ListTile(
            leading: const Icon(Icons.language),
            title: const Text('اللغة'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push(Routes.language),
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: const Text('الخصوصية'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('سياسة الخصوصية')),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.delete_outline,
                color: AppColors.errorLight),
            title: const Text('حذف الحساب',
                style: TextStyle(color: AppColors.errorLight)),
            onTap: () {
              showDialog<void>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('حذف الحساب'),
                  content: const Text(
                      'سيتم حذف بياناتك نهائياً. هل أنت متأكد؟'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(ctx).pop(),
                      child: const Text('إلغاء'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.of(ctx).pop(),
                      child: const Text(
                        'حذف',
                        style: TextStyle(color: AppColors.errorLight),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('عن التطبيق'),
            trailing: const Icon(Icons.chevron_left),
            onTap: () => context.push(Routes.about),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.label);
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}
