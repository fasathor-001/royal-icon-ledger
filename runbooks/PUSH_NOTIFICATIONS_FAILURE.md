# Runbook: Push Notification Failure

> Step-by-step diagnosis when push notifications stop arriving or return errors. Last updated: 2026-05-10.

---

## Symptoms

- Users never receive notifications despite opting in
- Console shows CORS errors for `push_subscriptions` or `notification_queue` table
- `SyncIndicator` shows "Sync failed" after any `queueNotification()` call
- Notification Settings page shows enabled but nothing arrives

---

## Diagnostic Tree

### Step 1 — Is the error a CORS error in the console?

Open DevTools → Network tab. Filter by the Supabase domain.

- If **only one endpoint** fails (e.g. `notification_queue`) while others succeed → likely a **missing table**. See Step 2.
- If **all Supabase endpoints** fail → project paused, wrong URL, or network issue. See Step 5.
- If **no CORS error** but notifications don't arrive → delivery or VAPID issue. See Step 3.

### Step 2 — Missing table check

```sql
-- Run in Supabase SQL Editor
select * from notification_queue limit 1;
-- If error: "relation does not exist" → run the migration
```

If missing, run `supabase/notification-queue-migration.sql`:

```sql
create table if not exists notification_queue (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text not null,
  payload jsonb default '{}',
  created_at timestamptz default now(),
  sent_at timestamptz
);
alter table notification_queue enable row level security;
create policy "insert own" on notification_queue
  for insert with check (auth.uid() = user_id);
```

Also check `push_subscriptions` table:
```sql
select * from push_subscriptions limit 1;
```

If the `timezone_iana`, `morning_time`, or `evening_time` columns are missing, run the column additions:
```sql
alter table push_subscriptions add column if not exists timezone_offset float default 2;
alter table push_subscriptions add column if not exists morning_time text default '08:00';
alter table push_subscriptions add column if not exists evening_time text default '18:00';
alter table push_subscriptions add column if not exists timezone_iana text;
```

### Step 3 — Is the user subscribed?

```sql
select * from push_subscriptions where user_id = '<user_uuid>';
```

- No row → user never completed the subscription flow. Ask them to go to Settings → Notifications and enable.
- Row exists, `daily_enabled = false` → notifications are disabled. Correct the preference.
- Row exists with correct prefs → delivery issue. See Step 4.

### Step 4 — Check VAPID key

1. Confirm `VITE_VAPID_PUBLIC_KEY` is set in the hosting platform environment variables
2. Confirm the VAPID private key is set in the Supabase Edge Function environment (this is server-side only)
3. If keys changed: all existing subscriptions are invalid (they were subscribed with the old public key). Users must re-subscribe:
   - In Settings → Notifications → toggle off → toggle on

### Step 5 — Supabase project status

1. Open Supabase Dashboard → check if the project is paused (free tier pauses after 1 week of inactivity)
2. If paused: click "Restore project" — takes 1-2 minutes
3. After restore, all endpoints should work again

### Step 6 — Check the notification cron job

The cron job that processes `notification_queue` and dispatches Web Push runs on the server. If it's not running:
- Check Supabase Edge Function logs → look for the push dispatch function
- Check Supabase → Database → pg_cron (if using pg_cron for scheduling)
- Unprocessed rows in `notification_queue` (where `sent_at is null` and `created_at` is old) confirm the job isn't running

### Step 7 — iOS-specific

iOS push notifications require:
1. App installed to Home Screen (standalone mode)
2. User granted permission inside the installed PWA (not in Safari browser view)

Confirm the user is in standalone mode:
```js
window.navigator.standalone === true
// or
window.matchMedia('(display-mode: standalone)').matches
```

If not standalone: show the iOS install guide (already implemented in `NotificationSettings.jsx` → `IOSInstallGuide` component).

---

## Escalation

If none of the above resolve the issue:

1. Collect from the user:
   - Browser and OS version
   - DevTools → Console output (full error text)
   - DevTools → Network tab screenshot showing the failing request and status code
   - Whether they're using the browser version or installed PWA

2. Check the Supabase project's usage limits (free tier has notification delivery quotas)

3. If the Web Push endpoint (e.g. `fcm.googleapis.com` for Chrome) is returning an error, the subscription may be stale — user should re-subscribe.

---

## Prevention

- Always run `notification-queue-migration.sql` as part of any new environment setup
- Never rotate VAPID keys without a plan to migrate all existing subscriptions
- Set up monitoring on `notification_queue.created_at` vs `sent_at` lag — if lag > 2 hours, the cron job is down
