# Royal Ledger — Code Patterns

> Canonical patterns used throughout the codebase. Follow these exactly — deviations silently break things. Last updated: 2026-05-10.

---

## P001 — Foundation check

```js
// ALWAYS check both fields — legacy users may have mode but not incomeType
const isFoundation = data.mode === 'foundation' || data.incomeType === 'foundation';
```

Never: `data.incomeType === 'foundation'` alone — misses legacy `mode` field users.

---

## P002 — Trading profile check

```js
// ALWAYS use explicit equality — not negation
const showTrading = data?.incomeType === 'variable';
```

Never: `!isFoundation && data.incomeType !== 'fixed'` — incorrectly includes Hybrid (`'mixed'`).

Hybrid has Capital Pool and Profit Allocator, but **not** Trading P&L tab, not Drawdown Protocol, not emotional trading guard.

Every component that renders trading-conditional copy must declare its own `const showTrading`. It is not inherited from a parent.

---

## P003 — Drawdown Protocol gate

```js
// ALWAYS gate on explicit 'variable' — not !== 'fixed' or !isFoundation
if (data.incomeType === 'variable') {
  // high-water mark update, drawdown banner, etc.
}
```

The high-water mark `useEffect` returns early when `incomeType !== 'variable'`. The drawdown zone banner condition uses `data.incomeType === 'variable' && stats.drawdownZone !== 'normal' && data.tradingCapital > 0`.

---

## P004 — Currency formatting

```js
// At component level (not per-call)
const fmt = makeFmt(data.currency);

// Every money display
fmt(12500)      // "R 12,500"
fmt(1_500_000)  // "R 1.5M"
fmt(null)       // "R 0"
```

Never: string concatenation, `Number.toLocaleString()` without `'en-US'`, or manual currency symbols.

`makeFmt(null)` and `makeFmt(undefined)` both fall back to ZAR. Do not add `?? 'ZAR'` guards at call sites.

---

## P005 — Backward-compatible field access

```js
(data.fieldName || 0)          // numeric fields
(data.fieldName || [])         // array fields
data.fieldName ?? defaultValue // nullable scalars
data.stageRules?.stage1?.goals ?? 0  // nested optionals
```

Reason: Users in the wild have localStorage from older app versions. Any field added since their last save won't exist in their data object. The `{ ...defaultData, ...loadedData }` spread handles most cases, but new code should still be defensive.

---

## P006 — Impulse → Envelope attribution (read path)

Two forms — use whichever is already present in the file you're editing:

**Form A (resolve-then-compare):**
```js
const discId = envelopes.find(e => e.isDiscretionary)?.id ?? null;
// inside filter:
const eid = i.envelopeId ?? discId;
return eid === env.id;
```

**Form B (explicit OR, Discretionary-only):**
```js
return i.envelopeId === discretionaryEnv.id || i.envelopeId == null;
```

Never: `i.envelopeId === env.id` alone — drops all legacy `null` entries silently.

---

## P007 — Impulse → Envelope attribution (write path)

All three write paths must resolve `null` to Discretionary at write time:

```js
const resolvedEnvelopeId = envelopeId || discretionaryEnv?.id || null;
```

Write paths: `logImpulse()`, `sleep()`, Buy button for pending items.

---

## P008 — Discretionary cap display

```js
// Always read from stats, never from data.spendingBudget directly
const discCap = discretionaryEnv?.cap ?? (Number(data.spendingBudget) || 0);
// Or from the pre-computed stat:
stats.discCap
```

Reason: After a `roll` rollover, the Discretionary cap grows beyond `spendingBudget`. Using `spendingBudget` directly shows a wrong (lower) number.

---

## P009 — Foundation stage denominator (`Math.max` guard)

```js
const envelopeTotal = (data.envelopes || []).reduce((s, e) => s + (Number(e.cap) || 0), 0);
const foundationMonthlyNeeds = Math.max(
  stats.salary,
  envelopeTotal + (Number(data.bufferReserve) || 0)
);
const foundationMonths = isFoundation
  ? (foundationMonthlyNeeds > 0 ? data.buffer / foundationMonthlyNeeds : 0)
  : (stats.salary > 0 ? data.buffer / stats.salary : 0);
```

The `Math.max` is the defence against a prematurely-triggered Foundation Complete banner. Without it, users with no Setup expenses get a tiny `salary` value, inflating `foundationMonths`. See F019/F022. **Do not remove this `Math.max`.**

Apply only to `foundationMonths`. Do not apply to `stats.monthsCovered` — non-Foundation profiles use that field and the guard doesn't apply to them.

---

## P010 — `_goalSaved` (Foundation savings proxy)

