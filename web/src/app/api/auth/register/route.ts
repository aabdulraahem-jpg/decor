import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const UPSTREAM = process.env.SUFUF_API_INTERNAL_URL ?? 'http://127.0.0.1:4000/api/v1';

interface RegResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; email: string; name: string | null; role: string; pointsBalance: number };
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const fwd = req.headers.get('x-forwarded-for') ?? '';

  const upstream = await fetch(`${UPSTREAM}/auth/register`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(fwd && { 'x-forwarded-for': fwd }),
    },
    body,
    cache: 'no-store',
  }).catch((e: Error) => new Response(JSON.stringify({ error: e.message }), { status: 502 }));

  const text = await upstream.text();
  if (!upstream.ok) {
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  }

  const data = JSON.parse(text) as RegResponse;
  const store = await cookies();
  store.set('sufuf_token', data.accessToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    maxAge: data.expiresIn, path: '/',
  });
  store.set('sufuf_refresh', data.refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, path: '/',
  });
  store.set('sufuf_user', JSON.stringify(data.user), {
    httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    maxAge: data.expiresIn, path: '/',
  });

  return NextResponse.json({ ok: true, user: data.user, expiresIn: data.expiresIn });
}
