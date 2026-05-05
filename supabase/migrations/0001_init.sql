-- RRI Thumbnail Generator — Initial Schema
-- Region: asia-southeast1 (Singapore)
-- Auth: Supabase Auth (real email + password)
-- Timestamps: timestamptz (server timezone)

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- TABLES
-- ============================================

-- Speakers (pembicara dalam database)
create table speakers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  position text,
  photo_url text,  -- Supabase Storage public URL
  photo_path text, -- Storage path for delete (e.g. "speakers/abc123.jpg")
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Presenters (host program: Dimas, Ammar, dst.)
create table presenters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  background_url text,  -- Supabase Storage URL (1280×720)
  background_path text, -- Storage path for delete
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Branding Settings (singleton: logos + metadata)
create table branding_settings (
  id uuid primary key default gen_random_uuid(),
  rri_logo_url text,     -- Supabase Storage URL
  rri_logo_path text,
  pro1_logo_url text,
  pro1_logo_path text,
  updated_at timestamptz default now()
);

-- ============================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table speakers enable row level security;
alter table presenters enable row level security;
alter table branding_settings enable row level security;

-- Speakers: public read, authenticated write
create policy "speakers_select" on speakers
  for select to authenticated, anon using (true);

create policy "speakers_insert" on speakers
  for insert to authenticated with check (
    auth.uid() is not null
  );

create policy "speakers_update" on speakers
  for update to authenticated using (
    auth.uid() is not null
  ) with check (
    auth.uid() is not null
  );

create policy "speakers_delete" on speakers
  for delete to authenticated using (
    auth.uid() is not null
  );

-- Presenters: public read, authenticated write
create policy "presenters_select" on presenters
  for select to authenticated, anon using (true);

create policy "presenters_insert" on presenters
  for insert to authenticated with check (
    auth.uid() is not null
  );

create policy "presenters_update" on presenters
  for update to authenticated using (
    auth.uid() is not null
  ) with check (
    auth.uid() is not null
  );

create policy "presenters_delete" on presenters
  for delete to authenticated using (
    auth.uid() is not null
  );

-- Branding Settings: public read, authenticated write
create policy "branding_select" on branding_settings
  for select to authenticated, anon using (true);

create policy "branding_update" on branding_settings
  for update to authenticated using (
    auth.uid() is not null
  ) with check (
    auth.uid() is not null
  );

-- ============================================
-- STORAGE BUCKETS (via dashboard or SQL)
-- ============================================

-- Insert buckets (note: storage.buckets table is admin-only)
-- Recommend: Create via Supabase dashboard instead
-- Steps:
--   1. Storage → Create bucket "logos" (public)
--   2. Storage → Create bucket "presenters" (public)
--   3. Storage → Create bucket "speakers" (public)

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Logos: public read, authenticated write
create policy "logos_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'logos');

create policy "logos_auth_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'logos' and auth.uid() is not null);

create policy "logos_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'logos' and auth.uid() is not null);

create policy "logos_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'logos' and auth.uid() is not null);

-- Presenters: public read, authenticated write
create policy "presenters_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'presenters');

create policy "presenters_auth_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'presenters' and auth.uid() is not null);

create policy "presenters_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'presenters' and auth.uid() is not null);

create policy "presenters_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'presenters' and auth.uid() is not null);

-- Speakers: public read, authenticated write
create policy "speakers_public_read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'speakers');

create policy "speakers_auth_write" on storage.objects
  for insert to authenticated with check (bucket_id = 'speakers' and auth.uid() is not null);

create policy "speakers_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'speakers' and auth.uid() is not null);

create policy "speakers_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'speakers' and auth.uid() is not null);

-- ============================================
-- INDEXES
-- ============================================

create index speakers_full_name_idx on speakers(full_name);
create index speakers_position_idx on speakers(position);
create index presenters_name_idx on presenters(name);
create index branding_settings_id_idx on branding_settings(id);
