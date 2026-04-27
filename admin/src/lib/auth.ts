'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const TOKEN_COOKIE = 'admin_token';
const USER_COOKIE = 'admin_user';

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

export async function getUser() {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; email: string; name: string | null; role: string };
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const token = await getToken();
  if (!token) redirect('/login');
  return token;
}

export async function setSession(accessToken: string, user: object) {
  const store = await cookies();
  store.set(TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24h
    path: '/',
  });
  store.set(USER_COOKIE, JSON.stringify(user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  store.delete(USER_COOKIE);
}
