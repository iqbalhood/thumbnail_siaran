-- Migration: Add thumbnail_settings column to branding_settings
-- Stores default configuration for thumbnail & poster generator (colors, logo positions, offsets, etc.)
-- Only admin accounts can update this default configuration.

ALTER TABLE branding_settings
  ADD COLUMN IF NOT EXISTS thumbnail_settings JSONB DEFAULT '{}'::jsonb;
