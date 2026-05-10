# Royal Ledger — Architecture

> Last updated: 2026-05-10. Read this before opening any source file.

---

## Overview

Royal Ledger is a personal finance OS for variable-income earners. It runs as a Progressive Web App (PWA). The live dashboard is at `my.royalledger.app/app`. The public marketing site is at `royalledger.app`.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 |
| Build tool | Vite 7 |
| PWA | vite-plugin-pwa (injectManifest strategy, custom `src/sw.js`) |
| Auth + DB | Supabase (`@supabase/supabase-js` v2.105) |
| Charts | Recharts |
| Icons | Lucide React |
| CSS | Tailwind CSS (utility classes, not PostCSS modules) |
| TypeScript | ❌ None — plain JSX throughout |

---

## Entry Points and Routing

```
index.html
  └── src/main_v2.jsx            ← ACTIVE entry point
        └── BrowserRouter
              ├── /app           → AppShell → App_v2 → OpenFinanceApp (App.jsx)
              └── /*             → MarketingSite (src/marketing/)
```

**`src/main.jsx`** — Legacy entry, no router, no auth. Not used in production. `index.html` imports `main_v2.jsx`.

On `my.royalledger.app` all non-`/app` paths redirect to `/login` (server-side redirect, configured in hosting platform).

---

## Component Hierarchy

```
App_v2 (auth shell)
  ├── AuthProvider (context)
  ├── ConflictModal (version conflict resolution)
  ├── MigrationModal (localStorage → cloud one-time import)
  ├── SyncIndicator (bottom-right status pill)
  └── OpenFinanceApp (src/App.jsx — the entire app)
        ├── PinContext.Provider
        ├── Onboarding (full-screen overlay, first run only)
        ├── PinSetupScreen (full-screen, no pinHash set)
        ├── BlockedScreen (full-screen, trading guard active)
        ├── MobileBottomNav (fixed, mobile only)
        ├── InstallPrompt (A2HS banner)
        └── Tab content (inline components in App.jsx)
              ├── Command   (Home tab)
              ├── ImpulseTab
              ├── Budget (src/components/Budget.jsx)
              ├── TradingTab (variable income only)
              ├── ProfitAllocator
              ├── Setup
              ├── History
              ├── Rules
              ├── AccountSettings
              └── AdminDashboard (src/components/AdminDashboard.jsx)
```

---

## Data Flow

```
User action
  → setData(newData)            in App.jsx
  → localStorage write          immediate, synchronous
  → saveToCloud(newData)        debounced 800ms
    → saveDataVersioned()       in dataLayer.js
      → Supabase upsert         user_data table, JSONB data column
```

On load:
```
App_v2 mounts
  → loadFromCloud(userId)       reads user_data from Supabase
  → if cloud newer than local   offer ConflictModal
  → else merge with defaultData spread and setData
  → if no cloud data + localStorage has data → MigrationModal
```

---

## File Structure

### Core application

| File | Purpose |
|---|---|
| `src/App_v2.jsx` | Auth wrapper. Handles: login page, Supabase session, cloud load/save loop, conflict modal, migration modal, sync indicator. Passes props into `OpenFinanceApp`. |
| `src/App.jsx` | **Main application** (~5,300 lines). Every tab, all state, all business logic. `OpenFinanceApp` is the default export. |
| `src/main_v2.jsx` | Entry point. BrowserRouter, `AppShell` + `MarketingSite` route split. |
| `src/main.jsx` | Legacy entry — not used. |

### Components

| File | Purpose |
|---|---|
| `src/components/Onboarding.jsx` | Multi-step first-run wizard. 8+ steps. Foundation branch at Steps 7–8. |
| `src/components/Budget.jsx` | Envelope system — list, editor, spending, `MonthEndActions`. |
| `src/components/RolloverModal.jsx` | Auto-triggered month-end rollover. Sweep-to-buffer + roll logic. |
| `src/components/MonthlyReview.jsx` | Monthly review modal. Exports `useShouldShowReviewModal`. |
| `src/components/MigrationModal.jsx` | One-time localStorage → cloud import on first sign-in. |
| `src/components/AdminDashboard.jsx` | Owner-only. Invite codes, access requests, PIN resets, Tester Activity. |
| `src/components/HelpTip.jsx` | Contextual `?` popover. Portal-based, smart repositioning. |
| `src/components/PinGate.jsx` | `usePinGate`, `usePinRowGate`, `useSectionPin` hooks. |
| `src/components/PinContext.jsx` | React context: `{ pin, pinHash, email }`. |
| `src/components/NotificationSettings.jsx` | Push notification prefs. Exports `PushPromptBanner`. |
| `src/components/WeeklyPulseBanner.jsx` | Weekly check-in banner. |
| `src/components/InstallPrompt.jsx` | PWA install prompt (A2HS). |

