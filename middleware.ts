import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Only run middleware on routes that need auth protection:
     * - /generator, /speakers, /settings (protected routes)
     * - /login (for redirect if already logged in)
     * Exclude static assets, API routes, and public pages
     * to avoid MIDDLEWARE_INVOCATION_TIMEOUT on Vercel.
     */
    '/(generator|speakers|settings|login)(.*)',
  ],
};
