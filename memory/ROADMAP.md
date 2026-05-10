# Royal Ledger — Roadmap

> Prioritised list of planned work, deferred features, and open questions. Not a commitment calendar — this is a living document for decision-making. Last updated: 2026-05-10.

---

## Current Phase: Closed Beta

Invite-only. Core loop is functional across all four income profiles. Focus: iron out bugs, establish tester feedback patterns, refine copy.

---

## Active / Immediate

### Foundation Arc time guard (KI001)

**What:** Prevent "Foundation Complete" milestone banner from firing on day 1 for users with pre-existing wealth.

**Options:**
- Option A: `daysSinceSetup >= 30` guard (derived from `setupCompleteAt`, already written)
- Option B: Wealth-signal detection in onboarding (suggest different profile if starting balances are high)
- Option C: Combined (time OR engagement — e.g. 30 days OR 3 snapshot entries)

**Waiting on:** Observation of existing tester behaviour. Need at least one more data point before locking in an approach.

**Impact:** Medium. Affects only Foundation users with pre-existing wealth. No data migration needed — `setupCompleteAt` already exists.

---

### Fixed profile "Capital %" column label (KI002)

**What:** Rename "Capital %" to "Goals %" in the allocation rules table for Fixed (`'fixed'`) profile users, or hide the column entirely.

**Waiting on:** First Fixed tester to surface this issue, or owner prioritisation.

**Risk:** Low. Option A is display-only. Option B touches allocation engine.

---

## Near-term (Next 2–4 Weeks)

### AdminDashboard / EarlyAccess "Hybrid" label (KI003)

**What:** Rename "Mixed" → "Hybrid" in AdminDashboard.jsx and EarlyAccess.jsx.

**Why now:** Small two-line change. Consistency cleanup.

**Risk:** Zero — display-only rename. `id: 'mixed'` field unchanged.

---

### PIN reset UX improvement

**What:** When a user's PIN reset request is approved, they currently see `PinSetupScreen` with `isForgotPin=true`. The UX is functional but the messaging could be improved.

**Possible improvement:** Email notification to the user when their reset is approved (instead of them having to re-open the app to check).

**Dependency:** Requires Supabase Edge Function for email dispatch, or webhook from admin approval action.

---

## Medium-term (Feature Roadmap)

### Profile-routing intelligence

**What:** Onboarding could detect "wealth signals" at Step 8 (starting balances) and suggest that a user with high pre-existing savings might be better served by Salary or Hybrid than Foundation.

**Why:** Foundation's value prop is "build from zero." A user with 12+ months of buffer already isn't building — they're managing. Profile mis-routing leads to irrelevant milestones and awkward Stage 1 experience.

**Design consideration:** Must be a suggestion, not a gate. User autonomy is important.

---

### Tester engagement dashboard

**What:** Improve Admin → Tester Activity tab with per-tester engagement timelines, last-seen dates, active/inactive classification.

**Current state:** The `get_tester_activity_summary()` RPC exists and returns basic data. The UI is minimal.

---

### Monthly Review enhancements

**What:** Make the Monthly Review modal more actionable — show spending trend vs last month, largest envelopes, any pending sleep-on-it items, and a one-tap "carry over" for items in the queue.

---

### Export / Backup improvements

**What:** The current manual backup (Settings → Download backup) produces a JSON file. Consider:
- CSV export for spreadsheet-friendly spending history
- Scheduled automatic backups to Supabase Storage

---

### Multi-device conflict UX improvement

**What:** The `ConflictModal` is functional but binary — keep local or keep cloud. A "view diff" option showing what changed on each side would help users make an informed choice.

---

## Deferred / Under Observation

### Mandatory goal at setup (F007, F020)

Two testers independently suggested requiring a goal before the app becomes usable. Currently deferred — the owner wants to see whether the optional onboarding goal step (F035) resolves the cold-start friction first.

### Wealth-signal onboarding prompt (F024 Priority 2)

Detect when a Foundation user's starting balances suggest they're already past the Foundation Arc. Deferred until the basic time guard (Option A, KI001) is shipped and validated.

### Admin → "Mixed" label (F031)

Deferred — no urgency. Admin-only view; no testers see it.

---

## Open Questions

1. **Should Foundation have a savings goal requirement?** Currently optional in Step 7. Two signals suggest users benefit from having a goal early (F007, F020, and the F035 onboarding improvement). Observe whether F035 changes behaviour before making it required.

2. **Should currency be user-self-serviceable?** Currently admin-only (via RPC patch). The argument for admin control: preventing users from silently reinterpreting historical balances in the wrong currency. The argument for user control: less friction for users who move countries.

3. **When should we open beta to more users?** Currently invite-only to 3–5 testers. What's the signal to expand? (No active outage, no P1 bugs, at least 2 tester feedback loops closed.)
