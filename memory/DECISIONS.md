# Royal Ledger — Architecture Decisions

> Permanent record of significant design decisions, why they were made, and what would happen if reversed. Last updated: 2026-05-10.

---

## D001 — Single JSONB blob strategy

**Decision:** All user data lives in one row in `user_data` with a single JSONB `data` column. No column-per-field, no normalised tables for user data.

**Why:** Rapid iteration. Adding a new data field requires no schema migration — just add it to `defaultData` and it's there on the next load. The `{ ...defaultData, ...loadedData }` spread handles migration automatically.

**Trade-offs:**
- No Postgres column-level querying on user fields (fine for single-user per row)
- No foreign key enforcement between user data fields (acceptable — client is the authority)
- Admin reporting must use JSONB operators or pull and process in JS

**What breaks if reversed:** Every field addition requires a Supabase migration. Field defaults no longer come free from `defaultData` spread. Significant operational overhead for a single-owner product in beta.

---

## D002 — Internal incomeType values frozen

**Decision:** The `incomeType` field values (`'foundation'`, `'fixed'`, `'variable'`, `'mixed'`) are permanently frozen. Display labels are decoupled and change freely.

**Why:** Every conditional in the 5,300-line codebase branches on these values. Every user's Supabase row stores one of these values. Renaming them would silently break all existing users' data and all conditional logic simultaneously.

**History:** Labels have already changed multiple times:
- F024 (2026-05-09): Picker cards redesigned from profile names to situation descriptions
- F028 (2026-05-10): "Trading" → "Trading / Self-employed"; "Mix" → "Mixed"
- F030 (2026-05-10): "Mixed" → "Hybrid"

**What breaks if reversed:** All existing users' `incomeType` field would not match any conditional. Every `isFoundation`, `showTrading`, `data.incomeType === 'fixed'` check would produce wrong results. No runtime error — silent logic failures.

---

## D003 — No TypeScript

**Decision:** Plain JSX throughout. No TypeScript.

**Why:** Iteration speed during early product development. The founder is the sole developer. Type safety is provided by patterns and conventions (documented), not the compiler.

**Trade-offs:** No compile-time catch of type errors, undefined identifiers in function bodies, or wrong prop shapes. ESLint with `no-undef` would partially compensate but is not currently enforced.

**Do not reverse without owner decision.** Adding TypeScript mid-project to a 5,300-line single-file app requires a migration plan that temporarily reduces iteration velocity.

---

## D004 — `main_v2.jsx` as entry point (not `main.jsx`)

**Decision:** `index.html` imports `src/main_v2.jsx`, which adds BrowserRouter + auth. The legacy `src/main.jsx` (no router, no auth) exists but is unused.

**Why:** `App_v2.jsx` was an additive auth wrapper around the existing `App.jsx`. To avoid touching `index.html` repeatedly, `main_v2.jsx` was created as a complete replacement. The old entry was kept for reference.

**Risk:** An agent or developer might read `main.jsx` and assume it's the entry point. `index.html` is the authoritative source — check it first.

---

## D005 — Offline-first: localStorage before Supabase

**Decision:** Every `setData` call writes to localStorage immediately and synchronously. Supabase write is debounced 800ms.

**Why:** The app must work with spotty mobile connections. Data must never be lost because a save failed. localStorage is the ground truth; Supabase is the sync layer.

**What breaks if reversed:** Data loss on network interruption. Users who add expenses on mobile in a low-signal area would lose the entry on page reload.

---

## D006 — PKCE auth flow, explicit localStorage, stable storageKey

**Decision:** Supabase client is configured with `flowType: 'pkce'`, `storage: window.localStorage`, and `storageKey: 'sb-auth-token'`.

**Why:**
- PKCE is more reliable on mobile WebKit (Safari/iOS). Implicit flow has issues with SameSite cookies on some iOS versions.
- Explicit `storage: window.localStorage` is required for iOS PWA. Without it, the app tries to use `sessionStorage` in the PWA sandbox, losing the session on navigation.
- Stable `storageKey` prevents session loss when the key is auto-generated from the Supabase URL (which changes if the project URL changes).

