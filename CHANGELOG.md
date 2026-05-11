# Royal-Icon Ledger — Changelog

All changes are listed newest-first. Each entry records the **user/tester feedback** that triggered the fix, the **root cause**, and what was **changed**.

---

## Session — 2026-05-11 (F041: Stage calculation — Variable profile protective wealth)

---

### [Feature] F041 — Stage calculation now reflects total protective wealth for Variable profile

**Trigger:** Lebo (WhatsApp, 2026-05-11) — Profit Allocator "trading field doesn't do anything" on Variable profile. Diagnosis confirmed: stage was computed from buffer alone, placing her in Stage 1 (tradingPct: 0%) despite holding existing trading capital.

**Root cause:** Stage gate used `data.buffer` for all profiles. Variable users with existing trading capital were staged below their actual protective position, locking them into Stage 1 stageRules where tradingPct defaults to 0. The allocator silently produced zero trading capital output and the allocation row was hidden.

**Fix:** Variable users now stage on `protectiveWealth = buffer + tradingCapital`. Fixed, Hybrid, and Foundation unchanged. `longTerm` excluded as earmarked wealth (three converging signals: AllocationBlock note text, stage progression copy, and Profit Allocator description all frame long-term as funded-after-protection, not constituting-protection). Protect-mode override and protect-mode progress display both remain buffer-only (Resolution A). Command tab UI, progress bar, StageRow checkmarks, HelpTip copy, and "X buffer months" label updated to match.

**Tester thread resolved:** Lebo's protective wealth (₦30,000) does not cross the Stage 1.5 threshold (₦141,000), so her observed stage is unchanged. Conversation surfaced a separate positioning observation (she expected trading-profit projection, which Royal Ledger does not provide); product line held. No further code action.

**Commits:** `a974596` (core calculation), `282c01a` (UI + copy).

---

## Session — 2026-05-11 (F040: Quick Log blank render — P002 violation in QuickLog)

---

### [Bug] F040 — Quick Log sub-tab rendered blank for all profiles due to undeclared `showTrading`

**Trigger:** Katleho Mokoma (WhatsApp, 2026-05-11) — Quick Log tab blank on Fixed profile. Bug affects all profiles; Katleho is the first tester to use the Quick Log sub-tab.

**Root cause:** `QuickLog` (App.jsx line 4332) is a top-level function separate from `ImpulseTab` — no closure access to `ImpulseTab`'s `const showTrading`. `QuickLog` referenced `showTrading` at line 4366 without declaring it, throwing `ReferenceError: showTrading is not defined` at render time. Same class of undefined-identifier crash as F019/P018 — build does not catch it.

**Fix — `src/App.jsx`:** Added `const showTrading = data?.incomeType === 'variable';` at the top of `QuickLog`'s function body. Canonical P002 pattern.

**Build:** Verified clean (commit `2147f4b`).

---

## Session — 2026-05-10 (F036–F039: Goal progress tracking, dashboard card, PIN gate, subtitle)

---

### [Bug] F036 — Foundation goal progress bar used wrong source in Stage 1; stage-boundary cliff caused bar to reset to $0

**Trigger:** Owner tested YOUR SAVINGS after adding money via Money Allocator. Progress bar showed $0 despite the savings balance growing. Separately, at ~$106K savings (Stage 2 boundary), the bar disappeared entirely — confirmed the bar was switching sources on the stage boundary.

**Root cause (Stage 1 zero):** The F034 fix correctly pointed `savingsProgress` at `data.futureGoals` but `data.futureGoals` is always $0 in Stage 1 — the waterfall doesn't feed the goals account until Stage 2. The bar was technically correct per the formula but useless to the user for the entire first stage.

**Root cause (stage-boundary cliff):** A hard `progressStage < 2` guard switched the tracking source from `data.buffer` to `data.futureGoals` the instant the user crossed the Stage 2 threshold. At the moment of crossing, `data.futureGoals` was $0, so the bar jumped from ~$106K progress to $0.

**Fix — `_goalSaved` balance-driven derivation:**
```js
const _goalSaved = isFoundation
  ? ((data.futureGoals || 0) > 0
      ? (data.futureGoals || 0)   // Goals pool funded — track that
      : (data.buffer || 0))       // Not yet funded — proxy with buffer
  : (data.futureGoals || 0);
```
- Stage 1: bar tracks `data.buffer` → rises as savings build, gives the user meaningful feedback
- Stage 2+: switches to `data.futureGoals` only once that pool is non-zero → no cliff
- Non-Foundation: reads `data.futureGoals` directly (unchanged)

**Also changed:** Stage 1 note in the goal display block updated to: *"Tracking your savings toward this goal. Hit Stage 2 to unlock a dedicated goals account."*

**Build:** Verified clean (commit `b5b9d0d`).

---

### [Bug] F037 — Foundation dashboard goal card read data.futureGoals directly — showed $0 and broken progress bar in Stage 1

**Trigger:** After F036 fixed the YOUR SAVINGS card, owner screenshots confirmed the Foundation Command tab goal card (a second, separate display component) still showed $0 saved and a flat progress bar. The card appeared correct in the header but wrong in the body.

**Root cause:** Two independent goal display components existed in App.jsx. F034/F036 fixed the YOUR SAVINGS card. The Foundation Command dashboard card (lines ~2769–2787) was a separate render block that read `data.futureGoals` directly — not via `_goalSaved` — so it was untouched by the earlier fix.

**Fix — `src/App.jsx`:**
Replaced all three `data.futureGoals` references in the dashboard card with `_goalSaved`:
- Amount label: `{fmt(_goalSaved)} saved`
- Progress bar width: `Math.min(100, (_goalSaved / data.goals[0].target) * 100)`
- Percentage text: `{Math.min(100, (_goalSaved / data.goals[0].target) * 100).toFixed(0)}% of target`

**Build:** Verified clean (commit `b5b9d0d`).

---

### [Bug] F038 — Edit goal and Add goal entry points had no PIN protection

**Trigger:** Owner noticed the goal editor opened immediately on tap — no PIN challenge — despite Setup → Goals being PIN-locked.

**Root cause:** `openGoalEditor` was called directly at all three entry points. The `usePinGate` hook existed and was used for other sensitive actions but was not wired to goal editing.

**Fix — `src/App.jsx`:**
- Added `const { attempt: attemptGoalEdit, gate: goalEditGate } = usePinGate();`
- Rendered `{goalEditGate}` in the gate portal block (alongside `{unlockGate}`)
- Changed all three call sites from `openGoalEditor` to `() => attemptGoalEdit(openGoalEditor)`:
  1. Edit goal button in YOUR SAVINGS card
  2. "+ Add goal" button in YOUR SAVINGS card
  3. Foundation savings nudge CTA (`ctaAction === 'goal'`)

**Build:** Verified clean (commit `ff28288`).

---

### [Bug] F039 — Future Goals balance card subtitle showed "1 goal" for Foundation Stage 1 users (goals pool $0)

**Trigger:** Owner observed the Future Goals card on the Command tab showed "1 goal" as the subtitle for a Foundation user who had set a goal during onboarding — even though `data.futureGoals` was $0 and the account hadn't started receiving funds.

**Root cause:** The `note` prop counted `data.goals.length` regardless of whether the goals pool had any money. A goal defined in `data.goals` but with no funding in `data.futureGoals` reads as active, creating the misleading "1 goal" subtitle before the account is live.

**Fix — `src/App.jsx`:**
```jsx
note={
  isFoundation && (data.futureGoals || 0) === 0
    ? 'Starts at Stage 2'
    : (data.goals || []).length > 0
      ? `${(data.goals || []).length} goal${(data.goals || []).length === 1 ? '' : 's'}`
      : 'Add goals in Setup'
}
```
Foundation users now see "Starts at Stage 2" until their goals account receives its first allocation. Once funded, they see the goal count. Non-Foundation users unaffected.

**Build:** Verified clean (commit `7609dfd`).

---

## Session — 2026-05-10 (F034 + F035: Goal system consolidation + Foundation onboarding goal step)

---

### [Feature] F034 — Goal system consolidated: YOUR SAVINGS card now reads/writes data.goals; progress tracks data.futureGoals

**Trigger:** Owner identified that the YOUR SAVINGS "Set Goal" editor wrote to `data.savingsGoal` (an orphan field), while progress was incorrectly measured as `data.buffer / target` (emergency fund vs goal target). Separately, `data.goals` (the array used by Setup → Goals) and `data.futureGoals` (the actual savings pool fed by the waterfall allocator) were disconnected from the savings card entirely.

