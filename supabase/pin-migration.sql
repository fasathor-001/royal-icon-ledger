-- ─────────────────────────────────────────────────────────────────────────────
-- Royal Ledger — PIN + user read access migration
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add assigned_pin column to early_access_leads
ALTER TABLE early_access_leads
  ADD COLUMN IF NOT EXISTS assigned_pin text;

-- 2. Allow authenticated users to read ONLY their own lead row
--    (used for block check + PIN sync on app load)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'early_access_leads' AND policyname = 'users_read_own_lead'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "users_read_own_lead"
        ON early_access_leads FOR SELECT TO authenticated
        USING (lower(email) = lower(auth.jwt() ->> 'email'))
    $p$;
  END IF;
END $$;
