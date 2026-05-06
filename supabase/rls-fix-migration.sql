-- supabase/rls-fix-migration.sql
--
-- Adds three missing RLS policies to early_access_leads:
--
--   1. admin_delete_leads        — admins can DELETE rows (was missing; bulk-delete was failing)
--   2. users_can_read_own_lead   — signed-in users can SELECT their own row
--                                  (needed for the block/suspend gate in App.jsx)
--   3. users_can_self_activate   — invited users can flip their own status to 'active'
--                                  (needed for auto-activation on sign-in)
--
-- Run this in the Supabase SQL editor AFTER admin-migration.sql and
-- leads-status-migration.sql have already been applied.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Admin DELETE policy (was missing from admin-migration.sql)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'early_access_leads' AND policyname = 'admin_delete_leads'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "admin_delete_leads"
        ON early_access_leads FOR DELETE TO authenticated
        USING ((auth.jwt() ->> 'email') IN ('hello@royalledger.app', 'fasathor@gmail.com'))
    $p$;
  END IF;
END $$;

-- 2. Users can read their own row (needed for block/suspend check in app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'early_access_leads' AND policyname = 'users_can_read_own_lead'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "users_can_read_own_lead"
        ON early_access_leads FOR SELECT TO authenticated
        USING (lower(email) = lower(auth.jwt() ->> 'email'))
    $p$;
  END IF;
END $$;

-- 3. Invited users can self-activate (invited → active) when they first sign in
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'early_access_leads' AND policyname = 'users_can_self_activate'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "users_can_self_activate"
        ON early_access_leads FOR UPDATE TO authenticated
        USING (
          lower(email) = lower(auth.jwt() ->> 'email')
          AND status = 'invited'
        )
        WITH CHECK (
          lower(email) = lower(auth.jwt() ->> 'email')
          AND status = 'active'
        )
    $p$;
  END IF;
END $$;