**Root cause:** Three separate goal systems existed with no wiring between them:
1. `data.savingsGoal` `{ name, target }` — written only by the YOUR SAVINGS editor, never read by anything else
2. `data.futureGoals` (number) — the actual money in the goals account, accumulated via the Profit Allocator waterfall
3. `data.goals` `[{ id, name, target }]` — named targets managed in Setup → Goals

Progress calculation used `data.buffer / target` — comparing the emergency fund balance against a goal target. This caused the "$7.1M savings goal" bug where a previously stored large buffer value appeared as savings progress.

**Changes — `src/App.jsx`:**
| Location | Change |
|---|---|
| `openGoalEditor` | Now reads from `data.goals[0]` instead of `data.savingsGoal` |
| `saveGoal` | Writes to `data.goals` array (updates `goals[0]` or creates new entry); removed incorrect `target <= data.buffer` validation |
| `primaryGoal` derived variable | Introduced as `(data.goals \|\| [])[0]` — single source of truth for the Foundation savings card |
| `hasSavingsGoal` | Now `!!(primaryGoal?.name && primaryGoal?.target > 0)` |
| `savingsProgress` | Now `(data.futureGoals \|\| 0) / primaryGoal.target` — correct pool vs target |
| Goal editor button label | `{(data.goals \|\| [])[0] ? 'Edit goal' : 'Set a goal'}` |
| Goal display block | Full replacement — shows `primaryGoal.name`, progress against `data.futureGoals`, Stage 1 note ("Goal funding starts at Stage 2") |

**Migration note:** Existing users with `data.savingsGoal` stored in Supabase will not see their old goal automatically — `data.savingsGoal` is now effectively deprecated. They will see "Set a goal" and can re-enter via the updated editor, which writes to `data.goals`.

**Build:** Verified clean.

---

### [Feature] F035 — Foundation onboarding Step 7 now collects a savings goal; auto-populates YOUR SAVINGS card on first launch

**Trigger:** Owner observation: Foundation users exit onboarding with `data.goals` empty, so YOUR SAVINGS card shows "Set a goal" on first launch despite the user having a savings intent. Proposal: collect the goal during onboarding so the card is pre-populated at setup completion.

**Root cause:** Foundation onboarding had no goal step. `data.goals` was only populated via Setup → Goals after onboarding. Standard profiles were unaffected (they have no savings goal card), but Foundation users had to navigate to a separate Setup section before their savings dashboard became meaningful.

**Changes — `src/components/Onboarding.jsx`:**
| Location | Change |
|---|---|
| State | Added `onboardingGoalName` and `onboardingGoalTarget` local state |
| Step 7 Foundation branch | Added optional goal section below milestone cards: goal name input (always shown), target amount input (shown only once name is entered) |
| `finish()` | If `incomeType === 'foundation'` and goal name provided, writes `[{ id, name, target, createdAt }]` prepended to `data.goals` |

**Standard profiles unaffected:** Goal section is inside the `incomeType === 'foundation'` branch of Step 7. Fixed/Variable/Hybrid users never see this step. Their `data.goals` continues to be populated exclusively via Setup → Goals.

**Goal is optional:** Both name and target can be left blank — no validation added to Step 7. If blank, no goal is written. User can always set or change via YOUR SAVINGS card or Setup → Goals post-onboarding.

**Build:** Verified clean.

---

## Session — 2026-05-10 (F032 + F033: Profile descriptor fix + Drawdown Protocol gate)

---

### [Copy] F032 — Hybrid descriptor word order corrected across all 5 display locations

**Trigger:** Owner profile-label verification audit — confirmed descriptor wording did not match canonical label table.

**Root cause:** Descriptor was written as "Steady salary, plus business or side income" at all locations. Canonical order per product label table is "Steady salary, plus side income or business" (side income leads because it is the more common case; business is the less common).

**Locations fixed:**
| File | Location | Was | Now |
|---|---|---|---|
| `Onboarding.jsx` | Step 4 picker card | `plus business or side income.` | `plus side income or business.` |
| `Onboarding.jsx` | Mismatch modal suggestion | `plus business or side income` | `plus side income or business` |
| `App.jsx` | GraduationModal picker | `plus business or side income.` | `plus side income or business.` |
| `App.jsx` | AccountSettings profile picker | `plus business or side income.` | `plus side income or business.` |
| `App.jsx` | AccountSettings Income Profile HelpTip | `with a business or side income.` | `with side income or a business.` |

**Build:** `a50a6bc` — 2 files changed.

---

### [Bug] F033 — Drawdown Protocol banner and high-water mark gated strictly to Trading/Self-employed

**Trigger:** Owner profile verification audit identified that the drawdown banner condition (`incomeType !== 'fixed' && !isFoundation`) included Hybrid (`'mixed'`) — a profile that does not have the Drawdown Protocol.

**Root cause:** Two connected issues:
1. High-water mark `useEffect` only skipped `'fixed'`, so Hybrid capital pool was being tracked against a high-water mark
2. Banner cascade drawdown condition fired for any non-fixed, non-Foundation profile — which includes Hybrid

**Risk realised:** A Hybrid user who enters a capital pool value and later sees it drop by 10%+ would receive a Drawdown zone alert — a feature explicitly listed as not included in the Hybrid profile.

**Fixes — `src/App.jsx`:**
| Location | Was | Now |
|---|---|---|
| High-water mark `useEffect` gate | `if (data.incomeType === 'fixed') return;` | `if (data.incomeType !== 'variable') return;` |
| Banner cascade drawdown condition | `data.incomeType !== 'fixed' && !isFoundation && drawdownZone !== 'normal'` | `data.incomeType === 'variable' && drawdownZone !== 'normal'` |

**Unaffected:** Hybrid Capital Pool balance field, allocation routing (`toTrading` block), Capital % column label — all of these correctly show for both `variable` and `mixed`. Only the Drawdown Protocol specifically is now gated to `variable` only.

**Build:** `fd0e36d` — 2 files changed.

---

## Session — 2026-05-10 (F028 addendum: Full trading copy sweep across all components)

---

### [Bug] Remaining trading copy cleaned from Hybrid/non-Variable surfaces — 9 additional strings

**Trigger:** Owner found "Enter your gross trading profit" in the Profit Allocator subtitle and HelpTip for Hybrid users, after the initial F028 commit (c84bea3) which fixed Impulse Control, Command Stage 3, and the trigger picker.

**Root cause:** The initial F028 pass fixed strings in `ImpulseTab` and `Command` tab display areas, but missed deeper copy inside the `ProfitAllocator`, `Setup`, and `AccountSettings` components — all of which used an unguarded `else` branch covering both Variable and Hybrid.

**Strings fixed — `src/App.jsx`:**

| Component | Location | Was | Now |
|---|---|---|---|
| `ProfitAllocator` | HelpTip | "Enter your gross trading profit… trading capital each receive…" | Conditional: Variable gets original; Hybrid gets "gross profit… capital each receive…" |
| `ProfitAllocator` | Subtitle paragraph | "Enter your gross trading profit. The system reserves taxes…" | Conditional on `showTrading` |
| `ProfitAllocator` | Input label | "Gross trading profit this month" | `showTrading ? 'Gross trading profit this month' : 'Gross profit this month'` |
| `Setup` | Buffer reserve HelpTip | "in addition to trading profits… between trading months" | Conditional on `showTrading` |
| `Setup` | Buffer reserve sublabel | "in addition to trading profits" | Conditional on `showTrading` |
| `Command` | Current balances HelpTip | "trading capital, family buffer…" (else branch) | `showTrading` conditional |
| `Command` | All Snapshots HelpTip | "buffer, trading capital, long-term savings…" | `showTrading ? 'trading capital' : 'capital'` |
| `AccountSettings` | Tax Reserve HelpTip | "trading profit" / "trading capital" (else branch) | Conditional on `showTrading` |
| `AccountSettings` | Tax Reserve paragraph | "gross trading profit" | Conditional on `showTrading` |

**`showTrading` added to:** `ProfitAllocator`, `Setup`, `Command`, `AccountSettings`. Each component now declares `const showTrading = data?.incomeType === 'variable';` independently — not inherited. Pattern logged in DEVELOPMENT_NOTES §4.

**Build:** `index-B6tVshU0.js` — ✓ built in 5.27s, zero errors.

---

## Session — 2026-05-10 (F030: Mix profile renamed to Hybrid)

---

### [UX] Mixed profile display label renamed from "Mix" to "Hybrid" across all user-facing surfaces

**Trigger:** Owner observation — "Mix" is too casual and reads ambiguously as either a noun or a verb. Three candidates evaluated: Mix (current), Mixed, Hybrid.

