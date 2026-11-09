-- Migration: Add thumbnail_settings column to dialogs table for per-dialog default configuration
ALTER TABLE dialogs
  ADD COLUMN IF NOT EXISTS thumbnail_settings JSONB DEFAULT '{}'::jsonb;
