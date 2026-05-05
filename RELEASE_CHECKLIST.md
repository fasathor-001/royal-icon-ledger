# Royal Ledger — Release Checklist

> Run `npm run release:check` first. If the build fails, stop. If it passes, work through this document top to bottom before deploying.

---

## ⚡ Quick Release Checklist (≤ 5 min)

Use this before every deploy. If any item fails, do not release.

- [ ] `npm run release:check` passes (build is clean, no errors)
- [ ] No console errors or warnings in the browser dev tools
- [ ] Cloud sync works — data saves and loads from Supabase
- [ ] LocalStorage fallback works — app loads without a network connection
- [ ] No data loss on page refresh (both signed-in and guest)
- [ ] PIN gate blocks sensitive actions correctly
- [ ] Push notifications fire at the correct local time (morning + evening)
- [ ] All pending Supabase SQL migrations have been run in production

---

## Deployment order

> Follow this sequence. Do not reverse steps 2 and 3.

1. Run Supabase SQL migrations (if any) — see Section 3
2. Deploy Cloudflare Worker (`wrangler deploy`) — if worker changed
3. Deploy frontend (`npm run build` → upload `dist/` to host)

---

## Full Checklist

---

### 1. Build & Code Health `[BLOCKING]`

- [ ] `npm run build` exits with zero errors
- [ ] No TypeScript / ESLint errors that affect runtime behaviour
- [ ] Bundle size has not regressed significantly (baseline: ~1 MB minified)
- [ ] Service worker (`dist/sw.js`) is regenerated and precache manifest is updated
- [ ] `APP_VERSION` constant in `src/App.jsx` matches the version being released
- [ ] No leftover `console.log` debug statements in production-critical paths

---

### 2. Supabase SQL Migrations `[BLOCKING]`

> These must be run in production **before** the frontend is deployed. Skipping causes silent failures.

- [ ] Check `src/lib/dataLayer.js` for any `-- Run in Supabase` comments added since the last release
- [ ] Check `cloudflare-worker/push-cron.js` header comment for any new SQL statements
- [ ] Verify the following columns exist on `push_subscriptions`:

  ```sql
  -- Confirm all columns exist (run in Supabase SQL editor):
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'push_subscriptions';

  -- Expected: user_id, subscription, daily_enabled, weekly_enabled,
  -- monthly_enabled, preferred_time, timezone_offset, morning_time,
  -- evening_time, timezone_iana, updated_at
  ```

- [ ] `notification_queue` table exists with RLS enabled
- [ ] `user_data` table exists and RLS policies allow authenticated reads/writes
- [ ] All new columns have been added (run any pending `ALTER TABLE` statements)

---

### 3. Cloudflare Worker `[BLOCKING if changed]`

