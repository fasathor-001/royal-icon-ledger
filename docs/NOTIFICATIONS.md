# Royal Ledger — Push Notifications

> Web Push API implementation details, VAPID setup, iOS quirks, and the notification queue. Last updated: 2026-05-10.

---

## Overview

Push notifications are delivered via the Web Push API. The Service Worker (`src/sw.js`) receives push events and displays them. User preferences are stored in `data.notificationPreferences` (synced to app data) and in the `push_subscriptions` Supabase table (for the server-side scheduler).

---

## Environment Variable

```
VITE_VAPID_PUBLIC_KEY=<your VAPID public key>
```

This must be set in `.env.local` (dev) and the hosting platform (production). The VAPID private key lives only on the server (Supabase Edge Function) — never in the frontend.

---

## Notification Types

| Type | Default schedule | Notes |
|---|---|---|
| Daily | 08:00 user local time | Daily check-in reminder |
| Weekly | Configurable | Weekly pulse / summary |
| Monthly | Configurable | Monthly review prompt |

Each can be independently toggled on/off in Settings → Notifications.

---

## User Preference Fields (`data.notificationPreferences`)

```js
{
  dailyEnabled: boolean,     // default: true
  weeklyEnabled: boolean,    // default: true
  monthlyEnabled: boolean,   // default: true
  preferredTime: string,     // "HH:MM" default "08:00"
  timezoneIana: string|null, // IANA zone string, e.g. "Africa/Johannesburg"
}
```

These preferences are set during onboarding (Step 10) and editable in Settings → Notifications.

---

## Supabase Table: `push_subscriptions`

One row per user. Columns:

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid | FK to `auth.users` |
| `subscription` | jsonb | Web Push subscription object (endpoint, keys) |
| `daily_enabled` | bool | |
| `weekly_enabled` | bool | |
| `monthly_enabled` | bool | |
| `preferred_time` | text | "HH:MM" |
| `timezone_offset` | float | Hours offset from UTC (deprecated in favour of timezone_iana) |
| `morning_time` | text | "HH:MM" |
| `evening_time` | text | "HH:MM" |
| `timezone_iana` | text | IANA zone string |
| `updated_at` | timestamptz | |

### Adding timezone columns (one-time SQL)

If the table exists without the timezone columns, run:

```sql
alter table push_subscriptions add column if not exists timezone_offset float default 2;
alter table push_subscriptions add column if not exists morning_time text default '08:00';
alter table push_subscriptions add column if not exists evening_time text default '18:00';
alter table push_subscriptions add column if not exists timezone_iana text;
```

---

## Notification Queue Table

For instant notifications (drawdown alerts, PIN override, stage change), the app queues a row in `notification_queue`. A cron job on the server processes this table.

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
create policy "insert own" on notification_queue for insert with check (auth.uid() = user_id);
```

This table was created retroactively (F023, 2026-05-09). Before it existed, `queueNotification()` calls produced CORS errors because PostgREST returns malformed CORS headers for missing tables. See `runbooks/PUSH_NOTIFICATIONS_FAILURE.md` for diagnosis steps.

---

## iOS Requirements

iOS requires the app to be installed to the Home Screen before push notifications can be enabled. The `NotificationSettings` component detects this and shows step-by-step installation guidance (`IOSInstallGuide`) when:
- `isIOS` is true (user agent check)
- `isStandalone` is false (not running in standalone/PWA mode)

Detection:
```js
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.navigator.standalone === true
  || window.matchMedia('(display-mode: standalone)').matches;
```

---

## VAPID Subscription Flow

1. User enables notifications in Settings → Notifications
2. Browser prompts for permission
3. If granted: `navigator.serviceWorker.ready` → `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) })`
4. Subscription object passed to `savePushSubscription(userId, subscription, prefs)` → Supabase upsert

---

## `dataLayer.js` Push Functions

| Function | Purpose |
|---|---|
| `savePushSubscription(userId, subscription, prefs)` | Upsert subscription + prefs to `push_subscriptions` |
| `deletePushSubscription(userId)` | Remove row (user disabled notifications) |
| `getPushSubscription(userId)` | Load current subscription + prefs for Settings display |
| `updatePushPreferences(userId, prefs)` | Update preference columns without touching subscription object |
| `queueNotification(userId, type, payload)` | Insert into `notification_queue` |

---

## Push Prompt Banner

`NotificationSettings.jsx` also exports `PushPromptBanner`, a dismissible banner shown on the Command tab for users who haven't enabled notifications yet. It prompts them to go to Settings → Notifications.

---

## What Not to Break

1. **`VITE_VAPID_PUBLIC_KEY` must be set** — if undefined, `NotificationSettings` imports `undefined` and `urlBase64ToUint8Array` throws at subscription time.
2. **`notification_queue` table must exist** — see migration SQL above. Missing table → CORS errors on every `queueNotification()` call.
3. **iOS install guide** — do not remove the `isIOS && !isStandalone` branch. Without it, iOS users who try to enable notifications before installing get a browser error they can't interpret.
4. **`ON DELETE CASCADE` is not required on `push_subscriptions`** (user_id references auth.users) — confirm this FK exists if adding it to the schema. Without CASCADE, Supabase Auth user deletion will fail.
