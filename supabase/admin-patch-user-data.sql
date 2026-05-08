-- admin_patch_user_data
-- Lets admin update a user's currency and/or income profile in user_data.
-- Called from AdminDashboard → AccountOverrideManager.
--
-- Usage:
--   SELECT admin_patch_user_data('user@example.com', 'USD', NULL);        -- currency only
--   SELECT admin_patch_user_data('user@example.com', NULL, 'fixed');       -- income only
--   SELECT admin_patch_user_data('user@example.com', 'GBP', 'variable');  -- both
--
-- Returns: 'ok' | 'no_auth_user' | 'no_data'

CREATE OR REPLACE FUNCTION admin_patch_user_data(
  p_email       text,
  p_currency    text DEFAULT NULL,
  p_income_type text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_data    jsonb;
BEGIN
  -- 1. Resolve email → user_id via auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(p_email)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN 'no_auth_user';
  END IF;

  -- 2. Fetch current app data blob
  SELECT data INTO v_data
  FROM user_data
  WHERE user_id = v_user_id;

  IF v_data IS NULL THEN
    RETURN 'no_data';
  END IF;

  -- 3. Patch currency
  IF p_currency IS NOT NULL THEN
    v_data := jsonb_set(v_data, '{currency}', to_jsonb(p_currency));
  END IF;

  -- 4. Patch income profile
  --    Writes both `incomeType` (current) and `mode` (legacy Foundation field)
  IF p_income_type IS NOT NULL THEN
    v_data := jsonb_set(v_data, '{incomeType}', to_jsonb(p_income_type));

    IF p_income_type = 'foundation' THEN
      -- Foundation uses both fields for compatibility
      v_data := jsonb_set(v_data, '{mode}', to_jsonb('foundation'::text));
    ELSE
      -- Remove legacy mode field if switching away from foundation
      v_data := v_data - 'mode';
    END IF;
  END IF;

  -- 5. Write back
  UPDATE user_data
  SET data       = v_data,
      updated_at = now()
  WHERE user_id = v_user_id;

  RETURN 'ok';
END;
$$;

-- Grant execute to authenticated role so the admin client (anon key) can call it.
-- The SECURITY DEFINER ensures only this function touches auth.users, not the caller.
GRANT EXECUTE ON FUNCTION admin_patch_user_data(text, text, text) TO authenticated;
