import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
  );

// Lazy singleton — safe to import at module level even during Next.js build
// when env vars are not present. Real requests will fail gracefully if env
// vars are missing, but the module itself will never throw on import.
export const supabase = createClient();

// Helper functions
export async function getSpeakers() {
  const { data, error } = await supabase
    .from('speakers')
    .select('*')
    .order('full_name');
  if (error) throw error;
  return data;
}

export async function getPresenters() {
  const { data, error } = await supabase
    .from('presenters')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function getBrandingSettings() {
  const { data, error } = await supabase
    .from('branding_settings')
    .select('*')
    .single();
  if (error && error.code !== 'PGRST116') throw error; // Ignore not found
  return data;
}
