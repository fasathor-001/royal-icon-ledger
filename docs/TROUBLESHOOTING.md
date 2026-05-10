# Royal Ledger — Troubleshooting Guide

> Diagnostic patterns, known false positives, and step-by-step resolution for common issues. Last updated: 2026-05-10.

---

## Before You Start

### Check the bundle hash first

Stack trace line numbers exceeding the source file length (~5,300 lines for App.jsx) mean the browser is running a **stale cached bundle**, not a new bug.

1. Check the line numbers in the stack trace
2. If any line number > 5,300 for App.jsx errors → stale cache confirmed
3. Do not re-fix. Instruct the user to:
   - Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
   - Open DevTools → Application → Service Workers → "Skip waiting" + "Update on reload"
   - Clear site data (Application → Clear Storage → Clear site data)
   - On mobile PWA: delete and reinstall from browser

### CORS errors: always check the Network tab

Console-only CORS errors are misleading. The browser says "Cross-Origin Request Blocked" for both "domain blocked" and "table doesn't exist" cases.

**Diagnosis steps:**
1. Open DevTools → Network tab
2. Filter by the Supabase domain
3. Look for failed requests: note which endpoint failed
4. Check other requests to the same domain — if they succeed, it's per-endpoint, not network-wide
5. "Status: (null), 0 B transferred" = blocked before headers (likely missing table or function)

**The most common cause of per-endpoint CORS errors:** The table doesn't exist in Supabase. PostgREST returns a malformed error response for missing tables, which the browser interprets as a CORS failure. Fix: run the relevant migration SQL.

---

## Common Issues

---

### Issue: "The app shows a bug I already fixed"

**Symptom:** User reports an error that was fixed in a previous commit. Stack trace references line numbers that don't exist in the current source file.

**Root cause:** User's browser or PWA is running a stale cached bundle.

**Resolution:**
1. Confirm the bundle hash. Ask the user what they see in DevTools → Network → Name column for the main JS file (e.g. `index-BSkhiOes.js`). Compare to the latest deployed hash.
2. If they match → it's a genuine new bug. Investigate normally.
3. If they don't match → stale cache. See "Before You Start" above.

**Do not re-fix code for a stale-cache false positive.**

---

### Issue: Sync fails with "Sync failed — permission error"

**Symptom:** `SyncIndicator` shows red "Sync failed — permission error. Sign out and back in."

**Root cause:** RLS error — `auth.uid()` doesn't match `user_data.user_id` for the row. Usually caused by an expired JWT that wasn't refreshed.

**Resolution:**
1. Instruct user to sign out
2. Sign back in
3. If issue persists after sign-in: check Supabase → Authentication → Users → confirm the account exists and is confirmed
4. If account is unconfirmed (email not verified): resend confirmation email

---

### Issue: User can't sign up — "Invite code not recognised"

**Symptom:** User enters an invite code during signup and gets "Invite code not recognised or already used."

**Causes:**
1. Code was already used by a different email address
2. Code has expired (`invite_code_expires_at` is in the past)
3. Typo in the code
4. The code is in `invite_codes` table but was created before the `early_access_leads` path existed (fallback RPC `use_invite_code` should catch this)

**Resolution:**
1. Open AdminDashboard → Invite Codes
2. Find the code — check `used` flag and `used_by_email`
3. If used by a different email: generate a new code for this user
4. If expired: the `validate_lead_invite_code` RPC rejects expired codes — generate a new one
5. If code shows as unused but still rejected: check if the email matches the `email` restriction on the code (if set)

**To generate a new code:**
- AdminDashboard → Invite Codes → Create → optionally restrict to the user's email → send code by email

---

### Issue: Foundation Complete banner on day 1

**Symptom:** New Foundation user sees "Foundation Complete — 12 months of security" immediately after onboarding.

**Root cause:** User entered pre-existing savings balance that satisfies the 12-month threshold. The math is correct; the problem is conceptual (Foundation Arc is designed for accumulation, not validation of pre-existing wealth). See F024 in `memory/KNOWN_ISSUES.md`.

**Current status:** No code fix deployed. Monitoring.

**Workaround for affected user:**
If the user should be on a different profile (Salary instead of Foundation), admin can patch their `incomeType`:
```sql
select admin_patch_user_data('user@example.com', null, 'fixed');
```

---

### Issue: Goal progress bar shows $0 or disappears

