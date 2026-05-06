-- supabase/admin-access-fix.sql
--
-- Run this in Supabase SQL Editor if:
--   (a) Admin dashboard shows "No users yet" despite data existing
--   (b) Admin cannot delete access requests
--
-- Safe to run multiple times (all statements are idempotent).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Admin can SELECT all early_access_leads (fixes "No users yet" in admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'early_access_leads' AND policyname = 'admin_select_leads'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "admin_select_leads"
        ON early_access_leads FOR SELECT TO authenticated
        USING ((auth.jwt() ->> 'email') IN ('hello@royalledger.app', 'fasathor@gmail.com'))
    $p$;
    RAISE NOTICE 'Created admin_select_leads policy';
  ELSE
    RAISE NOTICE 'admin_select_leads already exists — skipping';
  END IF;
END $$;

-- 2. Admin can UPDATE early_access_leads (status changes, notes, invite codes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'early_access_leads' AND policyname = 'admin_update_leads'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "admin_update_leads"
        ON early_access_leads FOR UPDATE TO authenticated
        USING ((auth.jwt() ->> 'email') IN ('hello@royalledger.app', 'fasathor@gmail.com'))
        WITH CHECK ((auth.jwt() ->> 'email') IN ('hello@royalledger.app', 'fasathor@gmail.com'))
    $p$;
    RAISE NOTICE 'Created admin_update_leads policy';
  ELSE
    RAISE NOTICE 'admin_update_leads already exists — skipping';
  END IF;
END $$;

-- 3. Admin can DELETE early_access_leads
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
    RAISE NOTICE 'Created admin_delete_leads policy';
  ELSE
    RAISE NOTICE 'admin_delete_leads already exists — skipping';
  END IF;
END $$;

-- 4. Admin can SELECT access_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'access_requests' AND policyname = 'admin_select_access_requests'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "admin_select_access_requests"
        ON access_requests FOR SELECT TO authenticated
        USING ((auth.jwt() ->> 'email') IN ('hello@royalledger.app', 'fasathor@gmail.com'))
    $p$;
    RAISE NOTICE 'Created admin_select_access_requests policy';
  ELSE
    RAISE NOTICE 'admin_select_access_requests already exists — skipping';
  END IF;
END $$;

-- 5. Admin can DELETE access_requests (lets you clear test/spam entries)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'access_requests' AND policyname = 'admin_delete_access_requests'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "admin_delete_access_requests"
        ON access_requests FOR DELETE TO authenticated
        USING ((auth.jwt() ->> 'email') IN ('hello@royalledger.app', 'fasathor@gmail.com'))
    $p$;
    RAISE NOTICE 'Created admin_delete_access_requests policy';
  ELSE
    RAISE NOTICE 'admin_delete_access_requests already exists — skipping';
  END IF;
END $$;

-- 6. Admin can UPDATE access_requests (approve/reject status)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'access_requests' AND policyname = 'admin_update_access_requests'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "admin_update_access_requests"
        ON access_requests FOR UPDATE TO authenticated
        USING ((auth.jwt() ->> 'email') IN ('hello@royalledger.app', 'fasathor@gmail.com'))
        WITH CHECK ((auth.jwt() ->> 'email') IN ('hello@royalledger.app', 'fasathor@gmail.com'))
    $p$;
    RAISE NOTICE 'Created admin_update_access_requests policy';
  ELSE
    RAISE NOTICE 'admin_update_access_requests already exists — skipping';
  END IF;
END $$;

-- 7. Authenticated users can INSERT into access_requests (request flow)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'access_requests' AND policyname = 'users_can_insert_access_requests'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "users_can_insert_access_requests"
        ON access_requests FOR INSERT TO anon, authenticated
        WITH CHECK (true)
    $p$;
    RAISE NOTICE 'Created users_can_insert_access_requests policy';
  ELSE
    RAISE NOTICE 'users_can_insert_access_requests already exists — skipping';
  END IF;
END $$;
