-- admin/ADMIN_QUERIES.sql
-- Royal Ledger — Tester Activity Inspection Queries
--
-- Paste these into the Supabase SQL Editor (Dashboard → SQL Editor).
-- Requires service role access — these queries join auth.users which is
-- not accessible from the anon/authenticated role.
--
-- All queries use user_activity_events populated by the frontend tracking
-- system (login, app_open, activity_ping). See DEVELOPMENT_NOTES.md for
-- the full description of what each event type means.


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Active users in the last 7 days
--
-- Use this to get a quick weekly overview: who opened the app, how many days,
-- and when they were last seen. Primary query for tester voucher decisions.
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  u.email,
  COUNT(DISTINCT DATE(e.created_at)) AS days_active,
  COUNT(*) FILTER (WHERE e.event_type = 'app_open') AS sessions,
  MAX(e.created_at) AS last_seen
FROM user_activity_events e
JOIN auth.users u ON u.id = e.user_id
WHERE e.created_at > now() - interval '7 days'
GROUP BY u.email
ORDER BY days_active DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Per-tester daily breakdown for the last 30 days
--
-- Use this to inspect daily usage patterns. approx_active_hours is derived
-- from activity_ping count (each ping = 60 seconds of verified interaction).
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  u.email,
  DATE(e.created_at) AS day,
  COUNT(*) FILTER (WHERE e.event_type = 'app_open') AS opens,
  COUNT(*) FILTER (WHERE e.event_type = 'activity_ping') AS pings,
  ROUND(COUNT(*) FILTER (WHERE e.event_type = 'activity_ping') / 60.0, 1) AS approx_active_hours
FROM user_activity_events e
JOIN auth.users u ON u.id = e.user_id
WHERE e.created_at > now() - interval '30 days'
GROUP BY u.email, DATE(e.created_at)
ORDER BY u.email, day DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Testers who have not logged in within 7 days
--
-- Use this to identify drop-offs. Includes users with no events at all
-- (never logged in). Good for follow-up outreach during the testing phase.
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  u.email,
  MAX(e.created_at) AS last_event,
  now() - MAX(e.created_at) AS time_since_last_event
FROM auth.users u
LEFT JOIN user_activity_events e ON e.user_id = u.id
GROUP BY u.email
HAVING MAX(e.created_at) < now() - interval '7 days'
   OR MAX(e.created_at) IS NULL
ORDER BY last_event NULLS FIRST;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Total events by type — sanity check
--
-- Use this after deployment to confirm events are being received. Expected
-- pattern: activity_ping >> app_open > login. If login > app_open, something
-- is wrong with the deduplication logic.
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  event_type,
  COUNT(*)
FROM user_activity_events
GROUP BY event_type
ORDER BY event_type;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Average session length (rough estimate)
--
-- Approximates session depth: how many pings occurred per app_open.
-- Higher avg_pings_per_session = longer, more engaged sessions.
-- Note: pings only fire when the user is actively interacting, so this
-- reflects genuine active time rather than idle tab time.
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  u.email,
  COUNT(*) FILTER (WHERE e.event_type = 'app_open') AS sessions,
  COUNT(*) FILTER (WHERE e.event_type = 'activity_ping') AS total_pings,
  ROUND(
    COUNT(*) FILTER (WHERE e.event_type = 'activity_ping')::numeric
    / NULLIF(COUNT(*) FILTER (WHERE e.event_type = 'app_open'), 0),
    1
  ) AS avg_pings_per_session
FROM user_activity_events e
JOIN auth.users u ON u.id = e.user_id
WHERE e.created_at > now() - interval '30 days'
GROUP BY u.email
ORDER BY avg_pings_per_session DESC NULLS LAST;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. TRUE weekly usage signal
--
-- The canonical query for tester compensation decisions.
-- ACTIVE   = opened on 3+ distinct days AND 10+ pings (genuinely engaged)
-- WEAK     = opened at least once but below the active threshold
-- INACTIVE = no events in the past 7 days
--
-- Adjust the thresholds (3 days, 10 pings) to match your programme criteria.
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  u.email,
  COUNT(DISTINCT DATE(e.created_at)) AS active_days,
  COUNT(*) FILTER (WHERE e.event_type = 'app_open') AS opens,
  COUNT(*) FILTER (WHERE e.event_type = 'activity_ping') AS activity_pings,
  CASE
    WHEN COUNT(DISTINCT DATE(e.created_at)) >= 3
     AND COUNT(*) FILTER (WHERE e.event_type = 'activity_ping') >= 10
    THEN 'ACTIVE'
    WHEN COUNT(DISTINCT DATE(e.created_at)) >= 1
    THEN 'WEAK'
    ELSE 'INACTIVE'
  END AS status,
  MAX(e.created_at) AS last_seen
FROM auth.users u
LEFT JOIN user_activity_events e
  ON e.user_id = u.id
 AND e.created_at > now() - interval '7 days'
GROUP BY u.email
ORDER BY
  CASE
    WHEN COUNT(DISTINCT DATE(e.created_at)) >= 3
     AND COUNT(*) FILTER (WHERE e.event_type = 'activity_ping') >= 10
    THEN 1
    WHEN COUNT(DISTINCT DATE(e.created_at)) >= 1
    THEN 2
    ELSE 3
  END,
  last_seen DESC NULLS LAST;
