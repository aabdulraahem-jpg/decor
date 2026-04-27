'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface User { id: string; name: string | null; email: string; pointsBalance: number; role: string }

function readUserCookie(): User | null {
  if (typeof document === 'undefined') return null;
  const raw = document.cookie.match(/sufuf_user=([^;]+)/)?.[1];
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as User;
  } catch { return null; }
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { setUser(readUserCookie()); }, [pathname]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  }

  const links = [
    { href: '/', label: 'الرئيسية' },
    { href: '/studio', label: 'الاستوديو' },
    { href: '/pricing', label: 'الباقات' },
    ...(user ? [{ href: '/history', label: 'تصاميمي' }] : []),
  ];

  return (
    <header className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-2xl flex items-center justify-center text-navy font-black text-xl shadow-md shadow-gold/30 group-hover:scale-105 transition">ص</div>
          <div className="leading-tight">
            <div className="text-navy font-black text-lg">صفوف رايقة</div>
            <div className="text-[10px] text-gold-dark font-semibold tracking-wider hidden sm:block">SUFUF.PRO</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                'text-sm font-bold transition-colors',
                pathname === l.href ? 'text-gold' : 'text-navy hover:text-gold',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/account" className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-gray-500">رصيدك:</span>
                <span className="badge bg-gold/15 text-navy">{user.pointsBalance} نقطة</span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-sm">خروج</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm">دخول</Link>
              <Link href="/register" className="btn-primary text-sm py-2 px-4">سجّل مجاناً</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