- [ ] `cloudflare-worker/push-cron.js` passes syntax check: `node --input-type=module --check < cloudflare-worker/push-cron.js`
- [ ] VAPID secrets are set in Cloudflare: `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
- [ ] Supabase secrets are set in Cloudflare: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- [ ] Cron trigger is configured: `"0 * * * *"` (every hour)
- [ ] IANA dual-path logic is intact — `getLocalHour` tries `timezone_iana` first, falls back to `timezone_offset`
- [ ] Worker deployed: `wrangler deploy` exits cleanly
- [ ] Verify in Cloudflare dashboard: last cron execution shows no errors

---

### 4. Authentication & Access `[BLOCKING]`

- [ ] Sign-up flow works (new email + password)
- [ ] Sign-in flow works (existing account)
- [ ] Password change saves and keeps the user signed in
- [ ] Sign-out clears session correctly
- [ ] Signed-out state shows the app in local/guest mode without errors
- [ ] Access control panel works (invite codes generate and apply)
- [ ] Sessions tab shows current device and allows signing out other devices
- [ ] RLS policies block cross-user data reads (verify with a second test account)

---

### 5. Data Sync (Supabase) `[BLOCKING]`

- [ ] Auto-sync fires on data change when signed in and online
- [ ] `syncStatus` transitions correctly: `idle → syncing → synced`
- [ ] Retry logic fires on failure: `failed → retry:1/3 → retry:2/3 → retry:3/3`
- [ ] `_version` field increments on each save (check `user_data.data._version` in Supabase)
- [ ] Conflict resolution: if cloud is newer, local data is not blindly overwritten
- [ ] Sync status pill on Account tab reflects current state accurately
- [ ] Last-synced time updates after a successful sync
- [ ] "Retry Sync" button in Data & Sync tab works when status is failed
- [ ] Upload (local → cloud) and Download (cloud → device) manual controls work

---

### 6. LocalStorage Fallback `[BLOCKING]`

- [ ] App loads and is fully usable when not signed in
- [ ] Data persists across page refreshes in guest mode
- [ ] Switching from guest → signed in merges / syncs without data loss
- [ ] App handles corrupt or missing localStorage gracefully (no white screen)
- [ ] Offline banner or sync pill reflects offline state correctly

---

### 7. Core Features — All Tabs `[BLOCKING]`

- [ ] **Dashboard** — Buffer, salary, spending budget, stage display correctly
- [ ] **Spending Gate** — Hard block fires at correct threshold; override is PIN-gated and logged
- [ ] **Impulses / History** — Entries save, display, and delete correctly; red badge shows on overrides
- [ ] **Envelopes** — Allocations calculate and display correctly
- [ ] **Buffer** — Stage progression logic correct; drawdown alert triggers as expected
- [ ] **Rules** — Custom thresholds save and are reflected in calculations
- [ ] **Trading P&L** — Visible for `variable`/`mixed` income types; hidden for `fixed`
- [ ] **Settings** — All sub-tabs render; no blank panels

---

### 8. PIN Protection `[BLOCKING]`

- [ ] Setting a PIN for the first time works
- [ ] Changing a PIN requires the correct current PIN
- [ ] Removing a PIN (blank new PIN) works
- [ ] PIN gate blocks: Rules edits, Spending Gate override, Re-run wizard, Reset all data
- [ ] Incorrect PIN shows error, does not unlock
- [ ] PIN is stored in `data.overridePin` (synced to cloud, not in a separate auth system)

---

### 9. Currency & Formatting `[IMPORTANT]`

- [ ] All 10 currencies display with correct symbol and space: `AED 10,200`, `R 8,500`
- [ ] Thousands separator is a comma on all device locales (pinned to `en-US`)
- [ ] Million abbreviation is smart: `AED 1M`, `AED 1.2M`, `AED 10.5M` (no trailing zeros)
- [ ] Negative values display correctly: `−R 500` (not `-R500`)
- [ ] Currency change in Settings shows inline `✓ Currency updated` and fades after 2s
- [ ] Currency change does not reset or recalculate any stored values
- [ ] Push notification amounts match app display (worker uses same formatting rules)

---

### 10. Notifications — Push & Worker `[IMPORTANT]`

- [ ] Enable push notifications flow works on Chrome (desktop + Android)
- [ ] Enable push notifications flow works on iOS (PWA installed to Home Screen)
- [ ] Denied permission shows the correct re-enable guide
- [ ] `PushPromptBanner` appears on first load and respects the escalating dismiss schedule
- [ ] Daily morning and evening reminders are scheduled correctly for the user's timezone
- [ ] Sunday Pulse fires on Sunday (morning + evening)
- [ ] Month-end Checkpoint fires in the last 3 days of the month
- [ ] Event notifications fire: `drawdown`, `override`, `stage_change`
- [ ] `notification_queue` rows are marked `sent_at` after delivery (no duplicate sends)
- [ ] Worker `console.warn` fires for invalid `timezone_iana` values (check Cloudflare logs)

---

### 11. Timezone System `[IMPORTANT]`

- [ ] IANA path: user with `timezone_iana = 'Europe/London'` gets notification at correct local hour (DST-aware)
- [ ] Offset fallback: user with `timezone_iana = null` gets notification via `timezone_offset` math (unchanged behaviour)
- [ ] Invalid `timezone_iana` falls back to offset, logs a warning — does not crash the worker
- [ ] `NotificationSettings` auto-detects timezone on first open:
  - Confident match → writes `timezoneIana` silently
  - Ambiguous → shows disambiguation banner
- [ ] Disambiguation confirm writes both `timezoneIana` and `timezoneOffset`
- [ ] Onboarding timezone tile selection writes both fields
- [ ] `push_subscriptions.timezone_iana` column exists in production (see Section 2)

---

### 12. Backup & Recovery `[IMPORTANT]`

- [ ] Export backup produces a valid JSON file with all user data
- [ ] Import backup restores data correctly and triggers a sync
- [ ] Import does not silently overwrite a newer cloud version
- [ ] Re-run setup wizard: clears expenses, preserves buffer / snapshots / P&L / rules
- [ ] Reset all data: wipes everything; app returns to initial state; requires PIN

---

### 13. Settings UI `[VERIFY]`

- [ ] All five sub-tabs render: Account, Sessions, Access, Data & Sync, Danger zone
- [ ] Account tab sync pill reflects real-time sync status
- [ ] Sync pill shows last-synced age when available; "Not yet synced" when not
- [ ] Sync pill shows `↻ Retry` link when sync has failed
- [ ] Data & Sync tab sections are labelled: CLOUD SYNC / BACKUP / SETUP
- [ ] Danger zone: AlertTriangle banner visible; "What will be deleted" list present; button is PIN-gated
- [ ] `Royal Ledger · v1.0.0` version footer visible at bottom of Settings
- [ ] Currency section: active tile has orange border + check icon; unselected tiles are visually dimmed

---

### 14. Mobile Experience `[VERIFY]`

- [ ] App is installable as a PWA on iOS (Add to Home Screen) and Android (Install prompt)
- [ ] Layout is usable on a 375px wide screen (iPhone SE) — no horizontal overflow
- [ ] Touch targets are large enough (minimum 44px for interactive elements)
- [ ] Keyboard does not break layout when text inputs are focused
- [ ] Bottom safe-area insets respected (no content hidden behind iPhone home bar)
- [ ] Dark theme renders correctly — no flash of white on load

---

### 15. Performance `[VERIFY]`

- [ ] Initial load is under 4s on a mid-range device with a 4G connection
- [ ] No layout shift or blank flash during the sync-on-load sequence
- [ ] Large impulse lists (100+ entries) do not cause visible lag when scrolling History
- [ ] Settings tab switches are instant (no re-fetches, pure local state)
- [ ] Service worker caches assets correctly — app loads offline after first visit

---

### 16. Final Safety Check `[BLOCKING]`

- [ ] Tested with a **real Supabase account** (not a mock or localhost stub)
- [ ] Tested in **incognito / private mode** (no cached state from development)
- [ ] Tested on at least **two different browsers** (e.g. Chrome + Safari)
- [ ] No test accounts or seed data left in the production database
- [ ] `.env` / environment variables are set correctly on the production host
- [ ] `VITE_VAPID_PUBLIC_KEY` is set in the production build environment
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` point to production (not a dev project)

