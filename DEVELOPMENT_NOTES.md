# DEVELOPMENT_NOTES.md

Internal engineering documentation for Royal Ledger. Not user-facing.
This file is the authoritative source for non-obvious rules, gotchas, patterns, and historical bugs.
Read this before touching the codebase.

---

## 1. Project Overview

Royal Ledger is a personal finance OS for variable-income earners, freelancers, and traders. It runs as a PWA and is deployed at [royalledger.app](https://royalledger.app); the dashboard is at `my.royalledger.app/app`. It is invite-only (gate enforced via Supabase RPC at signup). Stack: React 19, Vite 7, Supabase (auth + Postgres via `@supabase/supabase-js` v2), Tailwind CSS (utility classes via CDN-style globals, not PostCSS modules), `recharts` for charts, `lucide-react` for icons, `vite-plugin-pwa` for service worker. No TypeScript — plain JSX throughout.

---

## 2. File Structure

### Entry and routing

| File | Purpose |
|---|---|
| `index.html` | Single HTML shell. Loads `src/main_v2.jsx`. Has `viewport-fit=cover` and `apple-mobile-web-app-status-bar-style: black-translucent` — see §4 (safe-area pattern). |
| `src/main_v2.jsx` | **Active entry point**. BrowserRouter: `/app` → `AppShell` (wraps `App_v2`), `/*` → `MarketingSite`. On `my.royalledger.app` all non-`/app` paths redirect to `/login`. |
| `src/main.jsx` | Legacy entry (no router, no auth). Not used. `index.html` imports `main_v2.jsx`. |

### Core application

| File | Purpose |
|---|---|
| `src/App_v2.jsx` | Auth wrapper. Handles login page, Supabase session, cloud load/save, conflict modal, migration modal, sync indicator. Passes `saveToCloud`, `loadFromCloud`, `user`, `syncStatus`, etc. down into `OpenFinanceApp`. |
| `src/App.jsx` | Main application logic and all tabs. Contains `OpenFinanceApp`, every tab component (Command, Setup, Budget tab, ProfitAllocator, TradingTab, ImpulseTab, History, Rules, Settings, Admin), plus `MobileBottomNav`, `PinSetupScreen`, `BlockedScreen`. **This is the largest file — ~5,300 lines.** |
| `src/contexts/AuthContext.jsx` | Supabase auth state: login, signUp, sendMagicLink, resetPassword, updatePassword, isPasswordRecovery. Three-layer PKCE recovery detection. |

### Components

| File | Purpose |
|---|---|
| `src/components/Budget.jsx` | Envelope budgeting system — envelope list, editor, spending tracking, `MonthEndActions` (manual rollover trigger). |
| `src/components/RolloverModal.jsx` | Auto-triggered month-end rollover dialog. Computes what happened to each envelope and executes sweep-to-buffer + roll-forward. |
| `src/components/Onboarding.jsx` | Multi-step first-run wizard. Sets `setupComplete: true` when done. Has its own safe-area padding (full-screen overlay). |
| `src/components/MigrationModal.jsx` | Shown once when a localStorage user signs in for the first time. Offers to push local data to cloud. |
| `src/components/MonthlyReview.jsx` | Monthly review modal (auto-shows during review window). Exports `useShouldShowReviewModal`. |
| `src/components/AdminDashboard.jsx` | Invite code management, access request approval, PIN reset approval, Tester Activity tab. Only visible to emails in `ADMIN_MOBILE_EMAILS`. |
| `src/components/HelpTip.jsx` | Contextual help tooltip component. Renders a small `?` button; click opens a premium dark popover explaining the feature. Portal-based (never clipped), smart repositioning (flips above when near viewport bottom, clamps to edges on mobile). Profile-aware — callers pass different content per `incomeType`. See §12. |
| `src/components/PinGate.jsx` | PIN verification hooks: `usePinGate`, `usePinRowGate`, `useSectionPin`. Used to protect structural edits. |
| `src/components/PinContext.jsx` | React context providing `{ pin, pinHash, email }` to PIN-gated components. |
| `src/components/NotificationSettings.jsx` | Push notification preferences. Exports `PushPromptBanner`. |
| `src/components/WeeklyPulseBanner.jsx` | Weekly check-in banner triggered by `RitualCard`. |
| `src/components/InstallPrompt.jsx` | PWA install prompt (A2HS). |

### Lib

| File | Purpose |
|---|---|
| `src/lib/supabase.js` | Creates and exports the Supabase client. Guards on `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Uses PKCE flow, `storageKey: 'sb-auth-token'`, `storage: window.localStorage` (explicit for iOS PWA). Exports `isSupabaseConfigured` boolean. |
| `src/lib/dataLayer.js` | All Supabase data ops: `loadData`, `saveData`, `saveDataVersioned`, `importLocalToCloud`, `deleteData`, `validateAndClaimInviteCode`, invite/access-request CRUD, `savePushSubscription`, `queueNotification`. Single table strategy: one row per user in `user_data`, JSONB `data` column. |
| `src/lib/pinHash.js` | PBKDF2-SHA256 PIN hashing (100k iterations, email-as-salt). Handles legacy SHA-256 hashes transparently in `verifyPin`. |
| `src/lib/currency.js` | `CURRENCIES` list, `getCurrency(code)`, `makeFmt(code)` → number formatter. Pins `en-US` locale for consistent comma separators across device locales. Abbreviates ≥1M values with "M" suffix. |
| `src/lib/timezones.js` | IANA timezone list for notification preference UI. |

### Marketing site

`src/marketing/` — public-facing site served at `royalledger.app`. Entirely separate from the app. Not documented here.

### Data storage

- **localStorage key**: `open-trader-finance-v2` — do **not** rename without a migration; existing users have their data under this key.
- **Supabase table**: `user_data` — columns: `user_id`, `data` (JSONB), `updated_at`. One row per user.
- **Other tables**: `invite_codes`, `access_requests`, `early_access_leads`, `push_subscriptions`, `notification_queue`, `pin_reset_requests`, `user_activity_events`.

### Supabase SQL migration files (`supabase/`)

Run these once in Supabase SQL Editor in the order listed. Safe to re-run — most use `CREATE OR REPLACE` or `IF NOT EXISTS`.

| File | Purpose |
|---|---|
| `early-access-schema.sql` | Creates `early_access_leads` table and base RLS policies. |
| `admin-migration.sql` | Admin-level table setup and RLS. |
| `leads-status-migration.sql` | Adds `status` column to `early_access_leads`. |
| `validate-invite-code.sql` | Creates `validate_lead_invite_code(p_code, p_email)` RPC. |
| `invite-code-expiry-migration.sql` | Adds `invite_code_expires_at` column to `early_access_leads` and updates `validate_lead_invite_code` to reject expired codes. **Run after `validate-invite-code.sql`.** |
| `pin-migration.sql` | Creates `pin_reset_requests` table. |
| `pin-reset-migration.sql` | Adds columns needed for PIN reset flow. |
| `rls-fix-migration.sql` | Patches RLS policies after early structural changes. |
| `admin-access-fix.sql` | Grants admin functions access to `auth.users`. |
| `activity-logs-migration.sql` | Creates `user_activity_events` table with `ON DELETE CASCADE` FK to `auth.users`. |
| `get-tester-activity-rpc.sql` | Creates `get_tester_activity_summary()` RPC (returns `jsonb`). Used by Admin → Tester Activity tab. |
| `auth-user-sync-trigger.sql` | Trigger that syncs new `auth.users` rows into `early_access_leads`. |
| `sync-users-from-auth.sql` | One-time backfill to sync existing auth users into `early_access_leads`. |
| `admin-reset-user-data.sql` | Admin utility — wipes a user's `user_data` row (support use only). |

---

## 3. Data Model

All fields live in a single JSON object (stored in localStorage and Supabase JSONB). The shape is defined as `defaultData` at `src/App.jsx:32`. New fields are added by spreading `defaultData` over stored data on load, so any missing field gets its default value automatically.

### Top-level fields

| Field | Type | Notes |
|---|---|---|
| `expenses` | `Array<{id, name, amount, category}>` | Fixed monthly expenses. Used to compute `salary`. |
| `spendingBudget` | `number` | Monthly discretionary allowance. Also seeds the Discretionary envelope cap. |
| `bufferReserve` | `number` | Amount held back from salary for buffer top-up. |
| `bufferTargetMonths` | `number` | Months of salary to hold in buffer. Default: 18. |
| `bufferProtectMonths` | `number` | Months threshold that triggers buffer-protect mode. Default: 16. |
| `stageRules` | `{stage1, stage15, stage2, stage3}` | Allocation percentages per stage. Each: `{bufferPct, longTermPct, tradingPct, goalsPct, lifestylePct}`. User-editable. See §7. |
| `stage1End` | `number` | Buffer threshold for end of Stage 1. Default: `0` → runtime defaults to `6 × salary`. |
| `stage15End` | `number` | Buffer threshold for end of Stage 1.5. Default: `0` → runtime defaults to `12 × salary`. |
| `taxReservePct` | `number` | Tax reserve percentage. Default: 25. |
| `buffer` | `number` | Current savings buffer balance. |
| `tradingCapital` | `number` | Current trading account balance. |
| `tradingCapitalHighWater` | `number` | All-time peak of `tradingCapital`. Auto-updated by effect in App.jsx (~line 784). Skipped for `incomeType === 'fixed'`. |
| `longTerm` | `number` | Long-term investment account balance. |
| `futureGoals` | `number` | Shared goals pool balance. All goals track against this single number. |
| `goals` | `Array<{id, name, target}>` | Goal definitions. Progress = `futureGoals / goal.target`. |
| `bufferProtectActive` | `boolean` | Auto-managed — set true when buffer drops below `bufferProtectThreshold`, false when it reaches `bufferTarget`. |
| `snapshots` | `Array<{date, buffer, tradingCapital, longTerm, totalAssets, salary, monthsCovered, stage}>` | Time-series data. One per calendar day max; deduped by date. |
| `tradingPnLHistory` | `Array<{month, pnl, id}>` | Monthly trading P&L log entries. |
| `profitAllocations` | `Array` | Historical profit allocation records. |
| `impulses` | `Array<impulse>` | All logged spending events. See impulse shape below. |
| `pending` | `Array<pendingItem>` | Sleep-on-it items awaiting buy/cancel decision. |
| `spendingGateThreshold` | `number` | Amount above which the impulse gate fires. Default: 50. |
| `lastSnapshot` | `string\|null` | ISO date string of last snapshot. |
| `setupComplete` | `boolean` | True after onboarding is completed. Controls whether onboarding shows. |
| `setupMonth` | `string\|undefined` | `"YYYY-MM"` of the month setup was completed. Written once in `Onboarding.jsx` finish(). Never overwritten. Used to suppress the false "last month carried forward" banner during the user's first calendar month. If absent (accounts created before this field existed), falls back to deriving the month from `createdAt`. |
| `lastBackupDate` | `string\|null` | ISO timestamp of last file backup. |
| `envelopes` | `Array<envelope>` | Budget envelopes. See envelope shape below. |
| `lastEnvelopeRollover` | `string\|null` | `"YYYY-MM"` of last completed rollover. Compared to previous month key to detect pending rollover. |
| `envelopeRolloverHistory` | `Array<rolloverRecord>` | Audit log of every rollover. |
| `reviewedMonths` | `Array<string>` | Months user has completed monthly review for. |
| `displayName` | `string` | User's display name in header. |
| `overridePin` | `string` | **Legacy** — plain-text PIN. Kept only for migration. Prefer `pinHash`. Clear after migrating. |
| `pinHash` | `string` | PBKDF2-derived hash of user's PIN. Verified via `verifyPin()` in `pinHash.js`. Empty string = no PIN set. |
| `tradingGuardUntil` | `number\|null` | Unix timestamp until which trading guard is active. Auto-expired by effect. |
| `notificationPreferences` | `object` | `{dailyEnabled, weeklyEnabled, monthlyEnabled, preferredTime, timezoneIana}`. Synced to `push_subscriptions` table. |
| `currency` | `string` | ISO 4217 code. Default: `'ZAR'`. Used by `makeFmt()` everywhere. |
| `incomeType` | `'variable'\|'fixed'\|'mixed'\|'foundation'\|null` | Income profile. `null` = legacy user, defaults to showing all features. See §4. |
| `mode` | `'foundation'\|undefined` | **Legacy field**. Foundation mode was originally tracked here before `incomeType` existed. Check `data.mode === 'foundation' || data.incomeType === 'foundation'` — not just one or the other. |
| `_version` | `number` | Auto-incremented on every data write. Used for conflict detection. Stripped before Supabase write (restored in-memory). |
| `_localModifiedAt` | `number` | Unix timestamp of last local write. Used for conflict resolution. Stripped before Supabase write. |
| `_syncedAt` | `string` | ISO timestamp from `user_data.updated_at` after a successful cloud load. Stripped before Supabase write. |

### Envelope shape

```js
{
  id: string,              // Stable ID. Discretionary always uses 'env_discretionary'.
  name: string,
  cap: number,             // Monthly budget. Grows after a 'roll' rollover.
  blockMode: 'soft'|'hard'|'pin',
  rolloverMode: 'reset'|'roll'|'sweep',
  icon: string,            // Key into ENVELOPE_ICONS in Budget.jsx
  isDiscretionary: boolean // True on exactly one envelope — the catch-all for untagged spend.
}
```

### Impulse shape

```js
{
  id: number,              // Date.now() at log time
  name: string,
  amount: number,
  // category: string,     // DEPRECATED 2026-05-09 — no longer written by any path.
                           //   Legacy entries may still have it; readers MUST ignore it.
                           //   See CHANGELOG: "Impulse Category Removal".
  envelopeId: string|null, // null = legacy entry; treated as Discretionary in all read paths
  trigger: string|null,
  timestamp: number,       // Unix ms
  wasGated: boolean,
  overrideUsed: boolean|undefined,
  overrideAt: number|undefined,
}
```

### Pending item shape

```js
{
  id: number,
  name: string,
  amount: number,
  // category: string,     // DEPRECATED 2026-05-09 — see impulse shape note above
  envelopeId: string|null, // Already resolved to Discretionary at write time (see §4)
  timestamp: number,
  status: 'pending'|'bought'|'cancelled',
}
```

### Rollover record shape

```js
{
  month: string,           // "YYYY-MM"
  timestamp: number,
  summary: Array<rolloverItem>, // rolloverItems snapshot — see warning in §10
  totalSwept: number,
}
```

---

## 4. Critical Patterns and Conventions

### Pattern: Untagged impulses route to Discretionary

**Rule:** When filtering impulses by envelope, never use `i.envelopeId === env.id` alone. Legacy impulses logged before the envelope system existed have `envelopeId: null` and must be counted against the Discretionary envelope.

Two equivalent forms — use the one already present in the file you're editing:

**Form A — "resolve-then-compare"** (used in `Budget.jsx` and `RolloverModal.jsx`):
```js
const discId = envelopes.find(e => e.isDiscretionary)?.id ?? null;
// ...inside filter:
const eid = i.envelopeId ?? discId;
return eid === env.id;
```

**Form B — explicit OR** (used in `App.jsx` stats for Discretionary-only paths):
```js
if (discretionaryEnv)
  return i.envelopeId === discretionaryEnv.id || i.envelopeId == null;
return !i.envelopeId;
```

**Do NOT use:** `i.envelopeId === env.id` alone — this silently drops all legacy null entries.

**Used in:**
- `App.jsx` — `stats.thisMonthImpulses` filter (~line 786) — Discretionary-only, drives `spendingLeft`
- `App.jsx` — `lastSpent` calculation in Command tab "Last month" IIFE — Discretionary rollover context
- `App.jsx` — `stats.envelopeBreakdown` computation — uses Form A to cover all envelopes
- `Budget.jsx` — `envelopeSpending` useMemo (~line 228)
- `RolloverModal.jsx` — `rolloverItems` useMemo (~line 26)

---

### Pattern: Total-spend vs Discretionary-spend — two separate stats

**Rule:** The Command tab "This Month" card shows total spending across ALL envelopes. Other parts of the codebase (Impulse Control tab gate threshold, `spendingLeft` maths) still use Discretionary-only spend. Do not conflate the two.

| Stat | Covers | Used for |
|---|---|---|
| `stats.thisMonthSpend` | Discretionary envelope only (+ legacy nulls) | `spendingLeft`, impulse gate remaining-budget warning |
| `stats.totalMonthSpend` | All envelopes, all impulses this month | Command tab primary number, compact Spending card |
| `stats.totalBudgetAllEnvelopes` | Sum of all envelope caps | Command tab "of R X budgeted" label and progress bar |
| `stats.envelopeBreakdown` | Per-envelope array sorted by spent desc | Command tab "This month by envelope" rows |

**Rule:** All Command tab spending display references must read from `stats.totalMonthSpend` and `stats.envelopeBreakdown`. Any new spending display added to Command must follow the same pattern or the displays will diverge (see Bug Log §5 — Multiple spending displays out of sync).

**`envelopeBreakdown` shape** (set in `stats` useMemo, `App.jsx`):
```js
{
  id: string,
  name: string,
  cap: number,
  spent: number,
  isDiscretionary: boolean,
  isOver: boolean,  // true when spent > cap && cap > 0
}
```
Sorted by `spent` descending. Includes envelopes with `cap > 0 || spent > 0`. Top 5 shown in UI; remainder indicated by "+N more" link.

### Pattern: Income-type-aware UI

**Rule:** Use `data.incomeType !== 'fixed'` to show trading UI. Use `data.mode === 'foundation' || data.incomeType === 'foundation'` to detect foundation mode. **Never** use just `data.incomeType === 'foundation'` — the legacy `mode` field must also be checked.

```js
const isFoundation = data.mode === 'foundation' || data.incomeType === 'foundation';
const showTrading  = !isFoundation && data.incomeType !== 'fixed';
```

**Reason:** `null` (legacy users) must see all features including trading. Foundation mode was stored in `data.mode` before `incomeType` existed. Fixed-income users see everything except trading.

**Used in:** `MobileBottomNav` (~line 155), desktop nav (~line 1009), `ProfitAllocator` tab label, `Command` balance card grid, drawdown banner, high-water-mark auto-update effect.

### Pattern: Backward-compatible field access

**Rule:** Always use defensive access when reading data fields that may not exist in older stored objects.

```js
(data.fieldName || 0)          // numeric fields
(data.fieldName || [])         // array fields
data.fieldName ?? defaultValue // nullable scalars
data.stage1?.goals ?? 0        // nested optional fields
```

**Reason:** Users in the wild have localStorage data from earlier app versions with fewer fields. `setData({ ...defaultData, ...parsed })` at load time handles most cases, but any field added after their last save won't exist.

### Pattern: Discretionary envelope rollover protection

**Rule:** The Discretionary envelope must never have `rolloverMode === 'reset'`. It must always roll over so the spending cap accumulates unused budget.

Three defense layers:
1. `Budget.jsx` editor excludes `reset` from the rollover mode options for the Discretionary envelope.
2. Migration `useEffect` in `App.jsx` (~line 647) forces any existing Discretionary envelope with `rolloverMode: 'reset'` to `'roll'`.
3. `RolloverModal.jsx` computes `effectiveMode` per item: `env.isDiscretionary && env.rolloverMode === 'reset' ? 'roll' : env.rolloverMode`. All downstream logic reads `effectiveMode`, not `rolloverMode`.

### Pattern: discCap vs spendingBudget

**Rule:** Display "spending budget" from `stats.discCap`, not `data.spendingBudget`.

```js
const discCap = discretionaryEnv?.cap ?? (Number(data.spendingBudget) || 0);
```

**Reason:** After a `roll` rollover, the Discretionary envelope's cap grows beyond the original `spendingBudget`. Command and Budget must show the same figure. `stats.discCap` is the single source of truth.

**Used in:** `App.jsx` stats useMemo (~line 742), Command tab spending display.

### Pattern: Impulse write paths — resolve envelopeId at write time

**Rule:** All three paths that create impulse records must resolve `null` envelopeId to Discretionary at write time.

- **`logImpulse`** in ImpulseTab (~line 3348): `const resolvedEnvelopeId = envelopeId || discretionaryEnv?.id || null`
- **`sleep()`** in ImpulseTab (~line 3371): same resolution pattern into `pending` item
- **Buy button** for pending items (~line 2322): `envelopeId: item.envelopeId || (d.envelopes || []).find(e => e.isDiscretionary)?.id || null`

The read paths (stats, Budget, RolloverModal) then handle any remaining `null` entries as a belt-and-suspenders fallback.

### Pattern: Safe-area inset compensation

**Rule:** Because `index.html` sets `viewport-fit=cover` and `apple-mobile-web-app-status-bar-style: black-translucent`, the status bar overlays web content. Any element that appears at the top of the screen must add `env(safe-area-inset-top)` padding.

Affected elements and how they compensate:
- **App header** (`App.jsx` ~line 968): `paddingTop: 'env(safe-area-inset-top)'`
- **Onboarding overlay** (`Onboarding.jsx` outer div): `paddingTop: 'env(safe-area-inset-top)'`
- **Skeleton loader** (`App_v2.jsx` fake header row): `paddingTop: 'calc(20px + env(safe-area-inset-top))'`
- **Bottom nav**: uses `paddingBottom: 'env(safe-area-inset-bottom)'` and `height: 64` so content pads correctly below the home indicator.

### Pattern: Currency formatting

**Rule:** Always use `makeFmt(data.currency)` to produce a formatter, then call `fmt(amount)`. Never construct currency strings manually.

```js
const fmt = makeFmt(data.currency);
// ...
fmt(stats.thisMonthSpend)  // → "R 1,500"
```

`makeFmt` pins `en-US` locale so comma separators are consistent across SA/EU device locales.

### Pattern: Admin detection

**Rule:** Admin tab visibility is controlled by `ADMIN_MOBILE_EMAILS` array in `App.jsx` (~line 148). Currently hardcoded:

```js
const ADMIN_MOBILE_EMAILS = ['hello@royalledger.app', 'fasathor@gmail.com'];
```

This is checked in both `MobileBottomNav` and the desktop nav. See §10 for the tech debt note.

---

## 5. Historical Bug Log

### Process: Stale-bundle false positive when diagnosing runtime errors (2026-05-09)

**Symptom:** Owner reported a runtime error with stack trace `at reset (App.jsx:6986:5) ... at onClick (App.jsx:7127:13)` for `setCategory is not defined`. This was the same error the previous Bug Log entry had already fixed.

**Diagnosis:** Source file `src/App.jsx` is ~5,300 lines. Stack trace referenced lines 6986 and 7127. **Bundled output line numbers do not map to source line numbers.** Lines that exceed the source file's total length are a strong signal that the browser is running a stale cached bundle, not that there's a new bug at those locations.

**Prevention rule:** Before re-fixing any reported runtime error:
1. Compare the maximum line number in the stack trace against `wc -l src/App.jsx`. If trace lines > source lines, the user is on a stale bundle.
2. Run `Grep` for the missing identifier across `src/`. Zero matches confirms the source is clean.
3. Check the latest build's bundle hash. If the user's browser console reports a hash that doesn't match the latest `dist/assets/index-*.js`, they're stale.
4. If all three indicate stale cache, do not re-fix. Instead: instruct the user to hard refresh, unregister service worker, clear site data, or reinstall the PWA.

**Why this matters:** Re-fixing already-fixed bugs wastes time, churns CHANGELOG/feedback log entries, and can introduce new regressions if the "fix" overcorrects.

---

### Bug: ImpulseTab `reset()` ghost setter reference after state hook removal (2026-05-09)

**Symptom:** Spending Gate crashed silently after every Skip / Sleep / Buy decision. Component disappeared from DOM; user had to reload to recover.

**Location:** `src/App.jsx` — `ImpulseTab.reset()`.

**Root cause:** The "Impulse Category Removal" change (same date) deleted the `const [category, setCategory] = useState('')` hook from `ImpulseTab` and removed `setCategory` calls from the write paths (`logImpulse`, `sleep`). A leftover `setCategory('')` call inside `reset()` was missed. Every gate decision finishes by calling `reset()`, which threw `ReferenceError: setCategory is not defined`.

**Why the build didn't catch it:** Vite/ESBuild only fails on syntax errors and import-time issues. Undefined identifiers inside function bodies are runtime errors, not compile errors. `npx vite build` returned green despite the bug. ESLint with `no-undef` would have caught it; current config does not enforce this.

**Fix applied:** Removed the `setCategory('')` call from `reset()`. Build verified.

**How it could be reintroduced:** Any future refactor that removes a `useState` hook from a component without searching the rest of the component for setter references. Specifically: setters can hide in `reset()` functions, `useEffect` cleanup callbacks, dependency arrays, and event handlers.

**Prevention rule:** When deleting a `useState` hook, always run `Grep` for the setter name across the entire component file before claiming the refactor is complete. This is a 5-second check that catches the entire class of bug.

---

### Change: Removed impulse `category` field (2026-05-09)

**Background:** Pre-defined six-bucket category list (food / clothes / tech / online / family / other) was attached to every impulse via Spending Gate and QuickLog forms. Audit confirmed it was write-once, display-only — no analytics, no filtering, no charts, no exports depended on it.

**Why removed:** Redundant with the envelope tag (which actually drives budget enforcement) and the trigger field (which feeds `triggerStats` analytics in History tab). Tester feedback flagged the closed list as feeling unprofessional. Form simplification reduces friction on every impulse log.

**What changed:**
- `CATEGORIES` constant deleted from `src/App.jsx`
- `category` removed from impulse and pending-item write paths in `confirmPending`, `ImpulseTab.logImpulse`, `ImpulseTab.sleep`, and `QuickLog.log`
- `category` `<select>` removed from Spending Gate input form and QuickLog form
- `category` state hook (`useState`) removed from `ImpulseTab` and `QuickLog`
- `ImpulseTab.renderRow()` meta line rebuilt to render `[envelope] · [trigger]` only with em-dash fallback when both absent
- Lucide imports `Coffee`, `ShoppingBag`, `Package` removed (only used by the deleted constant)

**Backward compatibility:** Legacy entries with `category` populated continue to load. The field is harmlessly retained in the JSONB blob. No migration script — readers ignore it.

**How it could regress:** If a future feature tries to filter or chart by category, it would need to reintroduce the form input. Rebuild deliberately if needed; do not bring back the field for cosmetic reasons alone.

---

### Bug: RolloverModal — null envelopeId entries silently excluded from Discretionary spend (QA Issue #1)

**Symptom:** RolloverModal showed `spent: 0` for the Discretionary envelope when all impulses had `envelopeId: null` (legacy entries). Rollover sweep/roll amounts were wrong as a result.

**Location:** `src/components/RolloverModal.jsx` — `rolloverItems` useMemo.

**Root cause:** Filter used `i.envelopeId === env.id` which never matches `null`.

**Fix applied:** Switched to resolve-then-compare pattern:
```js
const discId = envelopes.find(e => e.isDiscretionary)?.id ?? null;
// ...
const eid = i.envelopeId ?? discId;
return eid === env.id;
```

**How it gets reintroduced:** Any refactor of the filter that removes the `?? discId` resolution or the `??` null-coalescing.

---

### Bug: RolloverModal — Discretionary envelope could rollover as 'reset' (QA Issue #2)

**Symptom:** If a Discretionary envelope had `rolloverMode: 'reset'` (possible via data restore or edge case), the month-end modal would reset its cap to zero instead of rolling forward unspent budget.

**Location:** `src/components/RolloverModal.jsx` — `rolloverItems` useMemo and `confirm` function.

**Fix applied:** Added `effectiveMode` computed field that overrides `rolloverMode` for Discretionary:
```js
const effectiveMode = env.isDiscretionary && env.rolloverMode === 'reset'
  ? 'roll'
  : env.rolloverMode;
```
All downstream code (`confirm`, `actionLabel`, category buckets) reads `effectiveMode`.

**How it gets reintroduced:** Reading `env.rolloverMode` instead of `item.effectiveMode` in `confirm()` or `actionLabel()`.

---

### Bug: Command tab spending stuck at zero (or wrong value)

**Symptom:** `stats.thisMonthSpend` showed R 0 or a stale value despite impulses being logged. Affected users who had existing impulses with `envelopeId: null`.

**Location:** `src/App.jsx` — `stats` useMemo, `thisMonthImpulses` filter (~line 728).

**Root cause:** Original filter was `i.envelopeId === discretionaryEnv.id` — excluded all legacy null entries.

**Fix applied:** Changed to `i.envelopeId === discretionaryEnv.id || i.envelopeId == null`. Propagated same fix to `lastSpent` calculation in Command "Last month" path (~line 1474).

---

### Bug: Budget tab envelope spending wrong for Discretionary

**Symptom:** Budget tab showed R 0 spent in Discretionary envelope despite impulses being logged. Same root cause as Command tab bug above.

**Location:** `src/components/Budget.jsx` — `envelopeSpending` useMemo (~line 228).

**Fix applied:** Added `discId` resolution before the spending accumulation loop. Uses resolve-then-compare form (`eid = imp.envelopeId ?? discId`).

---

### Bug: Impulse history invisible in History & Triggers tab

**Symptom:** History tab only showed current-month impulses; past months were invisible.

**Location:** `src/App.jsx` — `ImpulseHistory` component.

**Root cause:** The display filter was using the stats filter (which excludes non-Discretionary envelopes) instead of showing all impulses. Past-months grouping logic was missing entirely.

**Fix applied:**
- Added `thisMonthAll` (all impulses this month, not envelope-filtered) for display.
- Added `pastMonths` useMemo that groups all historical impulses by `YYYY-MM` key, sorted newest first.
- Added `envNameFor` helper: `env.isDiscretionary ? 'Spending' : env.name`.
- Updated `renderRow` to show envelope name on each row.

---

### Bug: "Last month carried forward" shown on first month

**Symptom:** Command tab showed e.g. "Last month: R 1,500 carried forward" for a user who had never used the app before — their first calendar month.

**Location:** `src/App.jsx` — Command tab carry-forward IIFE (~line 1465).

**Root cause:** The `else` branch (no `envelopeRolloverHistory` entry for previous month) fell through to a fallback calculation: `leftover = discEnv.cap - lastSpent`. On first month, `lastSpent = 0` because the app didn't exist last month, so `leftover = full budget` and the banner showed.

**Fix applied:** When setup completes, `Onboarding.jsx` now writes `setupMonth: "YYYY-MM"`. The carry-forward IIFE derives `setupMonthKey` from `data.setupMonth` (new) or `data.createdAt` (fallback for existing accounts). If `setupMonthKey === thisMonthKey`, return `null` before any calculation.

**How it gets reintroduced:** Removing the `setupMonthKey === thisMonthKey` guard or failing to write `setupMonth` in the Onboarding finish function.

---

### Bug: Tester Activity tab infinite flicker loop on RPC error

**Symptom:** Admin Dashboard → Tester Activity tab would flash a loading state endlessly when the RPC call returned an error — the UI appeared to flicker permanently.

**Location:** `src/components/AdminDashboard.jsx` — `fetchTesterActivity` + `useEffect` dependency on `testerLoaded`.

**Root cause:** `useEffect` re-triggered on every render because its condition was `!testerLoaded && !testerLoading`. `testerLoaded` was only set `true` in the `try` block — on error, it stayed `false`, so the effect kept firing.

**Fix applied:** Added `setTesterLoaded(true)` to the `catch` block. Refresh button resets `testerLoaded(false)` and `testerError(null)` before re-fetching.

**How it gets reintroduced:** Removing `setTesterLoaded(true)` from the `catch` block, or restructuring the effect condition so it can re-trigger on error.

---

### Bug: Tester Activity RPC "structure of query does not match function result type"

**Symptom:** `get_tester_activity_summary()` returned an error in the Admin Dashboard despite the SQL running fine in the SQL Editor. Persisted through DROP + recreate, `NOTIFY pgrst.reload`, and even deleting the function via the Supabase UI.

**Location:** `supabase/get-tester-activity-rpc.sql`

**Root cause:** PostgREST caches `RETURNS TABLE` function signatures in its schema cache. When the column list changes, the cached type definition conflicts with the new one. The cache survives DROP + recreate and `NOTIFY pgrst reload` under some Supabase hosting conditions.

**Fix applied:** Changed function signature from `RETURNS TABLE (...)` to `RETURNS jsonb`. Inside, `jsonb_agg(row_to_json(t)::jsonb)` packs the rows into a JSONB array. PostgREST has no type-matching problem with scalar `jsonb` returns. The JavaScript client receives an identical array structure.

**Rule:** For any admin-only RPC that returns rows with evolving columns, always use `RETURNS jsonb` + `jsonb_agg(row_to_json(t)::jsonb)` to avoid schema-cache conflicts. Never use `RETURNS TABLE` for frequently-changed RPCs.

---

### Bug: "Database error deleting user" when deleting from Supabase Auth dashboard

**Symptom:** Attempting to delete a user from the Supabase Auth dashboard returned "Database error deleting user." User remained in `auth.users` and in the Tester Activity tab.

**Location:** `supabase/activity-logs-migration.sql` — FK constraint on `user_activity_events`.

**Root cause:** The `user_activity_events.user_id` foreign key to `auth.users.id` was created without `ON DELETE CASCADE`. Supabase Auth's delete path hits the FK constraint before deleting the auth row.

**Fix applied:** Dropped and recreated the FK with `ON DELETE CASCADE`. File updated in `activity-logs-migration.sql`.

**Rule:** Any table that references `auth.users.id` as a FK **must** use `ON DELETE CASCADE` or `ON DELETE SET NULL`. Supabase Auth cannot delete users when child rows exist without cascade.

---

### Bug: Multiple spending displays out of sync (2026-05-09)

**Symptom:** Command tab showed inconsistent spending numbers between the large "This Month" card and the compact "Spending" mini-card. Impulses logged to named envelopes (Groceries, Transport, etc.) appeared in one display but not the other.

**Location:** `src/App.jsx` — two separate UI blocks in the Command tab:
1. Large "This month" card (~line 1405) — the primary spending control point
2. Compact "Spending" mini-card (~line 2322) — 2-column grid section below stages

**Root cause:** Both blocks rendered spending data independently. When `totalMonthSpend` was introduced to show all-envelope spend, only the large card was updated to use it. The mini-card continued reading `stats.thisMonthSpend` (Discretionary-only), causing visible inconsistency.

**Fix applied:** Mini-card updated so all three references use `totalMonthSpend`:
- Progress bar: `totalMonthSpend / discCap`
- "X spent" label: `totalMonthSpend`
- "X left" header: `Math.max(0, discCap - totalMonthSpend)`

**How it gets reintroduced:** Adding a third spending display anywhere in Command tab without using `stats.totalMonthSpend`.

**Rule:** All Command tab spending references must read from `stats.totalMonthSpend` (total across all envelopes). `stats.thisMonthSpend` is Discretionary-only and is only valid as the numerator for the main "left to spend" control number in the large card.

---

## 6. Authentication and Cloud Sync

### PIN authentication

PIN is 4–6 digits. Stored as PBKDF2-SHA256 in `data.pinHash` (Base64, ~44 chars). Salt: `'royal-ledger-pin-v1:' + email.toLowerCase()`. 100,000 iterations, 256-bit output. NEVER stored as plain text after migration.

Legacy hashes: 64-char lowercase hex (SHA-256). `verifyPin()` in `pinHash.js` detects format automatically (regex `/^[0-9a-f]{64}$/`) and verifies via the old algorithm. On next successful PIN save, the new PBKDF2 hash replaces it.

`data.overridePin` is the legacy plain-text PIN field. Read it only for backward-compat check (`hasPinProtection = !!(data.pinHash || data.overridePin)`). Clear `overridePin` whenever `pinHash` is set.

PIN reset flow: user submits request → inserted into `pin_reset_requests` table → admin approves in `AdminDashboard` → on next app load, `setPinResetApproved(true)` triggers `PinSetupScreen`.

### Supabase auth

Uses PKCE flow (`flowType: 'pkce'` in `supabase.js`). Auth token stored under `'sb-auth-token'` in localStorage (explicit for iOS PWA). Session auto-refreshes.

Password reset detection has three layers (see `AuthContext.jsx` header comment, ~line 14–52). This is intentionally complex — the URL and localStorage are read at module load time (synchronously, before `supabase-js` cleans them up) to survive the async initialization race. Do not simplify without understanding the timing constraints documented there.

### Cloud sync states

`syncStatus` in `App_v2.jsx`:
- `'idle'` — no indicator shown
- `'syncing'` — pulsing dot
- `'retry:N'` — retry attempt N (exponential backoff, 3 retries)
- `'synced'` — brief green flash
- `'failed'` — data saved locally, sync failed
- `'failed:rls'` — RLS error — user needs to re-authenticate

Offline: detected via `navigator.onLine`. Writes queue to `pendingSyncRef` and flush on `'online'` event.

### localStorage-to-cloud migration

First login with existing localStorage data triggers `MigrationModal`. User confirms → `importLocalToCloud()` in `dataLayer.js` upserts the local blob to Supabase. On subsequent logins, cloud wins if no version conflict.

**Version conflict** (`saveDataVersioned`): if local `_version > cloudVersion` and local timestamp is more than 30 seconds newer, `ConflictModal` appears. User picks local or cloud; the other is discarded.

---

## 7. Stage System Rules

Stages are determined by `data.buffer` vs computed thresholds in `stats` useMemo (`App.jsx` ~line 686):

| Stage | Trigger | Default buffer range |
|---|---|---|
| 1 | `buffer < stage1End` | 0 → 6× salary |
| 1.5 | `buffer >= stage1End` | 6× → 12× salary |
| 2 | `buffer >= stage15End` | 12× → 18× salary |
| 3 | `buffer >= stage2End` (= `bufferTarget`) | 18×+ salary |
| `'protect'` | `bufferProtectActive === true` | Overrides stage calc; shown separately |

`stage1End` and `stage15End` default to `salary * 6` and `salary * 12` when stored as `0`. `stage2End` = `bufferTarget` = `salary * bufferTargetMonths` (default 18).

Default allocation percentages (editable by user in Rules tab):

| | Buffer | Long-term | Trading | Goals | Lifestyle |
|---|---|---|---|---|---|
| Stage 1 | 100% | 0% | 0% | 0% | 0% |
| Stage 1.5 | 55% | 30% | 0% | 15% | 0% |
| Stage 2 | 65% | 20% | 0% | 15% | 0% |
| Stage 3 | 0% | 30% | 30% | 20% | 20% |

Percentages must sum to 100%. The Rules tab warns but **does not enforce** — saving an invalid sum is allowed. See §10.

**Fixed-income trading redirect:** At runtime in `ProfitAllocator` (~line 2768), when `data.incomeType === 'fixed'`, the `tradingPct` allocation is added to `goalsPct`:

```js
const effectiveGoalsPct = (rule.goalsPct ?? 0) + (data.incomeType === 'fixed' ? (rule.tradingPct ?? 0) : 0);
```

The stored `tradingPct` is not changed — only the computed allocation is adjusted. The "Trading Capital" line is hidden in the waterfall display for fixed-income users.

---

## 8. Things That Look Wrong But Aren't

**Manual rollover trigger in Budget tab (`MonthEndActions`).** The Budget tab has an "Apply rollover" button that appears in the last 3 days of the month. This is intentional — it forces user acknowledgment of what's happening to their budget. The auto-trigger (`RolloverModal`) fires at the start of the *next* month; the Budget tab button covers the overlap window.

**Snapshot button auto-downloads a file.** Clicking the camera/Snapshot button in the header records a snapshot AND triggers an immediate JSON backup file download. These are two distinct actions collapsed into one button on purpose ("two birds, one stone"). The backup file is named `ledger-backup-YYYY-MM-DD.json`.

**`data.spendingBudget === 0` users skip Discretionary migration.** The migration `useEffect` in `App.jsx` (~line 648) guards on `data.spendingBudget` being truthy before creating the Discretionary envelope: `if (loading || !data.setupComplete || !data.spendingBudget) return`. This is intentional — if a user has no spending budget, there's nothing to track.

**"Profit Allocator" becomes "Surplus Allocator" for fixed-income users.** Fixed-income users have no trading profits — "surplus" is the correct term. Label is computed inline: `data.incomeType === 'fixed' ? 'Surplus Allocator' : 'Profit Allocator'`.

**"Money Allocator" for Foundation mode.** Same pattern — `isFoundation ? 'Money Allocator' : ...`.

**Weekly Pulse Banner renders inline below the Check Pulse button, not at the top of the Command tab.** On mobile, the banner was previously placed near the top of the Command tab content. When the user scrolled down to tap "Check pulse," the banner would render far above where they were looking. The banner now renders immediately above the Check Pulse button so it appears inline in context. Do not move it back to the top.

**Re-run setup wizard was intentionally removed from Settings.** It was removed because making it trivially easy to restart the full setup flow would let users quietly reset their baseline whenever their numbers became uncomfortable — defeating the discipline purpose of the product. Individual field edits in the Setup tab handle legitimate changes (income update, expense adjustment). A full wizard re-run is a support-level action, not a self-service one. Do not re-add it without deliberate product decision.

**`localStorage` key is `'open-trader-finance-v2'`.** The app was renamed Royal Ledger after launch. The key predates the rename. Do NOT change it without writing a migration that reads the old key and writes to the new one — existing users have years of data under `open-trader-finance-v2`.

**`main.jsx` exists but is not used.** It's a legacy entry point without auth or routing. The live entry point is `main_v2.jsx` (referenced directly in `index.html`). Keep `main.jsx` for reference but don't update it.

**`data.mode` field checked alongside `data.incomeType`.** Foundation mode was initially stored in `data.mode = 'foundation'`. When `incomeType` was added, Foundation became `incomeType: 'foundation'`. Both must be checked everywhere: `data.mode === 'foundation' || data.incomeType === 'foundation'`.

**Goals share a single balance (`futureGoals`).** There is no per-goal tracking. `data.goals` is an array of `{id, name, target}` and the progress bar for each goal shows `futureGoals / goal.target`. This is not a bug — it's a deliberate simplification.

---

## 9. Build and Deploy

```bash
npm install      # install dependencies
npm run dev      # local dev server (Vite, default port 5173)
npm run build    # production build → dist/
npm run preview  # preview production build locally
npm run release:check  # build + reminder to work through RELEASE_CHECKLIST.md
```

Deploys to Cloudflare Pages. The marketing site is at `royalledger.app`; the dashboard is at `my.royalledger.app`. PWA `start_url` is `/app?source=pwa`.

Pre-deploy checklist:
1. npm run build passes
2. Tested locally before push
3. CHANGELOG.md updated
4. TESTER_FEEDBACK_HANDBOOK.md updated (if feedback-driven)
5. DEVELOPMENT_NOTES.md updated (if patterns/architecture changed)
6. Tester notified (if their feedback was acted on)

### Required environment variables

Create `.env.local` (gitignored):

```
VITE_SUPABASE_URL=<project URL>
VITE_SUPABASE_ANON_KEY=<anon key>
```

Without these, the app runs in local-only mode (no auth, no sync). The warning is logged to console. Do NOT add `VITE_SUPABASE_SERVICE_ROLE_KEY` — the service role key must never be in client code.

### Supabase dashboard config required for auth to work

- Authentication → URL Configuration → Site URL: `https://royalledger.app`
- Redirect URL allowlist must include a wildcard pattern like `https://royalledger.app**` so `?type=recovery` is preserved through the PKCE redirect. Without this, Layer 1b of reset detection fails (Layer 2 localStorage fallback still catches same-browser flows).

---

## 10. Future Considerations / Known Tech Debt

- **Hardcoded admin emails.** `ADMIN_MOBILE_EMAILS` in `App.jsx` (~line 148) should eventually move to an environment variable or a Supabase role/claim. Current value: `['hello@royalledger.app', 'fasathor@gmail.com']`.

- **Historical rollover summaries may have inflated `unspent` values.** `envelopeRolloverHistory[].summary` entries recorded before QA Issue #1 was fixed will show incorrect `unspent` figures for the Discretionary envelope (null-envelopeId entries were not counted). This is accepted residual risk — the buffer and cap values are correct; only the historical display is wrong.

- **Stage allocation sum-to-100 validation warns but does not block.** The Rules tab shows a red warning when percentages don't sum to 100% but still saves. A future improvement would prevent saving an invalid ruleset.

- **`App.jsx` is ~5,300 lines.** All tab components live inline. This makes searching manageable but the file should eventually be split by tab.

- **`data.goals` progress tracking is shared-pool only.** There's no per-goal savings ring-fencing. If the user wants to track e.g. "Car fund" separately from "Emergency extension," they currently can't — all goals draw from `data.futureGoals`. Separate balances per goal would require a data migration.

- **Invite code expiry is 30 days from assignment.** `early_access_leads.invite_code_expires_at` (timestamptz) is written when a code is generated or sent. `validate_lead_invite_code()` rejects codes where `expires_at < now()`. Codes created before this field existed have `expires_at = NULL` and are still accepted (grandfathered). To revoke access before expiry, set the lead's status to anything other than `invited` or `active` in the Admin dashboard.

- **Push notification cron worker is external.** Entries in `notification_queue` are processed by a cron function deployed separately from this repo. TODO: verify the function name and whether it lives in the Supabase project's `supabase/functions/` directory.

- **`tradingCapitalHighWater` does not reset on `incomeType` change.** If a user switches from variable to fixed income, the high-water mark stays in place. The drawdown calculation would then show a permanent phantom drawdown. Low priority but worth noting.

- **`data.bufferProtectActive` is auto-managed** — do not give users an explicit toggle. The activate/deactivate effect in `App.jsx` (~line 772) handles it. Manual toggle would fight the effect.

- **User activity events accumulate over time.** At 60-second pings, a fully active user can generate up to ~1,440 rows per day. For the tester phase with fewer than 10 users this is acceptable (under ~15K rows/week total). When Royal Ledger reaches 50+ users, add a cleanup job to delete `user_activity_events` rows older than 90 days.

---

## 11. Tester Activity Tracking

`public.user_activity_events` exists to verify real tester usage during the compensated testing phase. It is NOT marketing analytics. Do not add event types without deliberate intent.

### Why it exists

Testers receive compensation (R200 voucher). The table provides evidence that they actually used the app, answerable with one SQL query. See `admin/ADMIN_QUERIES.sql` for the full inspection playbook including the canonical weekly usage signal query.

### Event types

| Event | Fires when | Where |
|---|---|---|
| `login` | User transitions from unauthenticated to authenticated | `AppRouter` in `App_v2.jsx` |
| `app_open` | App loads with an authenticated user | `AppRouter` in `App_v2.jsx` |
| `activity_ping` | Every 60 seconds, visible tab, recent interaction | `AuthenticatedApp` in `App_v2.jsx` |

### Deduplication

- `login` and `app_open` are guarded by `sessionStorage` keys (`royal_ledger_login_logged`, `royal_ledger_app_open_logged`). Both fire at most once per browser session and are cleared on logout.
- `activity_ping` requires a user interaction (click, keypress, touchstart, pointerdown) within the last 60 seconds. Page Visibility API prevents pings from firing in hidden/background tabs.

### Admin Dashboard — Tester Activity tab

The Admin Dashboard → Tester Activity tab calls `get_tester_activity_summary()` (Supabase RPC). This function:
- Queries `auth.users` LEFT JOIN `user_activity_events` for the last 7 days.
- Returns `jsonb` (not `RETURNS TABLE`) to avoid PostgREST schema-cache type-matching errors. See Bug Log §5.
- Is admin-only: validates caller email against `('hello@royalledger.app', 'fasathor@gmail.com')` inside the function body.
- Status logic: `active` = 3+ distinct days AND 10+ `activity_ping` events; `weak` = 1+ days; `inactive` = no events.

**Two separate data sources in Admin:**
- **Users tab** reads `early_access_leads` — people who requested access or were invited. "ACTIVE" status here means the lead was invited and activated, NOT that they signed up.
- **Tester Activity tab** reads `auth.users` — people who completed signup. A lead only appears here after they successfully create a Supabase account using their invite code.

### FK constraint — required for user deletion

`user_activity_events.user_id` must have `ON DELETE CASCADE` to `auth.users.id`. Without it, the Supabase Auth dashboard cannot delete users (FK violation). Migration is in `supabase/activity-logs-migration.sql`.

### Implementation files

- `src/lib/analytics.js` — `logEvent(eventType)` function. Silent fail. Guards on `isSupabaseConfigured` and null `supabase` client (local-only mode).
- `src/App_v2.jsx` — integration: `AppRouter` handles login/app_open, `AuthenticatedApp` handles activity_ping interval + interaction listeners.
- `supabase/get-tester-activity-rpc.sql` — RPC definition. Returns `jsonb`.
- `admin/ADMIN_QUERIES.sql` — six SQL queries for Supabase SQL Editor inspection.

---

## 12. Contextual Help Tooltip System

### Component: `HelpTip`

`src/components/HelpTip.jsx` — drop-in inline help button. Takes `title` (string) and `children` (React content).

```jsx
<HelpTip title="Buffer Stages">
  Explanation text here. Can include <strong> and <br /> for formatting.
</HelpTip>
```

**Behaviour:**
- Renders a 15×15px `?` circle button, muted (`#4A4038`) at rest, gold (`#C4A96B`) when open.
- Click to open/close (not hover — hover doesn't work on mobile).
- Popover is portal-rendered into `<body>` so it is never clipped by `overflow: hidden` parents.
- Positions below the trigger by default; flips above if less than 180px below the viewport bottom.
- Clamps horizontally to viewport edges with a 12px margin.
- Repositions on scroll and resize while open.
- Fade-in animation via `@keyframes rl-helptip-in` injected into `<head>` (also portal-rendered).

### Profile-aware content rule

Tooltips that reference features must use profile flags to show only relevant content. Do not write a tooltip that mentions "trading capital" to a foundation or fixed-income user.

```jsx
// Use flags already in scope at each call site:
const isFoundation = data.mode === 'foundation' || data.incomeType === 'foundation';
const showTrading  = !isFoundation && data.incomeType !== 'fixed';

<HelpTip title="Current Balances">
  {isFoundation
    ? 'Savings, money available, long-term, and future goals...'
    : showTrading
      ? 'Trading capital, buffer, salary account, long-term, and future goals...'
      : 'Buffer, salary account, long-term, and future goals...'
  }
</HelpTip>
```

### Current placements

| Location | Title | Profile-aware? |
|---|---|---|
| Command → "This month" heading | Spending Budget | ✅ foundation vs others |
| Command → Buffer stage label | Buffer Stages | ✅ fixed ("surplus") vs variable ("profits") |
| Command → "Current balances" heading | Current Balances | ✅ all three profiles |
| Header → Net Worth display | Net Worth | ✅ all three profiles |
| Daily Checkpoints card (`RitualCard.jsx`) | Daily Checkpoints | — same for all |
| Budget → Month-end mode pills | Month-End Mode | — same for all |
| Profit Allocator tab heading | Money / Surplus / Profit Allocator | ✅ all three profiles |
| Impulse Control tab heading | Impulse Control | — same for all |
| Trading P&L → Drawdown Protocol | Drawdown Protocol | — only renders for traders |
