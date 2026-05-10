# Royal Ledger — Onboarding System

> Documents the first-run wizard flow, what each step collects, and what `finish()` writes. Last updated: 2026-05-10.

---

## Overview

`src/components/Onboarding.jsx` is a 10-step full-screen wizard shown when `data.setupComplete` is false. It renders over a full-screen overlay with `env(safe-area-inset-top)` padding for iOS notch safety.

On completion, it calls `onComplete()` in the parent (App.jsx), which sets `showOnboarding` to false and routes to the `command` tab.

---

## Step Map

| Step | Title | What it collects |
|---|---|---|
| 1 | Welcome | Currency selection (10 currencies; default ZAR) |
| 2 | How it works | Informational — no data collected |
| 3 | Income profile | `incomeType`: foundation / fixed / variable / mixed |
| 4 | Monthly expenses | `expenses[]`, `customExpenses[]` |
| 5 | Envelope tracking | Which expenses get their own envelope; rollover mode per envelope |
| 6 | Spending budget + buffer reserve | `spendingBudget`, `bufferReserve` |
| 7 | Buffer target | `bufferMonths` (default 18). Foundation branch also shows optional savings goal section. |
| 8 | Starting balances | `buffer`, `tradingCapital`, `longTerm`, `futureGoals` |
| 9 | PIN setup | Collects and hashes the user's 4–6 digit PIN |
| 10 | Summary + notifications | Notification permissions; shows computed salary and buffer target |

**Total steps: 10.** Progress bar shows `step / 10`.

---

## Income Profile Step (Step 3)

Four options rendered as picker cards:

| Card | Internal value written |
|---|---|
| 🌱 Building from zero | `'foundation'` |
| 💼 Salary | `'fixed'` |
| 📈 Trading / Self-employed | `'variable'` |
| ⚡ Hybrid | `'mixed'` |

`incomeType` controls which branches appear in later steps (e.g. Step 7 Foundation goal section, Step 8 trading capital field) and which features are shown post-onboarding.

---

## Expense Step (Step 4)

Eight suggested expense rows are shown (Rent, Utilities, Groceries, Transport, Phone, Insurance, School, Family support). User enters amounts. Custom expenses can be added.

- `expenseTotal` = sum of all entered amounts
- `salary` = `expenseTotal + spendingBudget + bufferReserve`

This derived `salary` drives the buffer target calculation and the Foundation stage thresholds.

**Gate at Step 5 → 6:** If any variable-cost expense (Groceries, Transport, Family) has a value but no envelope tracking selected, the user sees a gate warning: "You have variable costs that aren't tracked." They can proceed anyway or go back to enable tracking.

---

## Envelope Creation (Step 5)

During onboarding, each expense that has a non-zero value AND `envelopeTracking[name] === true` becomes an envelope.

Smart defaults: variable-cost keywords (groceries, food, transport, fuel, family, kids, household) pre-toggle tracking ON. Fixed-cost keywords (rent, bond, mortgage, insurance, school, phone) default OFF.

Each envelope gets a `rolloverMode` (reset/roll/sweep). Default for tracked items: `'roll'`.

The **Discretionary** envelope is always created:
- `id: 'env_discretionary'`
- `isDiscretionary: true`
- `rolloverMode: 'roll'` (never `'reset'` — enforced by three defense layers)
- `cap` = `spendingBudget`

---

## Foundation Goal Step (Step 7 — Foundation branch only)

Below the milestone roadmap cards in Step 7, Foundation users see an optional goal section:
- Name field: "What are you saving toward?" (e.g. Laptop, Emergency fund, Course)
- Target amount field: only shown once a name is entered

This is optional. If left blank, `data.goals` is not written.

If filled in, `finish()` writes the goal to `data.goals` as `goals[0]` (prepended), so the YOUR SAVINGS card on the Command tab auto-populates on first launch without the user needing to navigate to Setup → Goals.

**Standard profiles are unaffected.** The goal section is inside the Foundation branch of Step 7 only.

---

## PIN Step (Step 9)

- Accepts 4–6 digit numeric input
- Validates match on confirm field
- Hashed via `hashPin(pin, userEmail)` (PBKDF2-SHA256, 100k iterations, email-as-salt) before write
- Written to `data.pinHash`
- `data.overridePin` is cleared on finish (legacy plain-text PIN migration)