---

## Rollback Readiness `[BLOCKING — verify before every deploy]`

> Before you deploy, confirm you can roll back. If you cannot answer YES to every item here, fix it first.

- [ ] Previous frontend build artifact (`dist/`) is saved or the previous commit is tagged in git
- [ ] Cloudflare Worker previous version is saved (Cloudflare keeps deployment history — confirm you can revert via dashboard or `wrangler rollback`)
- [ ] Any SQL migrations run in this release are **non-destructive** (columns added, not dropped; no data deleted)
- [ ] A full data export has been taken from at least one real production account immediately before deploying
- [ ] The git tag for this release has been created **before** deploying (see workflow below)

---

## Rollback Procedure

> Use this if a deploy causes regressions. Work backwards through the steps.

### Frontend rollback
1. Identify the last good git tag: `git tag --sort=-creatordate | head -5`
2. Check out the tag: `git checkout v<last-good-version>`
3. Rebuild: `npm run build`
4. Re-upload `dist/` to your hosting provider
5. Verify app loads and syncs correctly

### Cloudflare Worker rollback
1. Go to Cloudflare dashboard → Workers & Pages → your worker → Deployments
2. Find the previous deployment and click **Roll back**
3. Alternatively: `wrangler rollback` (if supported by your plan)
4. Verify cron logs show no errors after rollback

### Supabase migration rollback
> SQL migrations are intentionally non-destructive — columns are added with `IF NOT EXISTS`, never dropped. There is no automated rollback for schema changes.

- If a new column caused a problem: `ALTER TABLE <table> DROP COLUMN <column>;` (only safe if column is empty in production)
- If RLS policy change broke access: re-apply the previous policy from your migration notes
- Data is never deleted by migrations — user records are always recoverable

### Sync / data rollback
- If a bad sync wrote corrupt data to Supabase: use the Supabase SQL editor to inspect `user_data` and restore from a previous `_version` if you kept a snapshot
- Instruct affected users to use **Import backup** to restore from their last export

---

## Rollback Trigger Conditions

> Roll back immediately (don't wait) if any of these are true after a deploy:

| Symptom | Likely cause | Action |
|---------|-------------|--------|
| App shows white screen on load | JS bundle error or missing env var | Frontend rollback |
| Sync fails for all users immediately | Supabase RLS policy broken or env var wrong | Check Supabase → rollback worker if worker changed |
| Push notifications stop firing | Worker crash or missing VAPID secret | Worker rollback |
| Data appears to reset on load | Wrong Supabase project URL in production env | Check env vars, do not rollback yet |
| Users report data loss after import | Import merge logic bug | Frontend rollback; instruct users to restore from backup |

---

## Git Tagging Workflow

> Tag every production release. Never deploy without a tag.

```bash
# Before deploying
git tag v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# After a successful deploy, update the release log below
# If rollback needed:
git checkout v0.9.0   # last good tag
```

---

## Release Decision

| Status | Action |
|--------|--------|
| All `[BLOCKING]` items checked | ✅ Safe to release |
| Any `[BLOCKING]` item unchecked | 🚫 Do not release — fix first |
| `[IMPORTANT]` items unchecked | ⚠️ Release with caution — document known gaps |
| `[VERIFY]` items unchecked | ℹ️ Acceptable if unrelated to this release's changes |

---

## Release log

| Date | Version | Released by | Notes |
|------|---------|-------------|-------|
|      | v1.0.0  |             | Initial release |

---

*Generated for Royal Ledger · Architecture: React/Vite PWA · Supabase · Cloudflare Workers · Web Push (VAPID)*
