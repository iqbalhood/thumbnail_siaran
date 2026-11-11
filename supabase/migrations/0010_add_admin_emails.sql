-- Migration 0010: Add admin_emails to branding_settings
-- Allows administrators to configure which email addresses have administrator privileges directly from the UI.
ALTER TABLE branding_settings
  ADD COLUMN IF NOT EXISTS admin_emails JSONB DEFAULT '[]'::jsonb;

