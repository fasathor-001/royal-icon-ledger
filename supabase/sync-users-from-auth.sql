-- supabase/sync-users-from-auth.sql
--
-- Step 1: Diagnose — see what's in each table
-- Step 2: Populate early_access_leads from auth.users (safe, skips existing rows)
--
-- Run in Supabase → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────────────────

-- STEP 1: Check counts
SELECT 'early_access_leads rows' AS label, COUNT(*) AS count FROM early_access_leads
UNION ALL
SELECT 'auth.users rows',                   COUNT(*)        FROM auth.users;

-- STEP 2: Insert a row into early_access_leads for every auth user
--         who doesn't already have one.
--         Status is set to 'active' since they already have an account.
INSERT INTO early_access_leads (email, name, status, created_at)
SELECT
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ) AS name,
  'active'     AS status,
  au.created_at
FROM auth.users au
WHERE au.email IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM early_access_leads eal
    WHERE lower(eal.email) = lower(au.email)
  );

-- STEP 3: Confirm the result
SELECT id, email, name, status, created_at
FROM early_access_leads
ORDER BY created_at DESC;
