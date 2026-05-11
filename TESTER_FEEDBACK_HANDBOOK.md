For AI agents working on Royal Ledger: When you act on feedback or ship a change, you MUST update three files:

CHANGELOG.md — what changed
TESTER_FEEDBACK_HANDBOOK.md — feedback log entry with status
DEVELOPMENT_NOTES.md if architecture/patterns changed

If you ship code without updating all three, the work is incomplete.

# Royal-Icon Ledger — Tester Feedback Operating Manual

**Purpose:** This document governs how every piece of tester feedback is received, triaged, responded to, tracked, and closed during the beta phase. Open it every time a tester messages you before deciding what to do.

**Scope:** Applies to all beta testers during the closed beta (voucher-compensation phase).

**Related files:**
- `CHANGELOG.md` — record of what was built and why
- `DEVELOPMENT_NOTES.md` — technical context for implementation decisions
- `tester-guide.html` — what testers are supposed to know before they test
- `tester-terms.html` — voucher eligibility criteria

---

## Section 1 — Triage Categories

Assign one category to every piece of feedback before responding. The category determines your response time and how many clarifying questions to ask.

---

### 🔴 Critical Bug

**Definition:** The app is broken in a way that affects data integrity, access, or financial accuracy.

**Identifying signs:**
- Tester cannot sign in or is stuck in a loading state
- A financial figure is demonstrably wrong (e.g., savings shown as negative when it's positive)
- Tester's data appears to have been lost or overwritten
- The app crashes or goes blank

**Response time:** Fix within 24 hours. Communicate ETA within 2 hours of receiving the report.

**Clarifying questions needed:** Minimal — diagnose first, ask only what you need to reproduce. Don't make the tester wait for answers before you start investigating.

**Example:** *"My savings balance shows R0 but I had R8,000 entered yesterday."*

---

### 🟠 Functional Bug

**Definition:** A feature exists and is supposed to work, but doesn't behave correctly in the tester's hands.

**Identifying signs:**
- A screen shows wrong information (but not zero-data or data loss)
- A flow that should complete doesn't complete
- A button does something other than what the label says
- The same action produces different results on different attempts

**Response time:** Diagnose within 24 hours. Fix within 48–72 hours after diagnosis confirms the bug.

**Clarifying questions needed:** Moderate. You need enough detail to reproduce it — which profile, which tab, what steps they took.

**Example:** *"I spent R200 but the spending tracker on the Command tab still shows R500."*

---

### 🟡 UX Confusion

**Definition:** The feature works correctly, but the tester didn't understand what it does or how to use it.

**Identifying signs:**
- Tester says "I don't understand what X does" or "I couldn't find Y"
- Tester asks a question that is answered in the tester guide
- Tester completed the wrong action because the label was unclear

**Response time:** Respond within 24 hours with an explanation. Then decide separately whether the UI needs copy changes.

**Clarifying questions needed:** Moderate. You need to know which part was confusing and what they expected. This is a UX signal, not just a support question.

**Action rule:** Explain first. Then ask "does that make sense now, or does it still feel confusing?" If they say still confusing after a clear explanation, that's a signal to improve copy — not necessarily to rebuild the feature.

**Example:** *"What is the use of the Daily Checkpoint? What does it actually do?"*

---

### 🟢 Design Suggestion

**Definition:** The feature works, and the tester understands it, but they're proposing a change to how it works.

**Identifying signs:**
- "I think it should work like..."
- "Wouldn't it be better if..."
- "Can you make the X do Y instead?"

**Response time:** Acknowledge within 24 hours. Decision deferred until n=2–3 or personal validation.

**Clarifying questions needed:** High. You need to understand the underlying problem they're trying to solve, not just the solution they proposed. A tester proposing a solution is often describing a symptom, not the root cause.

**Example:** *"The 6-month buffer target is too high for Foundation users — can you make it 3 months instead?"*

---

### 🔵 Feature Request

**Definition:** Tester wants the app to do something it doesn't currently do at all.

**Identifying signs:**
- "Can you add..."
- "It would be great if..."
- "Other apps do X..."

**Response time:** Acknowledge within 24–48 hours. Log and defer.

**Clarifying questions needed:** Light. Enough to understand what problem they're trying to solve. Don't over-invest in scoping a feature you're not building yet.

**Action rule:** Log it. Do not build it during beta unless it's also something you personally want and n ≥ 2.

**Example:** *"Can you add a recurring expense tracker that auto-deducts from my budget each month?"*

---

### ⚪ Preference / Aesthetic

**Definition:** Tester prefers something visually or stylistically different, with no functional basis.

**Identifying signs:**
- "I prefer dark mode" (already dark)
- "Can the font be bigger?"
- "I don't like the orange colour"

**Response time:** Acknowledge within 48 hours. Log. Decide later or not at all.

**Clarifying questions needed:** None or minimal. These are valid signals about audience fit, not product decisions.

**Action rule:** Log it. If 3+ testers report the same aesthetic issue, treat it as a UX signal. Otherwise, file and move on.

**Example:** *"The orange buttons feel too aggressive — can they be softer?"*

---

## Section 2 — The Decision Framework

### Core Rules

**Rule 1 — n=1 is a data point, not a mandate.**
One tester reporting something is interesting. It means something might be worth looking at. It does not mean you build, change, or remove anything immediately (except bugs).

**Rule 2 — n=2–3 is a pattern, investigate it.**
Two or three independent testers reporting the same thing without talking to each other is a real signal. Investigate the root cause before acting.

**Rule 3 — Bugs are objective, suggestions are not.**
A functional or critical bug gets fixed regardless of n. It either works or it doesn't. Suggestions require multiple validators.

**Rule 4 — Personal validation.**
For design suggestions: ask yourself "do I, as a daily user of my own app, agree with this?" If yes + n=1, lower the threshold. If no + n=1, hold firm and wait.

**Rule 5 — Industry convention.**
If testers are confused by something that works the same way in every other finance app (e.g., envelope budgeting), the issue is onboarding/explanation, not product design.

**Rule 6 — Reversibility test.**
Easy to undo (copy changes, colour tweaks, label changes) → lower the threshold to act. Hard to undo (data migrations, onboarding restructure, removing a core feature) → require n=3 minimum and personal validation.

---

### Decision Tree

```
Incoming feedback
│
├─ Is it a bug? (something broken, wrong data, crash)
│   ├─ YES → 🔴 Critical or 🟠 Functional → Fix it
│   └─ NO → Continue
│
├─ Does the tester understand the feature?
│   ├─ NO → 🟡 UX Confusion → Explain, then assess copy quality
│   └─ YES → Continue
│
├─ Does the feature exist?
│   ├─ NO → 🔵 Feature Request → Log, defer
│   └─ YES → Continue
│
├─ Is it a change to existing behavior?
│   ├─ YES → 🟢 Design Suggestion
│   │         ├─ n ≥ 2? → Investigate root cause, consider acting
│   │         ├─ n = 1, you agree personally? → Consider acting
│   │         └─ n = 1, you don't agree? → Log, wait for pattern
│   └─ NO → ⚪ Preference → Log, revisit if n ≥ 3
```

---

### Override Conditions

These conditions override the n-rule and allow immediate action:

| Condition | Action |
|---|---|
| Data loss risk | Fix immediately regardless of n |
| Security issue | Isolate and fix immediately, notify all testers |
| Tester physically cannot complete core flow | Fix within 24h |
| You personally use the feature daily and agree it's wrong | Threshold lowered by 1 |

---

## Section 3 — Response Templates

All templates are plain text, suitable for WhatsApp or email. Customise the name and specifics — everything else can go as-is.

---

### T1 — Acknowledging a Bug Report

**When to use:** Any 🔴 Critical or 🟠 Functional bug report.

```
Hey [Name], thanks for catching this — really helpful.

I can see what you're describing. To make sure I fix the right thing:
- Which profile type did you select during setup? (Foundation / Variable / Fixed / Mixed)
- What were the steps right before it happened?
- Is it happening consistently, or just once?

I'll look into this now and come back to you. Expect an update within [24h for critical / 48-72h for functional].
```

**After sending:** Open the code immediately. Don't wait for tester response if you can reproduce it yourself. Update the feedback log with status → Investigating.

---

### T2 — Acknowledging UX Confusion

**When to use:** Tester doesn't understand how a feature works (🟡 UX Confusion).

```
Hey [Name], good question — that section isn't as clear as it should be.

Here's how [feature name] works: [one short paragraph explanation, plain language, no jargon].

Does that make sense? And even after that explanation — does the screen still feel confusing when you look at it, or does it click now?

Your answer helps me decide whether to update the text in the app or just the guide.
```

**After sending:** Log the confusion point. If 2+ testers ask the same question, update the copy in the app — not just the guide.

---

### T3 — Acknowledging a Design Suggestion

**When to use:** Tester proposes a change to existing behavior (🟢 Design Suggestion).

```
Hey [Name], appreciate this — I want to make sure I understand what's driving it.

When you say [their suggestion], what's the situation that made you feel that way? Was it that [possible root cause A], or more like [possible root cause B]?

I'm not dismissing it — I want to fix the actual problem, not just the surface. Let me know what was happening when that thought came up.
```

**After sending:** Log as Pending — n=1. Note the underlying need they described. If another tester raises the same issue independently, move to Investigating.

---

### T4 — Deferring a Feature Request

**When to use:** Tester requests something the app doesn't do (🔵 Feature Request).

```
Hey [Name], I like this idea and I've logged it.

Right now I'm focused on making the core flow rock-solid before adding new capabilities. Once the beta is stable, I'll revisit this — your note is on the list.

Keep the other feedback coming, it's genuinely useful.
```

**After sending:** Log with status → Deferred. Don't over-explain or apologise. The tester's job is to test what exists, not to roadmap the product.

---

### T5 — Closing the Loop on an Implemented Fix

**When to use:** You've fixed something a tester reported and pushed the update.

```
Hey [Name], quick update — I fixed the issue you reported with [brief description].

It's live in the app now. Could you do a quick check and let me know if it's behaving correctly on your end?

And if you spot anything else, keep it coming.
```

**After sending:** Update the feedback log with status → Closed. Note the resolution.

---

### T6 — Following Up on a Quiet Tester

**When to use:** A tester hasn't sent feedback in 7+ days and hasn't completed minimum activity requirements.

```
Hey [Name], checking in — haven't heard from you in a bit.

No pressure at all. If you're stuck on something, ran into a bug, or the app isn't making sense somewhere, let me know and I'll sort it.

If life's just been busy, totally understand. Whenever you're back, I'd love to know what you think so far.
```

**After sending:** Note the date in the log. If no response in another 7 days, assess whether this tester is meeting the voucher activity threshold.

---

### T7 — Disqualification Message

**When to use:** Tester has not met the minimum activity threshold for voucher compensation (as defined in `tester-terms.html`). Use this only after the beta period closes, not mid-beta.

```
Hey [Name], thanks for being part of the Royal Ledger beta.

I've reviewed activity for the beta period and unfortunately your account didn't meet the minimum requirements for voucher compensation: [list the specific shortfall — e.g., fewer than 15 active days, no Spending Gate uses, no written feedback submitted].

The requirements were outlined in the tester agreement you signed at the start.

I appreciate the time you did put in and I hope the app was useful. If you have feedback you'd still like to share, I'd welcome it.
```

**After sending:** Update the tester record. Don't negotiate on the criteria — they were agreed upfront.

---

## Section 4 — Feedback Tracking System

### Format

Add every piece of feedback to this log when it comes in. Don't batch — update in real time.

**Status options:**
- `New` — received, not yet triaged
- `Investigating` — actively diagnosing
- `Pending` — waiting for more data (n=1 pattern watch) or tester response
- `Acted On` — fix deployed or change shipped
- `Deferred` — logged, explicitly not building now
- `Closed` — resolved and confirmed by tester or owner
- `Wontfix` — reviewed, decided not to act, reason noted

**ID format:** `F` + three-digit sequential number. Example: F001, F002, F003.

---

## Active Testers

This roster tracks every tester currently in the beta program. Updated whenever someone joins, leaves, or changes status.

| Tester ID | Name | Email | Profile | Country | Joined | Source | Status | Notes |
|-----------|------|-------|---------|---------|--------|--------|--------|-------|
| T001 | [First tester name] | [email] | Foundation | [country] | [date] | [source] | Active | First tester — Foundation profile feedback |
| T002 | Kamzingeni Phiri | kamuphiri@gmail.com | Variable | ZA | 2026-05-09 | WhatsApp | Awaiting agreement | Why interested: "Medium income need to move to wealthy" |

### Status options

- **Awaiting agreement** — signed up but hasn't returned "I agree" yet
- **Onboarding** — agreed, sent user guide, hasn't completed setup
- **Active** — onboarded and actively testing
- **Inactive** — hasn't logged in for 7+ days, sent re-engagement message
- **Disqualified** — failed activity requirements, voucher not earned
- **Completed** — finished 30-day cycle, voucher issued
- **Withdrew** — chose to stop testing voluntarily

### When to update

- New tester signs up → add row, status "Awaiting agreement"
- Tester replies "I agree" → status "Onboarding"
- Tester completes onboarding → status "Active"
- Friday check-in shows no activity for 7+ days → status "Inactive", send re-engagement
- 30-day period ends → status "Completed" if requirements met, "Disqualified" if not

---

### Tester Feedback Log

| ID | Date | Tester | Profile | Category | Description | Status | Resolution |
|----|------|--------|---------|----------|-------------|--------|------------|
| F001 | 2026-05-09 | Tester A | Foundation | 🟢 Design Suggestion | Initial buffer target of 6 months is too high — suggests 3 months | Acted On | Foundation Arc implemented: 3-month starter stage added, staged 3→6→12 progression |
| F002 | 2026-05-09 | Tester B | Variable | 🟠 Functional Bug | Command tab spending tracker shows only Discretionary spend, not other envelopes | Closed | Fixed: totalMonthSpend now aggregates all envelopes; envelopeBreakdown added |
| F003 | 2026-05-09 | Tester B | Variable | 🟠 Functional Bug | After adding R200 spend, Command still shows pre-spend total | Closed | Fixed: Discretionary cap delta sync (Fix 2A) + QuickLog envelopeId gap (Fix 2B) |
| F004 | 2026-05-09 | Tester C | Variable | 🟠 Functional Bug | Trading tab visible for Mixed and Fixed profiles — should be Variable only | Closed | Fixed: showTrading and showTradingDesk gated to incomeType === 'variable' |
| F005 | 2026-05-09 | Owner | Foundation | 🟠 Functional Bug | Foundation option missing from Settings income profile list | Closed | Fixed: Foundation card added to Settings; legacy mode field detection added |
| F006 | 2026-05-09 | Tester B | Any | 🟢 Design Suggestion | Currency should not be changeable after onboarding | Acted On | Currency picker removed from Settings; replaced with read-only locked display |
| F007 | 2026-05-09 | Tester C | Any | 🟡 UX Confusion | What does the Daily Checkpoint do? | Closed | Explained: self-accountability markers; Sunday → weekly pulse; month-end → review. No code change. |
| F008 | 2026-05-09 | Tester D | Foundation | 🟢 Design Suggestion | Goal should be required to complete onboarding | Pending — n=1 | Goals step added to onboarding (step 10) — noted as deferred if n stays at 1 |
| F009 | 2026-05-09 | Tester E | Any | 🟢 Design Suggestion | Impulse Category list (food/clothes/tech/online/family/other) feels unprofessional and redundant with envelope tag | Acted On | Audit confirmed write-once display-only with no analytics dependencies. Field removed from both Spending Gate and QuickLog forms; legacy entries ignored on read. See CHANGELOG "Impulse Category Removal" (2026-05-09). |
| F010 | 2026-05-09 | Owner | Any | ⚪ Preference | Currency flags not rendering on Windows (showed "ZA"/"US" text instead of 🇿🇦/🇺🇸) | Closed | Root cause: Windows has no flag-emoji font. Swapped to flagcdn.com PNG images via new `flagUrl(cc)` helper in `src/lib/currency.js`. Renders identically across all platforms. |
| F011 | 2026-05-09 | Tester F | Any | 🟠 Functional Bug | Sign out button is too hidden on mobile — testers couldn't find it | Closed | MobileBottomNav More sheet redesigned: Sign out separated by divider, red color, persistent visibility once More is opened. `onLogout` prop threaded through. |
| F012 | 2026-05-09 | Tester G | Foundation | 🟠 Functional Bug | Graduation banner not showing on mobile despite hitting milestone | Closed | Banner-cascade priority bug — `upgrade` was below `backup` so the recurring backup banner pre-empted the one-time graduation event. Reordered cascade: upgrade now outranks backup. |
| F013 | 2026-05-09 | Tester G | Variable | 🟡 UX Confusion | "Still seeing trading, I am confused about trading" — Stage 2 progression row showed backwards range; Stage 3 description mentioned trading even for Foundation users | Closed | Stage 2 row hidden when `bufferTarget ≤ stage15End` (was rendering as `R12k → R8k`). Stage 3 subtitle made conditional on `isFoundation`: shows "Lifestyle · goals" not "Trading · lifestyle · goals" for Foundation accounts. Trading P&L empty-state copy improved. |
| F014 | 2026-05-09 | Owner | Any | ⚪ Preference | Contact email hello@royalledger.app should be support@ | Closed | Global find-replace across `src/App.jsx`, `src/components/AdminDashboard.jsx`, `tester-guide.html`, `tester-terms.html`. Trivial reversibility — acted on n=1 personal validation per Decision Framework Rule 6. |
| F015 | 2026-05-09 | Owner | Any | 🔵 Feature Request | Admin needs a way to change a user's currency or income profile when support requests come in | Closed | Built `admin_patch_user_data(p_email, p_currency, p_income_type)` Supabase RPC (SECURITY DEFINER) + `AccountOverrideManager` component in AdminDashboard. SQL file `supabase/admin-patch-user-data.sql` requires one-time manual run in Supabase SQL Editor. |
| F016 | 2026-05-09 | Owner | Any | 🟡 UX Confusion | Some Settings sections don't have tooltips — inconsistent across profiles | Closed | HelpTips added to Income Profile, Currency, Password, Security PIN, Cloud Sync, Backup & Restore, and Notifications headings. |
| F017 | 2026-05-09 | Owner | Any | 🔵 Feature Request | Need a detailed printable HTML user guide for testers + a Beta Tester Agreement they can sign | Closed | Created `tester-guide.html` (19 sections covering all profiles, flows, gates, rituals) and `tester-terms.html` (9-clause Beta Tester Agreement covering R200 voucher conditions and minimum activity requirements). Both WhatsApp-shareable. |
| F018 | 2026-05-09 | Tester H | Foundation | 🟢 Design Suggestion | Foundation buffer target should default to 3 months instead of 6 — feels like a more attainable starting goal | Pending — n=1 | Spawned the Foundation Arc work (F001) but specifically about default `bufferTargetMonths`. Currently 18 across all profiles; Foundation could default to 3 if pattern emerges. Held at n=1 per Decision Framework Rule 1. |
| F019 | 2026-05-09 | Owner | Foundation | 🔴 Critical Bug | "We still have categories under impulse control? Is this right?" — surfaced a regression where Spending Gate crashed after every decision (Skip/Sleep/Buy) | Closed | Fixed: Ghost `setCategory('')` reference in `ImpulseTab.reset()` (App.jsx:3870) removed. Threw ReferenceError at runtime because `useState` hook was deleted in F009 but the setter call in `reset()` was missed. See CHANGELOG "Spending Gate Crash Fix" (2026-05-09). |
| F020 | 2026-05-09 | Owner | Foundation | 🟠 Functional Bug (suspected) / 🟡 UX Confusion (alt) | Money Allocator on Foundation: entered amount but balance didn't reflect change | Closed | Verified working by owner on 2026-05-09. Likely original cause was either (a) two-step flow misread — only "Apply allocation" on screen 2 actually writes to balance, "Allocate money" on screen 1 only previews; or (b) PIN prompt dismissal. No code defect identified. Code logic confirmed correct in earlier review: Foundation routes 100% via `d.buffer + toBuffer`. **Possible follow-up:** if other Foundation testers report similar confusion, consider adding stronger visual cue that screen 1 is preview-only — e.g., button label "Preview allocation →" on screen 1 instead of "Allocate money". Held for n=2 confirmation. |
| F019 | 2026-05-09 | Owner (test account) | Foundation | Functional Bug | Foundation Complete graduation banner appeared at ~1.6 months buffer covered. Investigation revealed root cause: stage logic uses Setup expenses (which were empty at time of report). Once Setup expenses populated and Foundation Arc deployed, banner correctly disappears. | Closed | Verified on deployed bundle index-BSkhiOes.js. Banner correctly absent on starter stage. Math.max defensive fix logged as F022 to prevent recurrence. |
| F020 | 2026-05-09 | Owner (test account) | Foundation | Design Suggestion | Suggestion: gate the app behind goal-setting after first snapshot, since onboarding doesn't require a goal | Deferred | Related to F007 (previous tester suggested making goals required at setup). Defer until n=2-3 confirms pattern. |
| F021 | 2026-05-09 | Owner | (any) | Critical Bug | `setCategory is not defined` ReferenceError thrown from reset(). Investigation revealed source code already clean — error was from stale browser bundle. Stack trace line numbers (6986, 7127) exceeded source file length (~5,300), indicating cached old bundle. | Closed | Verified on deployed bundle index-BSkhiOes.js. No error in console. Process rule added to DEVELOPMENT_NOTES Section 5. |
| F022 | 2026-05-09 | Owner (architectural follow-up) | Foundation | Functional Bug (preventive) | Foundation stage calculation uses stats.salary which can fall below envelope total, causing premature stage advancement. Recommended fix: Math.max(salary, envelopeTotal + bufferReserve) as defensive denominator. | Acted On | Shipped: `foundationMonths` denominator changed to `Math.max(salary, envelopeTotal + bufferReserve)` for Foundation users only. Non-Foundation profiles unchanged. `stats.monthsCovered` deliberately not modified — both render sites are gated to non-Foundation users. Build hash `index-CstdAyoQ.js`. Decision rationale: scoped change to Foundation-only minimises blast radius. See CHANGELOG "F022: Foundation Stage Defensive Denominator" (2026-05-09). One-time cleanup snippet for false dismissals provided in CHANGELOG. Move to Closed when owner verifies on deployed bundle. |
| F023 | 2026-05-09 | Owner | Any | 🟠 Functional Bug (background) | Firefox console showed `Cross-Origin Request Blocked` for Supabase requests. Initial console-only diagnosis assumed domain-wide block; Network tab analysis revealed the block was per-table — only `POST notification_queue` failed; `user_data`, `early_access_leads`, `pin_reset_requests`, `user_activity_events` all succeeded. | Closed | **Root cause:** `notification_queue` table was never created in production Supabase project. The CREATE TABLE SQL existed only as a code comment in `src/lib/dataLayer.js:357-367` — no migration file in `supabase/` directory. PostgREST returned error response without proper CORS headers on missing-table inserts. **Fix:** Created `supabase/notification-queue-migration.sql` with idempotent CREATE TABLE, RLS policy, GRANT, and index. **Owner action completed:** ran migration in Supabase SQL Editor — "Success. No rows returned" confirmed table + policy + grant + index created. Subsequent attempt to re-run the original code-comment SQL produced expected error 42710 (policy already exists) — confirms first run took effect. **Impact while broken:** No user-facing UX broken; only background admin notifications (PIN override audit, stage change pings, drawdown alerts) were dropped. Cloud sync entirely unaffected. **Lesson logged in CHANGELOG:** SQL embedded in code comments is invisible to setup flows — always extract to migration files. **Diagnostic correction noted:** initial response said "domain-wide block, rules out RLS" — wrong, based on console alone. Network tab is the authoritative view for CORS issues. Updated DEVELOPMENT_NOTES Section 5 with the diagnosis rule. |
| F024 | 2026-05-09 | Tester (Foundation, new account) | Foundation | 🟠 Functional Bug + 🟢 Design Gap | Brand-new Foundation tester completed onboarding, logged spending, and immediately saw "Foundation Complete — You've built strong financial stability. R 5M saved — 13 months of financial security." Banner fired on day 1 of usage with no time-in-app to validate the numbers. | **Investigating — Hold on code change pending tester behaviour observation** | **Math walkthrough confirms internal consistency:** R 5M buffer ÷ R 373k monthly needs = 13.4 months. Thresholds 3mo / 6mo / 12mo correctly compute to R 1.1M / R 2.2M / R 4.5M. All three milestones legitimately satisfied per the formula. **No calculation defect.** **Conceptual gap identified:** Foundation Arc has only one day-0 guard (`hasLoggedExpense`) — once user logs any spend, stage derivation runs against onboarding-entered values. There is no time-based or activity-based guard preventing Foundation Complete from firing on day 1 for users who enter realistic wealth values during onboarding. **Decision tree drafted (held, not implemented):** Option A — time guard (`daysSinceSetup ≥ 30` before Foundation Complete fires). Option B — snapshot-count guard (≥3 snapshots required). Option C — combined (time OR engagement satisfies). Option D — status-quo with softened banner copy when `daysSinceSetup < 30`. Agent recommended Option A (time-based, scoped to `complete` stage only). **Owner decision (logged here for reference):** HOLD on Priority 1 (time guard). The deeper question is whether Foundation is the right profile for a user with R 5M in pre-existing savings — this is a **profile-routing** question, not a stage-progression question. A user with R 5M+ may be better served by Variable / Mixed / Fixed profiles which assume "I have wealth, now allocate ongoing income" rather than Foundation's "I'm building from low-base." **Plan:** (1) observe what this tester does next — graduate or stay, (2) consider whether onboarding should detect wealth signals and recommend a non-Foundation profile, (3) consider whether the GraduationModal copy should adapt to "you came in here, did you mean to be on Foundation?" framing. **Documentation:** DEVELOPMENT_NOTES Section 5 updated with note on the unresolved design gap. **Status:** Investigating. Will revisit when tester next interacts with the app. |
| F024 | 2026-05-09 | [tester name] | Foundation | Design Gap (Profile Naming) | Foundation user with R 5M savings saw "Foundation Complete" on day 1. Tester's diagnosis (verbatim): "Foundation was understanding, Variable was confusing and Mixed was technical." Income source: Salary. Right profile would have been Fixed. Tester wants to stay on Foundation despite mismatch. | Investigating | Profile picker labels are the root cause, not banner trigger logic. Three actions identified: (1) Redesign picker labels to income-type-based language [primary], (2) Add post-onboarding mismatch check [safety net], (3) Add time guard for celebratory copy [secondary]. Decision pending overnight before code work. |
| F025 | 2026-05-09 | [tester name] | Foundation | UX Confusion (Day-1 Banner) | New users completing onboarding with high starting savings see celebratory milestone banners ("Foundation Complete") immediately, before doing anything. Tester said: "Got me confused because I haven't done anything yet." | Investigating | Subset of F024. Time guard (30 days before Foundation Complete celebration) addresses this directly. Less urgent than F024 if profile labels get fixed. |
| F024 | 2026-05-09 | [tester] | Foundation | Design Gap | Profile picker labels confused tester. Foundation read as "beginner" but tester actually had R 5M and salary income. | **Closed — Tester Verified** | Three-commit fix shipped 2026-05-09 in commit c4bc3e8. Final bundle (after F026 + F027): `index-_Z8htjEB.js`. **Tester confirmed confusion cleared after deploy** (2026-05-09). New picker labels (🌱 Building from zero / 💼 Salary / 📈 Trading / ⚡ Mix) + time guards + mismatch modal all reading correctly. Original tester cleanup snippet ran successfully. |
| F025 | 2026-05-09 | [tester] | Foundation | UX Confusion | Foundation Complete banner fires on day 1 for users with high starting savings | Closed | Resolved as part of F024 Commit 2 (time guards). Bundle: index-CkMmoezx.js. |
| F026 | 2026-05-09 | Owner (consistency audit) | Any | 🟡 UX Confusion / 🟢 Design Suggestion | Onboarding Step 4 subtitle still reads "Variable income needs a bigger buffer; fixed income needs less" — uses old terminology while the cards themselves now use new situation-based labels (🌱 Building from zero / 💼 Salary / 📈 Trading-Self-employed / ⚡ Mix). Owner flagged this as a consistency issue and asked the new framing be applied to standard profiles too. | **Closed** | **Locked decisions executed:** A (drop technical jargon) / Medium (subtitle + Settings HelpTip + buffer-step descriptions) / Later (separate commit after F024). **Three touch points fixed:** (1) Onboarding Step 4 subtitle replaced with situation-framed copy that reads as guidance, not system mechanics; also corrected "update in Settings" to "ask support to change" since profile and currency are admin-only changes. (2) Onboarding 18-month buffer description rewritten with conditional phrasing ("Sole earner with dependents, or income that changes month to month"). (3) Settings → Income Profile HelpTip fully rewritten: each profile now uses the new emoji+label combination and conditional "for X" phrasing instead of profile-named. **Pre-implementation grep ran across `src/`** — identified additional matches in `marketing/*`, `AdminDashboard.jsx`, code comments, and functional `incomeType === 'fixed' ? 'surplus' : 'profits'` conditionals. Per Medium scope, these were correctly excluded: marketing audience separate, admin not user-facing, comments not user-facing, functional copy is right copy. Build hash `index-C05OFzEX.js`. |
| F027 | 2026-05-09 | Owner (post-F026 review) | Any | ⚪ Preference (copy refinement) | Owner reviewed F026's deployed Step 4 subtitle and flagged it as still suboptimal — "allocator rules" remains jargon, three-item list is technical, "ask support to change" ends on friction. Owner authored a replacement and asked for review. | **Closed** | **Owner-authored copy shipped:** *"This shapes how Royal Ledger protects, allocates, and manages your money. Pick what matches your reality today. We'll tailor the rest around it."* Improvements over F026: (1) first sentence answers "why does this matter?" with brand voice, (2) three plain verbs (protects / allocates / manages) describe outcomes not mechanics, (3) two-beat rhythm reads considered, (4) brand insertion signals confidence. Verbs evaluated during review: "guides" rejected (financial-advice exposure), "grows" rejected (inaccurate), "structures" rejected (cold, breaks rhythm). "Manages" retained as accurate catch-all. Single touch point edit, pure copy, no logic changes. Build hash `index-_Z8htjEB.js`. |
| F028 | 2026-05-09 | Tester | Salary or Mix (non-Variable) | 🟠 Functional Bug | Tester complained about "Trading on Impulse control description and trading on the command menu." Trading-specific copy was leaking into Salary and Mix profile views — the Impulse Control subtitle mentioned "your trading P&L," the Command tab Stage 3 description read "trading, lifestyle, goals," and the Quick Log trigger picker included "Won a trade" / "Lost a trade" chips for all profiles. | **Closed** | Full sweep across two commits (c84bea3 + 73339d7). **Commit 1** — Impulse Control subtitle, Command Stage 3 desc, Quick Log trigger picker, Spending Gate guard label, Mix profile descriptions (all 6 touch points renamed "business or side income"), allocation column "Trading %" → "Capital %" for non-Variable (state key unchanged). **Commit 2 (addendum)** — 9 additional strings missed in Commit 1: Profit Allocator HelpTip + subtitle + input label; Setup buffer reserve HelpTip + sublabel; Command balances HelpTip + snapshots HelpTip; Settings Tax Reserve HelpTip + paragraph. All gated to `showTrading = data?.incomeType === 'variable'`. `showTrading` added to `ProfitAllocator`, `Setup`, `Command`, `AccountSettings` components. Variable profile: no change throughout. Build verified: `index-B6tVshU0.js` ✓. Pattern added to DEVELOPMENT_NOTES §4: "Trading-copy scope rule". See CHANGELOG "F028" (2026-05-09 + 2026-05-10). |
| F030 | 2026-05-10 | Owner (brand/UX) | Any (Mixed profile) | ⚪ Preference / 🟢 Design Suggestion | Profile label "Mix" is too casual and ambiguous — reads as a noun or verb rather than a descriptor. Owner evaluated Mix / Mixed / Hybrid. | **Closed** | Renamed to **Hybrid** across all 6 user-facing touch points (GraduationModal, Settings HelpTip, Settings picker card, Onboarding picker card, Onboarding mismatch modal). Internal `incomeType === 'mixed'` state key and Supabase value unchanged — display-only rename. Admin (`AdminDashboard.jsx`) and marketing (`EarlyAccess.jsx`) excluded per pre-existing scope rule. Zero residual "Mix" labels in user-facing src confirmed by grep. See CHANGELOG "F030" (2026-05-10). |
| F031 | 2026-05-10 | Owner (convention audit) | Admin / Marketing | ⚪ Housekeeping | `AdminDashboard.jsx` and `EarlyAccess.jsx` both use the label "Mixed" for `incomeType === 'mixed'`. Correctly excluded from F030 scope (internal/marketing, not tester-facing). However, the convention is now "Hybrid" externally — two surfaces diverge from that. Decision needed: align them to "Hybrid" (pure display rename, same pattern as F030) or document as deliberate (internal tool, internal vocabulary). | **Pending — deliberate hold** | Not urgent. No tester has seen AdminDashboard (owner-only). EarlyAccess is a pre-signup funnel page — testers see it before onboarding, where the profile terminology hasn't landed yet. Neither surface causes confusion today. Log exists to prevent this being rediscovered as a bug later. Recommended resolution when actioned: rename to "Hybrid" in both — display-only, same `id: 'mixed'` field, zero data impact. One line each. |
| F032 | 2026-05-10 | Owner (profile verification audit) | Hybrid (`mixed`) | 🟡 UX Confusion (copy consistency) | Owner ran a canonical label verification sweep across all picker cards, mismatch modals, and graduation modal. The Hybrid profile descriptor read "Steady salary, plus **business or side income**" in 5 locations — but the canonical word order is "**side income or business**". Affects: `Onboarding.jsx` picker card + mismatch modal, `App.jsx` GraduationModal + AccountSettings picker card + AccountSettings HelpTip. | **Closed** | All 5 locations aligned to canonical "Steady salary, plus side income or business." Word order only — no logic, data, or profile routing changes. Commit `a50a6bc`. See CHANGELOG F032 (2026-05-10). Source: owner-driven audit, not tester-reported. |
| F033 | 2026-05-10 | Owner (profile audit — latent bug) | Hybrid (`mixed`) | 🔴 Critical Bug (latent) | During the same profile verification audit (F032), the Drawdown Protocol was found leaking into the Hybrid profile. Two conditions used `incomeType !== 'fixed'` or `!isFoundation` which correctly excluded Foundation and Salary but incorrectly included Hybrid. (1) High-water mark auto-update `useEffect` ran for Hybrid users despite Hybrid having no Drawdown Protocol. (2) Banner cascade drawdown zone condition fired for Hybrid users who had a Capital Pool balance. Hybrid's feature set is Capital Pool ✅, Profit Allocator ✅, Envelopes ✅, Spending Gate ✅, Stage System ✅ — Drawdown Protocol ❌. | **Closed** | Both conditions changed to `incomeType === 'variable'` explicit gate. High-water mark `useEffect`: `if (data.incomeType === 'fixed') return` → `if (data.incomeType !== 'variable') return`. Banner cascade: `data.incomeType !== 'fixed' && !isFoundation && stats.drawdownZone !== 'normal' && data.tradingCapital > 0` → `data.incomeType === 'variable' && stats.drawdownZone !== 'normal' && data.tradingCapital > 0`. Hybrid Capital Pool allocation routing unaffected. Commit `fd0e36d`. Gate rule added to DEVELOPMENT_NOTES §4. See CHANGELOG F033 (2026-05-10). Source: owner-driven audit, not tester-reported. |
| F034 | 2026-05-10 | Owner (design review) | Foundation | 🟠 Functional Bug + 🟢 Design Improvement | YOUR SAVINGS "Set Goal" editor wrote to `data.savingsGoal` (orphan field disconnected from all other goal logic). Progress bar calculated `data.buffer / target` — emergency fund balance vs goal target — producing absurd values (e.g. "R7.1M" for a "Laptop" goal). Three disconnected goal systems existed in parallel: `data.savingsGoal`, `data.futureGoals`, and `data.goals`. | **Closed** | Consolidated goal system: editor now reads/writes `data.goals[0]` (same array as Setup → Goals). Progress now tracks `data.futureGoals / primaryGoal.target` (actual savings pool vs named target). `data.savingsGoal` deprecated. Stage 1 informational note added: "Goal funding starts at Stage 2 — keep building your buffer first." Standard profiles unaffected. See CHANGELOG F034 (2026-05-10). |
| F035 | 2026-05-10 | Owner (UX observation) | Foundation | 🟢 Design Improvement | Foundation users exited onboarding with `data.goals` empty — YOUR SAVINGS card showed "Set a goal" on first launch even though the user had a clear savings intent from onboarding. Users had to navigate to Setup → Goals to give their savings a purpose, creating a cold-start friction point. | **Closed** | Added optional goal-collection section to Onboarding Step 7 (Foundation branch only). Name + target inputs appear below the milestone roadmap cards. On `finish()`, goal is written to `data.goals` (prepended as `goals[0]`) so YOUR SAVINGS card auto-populates at first launch. Standard profiles (Salary/Trading/Hybrid) entirely unaffected — their `data.goals` is still only populated via Setup → Goals. See CHANGELOG F035 (2026-05-10). |
| F036 | 2026-05-10 | Owner (test account) | Foundation | 🔴 Critical Bug (two parts) | (1) YOUR SAVINGS goal progress bar showed $0 in Stage 1 even after adding money via Money Allocator. (2) At ~$106K savings (crossing Stage 2 threshold), the progress bar disappeared entirely — bar reset from $106K progress to $0. | **Closed** | Root cause: `data.futureGoals` is always $0 in Stage 1 (waterfall doesn't feed goals account until Stage 2). Hard stage-based switch caused cliff at Stage 2 boundary. Fixed with balance-driven `_goalSaved`: if `data.futureGoals > 0` use it, else fall back to `data.buffer`. Bar now rises smoothly through Stage 1 and transitions without a cliff. Stage 1 note updated: "Tracking your savings toward this goal. Hit Stage 2 to unlock a dedicated goals account." Commit `b5b9d0d`. See CHANGELOG F036 (2026-05-10). |
| F037 | 2026-05-10 | Owner (test account) | Foundation | 🟠 Functional Bug | After F036 fix, Foundation Command tab goal card still showed $0 and a flat progress bar. The fix applied to YOUR SAVINGS card only; a second goal display block on the dashboard read `data.futureGoals` directly. | **Closed** | Second goal card (Foundation Command dashboard) updated to use `_goalSaved` for amount label, progress bar width, and percentage text. Both goal display surfaces now use the same derived source. Commit `b5b9d0d`. See CHANGELOG F037 (2026-05-10). |
| F038 | 2026-05-10 | Owner (security audit) | Foundation | 🟠 Functional Bug (security gap) | Edit goal and Add goal buttons opened the goal editor with no PIN challenge. Setup → Goals is PIN-locked, but the equivalent actions directly on the YOUR SAVINGS card and the savings nudge CTA bypassed the gate entirely. | **Closed** | Added `usePinGate` hook instance (`attemptGoalEdit` / `goalEditGate`) and wired all three entry points: Edit goal button, + Add goal button, and Foundation savings nudge CTA (`ctaAction === 'goal'`). Gate modal rendered in portal block. Commit `ff28288`. See CHANGELOG F038 (2026-05-10). |
| F039 | 2026-05-10 | Owner (UX observation) | Foundation | 🟡 UX Confusion | Future Goals balance card on the Command tab showed "1 goal" as the subtitle for a Stage 1 Foundation user whose goals pool (`data.futureGoals`) was $0. The subtitle implied the account was active when it hadn't started receiving funds. | **Closed** | Subtitle logic updated: Foundation users with `data.futureGoals === 0` now see "Starts at Stage 2" instead of a goal count. Once the pool is funded, they see the normal goal count. Non-Foundation users unaffected. Commit `7609dfd`. See CHANGELOG F039 (2026-05-10). |
| F040 | 2026-05-11 | Katleho Mokoma (WhatsApp) | Fixed (Salary) — bug affects all profiles | 🔴 Critical Bug | Quick Log sub-tab renders completely blank. Tester described: "loading blank when they click OK to log expenses." Navigating to Impulse Control → Quick Log tab shows nothing — no form, no content. Reported on Fixed profile; root cause is profile-agnostic (affects Foundation, Variable, Fixed, Hybrid equally — Katleho is the first tester to use the Quick Log sub-tab). | **Closed** | **Root cause — P002 violation (undeclared `showTrading` in `QuickLog` scope):** `QuickLog` (App.jsx line 4332) is a separate top-level function from `ImpulseTab` (line 3981). It references `showTrading` at line 4366 in its JSX (`showTrading ? TRIGGERS : TRIGGERS.filter(...)`) but never declares it — `showTrading` is not in `QuickLog`'s props, not in its function body, and not at module level. `ImpulseTab`'s `const showTrading` (line 3985) is local to ImpulseTab; `QuickLog` has no closure access. In strict-mode ES modules (Vite default), referencing an undeclared identifier throws `ReferenceError: showTrading is not defined`, crashing the component. Without an error boundary, React renders blank. Build does not catch it (same class as F019/P018 — Vite does not validate undefined identifiers in function bodies). **Fix:** Added `const showTrading = data?.incomeType === 'variable';` immediately after the `fmt` declaration in `QuickLog` — canonical P002 pattern, identical to ImpulseTab and all other trading-conditional components. One line, no logic change. See CHANGELOG F040 (2026-05-11). |
| F029 | 2026-05-09 | Owner (architectural observation, no tester yet) | Fixed (Salary) | 🟡 UX Confusion (anticipated) | Fixed profile users see a "Capital %" column in the allocation rules table (Settings → Profit allocation by stage). The label was introduced in F028 as a neutral replacement for "Trading %" for non-Variable profiles. However, for Fixed users specifically, `tradingPct` does not allocate to a capital pool — it silently redirects to Goals under the hood (`effectiveGoalsPct = goalsPct + tradingPct` for `incomeType === 'fixed'`, App.jsx ~line 3334). A Fixed tester who enters a value in "Capital %" expecting it to build a capital balance will see it go to Goals instead, with no indication this is happening. | **Pending — no action until Fixed tester surfaces or owner prioritises** | No Fixed testers in closed beta yet. Two resolution paths when this is actioned: (A) rename the column to "Goals %" for Fixed users only, reflecting actual behavior (`data.incomeType === 'variable' ? 'Trading %' : data.incomeType === 'fixed' ? 'Goals %' : 'Capital %'`); or (B) stop redirecting `tradingPct` to Goals for Fixed and instead zero the column and hide it, forcing all goal allocation through `goalsPct`. Option A is display-only and safe. Option B touches allocation engine and requires migration consideration for Fixed users who have non-zero `tradingPct` in their stage rules. Recommend Option A unless a product reason emerges to separate the two pools. |

---

### How to add a new entry

1. Assign the next sequential ID (`F009`, `F010`, etc.)
2. Record date, tester alias, their profile type
3. Assign a category (pick from Section 1)
4. Write the description in the tester's own words — don't interpret yet
5. Set status to `New`
6. Send the appropriate response template (Section 3)
7. Update status to `Investigating` or `Pending` as appropriate
8. Come back and update `Resolution` when the item closes

Do this for every piece of feedback, even if it seems minor. The log is where patterns emerge.

---

## Section 5 — Pattern Recognition

### Weekly Diagnostic Questions

Ask these every Friday before reviewing the log:

1. **Are 2+ testers reporting the same issue?**
   Yes → Assign Pattern status. Move from Pending to Investigating. Don't wait for n=3 for bugs.

2. **Are testers getting stuck at the same point in onboarding?**
   Yes → Onboarding UX gap. Check the step they describe. Update copy or the tester guide first; rebuild only if copy doesn't fix it.

3. **Are testers requesting the same feature independently?**
   Yes → Real demand signal. Log it as a roadmap candidate. Don't build it yet.

4. **Is one tester producing the majority of critical feedback?**
   Yes → Calibrate. Check if their profile matches the intended audience. Heavy critical feedback from one person may indicate a profile fit mismatch, not a product problem.

5. **Are testers going quiet?**
   Yes → Engagement problem. Check whether the app is confusing enough that they've stopped trying, or whether life just intervened. Follow-up with T6 template. If response rate drops below 50% of enrolled testers, pause and assess.

6. **Are bugs clustering in one area of the app?**
   Yes → That module needs a targeted review. Don't patch individually; look at the system.

---

### Friday Review Checklist

Run this every Friday during active beta:

- [ ] Open `TESTER_FEEDBACK_HANDBOOK.md` → Feedback Log
- [ ] Check all items with status `New` — have they been triaged and responded to?
- [ ] Check all items with status `Investigating` — is there an update to add?
- [ ] Check all items with status `Pending` — has any other tester independently reported the same thing this week?
- [ ] Scan `CHANGELOG.md` — does every `Acted On` item in the log have a corresponding entry?
- [ ] Count active testers this week (sent at least one message or logged something in the app)
- [ ] Note any tester who's been silent for 7+ days — send T6 if needed
- [ ] If 2+ Pending items have the same underlying cause, merge them in the log and move to Pattern
- [ ] Update the log — no item should sit at `New` for more than 48 hours

Time required: 15–20 minutes. Do this before opening the code editor, not after.

---

## Section 6 — Escalation Rules

These situations require immediate action beyond the normal triage flow.

---

### E1 — Data Loss Report

**Trigger:** Tester reports that data they entered is missing, overwritten, or reset.

**What "escalate" means:**
1. Stop new tester onboarding immediately
2. Investigate the Supabase `user_data` table for the affected user — check the `updated_at` timestamp and JSONB blob
3. If confirmed: check whether the sync logic (local → cloud, cloud → local) has a conflict resolution bug
4. Communicate to all active testers within 4 hours: "We've identified a data sync issue and are investigating. No action needed from you — your data is safe / [being recovered]."
5. Do not push a fix until you've confirmed the fix in a dev environment
6. Post-mortem in `DEVELOPMENT_NOTES.md` once resolved

**Never:** Tell a tester their data is fine if you haven't actually checked.

---

### E2 — Privacy Concern

**Trigger:** Tester believes their personal data (name, email, financial figures) is visible to other users, or has been shared without consent.

**What "escalate" means:**
1. Take the report seriously immediately — do not wait for n=2
2. Verify in Supabase: RLS policies on `user_data`, `push_subscriptions`, `pin_reset_requests`
3. If a real leak is confirmed: disable cloud sync temporarily if needed
4. Contact the affected tester directly with confirmation of what was/wasn't exposed
5. Review `PRIVACY_POLICY.md` for disclosure obligations
6. Do not publicly acknowledge a privacy issue to all testers until you know the scope

---

### E3 — Security Issue

**Trigger:** Tester or anyone reports a way to access another user's data, bypass PIN protection, or inject data.

**What "escalate" means:**
1. Confirm the vulnerability (reproduce in dev, never in prod)
2. If confirmed: patch immediately, deploy, test
3. If you cannot patch within 24 hours: disable the affected feature
4. Do not disclose the specific vulnerability in public channels until patched
5. Notify affected users after the patch is deployed

---

### E4 — Repeated Complaints Blocking Core Flow

**Trigger:** 3+ testers independently report the same bug or confusion point that prevents them from completing a core task (onboarding, logging a spend, viewing Command tab).

**What "escalate" means:**
1. Pause new tester recruitment — don't add more people to a broken experience
2. Treat as 🔴 Critical regardless of original classification
3. Fix and verify before resuming recruitment
4. Message all active testers: "We've fixed an issue with [feature]. Please update and let me know if it's working."

---

## Section 7 — Examples Library

These are real feedback items received during the Royal Ledger beta, with the full handling trace. Reference these when a new situation feels similar.

---

### Example 1 — Design Suggestion that became a system redesign

**Original feedback (paraphrased):**
*"For a Foundation user, the initial 6-month buffer goal is a lot. Can you make it 3 months instead?"*

**Triage:** 🟢 Design Suggestion

**Initial assessment:** n=1. However, the underlying concern (6 months is psychologically daunting for low-income users starting from zero) was personally validated — I agreed this was true when I thought about the target audience.

**Response sent:** Acknowledged and asked what made it feel like too much — was it the number, the amount of money, or something else? Tester confirmed it was the feeling of being overwhelmed by a large target with no visible progress milestones.

**Decision:** Act. The root cause wasn't the number — it was the absence of intermediate milestones. Rather than lowering the target, the right fix was a staged system: 3 months → 6 months → 12 months, with visible progression and a named stage at each point.

**Outcome:** Foundation Arc implemented. The 3-month target is now the entry stage. Testers advance through stages naturally. The 6-month and 12-month targets remain as progression milestones, not an imposing single goal.

**Lesson:** When a suggestion points to a symptom (number feels big), dig for the root cause (no visible progress). The real fix was different from — and better than — what the tester proposed.

---

### Example 2 — Functional Bug confirmed immediately

**Original feedback (paraphrased):**
*"I spent R200 from my Discretionary budget but the Command tab still shows the original amount. The spending tracker didn't update."*

**Triage:** 🟠 Functional Bug

**Initial assessment:** Reproducible without clarifying questions — any spend through QuickLog would exhibit this. No need to ask for steps.

**Response sent:** "Confirmed — I can see this. Looking into it now. Fix expected within 24 hours."

**Diagnosis:** Two bugs found:
1. The Discretionary envelope cap wasn't updating when the spending budget was changed in Setup — a delta sync was missing
2. QuickLog was creating impulse entries without an `envelopeId` field, causing them to not match the Discretionary filter correctly

**Outcome:** Both bugs fixed (Fix 2A and Fix 2B). Tester confirmed resolution.

**Lesson:** Some bugs are immediately reproducible. Don't ask clarifying questions when you can reproduce it yourself — it slows the fix and frustrates the tester.

---

### Example 3 — UX Confusion, no code change needed

**Original feedback (paraphrased):**
*"What is the use of the Daily Checkpoint? I tap it but nothing happens."*

**Triage:** 🟡 UX Confusion

**Initial assessment:** The feature works correctly. Morning/midday/evening checkpoints are self-accountability markers — they're not automated triggers (except Sunday → weekly pulse, month-end → review). The confusion was in the label and the lack of visible outcome.

**Response sent:** Explained that checkpoints are intentional self-check-ins, not automated actions. On Sundays, completing the evening one opens the Weekly Pulse. At month-end, it opens the Monthly Review. Otherwise they work like a daily habit tracker — the counter shows "X remaining / All done today."

**Follow-up question asked:** "Does that make sense? And does the screen itself make that clearer, or is it still confusing once you know what it does?"

**Tester response:** "Makes sense now, but the screen doesn't explain it."

**Decision:** Added clarification to the tester guide. Deferred in-app copy update — noted as something to address in the next copy pass.

**Lesson:** Always ask whether the explanation makes it clear, or whether the UI itself is still the problem. The answer tells you whether you need a code change or just better documentation.

---

### Example 4 — Design Suggestion, held at n=1, not acted on

**Original feedback (paraphrased):**
*"The contact email should be support@ not hello@."*

**Triage:** ⚪ Preference / Aesthetic (or 🟢 Design Suggestion — borderline)

**Initial assessment:** This is legitimately a better choice — `support@` sets the right expectation for a support inbox. Personal validation: agreed. Also, n=1 but it's trivially reversible.

**Decision:** Act. Global find-replace across all files. Zero risk.

**Lesson:** The reversibility test matters. When a change takes 5 minutes and has no downside, acting on n=1 is appropriate. The friction cost of waiting for n=2 is higher than the risk of the change.

---

### Example 5 — Functional Bug, cross-component, subtle

**Original feedback (paraphrased):**
*"I can see the Trading tab even though I selected Fixed income. Is that a bug?"*

**Triage:** 🟠 Functional Bug

**Initial assessment:** Yes — the `showTrading` flag was incorrectly computed as `!isFoundation && incomeType !== 'fixed'`, which still evaluated to `true` for Mixed profile users. The feedback confirmed the bug was systemic (affected any non-Fixed, non-Foundation user incorrectly).

**Response sent:** "Yes, that's a bug. It should only appear for Variable income users. Fixing it now."

**Diagnosis:** The condition `incomeType !== 'fixed'` allowed Mixed profile to pass through. It needed to be `incomeType === 'variable'` to be strictly correct.

**Outcome:** Fixed for both `showTrading` and `showTradingDesk`. Verified against all four profile types.

**Lesson:** When a flag uses negation logic (`!== 'fixed'`), always check what other values it accidentally allows. Positive equality (`=== 'variable'`) is always safer for feature gating.

---

## Quick Reference Card

Tape this to your monitor during active beta.

```
INCOMING FEEDBACK — FIRST 3 QUESTIONS
1. Is something broken?     → Bug (🔴 or 🟠) → Fix it, ask minimal questions
2. Do they understand it?   → If no → UX Confusion (🟡) → Explain first
3. Are they proposing change? → Design Suggestion (🟢) → n=2 or personal validation

WHEN TO ACT
- n=1 + trivially reversible + you agree → act
- n=1 + complex change + you agree → wait for n=2
- n=1 + you don't agree → log, don't act, watch for pattern
- Bug → always act regardless of n

RESPONSE TIME
- 🔴 Critical: contact within 2h, fix within 24h
- 🟠 Functional: diagnose within 24h, fix within 72h
- 🟡 UX Confusion: respond within 24h
- 🟢 Suggestion: acknowledge within 24h, decision later
- 🔵 Request: acknowledge within 48h, defer

BEFORE CLOSING A FEEDBACK ITEM
- Did you send the T5 (loop-close) message?
- Did you update the feedback log status?
- Did you add a CHANGELOG.md entry if code was changed?
```

---

*Last updated: 2026-05-09*
*Owner: Royal Ledger development — internal use only*
