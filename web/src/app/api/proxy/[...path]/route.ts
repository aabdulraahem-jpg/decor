import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const UPSTREAM = process.env.SUFUF_API_INTERNAL_URL ?? 'http://127.0.0.1:4000/api/v1';

const ALLOWED_PREFIXES = [
  'samples/',
  'samples',
  'palette/',
  'palette',
  'site/',
  'site',
  'packages',
  'projects',
  'projects/',
  'designs',
  'designs/',
  'users/me',
  'auth/refresh',
  'auth/logout',
];

function isAllowed(p: string): boolean {
  return ALLOWED_PREFIXES.some((x) => p === x || p.startsWith(x));
}

async function forward(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const segments = path.join('/');

  // Special case: /api/proxy/uploads/reference → backend /samples/reference (user-scoped)
  let backendPath = segments;
  if (segments === 'uploads/reference') backendPath = 'samples/reference';

  if (!isAllowed(backendPath)) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  const url = `${UPSTREAM}/${backendPath}${req.nextUrl.search}`;
  const store = await cookies();
  const token = store.get('sufuf_token')?.value;

  const headers: Record<string, string> = {};
  const ct = req.headers.get('content-type');
  if (ct) headers['content-type'] = ct;
  if (token) headers['authorization'] = `Bearer ${token}`;

  const init: RequestInit = { method: req.method, headers, cache: 'no-store' };
  if (!['GET', 'HEAD'].includes(req.method)) {
    const buf = await req.arrayBuffer();
    init.body = Buffer.from(buf);
    // @ts-expect-error duplex required for body in Node fetch
    init.duplex = 'half';
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch (e) {
    return NextResponse.json({ error: 'Upstream unreachable', detail: (e as Error).message }, { status: 502 });
  }

  const body = await upstream.text();
  const res = new NextResponse(body, { status: upstream.status });
  const respCt = upstream.headers.get('content-type');
  if (respCt) res.headers.set('content-type', respCt);
  return res;
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
