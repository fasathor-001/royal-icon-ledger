-- supabase/auth-user-sync-trigger.sql
--
-- Automatically adds a row to early_access_leads when a new user signs up
-- via Supabase Auth. Safe to run multiple times (CREATE OR REPLACE).
--
-- Run in Supabase → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION sync_auth_user_to_leads()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO early_access_leads (email, name, status, created_at)
  VALUES (
    lower(NEW.email),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'active',   -- already signed up, so they're active
    NEW.created_at
  )
  ON CONFLICT (email) DO NOTHING;  -- skip if already exists (invited flow ran first)
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_auth_user_to_leads();
