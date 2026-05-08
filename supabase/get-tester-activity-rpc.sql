-- supabase/get-tester-activity-rpc.sql
--
-- Creates the SECURITY DEFINER RPC used by the Admin Dashboard
-- Tester Activity tab to summarise weekly tester engagement.
--
-- Run once in Supabase SQL Editor:
--   Dashboard → SQL Editor → paste → Run
--
-- Returns JSONB (array of objects) to avoid PostgREST schema-cache
-- type-matching issues that arise with RETURNS TABLE.
--
-- Each object has:
--   user_id, email, active_days, app_opens, activity_pings, last_seen, status
--
-- Status logic (last 7 days):
--   active   = 3+ distinct active days AND 10+ activity_ping events
--   weak     = at least 1 active day
--   inactive = no events at all

DROP FUNCTION IF EXISTS get_tester_activity_summary();

CREATE FUNCTION get_tester_activity_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_email text;
  v_result       jsonb;
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

  -- ── Build JSONB array of tester activity rows ───────────────────────────
  -- Returns JSONB instead of TABLE to bypass PostgREST schema-cache
  -- type-matching (which caused persistent "structure of query does not
  -- match function result type" errors after schema changes).
  SELECT jsonb_agg(row_to_json(t)::jsonb)
  INTO v_result
  FROM (
    SELECT
      u.id                                                              AS user_id,
      u.email                                                           AS email,
      COUNT(DISTINCT DATE(e.created_at))                                AS active_days,
      COUNT(*) FILTER (WHERE e.event_type = 'app_open')                AS app_opens,
      COUNT(*) FILTER (WHERE e.event_type = 'activity_ping')           AS activity_pings,
      MAX(e.created_at)                                                 AS last_seen,
      CASE
        WHEN COUNT(DISTINCT DATE(e.created_at)) >= 3
         AND COUNT(*) FILTER (WHERE e.event_type = 'activity_ping') >= 10
        THEN 'active'
        WHEN COUNT(DISTINCT DATE(e.created_at)) >= 1
        THEN 'weak'
        ELSE 'inactive'
      END                                                               AS status
    FROM auth.users u
    LEFT JOIN user_activity_events e
      ON e.user_id = u.id
     AND e.created_at > now() - interval '7 days'
    GROUP BY u.id, u.email
    ORDER BY
      CASE
        WHEN COUNT(DISTINCT DATE(e.created_at)) >= 3
         AND COUNT(*) FILTER (WHERE e.event_type = 'activity_ping') >= 10
        THEN 1
        WHEN COUNT(DISTINCT DATE(e.created_at)) >= 1
        THEN 2
        ELSE 3
      END,
      MAX(e.created_at) DESC NULLS LAST
  ) t;

  RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- Allow authenticated users to invoke the function.
-- The function body itself enforces the admin-email restriction.
GRANT EXECUTE ON FUNCTION get_tester_activity_summary() TO authenticated;