### Lib

| File | Purpose |
|---|---|
| `src/lib/supabase.js` | Supabase client. PKCE flow, `storageKey: 'sb-auth-token'`, explicit `window.localStorage` for iOS PWA. |
| `src/lib/dataLayer.js` | All Supabase ops: loadData, saveData, saveDataVersioned, importLocalToCloud, invite/access CRUD, push subscriptions, queueNotification. |
| `src/lib/pinHash.js` | PBKDF2-SHA256 (100k iterations, email-as-salt). Transparent legacy SHA-256 handling in `verifyPin`. |
| `src/lib/currency.js` | `CURRENCIES` list (10 currencies), `getCurrency(code)`, `makeFmt(code)`. Pins `en-US` locale. |
| `src/lib/analytics.js` | Analytics event logging. |
| `src/lib/timezones.js` | IANA timezone list for notification prefs. |
| `src/contexts/AuthContext.jsx` | Auth state: login, signUp, sendMagicLink, resetPassword, updatePassword. Three-layer PKCE recovery detection. |

### Marketing

`src/marketing/` — public site at `royalledger.app`. Entirely separate from the app. Not in scope here.

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `user_data` | Primary data store. One row per user. Columns: `user_id`, `data` (JSONB), `updated_at`. |
| `invite_codes` | Closed-beta gate codes. Managed via AdminDashboard. |
| `access_requests` | Users who requested access without a code. |
| `early_access_leads` | Admin-generated invite codes tied to email addresses. |
| `push_subscriptions` | Web Push subscription objects + user notification preferences. |
| `notification_queue` | Queued instant notifications (drawdown alerts, stage changes, PIN overrides). |
| `pin_reset_requests` | PIN reset requests submitted by users. Approved by admin. |
| `user_activity_events` | Tester activity log. FK to `auth.users` with `ON DELETE CASCADE`. |

---

## Storage Keys

| Storage | Key | Content |
|---|---|---|
| localStorage | `open-trader-finance-v2` | Full data JSON blob (offline copy). **Do not rename** — existing users have data here. |
| localStorage | `sb-auth-token` | Supabase session (explicit `storageKey` in supabase.js for iOS PWA stability). |
| localStorage | `sb-auth-token-code-verifier` | PKCE code verifier. Read synchronously at module load in AuthContext.jsx. |

---

## Critical Design Decisions

### Single-table JSONB strategy
All user data lives in one JSONB column (`user_data.data`). Schema is fluid — new fields are added by spreading `defaultData` over stored data on load. This means any field added after a user's last save gets its default automatically. Trade-off: no Postgres column-level querying on user data; reporting goes through JSONB operators.

### Offline-first
Data writes always go to localStorage first, then Supabase. `saveToCloud` is debounced (800ms). If Supabase is unreachable, `SyncIndicator` shows "Offline — saved locally." On reconnect, the next user action triggers the debounced save.

### No TypeScript
Intentional for iteration speed. The codebase relies on careful conventions (documented in `DEVELOPMENT_NOTES.md` and `memory/PATTERNS.md`) rather than compile-time types. Do not add TypeScript without explicit owner decision.

### Income type system
Four income profiles: `foundation`, `fixed`, `variable`, `mixed`. Internal values are stable; display labels are decoupled. See `memory/PATTERNS.md` for the full rule set.

---

## What Not to Break

1. **localStorage key** `open-trader-finance-v2` — renaming this orphans all existing users.
2. **`data.incomeType` values** — `'foundation'`, `'fixed'`, `'variable'`, `'mixed'` — display labels can change; these cannot.
3. **`isFoundation` derivation** — always `data.mode === 'foundation' || data.incomeType === 'foundation'`. Never check only one.
4. **`storageKey: 'sb-auth-token'`** — explicit for iOS PWA. Removing causes session loss on iOS home screen apps.
5. **`main_v2.jsx`** as the entry point — `index.html` imports this, not `main.jsx`.
6. **`ON DELETE CASCADE`** on `user_activity_events.user_id` — required for Supabase Auth user deletion.
