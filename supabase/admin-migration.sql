-- ─────────────────────────────────────────────────────────────────────────────
-- Royal Ledger — Admin System Migration
-- Run once in Supabase SQL editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend early_access_leads
ALTER TABLE early_access_leads
  ADD COLUMN IF NOT EXISTS notes        text,
  ADD COLUMN IF NOT EXISTS invited_at   timestamptz,
  ADD COLUMN IF NOT EXISTS rejected_at  timestamptz,
  ADD COLUMN IF NOT EXISTS blocked_at   timestamptz,
  ADD COLUMN IF NOT EXISTS invite_code  text;

-- 2. Expand status CHECK to include 'blocked'
ALTER TABLE early_access_leads
  DROP CONSTRAINT IF EXISTS early_access_leads_status_check;

ALTER TABLE early_access_leads
  ADD CONSTRAINT early_access_leads_status_check
  CHECK (status IN ('pending', 'invited', 'rejected', 'blocked'));

-- 3. Admin RLS policies for early_access_leads (safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'early_access_leads' AND policyname = 'admin_select_leads'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "admin_select_leads"
        ON early_access_leads FOR SELECT TO authenticated
        USING ((auth.jwt() ->> 'email') IN ('hello@royalledger.app','fasathor@gmail.com'))
    $p$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'early_access_leads' AND policyname = 'admin_update_leads'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "admin_update_leads"
        ON early_access_leads FOR UPDATE TO authenticated
        USING ((auth.jwt() ->> 'email') IN ('hello@royalledger.app','fasathor@gmail.com'))
        WITH CHECK ((auth.jwt() ->> 'email') IN ('hello@royalledger.app','fasathor@gmail.com'))
    $p$;
  END IF;
END $$;

-- 4. blocked_users — for blocking active app users by email
CREATE TABLE IF NOT EXISTS blocked_users (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  email      text        NOT NULL UNIQUE,
  blocked_at timestamptz DEFAULT now() NOT NULL,
  blocked_by text,
  reason     text
);

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Admin can manage all blocked_users rows
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'blocked_users' AND policyname = 'admin_manage_blocked_users'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "admin_manage_blocked_users"
        ON blocked_users FOR ALL TO authenticated
        USING ((auth.jwt() ->> 'email') IN ('hello@royalledger.app','fasathor@gmail.com'))
        WITH CHECK ((auth.jwt() ->> 'email') IN ('hello@royalledger.app','fasathor@gmail.com'))
    $p$;
  END IF;

  -- Any authenticated user can check if their own email is blocked
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'blocked_users' AND policyname = 'users_check_own_block'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "users_check_own_block"
        ON blocked_users FOR SELECT TO authenticated
        USING (lower(email) = lower(auth.jwt() ->> 'email'))
    $p$;
  END IF;
END $$;

-- 5. admin_actions — audit log for admin operations
CREATE TABLE IF NOT EXISTS admin_actions (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   timestamptz DEFAULT now() NOT NULL,
  admin_email  text        NOT NULL,
  target_email text,
  action       text        NOT NULL,  -- 'invite' | 'block' | 'unblock' | 'reject' | 'reset'
  reason       text,
  metadata     jsonb
);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'admin_actions' AND policyname = 'admin_manage_actions'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "admin_manage_actions"
        ON admin_actions FOR ALL TO authenticated
        USING ((auth.jwt() ->> 'email') IN ('hello@royalledger.app','fasathor@gmail.com'))
        WITH CHECK ((auth.jwt() ->> 'email') IN ('hello@royalledger.app','fasathor@gmail.com'))
    $p$;
  END IF;
END $$;
