-- admin-reset-user-data.sql
--
-- Creates a SECURITY DEFINER function that allows admin users to wipe
-- a user's app data row from user_data. The user will go through
-- onboarding again on next login.
--
-- Run once in Supabase SQL Editor, then use the "Reset app data" button
-- in the Admin Dashboard → expand any user row.

CREATE OR REPLACE FUNCTION admin_reset_user_data(p_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_email text;
  v_user_id      uuid;
BEGIN
  -- ── Authorisation: only admin emails may call this ──────────────────────
  v_caller_email := lower(trim(
    coalesce(
      current_setting('request.jwt.claims', true)::json->>'email',
      ''
    )
  ));

  IF v_caller_email NOT IN ('hello@royalledger.app', 'fasathor@gmail.com') THEN
    RAISE EXCEPTION 'Not authorized: admin only';
  END IF;

  -- ── Look up the Supabase auth user by email ──────────────────────────────
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(trim(p_email))
  LIMIT 1;

  IF v_user_id IS NULL THEN
    -- User has never signed up — nothing to reset
    RETURN 'no_auth_user';
  END IF;

  -- ── Wipe the user's data blob ────────────────────────────────────────────
  -- The app will detect the missing row on next login, show onboarding,
  -- and write a fresh row when the user completes setup.
  DELETE FROM user_data WHERE user_id = v_user_id;

  RETURN 'reset_ok';
END;
$$;

-- Allow authenticated users to call the function.
-- The body itself enforces the admin-email restriction.
GRANT EXECUTE ON FUNCTION admin_reset_user_data(text) TO authenticated;
