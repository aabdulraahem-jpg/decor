import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const UPSTREAM = process.env.SUFUF_API_INTERNAL_URL ?? 'http://127.0.0.1:4000/api/v1';
const PUBLIC_BASE = process.env.NEXT_PUBLIC_WEB_BASE_URL ?? 'https://sufuf.pro';

interface RedeemResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; email: string; name: string | null; role: string; pointsBalance: number };
}

export async function GET(req: NextRequest) {
  const ticket = req.nextUrl.searchParams.get('ticket');
  if (!ticket) return NextResponse.redirect(`${PUBLIC_BASE}/login?error=missing_ticket`);

  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/auth/oauth-redeem`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ticket }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.redirect(`${PUBLIC_BASE}/login?error=upstream`);
  }

  if (!upstream.ok) {
    return NextResponse.redirect(`${PUBLIC_BASE}/login?error=invalid_ticket`);
  }

  const data = (await upstream.json()) as RedeemResponse;
  const store = await cookies();
  const secure = process.env.NODE_ENV === 'production';
  store.set('sufuf_token', data.accessToken, {
    httpOnly: true, secure, sameSite: 'lax', maxAge: data.expiresIn, path: '/',
  });
  store.set('sufuf_refresh', data.refreshToken, {
    httpOnly: true, secure, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/',
  });
  store.set('sufuf_user', JSON.stringify(data.user), {
    httpOnly: false, secure, sameSite: 'lax', maxAge: data.expiresIn, path: '/',
  });

  return NextResponse.redirect(`${PUBLIC_BASE}/studio`);
}