**Symptom:** YOUR SAVINGS card shows a goal name but the progress bar is flat at $0, or the bar disappears after the user adds money.

**Root cause (if on Stage 1):** `data.futureGoals` is $0 in Stage 1 — the waterfall doesn't feed the goals account until Stage 2. The app uses `data.buffer` as a proxy via `_goalSaved`.

**Root cause (if bar disappears at Stage 2 boundary):** This was the stage-switch cliff bug — fixed in commit `b5b9d0d` (F036). If the user is on a stale bundle, see stale cache resolution above.

**Verification:** Check `data.futureGoals` and `data.buffer` in the user's Supabase row. If both are > 0 and the bar is still at $0, the user is on a stale bundle.

---

### Issue: Monthly Review modal doesn't dismiss

**Symptom:** The Monthly Review modal keeps appearing even after the user completes it.

**Root cause:** `data.reviewedMonths` didn't get the current month's `"YYYY-MM"` key written.

**Verification:** Check `data.reviewedMonths` in Supabase. If the current month key (`"2026-05"`) is absent, the modal fires again on next load.

**Resolution:** If the write failed (sync error during modal completion), user should complete the review again — it will write the key on next successful sync.

---

### Issue: Tester Activity tab shows infinite loading / flicker

**Symptom:** Admin Dashboard → Tester Activity tab keeps spinning and never shows data.

**Root cause:** The `get_tester_activity_summary()` RPC doesn't exist, or the function signature conflicts with PostgREST's cached type (see F023 and the "RETURNS jsonb" rule in DEVELOPMENT_NOTES).

**Resolution:**
1. Open Supabase SQL Editor → run `get-tester-activity-rpc.sql`
2. If function exists but still fails: DROP and recreate — the signature may have changed since last deploy
3. After recreate: wait 30 seconds for PostgREST schema cache to clear, or run `NOTIFY pgrst, 'reload schema';`

---

### Issue: Cannot delete a user from Supabase Auth dashboard

**Symptom:** "Database error deleting user" when deleting from Authentication → Users.

**Root cause:** A foreign key on `user_activity_events.user_id` lacks `ON DELETE CASCADE`.

**Resolution:**
```sql
-- Drop and recreate the FK with CASCADE
alter table user_activity_events
  drop constraint if exists user_activity_events_user_id_fkey;
alter table user_activity_events
  add constraint user_activity_events_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
```

---

### Issue: Password reset link doesn't work

**Symptom:** User clicks the reset link from the email and lands on the login page instead of the "Set new password" page.

**Root cause:** The `?type=recovery` parameter was stripped by Supabase because the Redirect URL allowlist doesn't include a wildcard.

**Resolution:**
1. Open Supabase → Authentication → URL Configuration
2. Add `https://my.royalledger.app**` to the Redirect URL allowlist
3. Test: request a new reset link. The URL should include `?type=recovery&code=xxx`

If the allowlist is already correct, Layer 2 (localStorage code verifier) should handle it for same-browser flows. If the user opened the link in a different browser (or cleared localStorage), the reset will fail — they must request a new link from the same browser they'll use to set the password.

---

### Issue: Push notifications not arriving

**Symptom:** User enabled notifications but never receives them.

**Diagnostic steps:**
1. Check `push_subscriptions` table — does the user have a row? Is `daily_enabled` true?
2. Check `notification_queue` — are there `sent_at: null` rows for this user older than 2 hours? If yes, the cron job isn't running.
3. Check the Supabase Edge Function logs for `notify-lead` or the push delivery function
4. On iOS: confirm app is installed to Home Screen (push requires standalone mode on iOS)

See `runbooks/PUSH_NOTIFICATIONS_FAILURE.md` for the full diagnostic runbook.

---

### Issue: "setCategory is not defined" runtime error

**Symptom:** Spending Gate crashes after every Skip/Sleep/Buy decision.

**Root cause:** A `useState` hook setter was removed from a component but a call to it remained in `reset()`. This is a known failure pattern — see DEVELOPMENT_NOTES §5.

**Diagnosis:** Run `Grep` for `setCategory` across `src/`. If it appears in a `reset()` function but there's no `const [category, setCategory] = useState()` in scope, this is the bug.

**Fix:** Remove the orphaned setter call. Verify with `npm run build`.

**Prevention:** When removing any `useState` hook, always grep for the setter name across the entire component file before finalising the change.