**What breaks if reversed:** iOS users who install the PWA lose their session on every app open. PKCE removal could break password reset flows on mobile browsers.

---

## D007 — `isFoundation` must check both `data.mode` and `data.incomeType`

**Decision:** `isFoundation = data.mode === 'foundation' || data.incomeType === 'foundation'`

**Why:** Foundation mode was originally tracked in `data.mode` before `incomeType` existed. Users who onboarded during the `data.mode` era have `mode: 'foundation'` but may not have `incomeType: 'foundation'`. Checking only `incomeType` would treat these legacy users as non-Foundation.

**What breaks if reversed:** Legacy Foundation users see the wrong UI (standard profile features instead of Foundation Arc). No runtime error — silent wrong behaviour.

---

## D008 — Drawdown Protocol gates on `incomeType === 'variable'` explicitly

**Decision:** High-water mark auto-update and the drawdown banner condition use `incomeType === 'variable'`, not `!isFoundation && incomeType !== 'fixed'`.

**Why:** Hybrid (`'mixed'`) has a Capital Pool but does NOT have the Drawdown Protocol. Using `!== 'fixed' && !isFoundation` incorrectly included Hybrid. Fixed in F033 (2026-05-10).

**What breaks if reversed:** Hybrid users with a Capital Pool balance see a Drawdown Protocol warning when their balance drops. Their capital allocation routing still works — only the banner and HWM tracking would be wrong.

---

## D009 — Mismatch modal lives in Onboarding, not App.jsx

**Decision:** The Foundation profile mismatch modal (F024 Commit 3) is computed and rendered inside `Onboarding.jsx`, not as a `useEffect` in App.jsx.

**Why:** The trigger condition (`incomeType === 'foundation' && monthsCovered >= 12 && !mismatchCheckShown`) could be satisfied by existing users if they later edit their balances. If the modal ran on every Command tab load, those users would see it retroactively. By running it only inside `finish()`, it fires exactly once per onboarding session.

**What breaks if reversed:** Existing users who edit their balances to satisfy the trigger condition would see the modal on their next app load. Users who have already set `mismatchCheckShown: true` are protected, but users from before that field existed are not.

---

## D010 — Admin emails hardcoded in `ADMIN_MOBILE_EMAILS`

**Decision:** The admin tab is shown only to emails in a hardcoded array in App.jsx: `['support@royalledger.app', 'fasathor@gmail.com']`.

**Why:** Single-owner product. No user-management system needed. Hardcoding is intentional simplicity.

**Tech debt acknowledged:** If the admin email changes or multiple admins are needed, update the array and redeploy. Consider moving to a Supabase RLS role check if the admin team grows beyond 2-3 people.

---

## D011 — `returns jsonb` for admin RPCs (not `RETURNS TABLE`)

**Decision:** `get_tester_activity_summary()` and any frequently-changed admin RPC must use `RETURNS jsonb` + `jsonb_agg(row_to_json(t)::jsonb)`.

**Why:** PostgREST caches `RETURNS TABLE` function signatures. When the column list changes, the cached type conflicts. This conflict survives DROP + recreate and even `NOTIFY pgrst reload` under some hosting conditions. `RETURNS jsonb` avoids schema cache type-matching entirely.

**What breaks if reversed:** Admin RPC returns "structure of query does not match function result type" error on any column change. Fix requires recreating with the old signature or using the `jsonb` return type.

---

## D012 — `_goalSaved` uses balance-driven switching, not stage-driven

**Decision:** `_goalSaved = futureGoals > 0 ? futureGoals : buffer` — not `progressStage >= 2 ? futureGoals : buffer`.

**Why:** The stage-driven version caused a cliff: when the user crossed the Stage 2 boundary, `_goalSaved` switched from `buffer` ($106K) to `futureGoals` ($0) in one frame. The progress bar dropped to $0. Balance-driven switching means the transition is invisible — it only switches when the goals pool actually has money.

**History:** F036 (2026-05-10). First draft used `progressStage < 2` guard.

**What breaks if reversed:** Progress bar drops to $0 at the Stage 2 boundary for any Foundation user who hasn't yet received a goals pool allocation.
