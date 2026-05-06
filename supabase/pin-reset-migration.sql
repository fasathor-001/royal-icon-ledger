-- ─────────────────────────────────────────────────────────────────────────────
-- Royal Ledger — PIN reset requests table
-- Run in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. pin_reset_requests — users submit, admin approves
CREATE TABLE IF NOT EXISTS pin_reset_requests (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now() NOT NULL,
  user_email  text        NOT NULL,
  reason      text,
  status      text        NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'dismissed')),
  reviewed_at timestamptz,
  reviewed_by text
);

ALTER TABLE pin_reset_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Users can submit their own reset request
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pin_reset_requests' AND policyname = 'users_insert_own_reset'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "users_insert_own_reset"
        ON pin_reset_requests FOR INSERT TO authenticated
        WITH CHECK (lower(user_email) = lower(auth.jwt() ->> 'email'))
    $p$;
  END IF;

  -- Users can read their own requests (to detect an approved reset on next login)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pin_reset_requests' AND policyname = 'users_read_own_reset'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "users_read_own_reset"
        ON pin_reset_requests FOR SELECT TO authenticated
        USING (lower(user_email) = lower(auth.jwt() ->> 'email'))
    $p$;
  END IF;

  -- Users can delete their own request after completing PIN setup (cleans up)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pin_reset_requests' AND policyname = 'users_delete_own_reset'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "users_delete_own_reset"
        ON pin_reset_requests FOR DELETE TO authenticated
        USING (lower(user_email) = lower(auth.jwt() ->> 'email'))
    $p$;
  END IF;

  -- Admins can read and update all requests
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'pin_reset_requests' AND policyname = 'admin_manage_reset_requests'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "admin_manage_reset_requests"
        ON pin_reset_requests FOR ALL TO authenticated
        USING ((auth.jwt() ->> 'email') IN ('hello@royalledger.app','fasathor@gmail.com'))
        WITH CHECK ((auth.jwt() ->> 'email') IN ('hello@royalledger.app','fasathor@gmail.com'))
    $p$;
  END IF;
END $$;
