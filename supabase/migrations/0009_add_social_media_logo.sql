-- Migration 0009: Add social media container image columns to branding_settings
ALTER TABLE branding_settings
  ADD COLUMN IF NOT EXISTS social_media_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS social_media_logo_path TEXT;

