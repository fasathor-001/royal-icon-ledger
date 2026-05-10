# Royal Ledger — Product Overview

> Internal reference. Describes what the product does, who it's for, and how the feature set maps to income profiles.

---

## What It Is

Royal Ledger is a personal finance OS designed for people whose income is unpredictable — freelancers, traders, and anyone who doesn't receive the same amount every month. It is not a budgeting app in the traditional sense. Its core job is to give every unit of income a role before it gets spent.

The app is a closed-beta PWA at `my.royalledger.app/app`. Access is invite-only.

---

## Income Profiles

Users choose one of four income profiles during onboarding. The profile governs which features and copy they see throughout the app.

| Display label | Descriptor | Internal value | Primary audience |
|---|---|---|---|
| 🌱 Building from zero | Starting savings from scratch | `'foundation'` | Low-to-no savings base; needs a staged accumulation path |
| 💼 Salary | Steady paycheck every month | `'fixed'` | Salaried employee; wants envelope budgeting without variable-income complexity |
| 📈 Trading / Self-employed | Income changes month to month | `'variable'` | Freelancers, traders; needs Drawdown Protocol, Trading Capital management |
| ⚡ Hybrid | Steady salary, plus side income or business | `'mixed'` | Dual-income; gets Capital Pool and Profit Allocator but not Drawdown Protocol |

**Internal values are permanent.** Display labels have changed multiple times (F024, F028, F030) and will change again. Never rename the internal values.

---

## Feature Matrix

| Feature | Foundation | Salary | Trading | Hybrid |
|---|---|---|---|---|
| Envelope budgeting (Budget tab) | ✅ | ✅ | ✅ | ✅ |
| Impulse Control / Spending Gate | ✅ | ✅ | ✅ | ✅ |
| Setup & Expenses | ✅ | ✅ | ✅ | ✅ |
| Monthly Review | ✅ | ✅ | ✅ | ✅ |
| Foundation Arc (stage system) | ✅ | ❌ | ❌ | ❌ |
| Profit Allocator / Money Allocator | ✅ | Surplus Allocator | ✅ | ✅ |
| Capital Pool | ❌ | ❌ | ✅ | ✅ |
| Trading P&L tab | ❌ | ❌ | ✅ | ❌ |
| Drawdown Protocol | ❌ | ❌ | ✅ | ❌ |
| Long-Term account | ✅ | ✅ | ✅ | ✅ |
| Future Goals / Savings Goals | ✅ (staged) | ✅ | ✅ | ✅ |

---

## Foundation Arc

Foundation is the most differentiated income profile. It implements a staged savings journey for users building financial stability from a low base.

### Stages

| Stage | Label | Threshold | Allocation rule (default) |
|---|---|---|---|
| Stage 1 | Starter | Buffer < 6× monthly needs | 100% → Buffer |
| Stage 1.5 | Building | 6–12× monthly needs | 55% Buffer / 30% Long-term / 15% Goals |
| Stage 2 | Established | 12–18× monthly needs | 65% Buffer / 20% Long-term / 15% Goals |
| Stage 3 | Foundation Complete | Buffer ≥ 18× monthly needs | 0% Buffer / 30% Long-term / 30% Capital / 20% Goals / 20% Lifestyle |

Stage is derived in real-time from `data.buffer / foundationMonthlyNeeds`. Stage thresholds are user-configurable via `data.stage1End` and `data.stage15End`. Milestones trigger celebratory banners ("You've built 3 months of security").

### Goal tracking in Foundation

- **Stage 1**: `_goalSaved` tracks `data.buffer` as a proxy (the goals pool hasn't started yet)
- **Stage 2+**: `_goalSaved` switches to `data.futureGoals` once it is non-zero (balance-driven, not stage-driven — prevents cliff at Stage 2 boundary)
- **`data.goals[0]`** is the primary goal displayed in the YOUR SAVINGS card
- **Goal can be set during onboarding** (Step 7) so the savings card is populated on first launch

---

## Tabs and Navigation

### Mobile navigation
Primary bar (always visible): Home, Impulse, Budget, Trade (variable only)
Secondary "More" sheet: Setup, Profit Allocator, History, Rules, Settings, Admin

### Tab descriptions

| Tab | Internal id | Description |
|---|---|---|
| Home | `command` | Command centre. Financial snapshot, balance cards, spending summary, stage card, nudges. |
| Impulse | `impulse` | Spending Gate. Logs purchases with emotional trigger tracking. Sleep-on-it queue. |
| Budget | `budget` | Envelope budgeting. Create/edit envelopes, track spending per envelope. |
| Trade | `trading` | Trading P&L log. Month-by-month profit/loss entries. Variable profile only. |
| Profit Allocator | `profit` | Allocates income across accounts per stage rules. Foundation: "Money Allocator". Fixed: "Surplus Allocator". |
| Setup | `setup` | Fixed expenses, spending budget, buffer reserve. Salary is computed from these. |
| History | `history` | Snapshot chart (AreaChart), impulse history, trigger analytics. |
| Rules | `rules` | Stage allocation rules editor. PIN-protected. |
| Settings | `settings` | Profile, currency, notifications, PIN, backup. |
| Admin | `admin` | Invite codes, access requests, PIN resets, Tester Activity. Owner emails only. |

---

## Impulse Control System

The spending gate fires when a purchase exceeds `data.spendingGateThreshold` (default: R 50). The user must:
1. Select an emotional trigger (Bored, Stressed, Tired, Won a trade, etc.)
2. Tag an envelope
3. Choose: Buy now / Sleep on it / Skip

"Sleep on it" items go to a pending queue visible on the Impulse tab. The user decides later: Buy or Cancel.

All logged impulses are stored in `data.impulses[]` and drive History tab analytics.

---

## PIN System

A 4–6 digit PIN is required before the app can be used. PIN protects:
- Setup tab (section-level via `useSectionPin`)
- Rules tab (section-level via `useSectionPin`)
- Edit Goal / Add Goal (action-level via `usePinGate`)
- Trading tab structural edits (action-level via `usePinRowGate`)

PIN is stored as a PBKDF2-SHA256 hash in `data.pinHash`. Never stored in plain text.

**Forgot PIN flow:** User submits a `pin_reset_requests` row. Admin approves it in AdminDashboard. User is shown `PinSetupScreen` with `isForgotPin=true` on next login.

---

## Envelope Budgeting

Envelopes are monthly spending categories with a cap. Each envelope has:
- A name and icon
- A monthly cap (budget)
- A block mode: `soft` (warning), `hard` (blocked), `pin` (PIN required to override)
- A rollover mode: `reset` (cap resets each month), `roll` (unspent carries forward), `sweep` (unspent goes to buffer)

One envelope is marked `isDiscretionary: true`. This is the catch-all for untagged impulses. Discretionary **must** always have `rolloverMode: 'roll'` — never `'reset'`. Three layers of defence enforce this.

Month-end rollover is triggered by `RolloverModal`, which auto-shows if `lastEnvelopeRollover` is behind the current month.

---

## Push Notifications

Delivered via Web Push API. Requires VAPID keys configured in the Supabase Edge Function.

Three notification types:
- **Daily** (default 08:00 local time) — daily check-in reminder
- **Weekly** — weekly pulse summary
- **Monthly** — monthly review prompt

iOS requires the app to be installed to the Home Screen before push notifications can be enabled.

Notification preferences stored in `data.notificationPreferences` and synced to `push_subscriptions` table.
