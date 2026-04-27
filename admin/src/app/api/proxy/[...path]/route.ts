import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const UPSTREAM = process.env.SUFUF_API_INTERNAL_URL ?? 'http://127.0.0.1:4000/api/v1';

const ALLOWED_PREFIXES = [
  'admin/',
  'packages',
  'samples/',
  'samples',
  'palette/',
  'palette',
  'auth/logout',
  'auth/refresh',
];

function isAllowed(path: string): boolean {
  return ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(p));
}

async function forward(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const segments = path.join('/');
  if (!isAllowed(segments)) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  const search = req.nextUrl.search;
  const url = `${UPSTREAM}/${segments}${search}`;

  const store = await cookies();
  const token = store.get('admin_token')?.value;

  const headers: Record<string, string> = {};
  const incomingType = req.headers.get('content-type');
  if (incomingType) headers['content-type'] = incomingType;
  if (token) headers['authorization'] = `Bearer ${token}`;

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
  };

  if (!['GET', 'HEAD'].includes(req.method)) {
    // Use arrayBuffer to keep binary uploads (multipart) intact
    const buf = await req.arrayBuffer();
    init.body = Buffer.from(buf);
    // @ts-expect-error duplex is required by Node's fetch when sending a body
    init.duplex = 'half';
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch (e) {
    return NextResponse.json(
      { error: 'Upstream unreachable', detail: (e as Error).message },
      { status: 502 },
    );
  }

  const body = await upstream.text();
  const res = new NextResponse(body, { status: upstream.status });
  const ct = upstream.headers.get('content-type');
  if (ct) res.headers.set('content-type', ct);
  return res;
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
