-- supabase/invite-code-expiry-migration.sql
--
-- Adds a 30-day expiry to invite codes stored in early_access_leads.
--
-- Run once in Supabase SQL Editor:
--   Dashboard → SQL Editor → paste → Run
--
-- What this does:
--   1. Adds invite_code_expires_at (timestamptz, nullable) to early_access_leads.
--      NULL = legacy code with no expiry (grandfather existing codes).
--   2. Replaces validate_lead_invite_code() to reject codes where
--      invite_code_expires_at < now().
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Step 1: add the column (safe to run again — IF NOT EXISTS) ────────────────
ALTER TABLE early_access_leads
  ADD COLUMN IF NOT EXISTS invite_code_expires_at timestamptz;

-- ── Step 2: replace the validation function ───────────────────────────────────
CREATE OR REPLACE FUNCTION validate_lead_invite_code(p_code text, p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER          -- bypasses RLS so anon users can call this during signup
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM early_access_leads
  WHERE UPPER(TRIM(invite_code)) = UPPER(TRIM(p_code))
    AND LOWER(TRIM(email))       = LOWER(TRIM(p_email))
    AND status IN ('invited', 'active')
    -- NULL expires_at = legacy / no expiry (grandfather existing codes).
    -- Non-null must be in the future.
    AND (invite_code_expires_at IS NULL OR invite_code_expires_at > now());

  RETURN v_count > 0;
END;
$$;

-- Ensure anon can still call this during signup
GRANT EXECUTE ON FUNCTION validate_lead_invite_code(text, text) TO anon, authenticated;
