'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

const nav = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: '📊' },
  { href: '/site', label: 'محتوى الموقع', icon: '🌐' },
  { href: '/packages', label: 'الباقات', icon: '📦' },
  { href: '/samples', label: 'العينات والفئات', icon: '🎨' },
  { href: '/palette', label: 'الألوان والمساحات', icon: '🎨' },
  { href: '/users', label: 'المستخدمون', icon: '👥' },
  { href: '/transactions', label: 'المعاملات', icon: '💳' },
  { href: '/settings/aps', label: 'إعدادات الدفع', icon: '🔑' },
  { href: '/settings/ai', label: 'إعدادات الذكاء الاصطناعي', icon: '🤖' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/session', { method: 'DELETE' });
    router.push('/login');
  }

  return (
    <aside className="w-64 min-h-screen bg-navy flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-navy-lighter">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center">
            <span className="text-navy font-black text-lg">س</span>
          </div>
          <div>
            <div className="text-white font-bold text-lg">سُفُف</div>
            <div className="text-gray-400 text-xs">لوحة التحكم</div>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
              pathname.startsWith(item.href)
                ? 'bg-gold text-navy'
                : 'text-gray-300 hover:bg-navy-lighter hover:text-white',
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-navy-lighter">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-navy-lighter w-full transition-all"
        >
          <span>🚪</span>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
