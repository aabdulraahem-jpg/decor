import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC = ['/login', '/api/session', '/api/login', '/api/proxy'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes and static assets
  if (PUBLIC.some((p) => pathname.startsWith(p)) || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('admin_token')?.value;
  if (!token) {
    const host = req.headers.get('host') ?? req.nextUrl.host;
    const proto = req.headers.get('x-forwarded-proto') ?? 'https';
    return NextResponse.redirect(new URL('/login', `${proto}://${host}`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
