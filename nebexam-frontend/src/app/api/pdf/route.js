import { NextResponse } from 'next/server';

const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_URL || '').replace(/\/$/, '');

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  if (MEDIA_BASE && !url.startsWith(MEDIA_BASE)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const upstream = await fetch(url, { cache: 'no-store' });
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: upstream.status });
    }
    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 500 });
  }
}
