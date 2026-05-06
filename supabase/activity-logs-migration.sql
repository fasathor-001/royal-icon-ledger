-- supabase/activity-logs-migration.sql
-- Creates the admin_actions table for activity logging.
-- Safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_actions (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at   timestamptz DEFAULT now() NOT NULL,
  admin_email  text        NOT NULL,
  target_email text,
  action       text        NOT NULL,
  metadata     jsonb       DEFAULT '{}'
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
        USING ((auth.jwt() ->> 'email') IN ('hello@royalledger.app', 'fasathor@gmail.com'))
        WITH CHECK ((auth.jwt() ->> 'email') IN ('hello@royalledger.app', 'fasathor@gmail.com'))
    $p$;
    RAISE NOTICE 'Created admin_manage_actions policy';
  ELSE
    RAISE NOTICE 'admin_manage_actions already exists — skipping';
  END IF;
END $$;
