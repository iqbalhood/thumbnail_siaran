import { NextRequest, NextResponse } from 'next/server';

/**
 * Same-origin image proxy — fetches images from Supabase Storage server-side
 * and returns them with CORS headers, so the browser canvas is never tainted.
 *
 * Usage: /api/proxy-image?url=<encoded-supabase-url>
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // Safety: only proxy Supabase Storage URLs
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }

  if (!parsed.hostname.endsWith('supabase.co')) {
    return new NextResponse('Only Supabase Storage URLs are allowed', { status: 403 });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return new NextResponse('Upstream fetch failed', { status: upstream.status });
    }

    const buffer = await upstream.arrayBuffer();
    const contentType = upstream.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('[proxy-image] error:', err);
    return new NextResponse('Proxy error', { status: 500 });
  }
}
