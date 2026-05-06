-- supabase/leads-status-migration.sql
--
-- Extends early_access_leads with two new statuses:
--   active    — user has signed in and completed onboarding (previously 'invited')
--   suspended — temporarily restricted; treated like blocked in-app but reversible
--
-- Run this in the Supabase SQL editor before deploying the updated admin panel.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Drop the old check constraint
ALTER TABLE early_access_leads
  DROP CONSTRAINT IF EXISTS early_access_leads_status_check;

-- 2. Re-add with the extended status set
ALTER TABLE early_access_leads
  ADD CONSTRAINT early_access_leads_status_check
  CHECK (status IN ('pending', 'invited', 'active', 'suspended', 'rejected', 'blocked'));

-- 3. Add suspended_at timestamp (mirrors blocked_at / rejected_at pattern)
ALTER TABLE early_access_leads
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz;

-- 4. Add activated_at timestamp
ALTER TABLE early_access_leads
  ADD COLUMN IF NOT EXISTS activated_at timestamptz;

-- ── Optional: RLS policy so authenticated users can self-activate ─────────────
-- When an invited user signs in, the app tries to flip their status to 'active'.
-- This policy allows that single transition (invited → active) without giving
-- users any broader write access to the table.
--
-- If you already have an existing UPDATE policy, merge this condition into it
-- rather than running CREATE POLICY directly.

-- DROP POLICY IF EXISTS "users_can_self_activate" ON early_access_leads;
-- CREATE POLICY "users_can_self_activate"
--   ON early_access_leads
--   FOR UPDATE
--   TO authenticated
--   USING (
--     lower(email) = lower(auth.jwt() ->> 'email')
--     AND status = 'invited'
--   )
--   WITH CHECK (
--     lower(email) = lower(auth.jwt() ->> 'email')
--     AND status = 'active'
--   );

-- 5. (Optional) Backfill: mark existing 'invited' leads as 'active' if you know
--    they have already signed up.  Review individually before running.
-- UPDATE early_access_leads
--   SET status = 'active', activated_at = now()
--   WHERE status = 'invited';