**Decision: Hybrid**
- Describes what the profile *is* — two income systems running in parallel (salary base + business/side income). "Mix" describes neither the structure nor the intent.
- "Mixed" is grammatically correct but bland — the default word when no better word is found.
- "Hybrid" carries intent: deliberate combination of stability and variable upside. Fits Royal Ledger's considered brand voice.
- Short enough for all UI surfaces (card title, modal button, tab).
- No negative connotations in context.

**Internal value: unchanged.** `incomeType === 'mixed'` persists in Supabase and all conditionals. Display label only — same pattern as F024 (Foundation → "Building from zero", Fixed → "Salary").

**Touch points changed — `src/App.jsx`:**
- GraduationModal profiles array: `label: 'Mix'` → `label: 'Hybrid'`
- Settings HelpTip bold: `⚡ Mix` → `⚡ Hybrid`
- Settings picker card: `title: 'Mix'` → `title: 'Hybrid'`
- Code comments updated for internal accuracy

**Touch points changed — `src/components/Onboarding.jsx`:**
- Step 4 picker card: `title: 'Mix'` → `title: 'Hybrid'`
- Mismatch modal button heading: `Mix` → `Hybrid`

**Excluded (admin/marketing, pre-existing scope rule):**
- `AdminDashboard.jsx` — uses "Mixed", not user-facing, unchanged
- `EarlyAccess.jsx` — marketing page, separate audience, unchanged

**Verification:** grep for `'Mix'`, `"Mix"`, `>Mix<` across `src/` returned zero matches.

---

## Session — 2026-05-09 (F028: Trading Copy Leakage to Non-Variable Profiles)

---

### [Bug] Trading copy filtered to Variable-only across three touch points

**Feedback:** Tester reported seeing trading-related text (1) in the Impulse Control section description and (2) on the Command menu — on a profile that is not Trading / Self-employed.

**Root cause:** Three places in `src/App.jsx` used trading-specific copy without gating it behind `incomeType === 'variable'`:

1. **Impulse Control subtitle** — the non-Foundation fallback read *"Same rules whether you're up or down. Your family's life shouldn't ride your trading P&L."* This rendered for **all** non-Foundation profiles (Salary and Mix included).
2. **Command tab — Stage 3 description** — `stageInfo[3].desc` read *"Full waterfall unlocked — trading, lifestyle, goals."* for all non-Foundation users, regardless of whether they have a trading business.
3. **Quick Log — Trigger picker** — `TRIGGERS` array contained "Won a trade" and "Lost a trade" and was mapped unfiltered for all profiles. Salary and Foundation testers saw these chips with no context.
4. **Spending Gate — Guard notice** — hardcoded label "Trading guard active" (low-severity — this banner can only appear if `tradingGuardUntil` is set, which requires the TradingTab, exclusive to Variable; but label updated for consistency).

**Fixes — `src/App.jsx`:**

- `ImpulseTab`: added `const showTrading = data?.incomeType === 'variable';` alongside existing `isFoundation` derivation.
- Impulse Control subtitle: `showTrading ? '<trading copy>' : 'Pause before every unplanned purchase. The gate creates friction between impulse and action.'`
- Stage 3 desc: `data.incomeType === 'variable' ? 'Full waterfall unlocked — trading, lifestyle, goals.' : 'Full waterfall unlocked — lifestyle and goals fully active.'`
- Trigger picker: `(showTrading ? TRIGGERS : TRIGGERS.filter(t => t !== 'Won a trade' && t !== 'Lost a trade')).map(...)`
- Guard notice: `showTrading ? 'Trading guard active' : 'Emotional guard active'`

**Profile impact:** Salary (Fixed) and Mix — no trading copy visible anywhere in Impulse Control or Command tab. Variable — no change, all trading copy preserved.

---

### [UX] Mix profile description and allocation column renamed — bundled into F028

**Trigger:** Owner observation that the Mix profile subtitle *"Steady salary, plus side income or trading on top"* was inconsistent with F028's removal of trading copy from Mix — the description promised a trading context the profile no longer surfaces.

**Analysis — what Mix actually does vs Variable:**
- Mix shares the Profit Allocator and the Trading Capital balance field with Variable
- Mix does **not** have the Trading P&L tab, Drawdown protocol, or emotional trading guard
- "Trading capital" as a balance pool is valid for Mix, but "trading" as the primary description is misleading — Mix serves salary earners with a business, freelance income, investments, or any extra income stream that isn't their primary trade

**Rename decision: "Capital %" (not "Side income %", "Business %", or "Other %")**
- "Capital %" describes what the column **does** (allocation of a non-spending pool), not the source of money
- Umbrella term: covers trading capital, business reinvestment, freelance reserves, investments — all valid Mix use cases
- Variable users retain "Trading %" — same mechanical slot, different label, different context. Correct, not confusing.
- `tradingPct` state key **unchanged** — persisted in Supabase, renaming would break existing data. Label is purely cosmetic.

**Fixes — bundled into same commit:**

`src/App.jsx`:
- `RuleInput label`: `"Trading %"` → `data.incomeType === 'variable' ? 'Trading %' : 'Capital %'`
- Allocation HelpTip: `"trading capital"` → `data.incomeType === 'variable' ? 'trading capital' : 'capital'`
- Allocation subtitle paragraph: `"How net trading profit"` → conditional for Variable / Fixed / Mix
- GraduationModal Mix desc: *"Steady salary, plus side income or trading on top."* → *"Steady salary, plus business or side income."*
- Settings HelpTip Mix entry: *"for a steady salary with side income or trading on top"* → *"for a salary earner with a business or side income"*
- Settings picker card Mix desc: same fix

`src/components/Onboarding.jsx`:
- Onboarding Step 4 picker card Mix desc: same fix
- Mismatch modal Mix button sub-label: same fix

**Touch points with "trading on top" after fix:** zero (verified by grep).

---

## Session — 2026-05-09 (F027: Onboarding Subtitle Brand-Voice Refinement)

---

### [UX] Onboarding Step 4 subtitle — owner-authored copy with brand voice

**Feedback:** F026 shipped a consistency sweep with subtitle copy *"This shapes how the system works for you — buffer targets, allocator rules, and which features show up. You can ask support to change it later."* On post-deploy review, owner flagged the line as still suboptimal — "allocator rules" is jargon, the three-item list is technical, and ending on "ask support to change" terminates on friction.

**Owner-authored replacement (shipped):**

> *"This shapes how Royal Ledger protects, allocates, and manages your money. Pick what matches your reality today. We'll tailor the rest around it."*

**Why it's a real improvement over F026:**
- **First sentence answers "why does this matter?"** before the user has to ask. Names the brand explicitly.
- **Three plain verbs** (protects / allocates / manages) describe outcomes, not mechanics. Each is instantly understood — protects = buffer, allocates = routing, manages = catch-all.
- **Two-beat rhythm** — framing → action — reads considered, not rushed.
- **Brand insertion** ("Royal Ledger") signals confidence without self-importance.

**Implementation — single touch point:**

`src/components/Onboarding.jsx` — Step 4 subtitle replaced. No other code changes. No data model changes. No backward-compat concerns (pure copy).

**Verbs evaluated and rejected during review:**
- "guides" — implies giving financial advice (regulatory exposure)
- "grows" — inaccurate, Royal Ledger doesn't actively grow money
- "structures" — slightly cold, breaks the natural rhythm of `-tects / -ates / -ages`

"Manages" retained as the catch-all third verb — accurate, rhythmic, avoids legal exposure.

**Build verification:** ✅ `npx vite build` clean, new bundle hash `index-_Z8htjEB.js`.

---

## Session — 2026-05-09 (F026: Profile Terminology Consistency Sweep)

---

### [UX] Profile terminology consistency — old "Variable income / Fixed income" copy aligned with new picker labels

**Feedback:** Owner observed in F024 deploy verification that the Onboarding Step 4 subtitle still read *"Variable income needs a bigger buffer; fixed income needs less"* — old terminology persisting after the F024 Commit 1 picker label redesign. Owner asked for the new framing to be applied across standard profiles too.

**Decisions (locked in F026 spec):**
- Subtitle copy: **Option A** — drop technical jargon entirely
- Scope: **Medium** — subtitle + Settings → Income Profile HelpTip + buffer-step descriptions
- Phrasing pattern in helper copy: **conditional** ("for steady monthly paychecks") not profile-named ("Salary users have")
- Out of scope: `tester-guide.html` (separate doc), marketing site, AdminDashboard internal labels, `incomeType === 'fixed'` conditionals that toggle functional terms ("Surplus" vs "Profits" — those are correct functional copy, not profile-name references)

