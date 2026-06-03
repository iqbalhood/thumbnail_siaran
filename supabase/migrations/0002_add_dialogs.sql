-- ============================================
-- Migration: Add dialogs table
-- Links presenters to specific dialog programs
-- ============================================

-- 1. Create dialogs table
CREATE TABLE dialogs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add dialog_id FK to presenters
--    First remove the unique constraint on presenters.name
--    (same presenter name can appear in different dialogs)
ALTER TABLE presenters DROP CONSTRAINT IF EXISTS presenters_name_key;

ALTER TABLE presenters
  ADD COLUMN dialog_id UUID REFERENCES dialogs(id) ON DELETE CASCADE;

-- 3. Enable RLS on dialogs
ALTER TABLE dialogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dialogs_select" ON dialogs
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "dialogs_insert" ON dialogs
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "dialogs_update" ON dialogs
  FOR UPDATE TO authenticated USING (
    auth.uid() IS NOT NULL
  ) WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "dialogs_delete" ON dialogs
  FOR DELETE TO authenticated USING (
    auth.uid() IS NOT NULL
  );

-- 4. Index for performance
CREATE INDEX dialogs_name_idx ON dialogs(name);
CREATE INDEX presenters_dialog_id_idx ON presenters(dialog_id);

-- 5. Migrate existing data:
--    Create a default "BANDA ACEH MENYAPA" dialog
--    and link all existing presenters to it.
--    Run this ONLY if you have existing presenters in the DB.

DO $$
DECLARE
  v_dialog_id UUID;
BEGIN
  -- Check if there are any presenters without a dialog_id
  IF EXISTS (SELECT 1 FROM presenters WHERE dialog_id IS NULL) THEN
    -- Create default dialog
    INSERT INTO dialogs (name) VALUES ('BANDA ACEH MENYAPA')
    RETURNING id INTO v_dialog_id;
    
    -- Link existing presenters
    UPDATE presenters SET dialog_id = v_dialog_id WHERE dialog_id IS NULL;
  END IF;
END $$;
