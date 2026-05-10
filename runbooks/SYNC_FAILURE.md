# Runbook: Sync Failure

> Diagnosis and resolution for cloud sync failures — "Sync failed" indicator, data not persisting across devices, or conflict modal behaviour. Last updated: 2026-05-10.

---

## Reading the Sync Indicator

| Indicator text | Meaning | Action |
|---|---|---|
| "Syncing…" | Save in progress | Wait |
| "Syncing… retry N" | Save failed, retrying (up to 3 times) | Wait |
| "Synced ✓" | Last save succeeded | None |
| "Offline — saved locally" | No internet connection | Wait for connectivity |
| "Sync failed — data saved locally" | Exhausted retries, not RLS | Check connectivity, sign out and back in |
| "Sync failed — permission error. Sign out and back in." | RLS error | Sign out and back in |

---

## Diagnosis Steps

### Step 1 — Identify the error type

Open DevTools → Network tab → filter by your Supabase domain → find the failing request.

Check the response:
- **401 / JWT error** → auth issue → sign out and back in
- **42501 / "row-level security"** → RLS policy issue → see below
- **404 / "relation does not exist"** → missing table → run migration
- **(null) / 0 bytes** → network blocked or missing table (see CORS note)
- **500** → Supabase server error → check Supabase Status page

### Step 2 — CORS / missing table

If the Network tab shows CORS failures for a specific endpoint:
- Other Supabase endpoints succeeding? → per-table issue, likely missing table
- All Supabase endpoints failing? → project paused or network issue

See `PUSH_NOTIFICATIONS_FAILURE.md` Step 2 for the CORS diagnostic pattern — same rule applies here.

---

## Common Scenarios

### "Sync failed — permission error"

**Cause:** `auth.uid()` doesn't match the `user_id` in `user_data`. Usually an expired or mismatched JWT.

**Fix:**
1. User signs out
2. User signs back in
3. If still failing after fresh sign-in: check the user exists in Supabase → Authentication → Users

**RLS policy check:**
```sql
-- Verify the policy exists
select * from pg_policies where tablename = 'user_data';
-- Should show a policy with: using (auth.uid() = user_id)
```

If the policy is missing:
```sql
create policy "own row" on user_data
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

---

### "Data conflict" modal appears

**Cause:** Another device saved a newer version of the data while this device had local changes. The `_version` counter on the cloud copy is higher than the local copy.

**Resolution:**
- **Keep "This device"** if the user just made important changes on this device
- **Keep "Cloud copy"** if the cloud has more recent changes (e.g. from a phone they just updated)

The modal shows relative timestamps ("just now", "3 min ago") to help the user decide.

**Note:** After choosing, the winning version is synced to both cloud and local. There's no undo.

---

### Changes saved on Device A don't appear on Device B

**Cause:** Either (a) the save on Device A hasn't synced yet, or (b) Device B is reading from a cached local version.

**Fix:**
1. On Device A: confirm "Synced ✓" appeared after the change
2. On Device B: hard refresh (Ctrl+Shift+R) — this reloads from cloud on next render
3. On Device B: sign out and back in — this forces a full cloud load

If Device B shows a conflict modal: the B-device had unsaved local changes. Choose the correct version.

---

### User reports data loss (changes vanished)

**Before assuming data loss:**
1. Check if the user is signed in (localStorage data vs cloud data may differ)
2. Check if they're on a stale bundle (see stale cache diagnosis)
3. Check if a conflict resolution chose the wrong side

**If data is genuinely missing from Supabase:**

```sql
-- Check the user's current data
select updated_at, data from user_data where user_id = '<user_uuid>';
```

If the data has an old `updated_at` timestamp, the user's changes never reached Supabase. They may still have the correct data in their browser's localStorage.

**Recovery path:**
1. User should NOT reload the page (localStorage is ground truth)
2. User goes to Settings → Backup → Download — saves a JSON of current local state
3. User then triggers a manual save by making any change in the app
4. Confirm "Synced ✓" appears
5. Verify Supabase row has the updated data

---

### Sync works but is very slow

**Cause:** Large `data` JSONB blob. If `data.snapshots` or `data.impulses` has accumulated thousands of entries, the upsert becomes slow.

**Check:**
```sql
select pg_column_size(data) from user_data where user_id = '<user_uuid>';
```

Over 500KB is large. Over 1MB may cause noticeable latency.

**Future mitigation:** Snapshot pruning (keep last N snapshots) or archiving old impulses. Not currently implemented.

---

## Offline Behaviour

When `navigator.onLine` is false:
- Sync indicator shows "Offline — saved locally"
- All `setData` calls still write to localStorage normally
- Supabase calls are skipped
- On reconnect, the next user action triggers the debounced save

**The user never loses data because of offline mode.** localStorage is always written first.

---

## Emergency: Full data reset for a user

Use only as a last resort (genuinely corrupt data).

```sql
-- In Supabase SQL Editor (admin only)
-- admin-reset-user-data.sql
delete from user_data where user_id = '<user_uuid>';
```

After deletion:
- User's next load gets `null` from `loadData`
- App shows onboarding (since `data.setupComplete` defaults to `false`)
- User must re-onboard

**Back up first** if the user has a download from Settings → Backup. They can re-import after re-onboarding by emailing the JSON file to support for manual restore (no in-app restore from file currently).