**Implementation — three touch points:**

1. **`src/components/Onboarding.jsx` Step 4 subtitle** — replaced *"This adjusts the system's defaults. Variable income needs a bigger buffer; fixed income needs less. You can update this later in Settings."* with: *"This shapes how the system works for you — buffer targets, allocator rules, and which features show up. You can ask support to change it later."* No more profile-name jargon. Reframes from system-mechanics to user-situation. Also corrects "update this later in Settings" — currency and profile are admin-only changes per F015.

2. **`src/components/Onboarding.jsx` 18-month buffer description** — replaced *"Sole earner with dependents. Variable income. The fortified position."* with: *"Sole earner with dependents, or income that changes month to month. The fortified position."* Conditional phrasing — describes the situation rather than naming a profile.

3. **`src/App.jsx` Settings → Income Profile HelpTip** — full rewrite of the four-line legend. Each profile now uses the new emoji+label combination (matching the F024 Commit 1 picker) and conditional "for X" phrasing instead of profile-named:
   - "🌱 **Building from zero** — for savings from scratch..."
   - "💼 **Salary** — for a steady monthly paycheck..."
   - "📈 **Trading / Self-employed** — for income that changes month to month..."
   - "⚡ **Mix** — for a steady salary with side income or trading on top..."

**What does NOT change:**
- Functional terms preserved: ProfitAllocator's runtime behavior of swapping "Profit" → "Surplus" for Fixed-income users, "Money Allocator" for Foundation, etc. These are correct functional copy.
- Stage descriptions in HelpTips that branch on `incomeType === 'fixed' ? 'surplus' : 'profits'` — these are functional, not profile-name references.
- Marketing site copy (`src/marketing/*`) — separate flow, separate audience, deliberately out of scope.
- Tester guide HTML (`tester-guide.html`) — out of scope for this commit per F026 Medium scope; can update in a doc-only follow-up.
- AdminDashboard's internal profile labels — admin-facing, doesn't reach testers.
- F024's three commits — all preserved.

**Build verification:** ✅ `npx vite build` clean, new bundle hash `index-C05OFzEX.js`.

---

## Session — 2026-05-09 (F024 Commit 3 of 3: Onboarding Mismatch Modal)

---

### [SAFETY NET] Foundation profile mismatch modal — fires once at end of onboarding

**Feedback:** F024 final commit. The original tester picked "Foundation" because the word evoked "beginner" while their actual situation was Salary with R 5M in pre-existing savings. Commit 1 fixed the labels. Commit 2 added time guards. **Commit 3 adds the explicit safety net** — if a user picks "🌱 Building from zero" but enters starting savings already covering 12+ months of expenses, a one-time modal offers them a chance to switch to a more appropriate profile before they land on the main app.

**Implementation — three coordinated changes:**

1. **`src/App.jsx` `defaultData`** — added `mismatchCheckShown: false`. Documented inline. Existing users get `false` via the spread default; the modal logic only runs in Onboarding `finish()` (never on app load), so legacy users never see it.

2. **`src/components/Onboarding.jsx` `finish()`** — computes mismatch condition before the existing setData call:

   ```js
   const _totalExpensesAmount = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
   const _monthlyNeeds = _totalExpensesAmount + (Number(spendingBudget) || 0) + (Number(bufferReserve) || 0);
   const _startingBufferNum = Number(startingBuffer) || 0;
   const _monthsCovered = _monthlyNeeds > 0 ? _startingBufferNum / _monthlyNeeds : 0;
   const _showMismatchModal = incomeType === 'foundation' && _monthsCovered >= 12;
   ```

   The denominator is the simple form (`expenses + spendingBudget + bufferReserve`), not the F022 Math.max defensive form. At onboarding time, envelopes are about to be created from the same data — envelope total ≤ this sum, so Math.max would be redundant.

   - If `_showMismatchModal` is `false`: `mismatchCheckShown: true` is written immediately and `onComplete()` is called as before.
   - If `_showMismatchModal` is `true`: `mismatchCheckShown: false` stays (until modal handler runs), `setMismatchModalOpen(true)` triggers the overlay, `onComplete()` is **not** called yet.

3. **`src/components/Onboarding.jsx` modal render** — full-screen overlay (`zIndex: 2000`) above all onboarding content. Cannot be dismissed by backdrop click — user must pick a button:
   - **💼 Salary** → `setData({incomeType: 'fixed', mode: 'standard', mismatchCheckShown: true})` → `onComplete()`
   - **📈 Trading / Self-employed** → `setData({incomeType: 'variable', mode: 'standard', mismatchCheckShown: true})` → `onComplete()`
   - **⚡ Mix** → `setData({incomeType: 'mixed', mode: 'standard', mismatchCheckShown: true})` → `onComplete()`
   - **Stay on Foundation** → `setData({mismatchCheckShown: true})` (no `incomeType` change) → `onComplete()`

   All four paths set `mismatchCheckShown: true` before `onComplete()`, so the modal can never re-fire under any condition.

**Why placement inside Onboarding component:** Per Adjustment 2 from the assessment phase. If the modal logic lived in App.jsx and read from `data` directly, any existing user whose data state happened to satisfy the condition (`foundation` + 12mo + `mismatchCheckShown` falsy) would see the modal on next load. By rendering inside Onboarding's return tree and gating on local state (`mismatchModalOpen`), the modal is bounded by the onboarding flow only. Existing users never re-enter Onboarding (parent gates `showOnboarding` on `!data.setupComplete`), so they never see this modal regardless of their data.

