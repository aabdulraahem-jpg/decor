import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC = ['/login', '/api/session'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes and static assets
  if (PUBLIC.some((p) => pathname.startsWith(p)) || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
