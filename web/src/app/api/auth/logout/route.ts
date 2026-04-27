import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const store = await cookies();
  store.delete('sufuf_token');
  store.delete('sufuf_refresh');
  store.delete('sufuf_user');
  return NextResponse.json({ ok: true });
}
