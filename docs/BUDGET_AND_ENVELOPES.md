# Royal Ledger — Budget and Envelopes

> Covers the envelope budgeting system: data model, spending rules, rollover logic, and known gotchas. Last updated: 2026-05-10.

---

## Overview

The Budget tab (`src/components/Budget.jsx`) implements an envelope-style monthly budget. Each envelope represents a spending category with a monthly cap. Spending is tracked through the Impulse Control system and tagged to envelopes.

---

## Envelope Data Model

Envelopes live in `data.envelopes` (array). Each envelope:

```js
{
  id: string,              // Stable, unique. Discretionary always 'env_discretionary'.
  name: string,
  cap: number,             // Monthly budget cap. Grows after a 'roll' rollover.
  blockMode: 'soft' | 'hard' | 'pin',
  rolloverMode: 'reset' | 'roll' | 'sweep',
  icon: string,            // Key into ENVELOPE_ICONS in Budget.jsx
  isDiscretionary: boolean // Exactly one envelope has this true.
}
```

---

## Block Modes

| Mode | Behaviour |
|---|---|
| `soft` | Warning shown but purchase can proceed |
| `hard` | Purchase blocked when over cap |
| `pin` | PIN required to approve purchases over cap |

---

## Rollover Modes

| Mode | End-of-month behaviour |
|---|---|
| `reset` | Cap resets to original value. Unused budget is lost. |
| `roll` | Unspent balance carries forward. Cap grows: `cap += (cap - spent)`. |
| `sweep` | Unspent balance is swept to the buffer account. Cap resets. |

---

## The Discretionary Envelope

**Every account has exactly one Discretionary envelope** (`isDiscretionary: true`, `id: 'env_discretionary'`). This is the catch-all for:
- All impulses logged without tagging a specific envelope
- Legacy impulses created before the envelope system existed (`envelopeId: null`)

### Critical rule: Discretionary must never have `rolloverMode: 'reset'`

Three defense layers enforce this:

1. **Budget.jsx editor** — `reset` option is excluded from the rollover mode dropdown for the Discretionary envelope
2. **Migration effect** in App.jsx (~line 647) — on every load, if Discretionary envelope has `rolloverMode: 'reset'`, it is forced to `'roll'`
3. **RolloverModal.jsx** — computes `effectiveMode` per envelope. For Discretionary: `env.rolloverMode === 'reset' ? 'roll' : env.rolloverMode`. All downstream rollover logic uses `effectiveMode`.

### Discretionary cap vs spendingBudget

After a `roll` rollover, the Discretionary envelope's cap grows beyond the original `spendingBudget`. All display code must read `stats.discCap` (derived as `discretionaryEnv?.cap ?? Number(data.spendingBudget)`), never `data.spendingBudget` directly.

---

## Impulse → Envelope Attribution

### Write paths (three locations — all resolve null at write time)

| Location | Code |
|---|---|
| `logImpulse` (ImpulseTab) | `const resolvedEnvelopeId = envelopeId \|\| discretionaryEnv?.id \|\| null` |
| `sleep()` (ImpulseTab) | Same resolution pattern |
| Buy button for pending items | `item.envelopeId \|\| (d.envelopes \|\| []).find(e => e.isDiscretionary)?.id \|\| null` |

### Read paths (null-safe — belt and suspenders)

Legacy impulses with `envelopeId: null` must be counted under Discretionary. Two equivalent patterns are used:

**Form A (resolve-then-compare):**
```js
const discId = envelopes.find(e => e.isDiscretionary)?.id ?? null;
const eid = i.envelopeId ?? discId;
return eid === env.id;
```
Used in: `Budget.jsx envelopeSpending`, `RolloverModal.jsx rolloverItems`

**Form B (explicit OR for Discretionary-only):**
```js
return i.envelopeId === discretionaryEnv.id || i.envelopeId == null;
```
Used in: `App.jsx stats.thisMonthImpulses filter`

**Never use** `i.envelopeId === env.id` alone — drops all legacy null entries silently.

---

## Spending Stats — Two Separate Aggregates

| Stat | What it covers | Used for |
|---|---|---|
| `stats.thisMonthSpend` | Discretionary only (+ legacy nulls) | `spendingLeft`, impulse gate warnings |
| `stats.totalMonthSpend` | ALL envelopes, all impulses this month | Command tab primary spending number |
| `stats.totalBudgetAllEnvelopes` | Sum of all envelope caps | Command tab "of R X budgeted" label |
| `stats.envelopeBreakdown` | Per-envelope array, sorted spent desc | Command tab envelope rows |

**Command tab display must read `totalMonthSpend` and `envelopeBreakdown`.** Do not use `thisMonthSpend` for Command tab display — it only covers Discretionary.

### `envelopeBreakdown` shape

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
Sorted by `spent` descending. Top 5 shown in UI; remainder shown as "+N more" link.

---

## Month-End Rollover

### Auto-trigger

`RolloverModal` shows automatically when `lastEnvelopeRollover` is behind the current month. The check happens on every app load inside `App.jsx` via `useShouldShowReviewModal` hook.

### What rollover does

For each envelope:
- `reset` mode: cap returns to original value, carried balance discarded
- `roll` mode: unspent balance added to cap → `newCap = cap + (cap - spent)`. Negative (overspent) envelopes reduce cap in next month
- `sweep` mode: unspent balance transferred to buffer (`data.buffer += unspent`), cap resets

Result is written back to `data.envelopes` and a record added to `data.envelopeRolloverHistory`.

### Manual trigger

Budget tab shows a "Roll over this month" button (`MonthEndActions` component) for users who want to trigger rollover early.

---

## Budget Tab Features

- Envelope list with spent/cap progress bars
- Edit mode: rename, change cap, change block mode, change rollover mode, change icon
- Add new envelope button
- Delete envelope (with confirmation)
- `MonthEndActions` — manual rollover trigger + history log

---

## Supabase-Level Cap-Sync Effect

When `spendingBudget` changes in Setup, the Discretionary envelope cap must stay in sync. App.jsx has a `useEffect` that:
1. Checks if `data.spendingBudget !== data.lastSyncedSpendingBudget`
2. Computes delta: `delta = newBudget - lastSynced`
3. Applies delta to Discretionary cap: `discEnv.cap += delta`
4. Updates `lastSyncedSpendingBudget = newBudget`

This preserves rollover-accumulated balance while keeping the base cap aligned with the spending budget. **Do not** simply set `discEnv.cap = newBudget` — that would erase accumulated roll balance.

---

## What Not to Break

1. **Discretionary rolloverMode** — see three-layer defence above. Removing any layer risks `'reset'` appearing.
2. **Null envelopeId reads** — always use Form A or Form B. Never `=== env.id` alone.
3. **`stats.discCap`** — only read from here, never `data.spendingBudget` directly, in display code.
4. **Delta cap-sync** — must apply delta, not overwrite. Overwriting erases carried rollover balance.
5. **`totalMonthSpend` vs `thisMonthSpend`** — wrong stat in the wrong place silently shows wrong numbers.
