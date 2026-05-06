-- supabase/validate-invite-code.sql
--
-- Creates a SECURITY DEFINER function that validates an invite code
-- against early_access_leads.invite_code (where admin-sent codes live).
--
-- Run in Supabase → SQL Editor → New query
-- Safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

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
    AND status IN ('invited', 'active');   -- only valid for invited or already-active leads

  RETURN v_count > 0;
END;
$$;

-- Grant execute to anon and authenticated roles (called before login)
GRANT EXECUTE ON FUNCTION validate_lead_invite_code(text, text) TO anon, authenticated;
