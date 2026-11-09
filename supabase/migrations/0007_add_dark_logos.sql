-- Migration: Add dark logo variants for RRI, PRO 1, PRO 2, PRO 4, and HUT RI
-- Existing columns (_url, _path) are kept as the White/Light variants for backward compatibility.

ALTER TABLE branding_settings
  ADD COLUMN IF NOT EXISTS rri_logo_dark_url TEXT,
  ADD COLUMN IF NOT EXISTS rri_logo_dark_path TEXT,
  ADD COLUMN IF NOT EXISTS pro1_logo_dark_url TEXT,
  ADD COLUMN IF NOT EXISTS pro1_logo_dark_path TEXT,
  ADD COLUMN IF NOT EXISTS pro2_logo_dark_url TEXT,
  ADD COLUMN IF NOT EXISTS pro2_logo_dark_path TEXT,
  ADD COLUMN IF NOT EXISTS pro4_logo_dark_url TEXT,
  ADD COLUMN IF NOT EXISTS pro4_logo_dark_path TEXT,
  ADD COLUMN IF NOT EXISTS hut_ri_logo_dark_url TEXT,
  ADD COLUMN IF NOT EXISTS hut_ri_logo_dark_path TEXT;