**Routing model preserved:** `setupComplete: true` is written in the initial `setData` call alongside all other onboarding fields. Onboarding stays mounted until `onComplete()` is called (which flips parent's `showOnboarding` state). The modal blocks `onComplete()` until resolved.

**Mental trace — original F024 tester scenario (R 5M, monthlyNeeds R 373k):**
- After they enter starting buffer R 5M, click "Open the dashboard"
- `_monthsCovered = 5M / 373k = 13.4` → `_showMismatchModal = true`
- setData writes all fields including `setupComplete: true`, `mismatchCheckShown: false`
- Modal renders. They pick "💼 Salary"
- setData writes `incomeType: 'fixed', mode: 'standard', mismatchCheckShown: true`
- `onComplete()` called → land on Command tab as Salary user
- The Foundation Arc no longer applies (they're now Fixed) — no banner false-fire

**Mental trace — Foundation user who legitimately deserves Foundation:**
- Picks "🌱 Building from zero", enters R 50,000 starting buffer with R 25,000 monthly needs
- `_monthsCovered = 2`, < 12 → `_showMismatchModal = false`
- setData writes everything including `mismatchCheckShown: true` immediately
- `onComplete()` called → land on Command tab as Foundation user
- Foundation Arc applies normally

**Mental trace — existing user (legacy):**
- `mismatchCheckShown: false` (default from spread)
- They never re-enter Onboarding (parent gates `showOnboarding` on `!setupComplete`)
- Modal never renders for them. **Zero behaviour change.**

**Mental trace — user adjusts data after onboarding to satisfy condition:**
- After onboarding, `mismatchCheckShown: true` is set
- User edits Setup tab, increases starting buffer to push themselves over 12 months
- Modal logic doesn't run on Setup-tab edits — only in Onboarding `finish()`
- Even if logic were re-checked elsewhere, the flag blocks it
- **No re-fire.**

**What does NOT change:**
- F022 Math.max defensive denominator preserved exactly
- F024 Commit 1 picker labels preserved
- F024 Commit 2 time guards preserved (still applied to whoever stays on Foundation post-modal)
- Onboarding step ordering, step count, summary screen
- `skip()` path — unchanged; users who skip onboarding don't see the modal (they may not even pick a profile)
- Non-Foundation users — entirely unchanged (modal gated on `incomeType === 'foundation'`)
- Banner cascade, GraduationModal, foundationStage derivation, allocation rules

**Build verification:** ✅ `npx vite build` clean, new bundle hash `index-CkMmoezx.js`.

**Cleanup snippet for the original F024 tester** (manual paste in browser console — NOT shipped in code):

```js
const d = JSON.parse(localStorage.getItem('open-trader-finance-v2'));
// Reset Foundation stage banner dismissals so corrected banners can re-evaluate
d.foundationStageBannersDismissed = [];
// Backdate setupCompleteAt 31 days so time guards from Commit 2 don't trap them
d.setupCompleteAt = new Date(Date.now() - 31 * 86400000).toISOString();
// Mark mismatch check as shown so the modal doesn't fire retroactively if they
// re-enter onboarding for any reason (they shouldn't, but defensive)
d.mismatchCheckShown = true;
localStorage.setItem('open-trader-finance-v2', JSON.stringify(d));
console.log('F024 tester cleanup applied. Refresh the app.');
```

After running this and refreshing, walk the tester through Settings → Income Profile to switch to Salary if appropriate, OR confirm they want to stay on Foundation.

**Status:** F024/F025 fully resolved across all three commits. Bundle ready for deploy: `index-CkMmoezx.js`.

---

## Session — 2026-05-09 (F024 Commit 2 of 3: Foundation Arc Time Guards)

---

### [PREVENTIVE] Foundation Arc stage banners now require minimum days since onboarding

**Feedback:** F024 follow-up — the underlying issue from a Foundation tester seeing "Foundation Complete" on day 1 with R 5M starting savings. F022 fixed the *denominator* (Math.max with envelope total). This commit fixes the *time* dimension — celebratory stage banners can no longer fire immediately after onboarding regardless of how legitimate the entered numbers are.

**Implementation — three coordinated changes:**

1. **`src/App.jsx` `defaultData`** — added new field `setupCompleteAt: null`. Documented inline as the F024 Commit 2 timestamp used for time-guard math. Legacy users (existing accounts with no value) receive `null` via the spread fallback on load.

2. **`src/components/Onboarding.jsx`**
   - `finish()` — sets `setupCompleteAt: d.setupCompleteAt || new Date().toISOString()`. The `||` pattern preserves the original timestamp if `finish()` were ever called twice (defensive).
   - `skip()` — same pattern. Users who skip onboarding still receive the timestamp so time guards apply consistently.

3. **`src/App.jsx` `foundationStage` derivation** — added `daysSinceSetup` computation and time guards on the stage transitions:

   ```js
   const daysSinceSetup = data.setupCompleteAt
     ? (Date.now() - new Date(data.setupCompleteAt).getTime()) / 86400000
     : Infinity;

   const foundationStage = (!isFoundation || !hasLoggedExpense || foundationMonthlyNeeds === 0)
     ? null
     : foundationMonths >= 12 && daysSinceSetup >= 30 ? 'complete'
     : foundationMonths >= 12 && daysSinceSetup >= 14 ? 'stable'
     : foundationMonths >= 6  && daysSinceSetup >= 14 ? 'stable'
     : foundationMonths >= 12 && daysSinceSetup >= 7  ? 'established'
     : foundationMonths >= 6  && daysSinceSetup >= 7  ? 'established'
     : foundationMonths >= 3  && daysSinceSetup >= 7  ? 'established'
     : 'starter';
   ```

**Threshold table:**

| Stage | Buffer coverage required | Days since setup required | Reasoning |
|---|---|---|---|
| `established` | ≥ 3 months | ≥ 7 days | Small celebration, low risk |
| `stable` | ≥ 6 months | ≥ 14 days | Medium milestone |
| `complete` | ≥ 12 months | ≥ 30 days | Big celebration, deserves real time-in-app to validate the numbers |

**Mental trace — original F024 tester scenario:**
- R 5M buffer, R 373k monthly needs, day 1 of usage
- `foundationMonths = 13.4` ✓ math threshold
- `daysSinceSetup = 1` ✗ all time guards fail (1 < 7)
- Result: `foundationStage = 'starter'` → **no celebratory banner**
- After 7 days: shows `'established'` (math allows complete, but time only allows established)
- After 14 days: shows `'stable'`
- After 30 days: shows `'complete'`

**Mental trace — legitimate Foundation user building over time:**
- Setup completes on day 0. Buffer R 0. Sets `setupCompleteAt`.
- Day 60: buffer reaches 3× monthly needs.
- `foundationMonths >= 3` ✓, `daysSinceSetup = 60 >= 7` ✓
- Result: `'established'` → banner fires correctly. No regression for real users.

**Mental trace — existing user (legacy, `setupCompleteAt: null`):**
- `daysSinceSetup = Infinity` (the `null → Infinity` fallback)
- All time guards satisfied (Infinity >= 30)
- Stage derives identically to pre-Commit-2 behavior. **No change for any existing user.**

**What does NOT change:**
- F022 Math.max defensive denominator preserved exactly — both fixes work together
- Threshold values for buffer coverage (3, 6, 12 months) unchanged
- Banner copy unchanged
- `foundationStageRules` allocation rules per stage unchanged
- `foundationStageBannersDismissed` mechanism unchanged
- GraduationModal / "Stay on Foundation" flow unchanged
- Non-Foundation profiles entirely unchanged (early-exit at `!isFoundation`)
- Onboarding step ordering / step count

**Build verification:** ✅ `npx vite build` clean, new bundle hash `index-Ds48WBSJ.js`.

**Status:** F024 Commit 2 of 3 shipped. Commit 3 (onboarding mismatch modal at 12-month threshold) pending owner review.

---

## Session — 2026-05-09 (F024 Commit 1 of 3: Profile Picker Label Redesign)

---

### [UX] Profile picker labels redesigned to situation-based descriptions

**Feedback:** F024 tester verbatim — *"Foundation was understanding, Variable was confusing and Mixed was technical."* Tester picked Foundation because the word evoked "beginner" while their actual situation was Salary (Fixed). Existing labels are jargon-leaning; new labels describe the user's situation directly.

**Mapping (display label → underlying `incomeType` value, **unchanged**):**

| New label | Descriptor | Internal `incomeType` |
|---|---|---|
| 🌱 Building from zero | For people starting savings from scratch | `'foundation'` |
| 💼 Salary | Steady paycheck every month | `'fixed'` |
| 📈 Trading / Self-employed | Income changes month to month | `'variable'` |
| ⚡ Mix | Steady salary, plus side income or trading on top | `'mixed'` |

**Backward compatibility:** `incomeType` field values in `defaultData` and existing user data are untouched. Only the display labels change. All conditional logic that branches on `incomeType` (tab visibility, Trading P&L gating, allocator naming, stage rules, foundationStage derivation, banner copy) keeps working with zero changes.

**Files modified:**

1. **`src/components/Onboarding.jsx`** (Step 4 picker)
   - Replaced Lucide icon column (`Sparkles`/`Briefcase`/`Wallet`/`Users`) with emoji span (`🌱💼📈⚡`)
   - Updated titles and descriptions to the new mapping
   - Removed the "New to budgeting?" badge from Foundation option (the new descriptor "For people starting savings from scratch" makes it self-evident)
   - Order: Foundation → Salary → Trading/Self-employed → Mix (was Foundation → Variable → Fixed → Mixed)

2. **`src/App.jsx` Settings → Income Profile section** (lines ~5463-5467)
   - Same emoji + label swap
   - Same display order
   - Active-account detection unchanged (`isFoundationAccount` check + `data.incomeType ?? 'variable'` fallback)

3. **`src/App.jsx` GraduationModal profile picker** (lines ~1222-1241)
   - Aligned the 3 non-Foundation choices (Fixed/Variable/Mixed) with the new mapping
   - Mixed icon changed from `⚖️` to `⚡` to match Settings/Onboarding consistency

**What does NOT change:**
- `incomeType` values in `defaultData` (still `'foundation'` / `'fixed'` / `'variable'` / `'mixed'`)
- Internal logic that branches on `incomeType`
- Tab visibility rules (`showTrading`, `showTradingDesk` still gated to `incomeType === 'variable'`)
- Allocator naming, stage rules, Foundation Arc thresholds
- `mode === 'foundation'` legacy field handling
- Onboarding step ordering, step count (still 10 steps)
- Banner cascade, GraduationModal flow, `foundationStageBannersDismissed` mechanism

**Build verification:** ✅ `npx vite build` clean, new bundle hash `index-CPXbnLwV.js`.

**Status:** F024 Commit 1 of 3 shipped. Commits 2 (Foundation Arc time guards) and 3 (onboarding mismatch modal) pending owner review and approval per the agreed sequence.

---

## Session — 2026-05-09 (F023: notification_queue Migration File)

---

### [NEW] `supabase/notification-queue-migration.sql` — created missing migration

**Feedback:** Owner Network tab showed `CORS Failed` POST to `wcylrb...notification_queue` while all other Supabase requests succeeded.

**Diagnosis:** The block was per-table, not domain-wide. `queueNotification()` in `src/lib/dataLayer.js` writes to a `notification_queue` table that was never created in the production Supabase project. The SQL to create the table existed only as a code comment at `dataLayer.js:357-367`, not as a runnable migration file in `supabase/`. When the table was missing, PostgREST returned an error response without proper CORS headers — Firefox surfaces this as "CORS Failed" with status `(null)`.

**Impact while broken:**
- Cloud sync of `user_data`, `early_access_leads`, `pin_reset_requests`, `user_activity_events` — **all unaffected**
- Stage-change / drawdown / override notifications were being lost (admin audit trail gap)
- No user-visible UX broken; only background notification queueing failed

**Fix — `supabase/notification-queue-migration.sql`:**

New migration file with the SQL that previously lived only as a code comment. Includes:
- `create table if not exists notification_queue` with id, user_id, type, payload, created_at, sent_at columns
- `alter table ... enable row level security`
- Idempotent RLS policy: `insert own` allowing `auth.uid() = user_id` inserts
- `grant insert on notification_queue to authenticated`
- Index on `sent_at where sent_at is null` for cron worker efficiency

**Required action by owner:** Run `supabase/notification-queue-migration.sql` once in the Supabase SQL Editor. After that, the CORS error disappears on the next `queueNotification` call (PIN override / stage change / drawdown). No code change needed.

**Lesson:** SQL embedded in code comments is invisible to setup-from-scratch flows. Always extract DB schema into a migration file in `supabase/` as soon as code calls a table.

---

## Session — 2026-05-09 (F022: Foundation Stage Defensive Denominator)

---

### [PREVENTIVE] Foundation stage uses `Math.max(salary, envelopeTotal + bufferReserve)` denominator

**Background:** F019 investigation surfaced a Foundation Complete banner triggering at ~1.6 months of buffer covered. Diagnostic showed that on a test account with empty `data.expenses` and a small `spendingBudget`, `stats.salary` evaluated to a tiny number (~R 1,500), so `foundationMonths = data.buffer / stats.salary` inflated to 16+. The bug didn't reproduce on production data because onboarding requires `expenseTotal > 0` at Step 5. But it WILL reproduce if a user:
- Deletes all Setup expenses post-onboarding (no guard against this)
- Migrates from an older app version without expense data
- Switches to Foundation profile via admin override after originally onboarding as another type

**Fix — `src/App.jsx`:**

Changed `foundationMonths` derivation (around line 1527) from a single salary divisor to a defensive `Math.max`:

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

The `foundationStage` early-exit guard updated from `stats.salary === 0` to `foundationMonthlyNeeds === 0` so it now triggers only when both salary AND envelope total are zero (true day-0 state).

**Why `Math.max` and not just envelope total:**
- A user with proper Setup expenses (salary R 14,500) and small envelopes (R 11,200) still has the larger value picked → behavior unchanged
- A user with empty Setup but envelopes (salary R 3,000, envelopes R 11,200) gets the envelope-based denominator → reflects reality
- A user with neither (salary 0, envelopes 0) gets `null` stage → safe day-0 guard

**Mental trace — the originally-buggy account:**
- Buffer R 24,000, salary R 1,500 (empty Setup, low spending budget)
- envelopeTotal R 11,200, bufferReserve R 0
- `foundationMonthlyNeeds = max(1500, 11200) = 11,200`
- `foundationMonths = 24000 / 11200 = 2.14`
- Stage: **starter** ✅ (was incorrectly `complete` before fix)

**What does NOT change:**
- `stats.salary` calculation unchanged — still `expenses + spendingBudget + bufferReserve`
- `stats.monthsCovered` unchanged — only used by non-Foundation profiles, original divisor remains correct
- Non-Foundation profiles get identical behavior (the `: (stats.salary > 0 ? ... : 0)` branch preserves the old formula)
- Banner cascade, Foundation stage rules, Journey display, GraduationModal — all unchanged
- Setup tab, onboarding flow — unchanged

**Cleanup snippet (one-time, manual — NOT shipped in code):**

For any account that hit the false-trigger and dismissed `'complete'`, paste in browser console:

```js
const d = JSON.parse(localStorage.getItem('open-trader-finance-v2'));
if (d.foundationStageBannersDismissed) {
  d.foundationStageBannersDismissed = d.foundationStageBannersDismissed.filter(s => s !== 'complete');
  localStorage.setItem('open-trader-finance-v2', JSON.stringify(d));
  console.log('Cleared false complete dismissal:', d.foundationStageBannersDismissed);
} else {
  console.log('No dismissal array exists — nothing to clean');
}
```

Build verification: ✅ Bundle hash `index-CstdAyoQ.js`.

---

## Session — 2026-05-09 (setCategory Cache Verification)

---

### [VERIFIED] No remaining `setCategory` references in source — error trace was from stale bundle

**Feedback:** Owner reported `Uncaught ReferenceError: setCategory is not defined` with stack trace pointing to App.jsx:6986 and App.jsx:7127.

**Investigation:** Lines 6986 and 7127 are higher than the current source file's total length (~5,300 lines). Those are bundled-output line numbers from the **previous** build, indicating the browser was running a stale cached bundle.

**Verification performed:**
- `Grep "setCategory"` across `src/` → **0 matches**
- `Grep "category"` across `src/App.jsx` → 13 matches, all legitimate (Setup-tab expense category retained per spec, plus copy/comments)
- Fresh `npx vite build` → clean compile, new bundle hash `index-BSkhiOes.js`

**Root cause of error in browser:** Service worker / browser cache still serving the previous bundle that contained the orphaned `setCategory('')` call (already removed in the earlier "Spending Gate Crash Fix" session).

**Resolution:** No code change needed. User cache-busting steps documented in feedback log F021. Once the cache is cleared, the in-source fix will take effect.

**Lesson:** Always check bundle hash and stack-trace line numbers vs source file length before assuming a re-fix is required. PWA service workers cache aggressively.

---

## Session — 2026-05-09 (Spending Gate Crash Fix)

---

### [FIX] Spending Gate `reset()` threw ReferenceError after every decision — regression from category removal

**Feedback:** Owner self-testing reported "We still have categories under impulse control? Is this right?" — investigation surfaced a critical regression rather than the literal complaint.

**Root cause:** The previous "Impulse Category Removal" change deleted the `category` `useState` hook from `ImpulseTab` and removed `setCategory` calls from the write paths, but missed one ghost reference inside the `reset()` function at App.jsx:3870. Every Skip / Sleep / Buy decision in the Spending Gate calls `reset()` at the end of its flow. The ghost `setCategory('')` call threw `ReferenceError: setCategory is not defined` at runtime, crashing the ImpulseTab component after every gate decision. Build did not catch it (runtime ReferenceError, not a syntax error). Vite's module compiler does not validate undefined identifiers inside function bodies.

**Fix — `src/App.jsx`:**

- Removed `setCategory('')` from the `reset()` function in `ImpulseTab`. Statement now reads: `setName(''); setAmount(''); setTrigger('');`
- All other state resets in `reset()` (envelopeId, step, decision, blockedEnv, pinEntry, pinError, pinStep, overrideUsed) are preserved.

**How it could regress:** Any future refactor that removes a `useState` hook from a component must grep the entire component for the corresponding setter to catch ghost references in `reset()`, `useEffect` deps, or callback dependency arrays. A simple `Grep` for `setCategory` after the original removal would have caught this.

**Lesson logged in DEVELOPMENT_NOTES Section 5.**

---

## Session — 2026-05-09 (Impulse Category Removal)

---

### [REMOVED] Impulse `category` field — write-once display-only field eliminated

**Decision basis:** The Category Field Audit (2026-05-09) confirmed `impulses[i].category` was write-once, display-only, with zero functional dependencies (no analytics, no filtering, no charts, no exports). Tester feedback flagged the pre-defined category list (food/clothes/tech/online/family/other) as feeling unprofessional and redundant with the envelope tag and trigger fields, both of which give richer behavioural data.

**Scope:** Impulse logging only. Expense `category` (a separate field used for fixed-cost categorisation) is unchanged.

**Implementation — `src/App.jsx`:**

1. **Constant removed** — `CATEGORIES` object (food / clothes / tech / online / family / other) deleted. `EXPENSE_CATEGORIES` (used by Setup tab) retained.

2. **Imports cleaned** — removed `Coffee`, `ShoppingBag`, `Package` from lucide-react import (only used by the deleted constant). `Smartphone` retained — still used elsewhere.

3. **Write paths cleared:**
   - `confirmPending` "Buy" button — no longer writes `category` when promoting pending → impulse
   - `ImpulseTab.logImpulse()` — removed `category` from new impulse object
   - `ImpulseTab.sleep()` — removed `category` from new pending entry
   - `QuickLog.log()` — removed `category` from new impulse object
   - QuickLog state reset — no longer calls `setCategory('')`

4. **Form fields removed:**
   - Spending Gate input form — Category `<select>` deleted (was the third item in the Amount/Envelope/Category grid)
   - QuickLog form — Category `<select>` deleted; Amount unwrapped from the now-redundant 2-col grid

5. **State variables removed** — `category` / `setCategory` `useState` hooks dropped from both `ImpulseTab` and `QuickLog`.

6. **Display updated** — `ImpulseTab.renderRow()` meta line rebuilt to show `[envelope] · [trigger]` only. Legacy entries with `category` populated still render (the field is ignored on read, no migration needed). Em-dash fallback when both envelope and trigger are absent.

**Backward compatibility:**
- Existing impulses with `category` set continue to load and render — the field is harmlessly ignored
- No data migration required (JSONB blob accepts arbitrary shape)
- Cloud sync, backups, and exports unaffected

**Out of scope:**
- Expense category (`expenses[i].category`) — untouched
- Trigger field — unchanged, still optional input
- Envelope field — unchanged, still optional input
- Database schema — no change

---

## Session — 2026-05-09 (Foundation Arc)

---

### [NEW] Foundation Arc — staged milestone progression with persistent dismissal

**Spec:** Foundation users progress through four named stages based on actual buffer savings vs monthly salary. Each stage has defined allocations. At Foundation Complete (12+ months) users can stay on Foundation indefinitely or unlock advanced income systems.

**Stage table:**

| Stage | Threshold | Name | Allocations |
|---|---|---|---|
| `starter` | buffer < 3 months | Building Foundation | 100% savings |
| `established` | buffer ≥ 3 months | Financially Established | 70 / 20 / 10 |
| `stable` | buffer ≥ 6 months | Financially Stable | 50 / 30 / 20 |
| `complete` | buffer ≥ 12 months | Foundation Complete | 50 / 30 / 20 + stay-or-unlock |

**Root causes fixed:**

1. `f3Hit/f6Hit/f12Hit` used `<=` comparison — multiple flags fired simultaneously, banners were unreliable.
2. `isFoundation` in Command and 4 other components checked only `data.mode === 'foundation'` — new accounts set `incomeType` but not `mode`, making them invisible to Foundation features.
3. Milestone banners had no dismiss — banner reappeared every render after target was advanced.
4. Graduation modal was a one-way flow — no dignity option to stay on Foundation.

**Implementation — `src/App.jsx`:**

1. **`defaultData`** — added `foundationStageBannersDismissed: []` and `graduatedFromFoundation: false`.

2. **`foundationStage` derivation** — replaces `f3Hit/f6Hit/f12Hit`. Derived from `data.buffer / stats.salary` ratio. Null for non-Foundation or pre-expense users (day-0 guard). Four values: `starter / established / stable / complete`.

3. **`fDismissed / fDismiss`** — `Set` built from `foundationStageBannersDismissed` for O(1) lookup; `fDismiss(stage)` appends to array via `setData` (persisted to cloud).

4. **`primaryBannerKey` cascade** — Foundation banners now use:
   - `'upgrade'` when `foundationStage === 'complete' && !fDismissed.has('complete')`
   - `'foundation-6mo'` when `foundationStage === 'stable' && !fDismissed.has('stable')`
   - `'foundation-3mo'` when `foundationStage === 'established' && !fDismissed.has('established')`

5. **Foundation Complete banner** (`upgrade` key for Foundation) — dignity copy: *"You've built strong financial stability."* Two buttons: "Unlock advanced systems →" (opens GraduationModal) and "Stay on Foundation" (calls `fDismiss('complete')` — persistent).

6. **Financially Established banner** (`foundation-3mo`) — "Aim for 6 months →" advances target + dismisses. "Remind me later" → persistent dismiss. Shows actual `data.buffer` amount.

7. **Financially Stable banner** (`foundation-6mo`) — "Aim for 12 months →" advances target + dismisses. "Remind me later" → persistent dismiss. No graduation CTA (graduation lives at Foundation Complete only).

8. **Foundation Journey section** — rebuilt using `foundationStage` index (not `bufferTargetMonths` comparisons). Shows stage names (Financially Established / Financially Stable / Foundation Complete), target amounts, and per-stage allocation hints. Subtitle shows exact months covered (`X.X months`).

9. **GraduationModal** — title updated to "Unlock advanced income systems" (dignity — not "you built a foundation"). `onConfirm` writes `graduatedFromFoundation: true` alongside `mode: 'standard'` and `incomeType`.

10. **Settings → Income Profile** — Foundation Complete users (buffer ≥ 12× salary) see a green CTA section: "Foundation Complete ✓ — Unlock advanced systems →". Always visible regardless of banner dismissal state. Calls `onRequestGraduate` (new prop on `AccountSettings`).

11. **`isFoundation` bug fixed in 5 components** — `Command`, `Setup`, `ProfitAllocator`, `ImpulseTab`, `Rules` all updated to `mode === 'foundation' || incomeType === 'foundation'`.

---

## Session — 2026-05-09 (User & Tester Feedback Round 1)

---

### [FIX] Command tab spending tracker only showed Discretionary — other envelope spend invisible

**Feedback:** "Tester also impulse spending on a different envelope but only discretionary budget displays on the command center. The Spending tracker on command shows only discretionary budget and no other expenses."

**Root cause:** The "Spent" figure and progress bar on the Command tab were computed from `thisMonthImpulses` — filtered to only include entries tagged to the Discretionary envelope (or with no envelope). Any impulse logged against a named envelope (Groceries, Transport, etc.) was silently excluded from the spending card.

**Fix — `src/App.jsx`:**

1. Added two new values to `stats`:
   - `totalMonthSpend` — sum of **all** impulses this month, regardless of envelope
   - `envelopeBreakdown` — array of `{ id, name, cap, spent, isDiscretionary }` for every envelope that has impulse activity this month

2. Updated the Command spending card:
   - **"Spent (all)"** label now shows `totalMonthSpend` (total across every envelope)
   - **"Discretionary budget"** label unchanged (shows the cap for personal free spending)
   - **"By envelope" breakdown section** appears below when more than one envelope has spending — shows each envelope's name, amount spent vs cap, and a colour-coded progress bar (green → amber → red as cap is approached)
   - The breakdown is hidden when only one envelope has activity (no noise for users who only use Discretionary)

3. The big "left to spend" number and main progress bar remain Discretionary-only — that is still the primary control-point number because it represents the user's personal spending budget, not tracked expense categories.

---

### [FIX] Spending tracker not updating after purchase — **Implemented 2026-05-09**

**Feedback:** "User added 500 on discretionary spending, and spent 200 but Command still displays 500 and the spending tracker didn't show the 200 spent."

**Root cause (two separate bugs):**

#### Fix 2A — Discretionary cap not synced when budget changes

**Problem:** The Discretionary envelope is created once at onboarding with `cap = spendingBudget`. If the user later changes their spending budget in the Setup tab, the envelope's stored `cap` field was never updated. The Command "Budget" line stayed at the original onboarding figure.

**Implementation — `src/App.jsx`:**

1. Added `lastSyncedSpendingBudget: null` to `defaultData`. This field tracks which value of `spendingBudget` was last applied to the envelope cap, so the effect can compute a delta rather than overwriting the cap absolutely. Storing the delta is critical: after a month-end rollover, `discEnv.cap` legitimately exceeds `spendingBudget` (unspent budget rolls forward) — overwriting with the raw `spendingBudget` would silently undo the rollover.

2. Added a new `useEffect` (after the existing migration effect at line ~688):
   - Guards: `loading || !data.setupComplete || !data.spendingBudget`
   - Guards: `if (!discEnv) return` — does not fight the creation effect
   - **First run** (`lastSyncedSpendingBudget === null`): seeds the tracker to the current budget, leaves `cap` untouched — safe for all existing users
   - **Subsequent runs**: if `spendingBudget !== lastSyncedSpendingBudget`, computes `delta = newBudget - lastSynced` and applies it: `cap = cap + delta`. Rollover balance is preserved. Updates `lastSyncedSpendingBudget = newBudget`.
   - Dependency array: `[loading, data.setupComplete, data.spendingBudget, data.lastSyncedSpendingBudget]`

**Mental trace — user changes budget from R5,000 → R8,000:**
- `lastSyncedSpendingBudget = 5000`, `spendingBudget = 8000`
- `delta = 3000`
- `cap (5000) + 3000 = 8000` → Command "Budget" shows R8,000 ✅
- If rollover had grown cap to R6,200: `6200 + 3000 = 9200` (R8k base + R1.2k rollover) ✅

---

#### Fix 2B — QuickLog missing `envelopeId`

**Problem:** QuickLog created impulse entries without an `envelopeId` field (it was absent from the object, not `null`). The `thisMonthImpulses` filter uses `i.envelopeId == null` as the Discretionary fallback — `undefined == null` is `true` in JS so most entries still counted, but the shape was non-canonical and inconsistent with all other write paths.

**Implementation — `src/App.jsx`, `QuickLog` component:**

Added Discretionary envelope resolution before creating the entry — matching the `logImpulse` pattern from DEVELOPMENT_NOTES §4:

```js
const discId = (data.envelopes || []).find(e => e.isDiscretionary)?.id ?? null;
const entry = { ..., envelopeId: discId, ... };
```

**Mental trace — user logs via QuickLog:**
- `discId = 'env_discretionary'`
- Entry written with `envelopeId: 'env_discretionary'`
- `thisMonthImpulses` filter: `i.envelopeId === discretionaryEnv.id` → `true` ✅
- Legacy null entries still handled by the `|| i.envelopeId == null` branch ✅

---

### [FIX] Goals not required to complete onboarding

**Feedback:** "Goal must be required as part of requirement to complete setup."

**Root cause:** The onboarding `finish()` function set `setupComplete: true` unconditionally. There was no goals step in the onboarding flow — goals could only be added after setup was complete via the Setup tab.

**Fix:**
- `src/components/Onboarding.jsx`
  - Added `obGoals` state (array of `{ id, name, target }` objects)
  - Inserted a new **Step 10 — Goals** screen between PIN (step 9) and Summary (step 11)
  - `canAdvance()` for step 10 requires `obGoals.length > 0` — the Continue button is disabled until at least one goal is added
  - `finish()` now writes `goals: obGoals` into `setData`
  - `totalSteps` updated from `10` → `11`; all step labels and progress bar updated accordingly

---

### [FIX] Trading P&L tab visible for Mixed and Fixed profiles

**Feedback:** "There is Trading in Mixed and Fixed income profile — this is not correct. Only Variable should have trading."

**Root cause:** The `showTrading` flag used `!isFoundation && incomeType !== 'fixed'`, which still included Mixed. Same for `showTradingDesk`.

**Fix:**
- `src/App.jsx`
  - `showTrading` changed to `data?.incomeType === 'variable'`
  - `showTradingDesk` changed to `data?.incomeType === 'variable'`
  - Mixed profile description updated to note "No Trading P&L tab"

---

### [FIX] Foundation income profile missing from Settings

**Feedback:** Foundation accounts (users who selected Foundation at onboarding) did not see a Foundation option in the Settings → Income Profile list.

**Root cause:** Foundation was not included in the profile array in the Settings tab. Active-state detection also failed because Foundation accounts may write `data.mode = 'foundation'` (legacy) rather than `data.incomeType = 'foundation'`.

**Fix:**
- `src/App.jsx`
  - Added `{ id: 'foundation', title: 'Foundation', ... }` to the Settings Income Profile cards array
  - Active detection: `const isFoundationAccount = data.mode === 'foundation' || data.incomeType === 'foundation'`; active card is `foundation` for these accounts, otherwise falls back to `data.incomeType ?? 'variable'`

---

### [FIX] Currency changeable in Settings after onboarding

**Feedback:** "I think we should make the currency the user sets during onboarding the only currency displayed — should not be changeable."

**Root cause:** Settings rendered a full currency-picker grid allowing users to change currency post-onboarding, which could break all stored monetary values and historical records.

**Fix:**
- `src/App.jsx`
  - Removed the currency picker grid and `currencyChanged` / `hoveredCurrency` state from Settings
  - Replaced with a read-only display card showing the locked currency name and symbol
  - Added note: "Set at onboarding — contact support to change"
- `src/components/Onboarding.jsx`
  - Currency step copy updated: "Choose carefully — this is locked after setup."

---

### [FIX] Contact email hello@ → support@

**Feedback:** "Let's change contact hello@royalledger.app to support@royalledger.app."

**Files changed (global find-replace):**
- `src/App.jsx`
- `src/components/AdminDashboard.jsx`
- `tester-guide.html`
- `tester-terms.html`

All instances of `hello@royalledger.app` replaced with `support@royalledger.app`.

---

### [NEW] Admin currency and income profile override

**Feedback:** "Income profile also has 'contact support for change of profile' — how would admin do that?"

**What was built:**
- `supabase/admin-patch-user-data.sql` — New Supabase `SECURITY DEFINER` RPC function `admin_patch_user_data(p_email, p_currency, p_income_type)`:
  - Looks up the user by email in `auth.users`
  - Patches `currency` and/or `incomeType` in the `user_data` JSONB blob
  - Handles Foundation legacy `mode` field (writes/removes `mode` alongside `incomeType`)
  - Returns `'ok'` | `'no_auth_user'` | `'no_data'`
  - Granted `EXECUTE` to `authenticated` role; caller can't touch `auth.users` directly
- `src/components/AdminDashboard.jsx`
  - Added `AccountOverrideManager` component (currency dropdown with 10 options, income profile dropdown with 4 options)
  - Calls `supabase.rpc('admin_patch_user_data', ...)` on submit
  - Wired into LeadRow expanded section so admin can override any user by clicking their row
  - `ADMIN_EMAILS` updated to `['support@royalledger.app', 'fasathor@gmail.com']`

**Required action:** Run `supabase/admin-patch-user-data.sql` once in the Supabase SQL Editor to register the function.

---

### [NEW] HelpTip tooltips on all Settings section headings

**Feedback:** "Some menus in Settings tab don't have a tooltip — update in all profiles."

**Files changed:**
- `src/App.jsx` — HelpTips added to:
  - Income Profile heading
  - Currency heading (shows lock reason)
  - Password heading
  - Security PIN (PinCard) heading
  - Cloud Sync heading
  - Backup & Restore heading
- `src/components/NotificationSettings.jsx` — HelpTip added to Notifications heading

---

### [NEW] Tester guide and Beta Tester Agreement

**Feedback:** "Give me a detailed printable HTML user guide for testers."

**Files created:**
- `tester-guide.html` — 19-section printable tester guide covering:
  - Onboarding flow, income profiles, Command tab, Spending Gate (3 buttons: Skip it / Sleep on it / Buy now), Trading P&L, Daily Checkpoints, Weekly Pulse, Monthly Review, Envelopes, Goals, Settings, Rules, Notifications, Backup, Admin, Daily Checkpoints UX note, known limits
  - Verified facts: threshold default R50, "Unlock to edit" for balances, Trading Guard activates for 24 h, exact stage allocations (Stage 1 / 1.5 / 2 / 3), Trading tab available to Variable only
- `tester-terms.html` — WhatsApp-shareable Beta Tester Agreement:
  - 9 clauses covering scope, R200 voucher reward conditions, minimum activity requirements (≥15 days active, ≥5 Spending Gate uses, ≥1 snapshot, ≥1 written report), disqualification conditions, data transparency

---

### [INFO] Daily Checkpoints — what they activate

**Tester question:** "What is the use of the Checkpoint? What does it activate?"

**Answer documented:**
- Daily checkpoints (Morning intention / Midday check-in / Evening reflection) are **self-accountability markers** — they do not trigger automated actions
- Sunday checkpoint dispatches the `show-weekly-pulse` custom event → opens the Weekly Pulse modal
- Month-end checkpoint calls `setTab('review')` → opens the Monthly Review screen
- The counter on the card shows "X remaining" / "All done today"

No code change — clarification added to the tester guide.

---

### [INFO] Foundation buffer target — 3 months vs 6 months

**Tester suggestion:** Foundation buffer target should be 3 months (simpler, lower bar for entry-level users).

**Decision pending:** The default for all profiles at onboarding is currently 18 months. For Foundation specifically, 6 months is the recommended default (full starter emergency fund standard; 3 months is the absolute minimum and may give a false sense of security). Implementation not yet applied — awaiting user confirmation.

---

## Pending (deferred — not implemented)

| # | Item | Decision |
|---|------|----------|
| 1 | Run `admin-patch-user-data.sql` in Supabase | Manual step — run once in Supabase SQL Editor to activate Admin Override |
| 2 | Goals required in onboarding (Fix 3) | Deferred — n=1 feedback. Will be skippable if implemented later |
| 3 | Foundation buffer target (Fix 11) | Deferred — pending more Foundation tester data. Current default: 18 months |
| 4 | Daily Checkpoints in-app subtitle (Fix 10) | Deferred — owner to finalise copy first |
