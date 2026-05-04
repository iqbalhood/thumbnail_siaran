/**
 * Supabase Client (Browser)
 *
 * Used in client components for auth, real-time queries, storage.
 *
 * TODO (Step 2):
 * - Implement createBrowserClient() initialization
 * - Add auth state listener for session persistence
 * - Export helper functions (signIn, signOut, fetchSpeakers, etc.)
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}

export const supabase = getSupabaseClient();

// TODO: Add helper functions
// - signInWithPassword(email, password)
// - signOut()
// - getSession()
// - getSpeakers(limit?, offset?, search?)
// - getPresenters()
// - getBrandingSettings()
// - uploadSpeakerPhoto(file)
// - etc.
