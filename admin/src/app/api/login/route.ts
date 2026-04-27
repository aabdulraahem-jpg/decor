import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const UPSTREAM = process.env.SUFUF_API_INTERNAL_URL ?? 'http://127.0.0.1:4000/api/v1';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; email: string; name: string | null; role: string; pointsBalance: number };
}

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Forward client IP so backend rate limiter / lockout sees the real IP
  const fwd = req.headers.get('x-forwarded-for') ?? '';
  const realIp = req.headers.get('x-real-ip') ?? '';

  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/auth/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(fwd && { 'x-forwarded-for': fwd }),
        ...(realIp && { 'x-real-ip': realIp }),
      },
      body,
      cache: 'no-store',
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'Upstream unreachable', detail: (e as Error).message },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  if (!upstream.ok) {
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  }

  const data = JSON.parse(text) as LoginResponse;

  // Only ADMIN can sign in to the admin panel
  if (data.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const store = await cookies();
  store.set('admin_token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.expiresIn,
    path: '/',
  });
  store.set('admin_refresh', data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  store.set('admin_user', JSON.stringify(data.user), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.expiresIn,
    path: '/',
  });

  return NextResponse.json({ ok: true, user: data.user, expiresIn: data.expiresIn });
}