```js
const _goalSaved = isFoundation
  ? ((data.futureGoals || 0) > 0
      ? (data.futureGoals || 0)   // Goals pool funded — track it
      : (data.buffer || 0))       // Not yet funded — use buffer as proxy
  : (data.futureGoals || 0);

const savingsProgress = primaryGoal?.target > 0
  ? _goalSaved / primaryGoal.target
  : 0;
```

**Balance-driven**, not stage-driven. Switches from `buffer` to `futureGoals` only when `futureGoals > 0` — prevents the Stage 2 boundary cliff. See F036.

Apply this derived variable everywhere Foundation savings progress is displayed — both the YOUR SAVINGS card and the Foundation Command dashboard card.

---

## P011 — PIN gate hooks

Three hook levels:

```js
// Action-level (single button)
const { attempt, gate } = usePinGate();
// Usage:
{gate}  // render the gate modal in JSX
<button onClick={() => attempt(openGoalEditor)}>Edit goal</button>

// Row-level (table row edit)
const { attempt, gate } = usePinRowGate(rowId);

// Section-level (whole tab)
const { SectionGate, unlock } = useSectionPin('setup');
// Usage:
<SectionGate />
```

PIN-protected surfaces: Setup tab, Rules tab, Edit/Add goal (goal editor), Trading structural edits.

---

## P012 — Safe-area inset compensation

`index.html` has `viewport-fit=cover` and `apple-mobile-web-app-status-bar-style: black-translucent`. Status bar overlays content.

Every element at the **top** of the viewport must add:
```css
padding-top: env(safe-area-inset-top)
```

Every element at the **bottom** (nav bar, fixed banners) must add:
```css
padding-bottom: env(safe-area-inset-bottom)
```

Affected: App header (`App.jsx`), Onboarding overlay, Skeleton loader (`App_v2.jsx`), Bottom nav, Sync indicator.

The Sync indicator moves above the bottom nav on mobile:
```css
@media(max-width:767px) { bottom: calc(76px + env(safe-area-inset-bottom, 0px)) }
```

---

## P013 — Rollover mode protection for Discretionary

Three defence layers — all must remain:

1. **Budget.jsx editor**: exclude `'reset'` from the options for `isDiscretionary` envelopes
2. **App.jsx migration effect**: force Discretionary `rolloverMode: 'reset'` → `'roll'` on every load
3. **RolloverModal.jsx**: compute `effectiveMode = env.isDiscretionary && env.rolloverMode === 'reset' ? 'roll' : env.rolloverMode`; use `effectiveMode` everywhere downstream

---

## P014 — Admin detection

```js
const ADMIN_MOBILE_EMAILS = ['support@royalledger.app', 'fasathor@gmail.com'];
const isAdminUser = ADMIN_MOBILE_EMAILS.includes(user?.email?.toLowerCase());
```

Check in both `MobileBottomNav` and desktop nav. When the owner email changes or a new admin is added, update this array in both places.

---

## P015 — `setupCompleteAt` write pattern (re-run safe)

```js
setupCompleteAt: d.setupCompleteAt || new Date().toISOString()
```

Never: `new Date().toISOString()` unconditionally — would overwrite on every re-run of finish(). The timestamp is used to compute `daysSinceSetup` for Foundation Arc time guards. Overwriting it resets the clock.

---

## P016 — Onboarding mismatch modal must block `onComplete()`

The modal must render **inside** the Onboarding component (not App.jsx). The parent's `showOnboarding` state is not set to false until `onComplete()` is called. `onComplete()` must not be called until the modal resolves.

```
finish() → writes data → setMismatchModalOpen(true) → modal renders
    → user clicks "Switch" or "Stay" → writes mismatchCheckShown: true → onComplete()
```

Do not move modal logic to App.jsx or add a `useEffect` watching `data.mismatchCheckShown`. This would fire for existing users who later edit their balances to satisfy the trigger condition.

---

## P017 — `RETURNS jsonb` for admin RPCs

```sql
create or replace function get_tester_activity_summary()
returns jsonb
language plpgsql
security definer
as $$
declare result jsonb;
begin
  -- ...query...
  select jsonb_agg(row_to_json(t)::jsonb) into result from (...) t;
  return coalesce(result, '[]'::jsonb);
end;
$$;
```

Never: `RETURNS TABLE (col1 type, ...)` for RPCs with columns that may change — PostgREST schema cache conflicts survive DROP + recreate.

---

## P018 — useState hook removal checklist

When removing a `useState` hook from any component:
1. Grep the setter name across the entire component file
2. Check: `reset()` functions, `useEffect` cleanup callbacks, `dependency arrays`, event handlers, child component calls
3. Remove every call site before marking the refactor complete
4. Run `npm run build` — build succeeds even with orphan calls (runtime errors only)

This prevents the `setCategory is not defined` class of bug (F021).
