-- early-access-schema.sql
--
-- Run once in the Supabase SQL Editor.
-- Safe to re-run — all statements use IF NOT EXISTS / IF EXISTS guards.
--
-- ── Create table (first-time setup) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS early_access_leads (
  id               uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz   DEFAULT now() NOT NULL,
  name             text          NOT NULL,
  email            text          NOT NULL UNIQUE,
  country          text,                        -- ISO-3166-1 alpha-2 code (e.g. 'NG', 'ZA')
  phone            text,                        -- WhatsApp / phone (optional)
  income_type      text          CHECK (income_type IN (
                                   'fixed','variable','trader','freelancer','family','other'
                                 )),
  income_situation text          CHECK (income_situation IN (
                                   'allowance','salary','freelance_gigs',
                                   'business','trading','mixed'
                                 )),
  referral_source  text,                        -- how they heard about Royal Ledger
  interest         text,                        -- free-text "why interested"
  status           text          DEFAULT 'pending' CHECK (status IN (
                                   'pending','invited','active',
                                   'suspended','rejected','blocked'
                                 )),
  invite_code      text,
  invited_at       timestamptz,
  activated_at     timestamptz,
  suspended_at     timestamptz,
  rejected_at      timestamptz,
  blocked_at       timestamptz,
  notes            text
);

-- ── Migrate existing table (add new columns if missing) ──────────────────────

ALTER TABLE early_access_leads
  ADD COLUMN IF NOT EXISTS phone            text,
  ADD COLUMN IF NOT EXISTS income_situation text,
  ADD COLUMN IF NOT EXISTS referral_source  text;

-- Add CHECK constraint on income_situation if not already present
-- (Postgres allows duplicate constraint names — use a unique name to avoid errors)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'early_access_leads_income_situation_check'
  ) THEN
    ALTER TABLE early_access_leads
      ADD CONSTRAINT early_access_leads_income_situation_check
      CHECK (income_situation IN (
        'allowance','salary','freelance_gigs','business','trading','mixed'
      ));
  END IF;
END$$;

-- ── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE early_access_leads ENABLE ROW LEVEL SECURITY;

-- Public INSERT (no auth required — anyone can submit the form)
-- CREATE POLICY doesn't support IF NOT EXISTS, so we guard it manually.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'early_access_leads'
      AND policyname = 'public_can_submit_early_access'
  ) THEN
    CREATE POLICY "public_can_submit_early_access"
      ON early_access_leads
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END$$;

-- No SELECT / UPDATE / DELETE for anon. Admin access via service-role key or
-- the AdminDashboard (authenticated admin users only, enforced by RLS on reads
-- or by the admin_reset_user_data SECURITY DEFINER function).
