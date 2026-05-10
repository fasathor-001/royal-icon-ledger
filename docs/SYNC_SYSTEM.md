# Royal Ledger — Sync System

> Covers the offline-first local → cloud sync loop, conflict detection, migration flow, and the sync indicator. Last updated: 2026-05-10.

---

## Architecture

Data is stored in two places simultaneously:
1. **localStorage** (`open-trader-finance-v2`) — always written first, synchronously
2. **Supabase** (`user_data` table, JSONB `data` column) — written asynchronously, debounced

This means the app works offline. When the user is offline, all edits are saved locally and sync when connectivity is restored.

---

## Write Path

```
setData(newData)                      ← called anywhere in App.jsx
  ├── immediate: localStorage write   ← synchronous, always succeeds
  └── debounced (800ms): saveToCloud(newData)
        └── saveDataVersioned(userId, newData)
              ├── reads cloud version
              ├── if local < cloud: returns { ok: false, conflict: true }
              └── if ok: upserts to user_data
```

`saveToCloud` is a prop passed from `App_v2` into `OpenFinanceApp`. It is the debounced wrapper around `saveDataVersioned`.

---

## Version Tracking

Every data write increments `data._version`. This field is never shown to users but is used to detect conflicts.

On every versioned save, `saveDataVersioned`:
1. Reads the current `_version` from the cloud row
2. If `localVersion < cloudVersion` → returns `{ ok: false, conflict: true, cloudVersion }`
3. Otherwise → writes and returns `{ ok: true }`

`_version`, `_localModifiedAt`, and `_syncedAt` are stripped before writing to Supabase (they are internal metadata, not part of the user's data).

---

## Conflict Detection

If a conflict is detected (another device saved a newer version), `App_v2` shows `ConflictModal`:

```
⚠️ Data conflict
This device has unsaved local changes. Choose which version to keep.

[ This device (NEWER) ]    [ Cloud copy ]
v12 · just now              v14 · 3 min ago
```

User choices:
- **Keep This Device** — local data is pushed to cloud (overwrites cloud version)
- **Keep Cloud** — cloud data is loaded and replaces local

The modal shows relative timestamps (e.g. "just now", "3 min ago") computed from `_syncedAt`.

---

## Load Path

On app launch:
1. `App_v2` calls `loadFromCloud(userId)` → `loadData(userId)` in dataLayer.js
2. Cloud data is returned with `_syncedAt` (the `updated_at` from the cloud row)
3. `App_v2` compares cloud vs local timestamp
4. Newer version wins, or user is shown `ConflictModal` if both have changes
5. Loaded data is spread over `defaultData`: `{ ...defaultData, ...loadedData }`

The spread over `defaultData` ensures any field added since the user's last save gets its default value automatically. This is the migration mechanism for new fields.

---

## Sync Status Indicator

`SyncIndicator` (bottom-right corner of the app) shows the current sync state:

| State | Label | Colour |
|---|---|---|
| Offline | "Offline — saved locally" | Amber |
| Syncing | "Syncing…" | Orange with pulsing dot |
| Retrying | "Syncing… retry N" | Orange |
| Synced | "Synced ✓" | Green |
| Failed | "Sync failed — data saved locally" | Red |
| RLS error | "Sync failed — permission error. Sign out and back in." | Red |

The indicator is only shown when there is something to communicate (hides when synced and online with no recent event). On mobile, it sits above the bottom nav bar (`bottom: calc(76px + env(safe-area-inset-bottom))`).

---

## Retry Logic

When a save fails, `App_v2` retries up to 3 times with exponential backoff. On each retry, `syncStatus` is set to `'retry:N'` (N = retry number), which the indicator shows as "Syncing… retry N". After 3 failures, `syncStatus` is set to `'failed'` or `'failed:rls'` depending on the error type.

Error classification is done by `classifyError(err)` in dataLayer.js:
- `'network'` — navigator.onLine false, "failed to fetch", NetworkError
- `'auth'` — JWT error, refresh_token_not_found
- `'rls'` — 42501 code, "row-level security", "permission denied"
- `'unknown'` — everything else

---

## Migration Modal (localStorage → Cloud)

When a returning user signs in for the first time on a device that has existing localStorage data, `MigrationModal` appears:

```
"You have local data on this device. Import it to your account?"
[ Import ]  [ Start fresh ]
```

- **Import** → calls `importLocalToCloud(userId, localData)` which always overwrites whatever is in the cloud (safe because this is first sign-in, so cloud has no user-specific data)
- **Start fresh** → dismisses modal, no import

`MigrationModal` is shown at most once per sign-in session (tracked by local React state in `App_v2`).

---

## Error Types and Handling

| Error type | App behaviour |
|---|---|
| Network | Save silently deferred. Indicator shows "Offline". Retried on next user action. |
| Auth | User is shown "permission error" message. Sign out and back in resolves it. |
| RLS | Same as auth — indicates JWT mismatch or policy gap. |
| Unknown | Treated as network error — retry, then show "sync failed" if exhausted. |

---

## Supabase Table: `user_data`

```sql
-- Minimal schema reference
create table user_data (
  user_id uuid references auth.users primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);
alter table user_data enable row level security;
create policy "own row" on user_data
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

One row per user. No foreign data beyond `user_id`. All application data is in the `data` JSONB column.

---

## What Not to Break

1. **localStorage key** `open-trader-finance-v2` — renaming this orphans existing users' offline data.
2. **`_version` strip before write** — if `_version` is not stripped, the cloud value diverges from the in-memory value after every save, breaking conflict detection.
3. **`{ ...defaultData, ...loadedData }` spread** — this is the field migration mechanism. Do not replace it with a direct assign.
4. **Debounce on saveToCloud** — do not remove the debounce. Direct save on every `setData` would send a Supabase request on every keystroke in every input field.
5. **RLS policy** — the `user_id = auth.uid()` policy must exist. Without it, every save and load returns an RLS error.