If the user somehow exits without completing PIN setup, `PinSetupScreen` will intercept app access on next load.

---

## The `finish()` Function

`finish()` is an async function that:
1. Converts `expenseValues` + `customExpenses` → `data.expenses[]`
2. Builds `newEnvelopes[]` (Discretionary + one per tracked expense)
3. Creates initial snapshots array entry
4. Builds a single object passed to `setData()` with all collected fields
5. If `incomeType === 'foundation'` and goal name provided → prepends to `data.goals`
6. If `incomeType === 'foundation'` and `monthsCovered >= 12` and `!mismatchCheckShown` → fires mismatch modal before calling `onComplete()`

### Fields written by `finish()`

| Field | Value |
|---|---|
| `currency` | Selected currency code |
| `incomeType` | Profile choice |
| `mode` | `'foundation'` if Foundation (legacy field compat), else removed |
| `expenses` | Expense array |
| `spendingBudget` | Spending budget amount |
| `bufferReserve` | Buffer reserve amount |
| `bufferTargetMonths` | Buffer months (default 18) |
| `buffer` | Starting buffer balance |
| `tradingCapital` | Starting trading capital (variable/mixed only) |
| `longTerm` | Starting long-term balance |
| `futureGoals` | Starting goals balance |
| `envelopes` | Envelope array |
| `lastSyncedSpendingBudget` | Set to `spendingBudget` (prevents false delta on first sync) |
| `pinHash` | Hashed PIN |
| `overridePin` | Cleared to `''` |
| `setupComplete` | `true` |
| `setupCompleteAt` | ISO timestamp (written once; `d.setupCompleteAt \|\| new Date().toISOString()` for re-run safety) |
| `setupMonth` | `"YYYY-MM"` of current month — suppresses false "Last month carried forward" banner on first month |
| `notificationPreferences` | `{ dailyEnabled: true, weeklyEnabled: true, monthlyEnabled: true, preferredTime: morningTime, timezoneIana }` |
| `snapshots` | `[{ date, buffer, tradingCapital, longTerm, totalAssets, salary }]` initial snapshot |
| `goals` | `[{ id, name, target, createdAt }]` if Foundation goal provided |
| `mismatchCheckShown` | Set in modal handlers, not in finish() itself |

---

## Mismatch Modal (F024 Commit 3)

After `finish()` completes the data write but before `onComplete()` routes the user to the app, a mismatch check runs:

**Trigger:** `incomeType === 'foundation' && monthsCovered >= 12 && !mismatchCheckShown`

If triggered, `setMismatchModalOpen(true)` shows a full-screen overlay explaining that Foundation is designed for low-base users and that this user's balances suggest they might be better served by a different profile.

**User choices:**
- Switch to Salary / Trading / Hybrid → updates `incomeType` + `mode`, writes `mismatchCheckShown: true`, calls `onComplete()`
- Stay on Foundation → writes `mismatchCheckShown: true`, calls `onComplete()`

**Why it's in Onboarding, not App.jsx:** The check must run exactly once per account. If it ran on every Command tab load, existing users who later edit their balances to satisfy the condition would see the modal retroactively. See `memory/PATTERNS.md` for the full rule.

---

## Skip Path

`Onboarding` accepts a "Skip" button at specific steps. On skip, `finish()` is called with default values. `setupCompleteAt` is still written using `d.setupCompleteAt || new Date().toISOString()`.

---

## What Not to Break

1. **`setupCompleteAt` write pattern** — must use `d.setupCompleteAt || new Date().toISOString()` to be re-run safe. Never overwrite an existing value.
2. **Foundation goal write** — prepend to `data.goals` (not append). `goals[0]` is the primary goal slot the Command tab reads.
3. **`setupMonth` write** — must be written in `finish()`. The Command tab carry-forward suppression depends on it.
4. **Mismatch modal must block `onComplete()`** — Onboarding must stay mounted until the modal is resolved. `setupComplete: true` in the data does not unmount Onboarding (parent reads local React state `showOnboarding`, not `data.setupComplete`).
