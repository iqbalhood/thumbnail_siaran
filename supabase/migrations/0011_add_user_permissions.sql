-- Migration 0011: Add user_permissions to branding_settings
-- Allows administrators to manage user access rights to specific dialogs / broadcast programs.
ALTER TABLE branding_settings
  ADD COLUMN IF NOT EXISTS user_permissions JSONB DEFAULT '[]'::jsonb;
