-- ============================================
-- Migration: Add portrait background to presenters
-- Supports 1080x1350 portrait poster format
-- ============================================

ALTER TABLE presenters
  ADD COLUMN IF NOT EXISTS background_portrait_url TEXT,
  ADD COLUMN IF NOT EXISTS background_portrait_path TEXT;

