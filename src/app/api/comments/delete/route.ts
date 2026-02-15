import { NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.MOMO_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MOMO_API_URL ||
  'https://api-momo.motues.top';

export async function DELETE(request: Request) {
  try {
    const incoming = new URL(request.url);
    const target = new URL('/admin/comments/delete', BACKEND_URL);
    target.search = incoming.search;
    const auth = request.headers.get('authorization') || '';
    const res = await fetch(target.toString(), {
      method: 'DELETE',
      headers: auth ? { Authorization: auth } : undefined,
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    });
  } catch {
    return NextResponse.json({ error: '删除评论失败' }, { status: 502 });
  }
}
