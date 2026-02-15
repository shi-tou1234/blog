import { NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.MOMO_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MOMO_API_URL ||
  'https://api-momo.motues.top';

function buildTargetUrl(request: Request) {
  const incoming = new URL(request.url);
  const target = new URL('/api/comments', BACKEND_URL);
  target.search = incoming.search;
  return target;
}

export async function GET(request: Request) {
  try {
    const target = buildTargetUrl(request);
    const res = await fetch(target.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    });
  } catch {
    return NextResponse.json({ error: '评论服务不可用' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const target = buildTargetUrl(request);
    const body = await request.text();
    const res = await fetch(target.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    });
  } catch {
    return NextResponse.json({ error: '评论提交失败' }, { status: 502 });
  }
}
