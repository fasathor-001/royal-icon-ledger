# Royal Ledger — Known Issues

> Active issues being monitored or deliberately deferred. Not bugs to fix immediately — these are tracked here so they're not rediscovered later. Last updated: 2026-05-10.

---

## KI001 — Foundation Arc: no time/activity guard for day-0 stage progression

**Feedback ID:** F024 / F025  
**Status:** Monitoring — no code fix deployed  
**Severity:** 🟡 UX Confusion (not a data defect)

**What happens:** A new Foundation user who enters pre-existing savings (e.g. R 5M) during onboarding can trigger the "Foundation Complete" milestone banner immediately on first app load, before doing any financial activity. The math is correct — their buffer divided by monthly needs genuinely satisfies the 12-month threshold.

**Why it's not fixed yet:** The root question is whether Foundation is the right profile for a user with pre-existing wealth. Fixing the time guard might mask the deeper profile-routing gap. Owner is observing tester behaviour before committing to either:
- Option A: Time guard (`daysSinceSetup >= 30` before Foundation Complete fires)
- Option B: Wealth-signal detection in onboarding (suggest a different profile when starting balances are high)

**Constraints any future fix must respect:**
- Must not break F022 defensive denominator (`Math.max` guard in `foundationMonths` derivation)
- Must not regress users who genuinely build to Foundation Complete over time
- `setupCompleteAt` field already exists and can power Option A with no data migration

**When to revisit:** If a second tester reports the day-0 banner sensation, or if the original tester disengages. See F024/F025 in `TESTER_FEEDBACK_HANDBOOK.md`.

---

## KI002 — Fixed profile: "Capital %" column label misleads Salary users

**Feedback ID:** F029  
**Status:** Pending — no Fixed testers in beta yet  
**Severity:** 🟡 UX Confusion (anticipated)

**What happens:** Fixed (`'fixed'`) profile users see a "Capital %" column in their allocation rules table (Settings → Profit allocation by stage). For Fixed users, this column's value is silently redirected to Goals (`effectiveGoalsPct = goalsPct + tradingPct` for `incomeType === 'fixed'`). A user who enters a value in "Capital %" expecting it to build a capital balance will see it go to Goals instead.

**Resolution options:**
- Option A: Rename column to "Goals %" for Fixed users: `data.incomeType === 'variable' ? 'Trading %' : data.incomeType === 'fixed' ? 'Goals %' : 'Capital %'`
- Option B: Hide the column entirely for Fixed users and zero `tradingPct`

Option A is display-only and safe. Option B touches the allocation engine.

**When to fix:** When the first Fixed tester surfaces or the owner prioritises it. Confirm no active Fixed testers have non-zero `tradingPct` before Option B.

---

## KI003 — AdminDashboard and EarlyAccess show "Mixed" instead of "Hybrid"

**Feedback ID:** F031  
**Status:** Deliberate hold  
**Severity:** ⚪ Housekeeping

**What happens:** `AdminDashboard.jsx` and `EarlyAccess.jsx` display the label "Mixed" for `incomeType === 'mixed'`. The user-facing label was renamed to "Hybrid" in F030, but these two surfaces were excluded from scope.

**Why held:** AdminDashboard is owner-only (no tester sees it). EarlyAccess is a pre-signup funnel page where profile terminology hasn't landed. Neither causes user confusion today.

**When to fix:** When the owner next touches either file, or when an admin needs a consistent vocabulary. Resolution is a display-only rename — `id: 'mixed'` field unchanged, zero data impact.

---

## KI004 — `data.savingsGoal` orphan in existing Supabase rows

**Feedback ID:** F034 (cleanup note)  
**Status:** Monitoring — no migration script deployed  
**Severity:** ⚪ Data hygiene

**What happens:** Users who used the YOUR SAVINGS "Set Goal" editor before F034 (2026-05-10) have a `data.savingsGoal` field in their Supabase JSONB row. After F034, this field is effectively deprecated — the editor now reads/writes `data.goals[0]`. The old value is harmlessly retained in the JSONB blob but is never read.

**Impact on users:** These users see "Set a goal" on first post-F034 load (because `data.goals` is empty). They must re-enter their goal via the updated editor. One-time friction.

**If a migration is ever needed:**
```js
// In dataLayer.js or a one-time script:
// For each user: if data.savingsGoal exists and data.goals is empty,
// write { goals: [{ id: Date.now(), name: data.savingsGoal.name, target: data.savingsGoal.target }] }
```

No urgency — the stale field causes no errors and takes negligible storage.

---

## KI005 — Foundation Arc time guard for "Stay on Foundation" carry-forward

**Context:** When a Foundation user in Foundation Complete (12+ months buffer) clicks "Remind me later" or "Stay on Foundation", the key `'complete'` is written to `data.foundationStageBannersDismissed`. This prevents the celebration banner from firing again — which is correct.

**However:** If F022 ever produces a false Foundation Complete trigger (via an incorrect denominator), and the user clicks "Stay on Foundation" or "Remind me later", the `'complete'` key gets written. After the F022 fix, the corrected stage derivation correctly shows them as not yet at Foundation Complete — but they won't see the proper milestone banner when they legitimately reach it, because `'complete'` is already dismissed.

**Mitigation:** The F022 fix reduces the likelihood of false triggers to near-zero. The one-time cleanup snippet (in CHANGELOG F022) can clear the dismissal for any specific user.

**Status:** Monitoring. No new false triggers reported since F022 shipped.

---

## KI006 — Password reset cross-device fails silently

**What happens:** If a user clicks a password reset link in a different browser (or a browser where they don't have the PKCE code verifier in localStorage), the code exchange fails silently and they land on the Login page with no session.

**Root cause:** PKCE requires the code verifier to be present in the same browser that made the reset request. The verifier is stored in localStorage under `'sb-auth-token-code-verifier'`. A different browser has no verifier.

**What the user sees:** Login page with no error message (the code exchange failure is silent in supabase-js).

**Resolution for users:** `SetNewPasswordPage` in `AuthContext` has a `sessionMissing` state that shows a "request a new link" form. This requires the user to understand that something went wrong.

**Current UX:** Not great. Layer 2 handles same-browser flows; cross-browser flows have no graceful recovery.

**Future fix considered:** Detect `?code=` in URL + no session after exchange → show "Reset link expired or used in a different browser. Request a new one." message.

---

## KI007 — `tradingCapitalHighWater` auto-update skips Foundation and Fixed

**What happens:** The high-water mark `useEffect` (App.jsx) returns early when `incomeType !== 'variable'`. This means `data.tradingCapitalHighWater` is never auto-updated for Foundation or Fixed users.

**Why this is intentional:** Foundation users have no Trading Capital. Fixed users have a "Capital %" column that routes to Goals, not a Capital account. The Drawdown Protocol (which uses the high-water mark) only applies to `incomeType === 'variable'`.

**Risk:** If a Foundation or Fixed user somehow has a non-zero `tradingCapital` balance (e.g. from a pre-F033 era or admin data patch), the high-water mark won't track it. Not currently a live issue.

**Status:** Intentional. Documented here for discoverability.
