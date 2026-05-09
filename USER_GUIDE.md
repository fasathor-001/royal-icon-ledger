# Royal Ledger — User Guide

*Personal finance for the disciplined.*

---

## Table of Contents

1. [App Philosophy](#1-app-philosophy)
2. [Getting Started](#2-getting-started)
3. [Tab-by-Tab Guide](#3-tab-by-tab-guide)
4. [Feature Deep-Dives](#4-feature-deep-dives)
5. [Daily / Weekly / Monthly Ritual](#5-daily--weekly--monthly-ritual)
6. [Emergency Scenarios](#6-emergency-scenarios)
7. [Common Mistakes](#7-common-mistakes)
8. [Success Metrics](#8-success-metrics)

---

## 1. App Philosophy

Royal Ledger is a discipline system, not a tracker. Generic finance apps tell you what you've already spent. This one prevents the spending you shouldn't do, automates the saving you said you'd do, and protects the money your family depends on.

Three operating principles:

**1. Family money first.** Buffer (cash reserves for survival) is funded before any other allocation. Trading capital, long-term investments, and lifestyle spending all wait their turn behind family protection.

**2. Trading is a job, not a windfall.** Profits flow through a tax reserve and a stage-based waterfall. Money you never see in your spending account is money you cannot impulse-spend.

**3. The pause is the system.** The Spending Gate inserts a moment between impulse and payment. That moment — not willpower, not motivation — is what protects your wealth.

The app is field-driven. Every calculation, warning, and rule depends on real numbers entered correctly. Garbage in, garbage out.

---

## 2. Getting Started

### Account

Royal Ledger is invite-only. You need an invite code to create an account. If you have one, go to the app at [royalledger.app](https://royalledger.app), click **Create account**, enter your invite code and email, and set a password. A confirmation link will be sent to your email — click it to activate.

If you don't have an invite code, click **Request access** on the login page.

### Cloud sync

Your data is stored on secure cloud servers and synced to every device you sign in on. Changes save automatically — you don't need to manually back anything up for basic use. A sync indicator appears briefly in the bottom-right corner when data is being saved; a green "Synced ✓" confirms it went through. If you're offline, data saves locally and syncs when you reconnect.

### PIN setup

After completing onboarding, the app will ask you to set a security PIN (4–6 digits). This PIN protects structural changes like editing expense entries, adjusting stage rules, and resetting data. Keep it somewhere you won't lose it — it cannot be recovered without admin assistance.

### Onboarding

The setup wizard walks you through adding your monthly expenses, setting your spending budget, and choosing your income profile. Complete it fully before using any other tab. Honest numbers here are what make the rest of the system work.

### Income profiles

During onboarding you'll pick the situation that best describes how money reaches you. The picker is **situation-based, not experience-level based** — there are no "beginner" or "advanced" options. Pick the one that matches your real income pattern:

| Display label | Who it's for | What changes in the app |
|---|---|---|
| 🌱 **Building from zero** | People starting savings from scratch — students, allowance recipients, irregular gigs, or anyone whose buffer is below 3 months of expenses | Simplified language ("Savings" instead of "Buffer", "Money Allocator" instead of "Profit Allocator"); trading features hidden; Foundation Arc staged milestones (Building Foundation → Financially Established → Financially Stable → Foundation Complete) |
| 💼 **Salary** | Steady paycheck every month — salaried employees, pensioners, regular contractors with fixed monthly amounts | Trading tab hidden; "Profit Allocator" renamed to "Surplus Allocator"; the trading allocation percentage is automatically redirected to Goals |
| 📈 **Trading / Self-employed** | Income changes month to month — traders, freelancers, commission earners, business owners | Full feature set — Trading P&L tab, Profit Allocator with stage-based rules, drawdown protocol |
| ⚡ **Mix** | Steady salary, plus side income or trading on top | Profit Allocator with full rules, but Trading P&L tab is hidden by default |

**Picking the right profile:** focus on **how income reaches you**, not on your experience or wealth level. A self-employed lawyer with R 5M in savings and a trader earning R 200/month both pick "📈 Trading / Self-employed" because their income pattern is the same.

**Changing it later:** the profile is set at onboarding. To change it, contact `support@royalledger.app` — admin can switch profiles via the override RPC.

---

## 3. Tab-by-Tab Guide

### Command (Home)

**Purpose**: The home screen. Shows your current state at a glance — total assets, buffer status, stage, drawdown zone, spending this month, and any active warnings.

**When to use**: Daily. Open the app, glance at Command, close it. 30 seconds.

**Key elements**:
- **Balance cards** — Family Buffer, Trading Capital, Long-term, Goals. Edit them directly when your real account balances change.
- **Stage banner** — which of the four stages you're currently in, and how far to the next.
- **Months Stored** — how many months of full salary your buffer can cover right now.
- **This Month spending** — what you've spent vs your discretionary budget this month.
- **Warning banners** — backup reminders, drawdown alerts, rollover prompts. Act on anything that's orange or red.
- **Quick Action buttons** — jump to Profit Allocator, Impulse Control, Trading P&L, or Monthly Review.
- **Snapshot button** (top right, camera icon) — records current state and downloads a backup file.

**Discipline rule**: Open Command first, every session. The 30-second read tells you whether to act normally, tighten up, or pause completely.

---

### Setup & Salary

**Purpose**: The foundation. Your monthly expenses, spending budget, buffer reserve, and buffer target all live here. Every calculation in the app derives from this tab.

**When to use**: Once during onboarding, then quarterly when life changes (rent increase, new dependent, income change).

**Key fields**:
- **Expenses list** — every recurring monthly debit. Name, amount, category. Add each one.
- **Monthly Spending Budget** — your total discretionary allowance (the pool that Budget envelopes split).
- **Buffer Reserve** — amount set aside from salary every month to feed the buffer, independent of trading profit.
- **Buffer Target Months** — how many months of salary you want stored as buffer (18 is the fortified target for variable-income earners).
- **Buffer Protect Months** — threshold below which buffer-protect mode activates automatically.
- **Spending Gate Threshold** — purchases at or above this amount trigger the gate pause. Default R100.
- **Monthly Salary (display)** — auto-calculated: Total Expenses + Spending Budget + Buffer Reserve.

**Discipline rule**: Enter what you actually spend, not what you wish you spent. Underestimating here makes every downstream feature wrong.

---

### Budget

**Purpose**: Splits your spending budget into named envelopes (categories) with individual rules for blocking and rollover. Where the monthly spending discipline lives.

**When to use**: Initial setup once. Weekly check-in. Monthly rollover.

**Envelope settings**:

*Block mode — what happens when you hit the cap:*
- **Soft warning** — shows you're over but allows the purchase. Use for essentials.
- **Hard block** — refuses purchases that would exceed the cap. Use for discretionary spend.
- **PIN override** — hard block, but bypassable with your security PIN. For safety-valve categories.

*Rollover mode — what happens to unspent money at month-end:*
- **Reset** — use it or lose it. Fresh budget each month. Best for groceries.
- **Roll over** — unspent carries to next month's cap. Best for lumpy categories (gifts, household repairs).
- **Sweep to buffer** — unspent transfers directly to your Family Buffer. The wealth-building option. Best for discretionary categories you want to under-spend.

**Month-end rollover**:

Two triggers — whichever comes first:
1. **Auto-rollover modal** — at the start of a new month, if last month hasn't been rolled over, the app shows an automatic modal summarising what will happen to each envelope. Confirm it to execute.
2. **Manual button** — in the last three days of the month, the Budget tab shows an **Apply rollover** button. Click it to execute early.

The rollover is intentionally user-confirmed — it forces you to acknowledge the month is closing and verify everything is logged correctly before committing.

**Pace projection**: Each envelope shows a predicted end-of-month total based on current spending rate. If pace projects you'll be over, tighten now, not at month-end.

**Strategic combination**: Discretionary envelopes (eating out, personal) set to Hard block + Sweep to buffer literally cannot let you overspend, and reward under-spending with automatic savings.

---

### Profit Allocator

*(Called "Surplus Allocator" for Fixed income users, "Money Allocator" for Foundation users)*

**Purpose**: Routes trading profit through a tax reserve and stage-based waterfall before any of it becomes spendable. Prevents profit from becoming an impulse windfall.

**When to use**: Every time you have realized profit. Before transferring anything anywhere.

**Process**:
1. Enter gross profit amount.
2. Tax reserve is subtracted first (your configured %, default 25%).
3. Net profit flows down the waterfall based on your current stage.
4. Review the breakdown — exact amounts going to Buffer / Long-term / Trading / Goals / Lifestyle.
5. Click **Apply allocation** to update your balance fields. Then physically transfer matching amounts in your real bank accounts.

**Why it matters**: Profit feels like a windfall. Windfalls trigger lifestyle creep. The allocator turns profit into a structured deposit before your brain has a chance to spend it.

**Tax reserve**: Set this to match your actual tax bracket. South African traders typically reserve 18–36%. Treat reserved tax as already paid — keep it in a separate sub-account untouched until tax season.

---

### Trading P&L

*(Hidden for Fixed income and Foundation users)*

**Purpose**: Tracks monthly trading performance, computes win-rate stats, and runs the Drawdown Protocol — the trader's risk discipline system.

**When to use**: Update Capital balance weekly minimum. Log P&L monthly. Check the Drawdown Protocol whenever you're trading actively.

**Capital field**: Enter your **total trading account balance** — not profit, not deposits alone, not just this month's change. The full equity in your broker account right now. Getting this wrong breaks the entire Drawdown Protocol.

**Drawdown Protocol**: The system tracks your highest-ever Capital (high water mark). Drawdown is how far below that you currently are.

| Zone | Drawdown | Rule |
|---|---|---|
| Normal | 0–9% | Full position sizes. Trade your plan. |
| Caution | 10–19% | Reduce position sizes by 25%. Review last 10 trades. |
| Defensive | 20–29% | Reduce position sizes by 50%. Consider a week off. |
| Stop | 30%+ | Stop trading. Strategy review required before resuming. |

The Command tab shows a warning banner when you cross into Caution or worse.

**Reset high water**: Only click this after intentional capital withdrawals (you moved money out on purpose). Never reset to "fix" a drawdown — that destroys the protocol.

---

### Impulse Control

**Purpose**: Three sub-views — Spending Gate, Quick Log, and History & Triggers.

**Spending Gate** (before any planned purchase ≥ your gate threshold):

1. Enter: What is it / Amount / Envelope / Trigger.
2. The gate checks envelope rules first:
   - Hard block envelope over cap → blocked, no purchase.
   - PIN override envelope over cap → PIN prompt.
   - Soft warning → continues regardless.
3. Decision screen shows: Hours of work this purchase represents / Money left this month / 30-year compound cost.
4. Choose: **Skip it** (log nothing) / **Sleep on it** (add to pending list) / **Buy now** (log and record to envelope).

**Quick Log** (for purchases already made):
Same fields (What / Amount / Trigger) but no gate and no envelope blocking — just records the purchase retroactively against your Discretionary envelope. Use it for honest catch-up, not as a way to bypass the gate.

**History & Triggers**:
- Current month and past months of logged impulses, each showing name, amount, envelope, and date.
- Trigger breakdown — which emotional state you were in when you spent. Your most common trigger is your biggest spending pattern. Lying here makes the data useless.
- Delete (×) on any entry to remove it. Clean up test data immediately — bad entries corrupt every downstream calculation.

**Discipline rule**: Every purchase ≥ your gate threshold goes through the Spending Gate. No exceptions. The discipline is in always asking the question, not always saying no.

---

### History

**Purpose**: Long-term view. Stacked area chart of buffer / trading / long-term over time, built from snapshots. List of all snapshots with delete option.

**When to use**: Monthly, after taking a month-end snapshot.

- Chart: orange = buffer, blue = trading, green = long-term.
- Snapshot list: date, all four balances, change from previous snapshot.
- Delete bad or test snapshots with ×. Bad snapshots distort the chart and the Review tab's buffer-change calculation.

---

### Review (Monthly Review)

**Purpose**: End-of-month guided wrap-up. Aggregates monthly spending, P&L, savings rate, envelope performance, and stage progress into a single page.

**When to use**: Last 3 days of every month, or first 3 days of the next. The system auto-popups during this window if you haven't reviewed yet.

**What it shows**:
- Four metric cards: Spent / Trading P&L / Savings Rate / Buffer Change.
- Envelope performance — each envelope with on-target indicator.
- Stage progress — current months covered, projected months to fortified.
- Discipline reward — total sweep amount going to buffer from under-spent envelopes.
- Auto-generated takeaway message.

**Three required end-of-month actions** (linked from the Review tab):
1. Log this month's P&L (if not already done).
2. Apply envelope rollover.
3. Take snapshot (auto-downloads backup file).

Click **Mark month as reviewed** when done. The auto-popup won't reappear until next month.

**Discipline rule**: A month doesn't end until it's reviewed. Even if the numbers were bad — especially if the numbers were bad.

---

### Rules

**Purpose**: System configuration. Stage thresholds, allocation percentages, gate threshold, stage rule editing. Also where you access advanced setup options.

**When to use**: Initial setup to confirm defaults. Quarterly to verify thresholds match your situation. As-needed for re-running setup.

**What you can configure**:
- **Tax Reserve %** — percentage of gross profit reserved for tax. Default 25%.
- **Stage allocation %s** — per-stage waterfall percentages for Buffer / Long-term / Trading / Goals / Lifestyle. Each stage must sum to 100%.
- **Buffer Target and Protect thresholds** — expressed in months of salary.
- **Re-run setup wizard** — rebuilds your expense list from scratch (keeps snapshots and P&L history).

**Default stage allocations**:

| Stage | Buffer | Long-term | Trading | Goals | Lifestyle |
|---|---|---|---|---|---|
| Stage 1 | 100% | 0% | 0% | 0% | 0% |
| Stage 1.5 | 55% | 30% | 0% | 15% | 0% |
| Stage 2 | 65% | 20% | 0% | 15% | 0% |
| Stage 3 | 0% | 30% | 30% | 20% | 20% |

For Fixed income users, the Trading % is automatically redirected to Goals at runtime — the stored numbers stay the same but trading capital never receives an allocation.

The Rules tab warns if percentages don't sum to 100% but will still save. Fix the sum immediately if you see the warning.

---

### Settings

**Purpose**: Account management, display preferences, cloud sync status, data backup, and danger-zone operations.

**Sub-tabs**:

**Account**
- Display name — shown in the app header instead of your email.
- Currency — changes the symbol and formatting everywhere in the app. Default ZAR.
- Cloud sync status — shows when your data was last synced and lets you retry if sync failed.
- Change password — enter new password (minimum 8 characters) and confirm.

**Sessions**
- Sign out other devices — terminates sessions on all browsers/devices except the current one.

**Notifications**
- Push notification preferences — daily/weekly/monthly alerts, morning/evening check-in times, timezone.
- Requires browser permission for notifications.

**Setup**
- Re-run setup wizard — same as in Rules tab.
- Currency selection — accessible here as well.

**Backup & Data**
- **Download as file** — exports your complete data as a JSON backup. Good as a secondary safety net.
- **Import backup** — restores from a JSON file. Replaces all current data.

**Danger zone**
- **Reset all data** — wipes everything and returns to first-launch state. Requires PIN confirmation. Take a backup first.

---

## 4. Feature Deep-Dives

### Spending Gate

The gate runs three calculations to reframe the purchase decision:

- **Hours of work** — Amount ÷ (Monthly Salary ÷ 160 hours). R1,500 headphones = ~6 hours of trading work.
- **Left this month** — How much spending budget remains if you buy this.
- **30-year value** — What the amount compounds to at 7% annual return over 30 years. R1,500 today = ~R11,400 not had at retirement.

These numbers don't tell you what to decide. They tell you what you're actually trading for.

**Pending items** (Sleep on it): Items in the pending list stay there until you decide. Each is tagged to the same envelope you selected. Coming back to buy from the pending list processes it the same way as a fresh buy — envelope rules still apply.

---

### Envelope System

**The wealth-building combination**: Discretionary envelopes (eating out, personal) on Hard block + Sweep to buffer mean the system literally refuses overspend and automatically routes every unspent rand to your family protection fund at month-end. Under-spend Eating Out by R200 every month = R2,400/year of pure discipline savings added to buffer automatically.

**Rollover in detail**:
- Roll over envelopes have their cap increased by the unspent amount next month.
- Sweep envelopes transfer the unspent amount directly to `data.buffer`.
- Reset envelopes simply zero out — the cap stays the same.

**Discretionary envelope**: The app maintains one special envelope called Discretionary (or Spending) that catches any purchase not explicitly tagged to another envelope. All spending that existed before the envelope system was set up is attributed here.

---

### Stage System

Stages auto-detect from your buffer balance versus monthly salary. You don't manually change stage — you earn it.

| Stage | Buffer coverage | What it means |
|---|---|---|
| Stage 1 — Survive | < 6 months | Family protection is the only priority. All profit goes to buffer. |
| Stage 1.5 — Stabilize | 6–12 months | Floor reached. Long-term investing begins at 30%. |
| Stage 2 — Build | 12–18 months | Goals investing added. Final push to fortified. |
| Stage 3 — Fortified | 18+ months | Wealth-building mode. First stage where lifestyle spending of profit is permitted. |
| Buffer-protect mode | Buffer below protect threshold | Automatically activated; treated like Stage 1 for allocation purposes. |

The stage thresholds are set by your Buffer Target Months in Setup. Default is 18 months = fully fortified. Stage 1 ends at 6 months, Stage 1.5 ends at 12 months.

---

### PIN System

The security PIN (4–6 digits) protects structural edits — expense changes, stage rule edits, data reset. It is set after you complete onboarding and is stored as a cryptographic hash (never plain text). The app cannot tell you what your PIN is — it can only verify it.

**If you forget your PIN**: On the PIN entry screen, click "Forgot your PIN?" and submit a reset request. An admin will review it. When approved, you'll be prompted to set a new PIN on your next login.

**PIN override on envelopes**: The envelope-level PIN is the same as your security PIN. When an envelope is set to PIN Override mode and you hit its cap, you'll be prompted for your PIN to proceed. Every override is tagged in History & Triggers — review this weekly.

---

### Auto-Rollover Modal

At the start of each new month, if the previous month hasn't been rolled over, the app automatically shows a modal summarising what happened to each envelope:

- Which envelopes will **sweep** unspent to buffer (and how much).
- Which envelopes will **roll forward** (increasing next month's cap).
- Which envelopes will **reset** to their original cap.
- Buffer balance before and after the sweep.

Clicking **Confirm and continue** executes the rollover. This is the primary rollover path — the manual button in Budget covers the same function for the last few days of the month before this modal appears.

---

### Snapshot System

A snapshot captures:
- Family Buffer, Trading Capital, Long-term, Goals balances.
- Total assets, salary, months covered, current stage.

Take a snapshot:
- At every month-end as part of the Review ritual.
- After any meaningful change (large deposit, profit allocation, big expense).

Every snapshot also auto-downloads a JSON backup file. Two actions in one click.

Snapshots feed:
- The History tab's stacked area chart.
- The Review tab's buffer-change metric.

---

### Backup and Data Safety

**Primary backup: cloud sync.** Your data is automatically synced to secure cloud servers every time it changes. As long as you're signed in and online, your data is safe regardless of what happens to your device or browser.

**Secondary backup: manual JSON export.** Rules tab or Settings → Backup & Data → Download as file. Exports a complete JSON snapshot. Use this for:
- Migrating to a new account.
- Keeping a local archive.
- Recovering from an account issue.

**Backup reminder**: The Command tab shows a reminder banner if you haven't taken a manual backup in 7+ days. Click it to download immediately.

**Restore from file**: Settings → Backup & Data → Import backup → select a JSON file. This replaces all current data. Take a backup of the current state first if there's anything you'd want to keep.

---

### Goals

Goals are specific things you're saving toward — a car, education, business equipment, a deposit on property. Each goal has a name and a target amount.

Goals are tracked against a single shared pool (`data.futureGoals`). Progress is shown per goal as a proportion of the pool balance vs that goal's target. Add and edit goals in the Rules tab.

The Profit Allocator routes a Goals % allocation here based on your stage rule. This allocation accumulates in the pool over time.

---

## 5. Daily / Weekly / Monthly Ritual

### Morning (30 seconds)
- [ ] Open app → Command tab.
- [ ] Read Stage, Months Stored, This Month spending.
- [ ] Read any warning banners. Act or note.
- [ ] Close app.

### Before any purchase ≥ gate threshold
- [ ] Open Impulse Control → Spending Gate.
- [ ] Enter: What / Amount / Envelope / Trigger.
- [ ] Read Hours of work / Left this month / 30-year value.
- [ ] Choose: Skip / Sleep / Buy.

### After any purchase already made
- [ ] Open Impulse Control → Quick Log.
- [ ] Log without judgment. Note the trigger honestly.

### Sunday weekly pulse (5 minutes)
- [ ] Command — overall state, any banners.
- [ ] Budget — envelope pace, anything trending over.
- [ ] Impulse Control → History — triggers this week.
- [ ] One adjustment if needed.

### Month-end ritual (15 minutes)
- [ ] Open Review tab (or confirm the auto-popup).
- [ ] Read all metric cards and envelope performance.
- [ ] Log this month's trading P&L.
- [ ] Apply envelope rollover (auto-modal or manual button).
- [ ] Take snapshot (auto-downloads backup).
- [ ] Click Mark month as reviewed.

---

## 6. Emergency Scenarios

### Hard block fired on a legitimate need
**Example**: Eating Out envelope is at R0 but family is visiting.

Options in order:
1. Use a different envelope (Family if you have one).
2. Edit the envelope cap temporarily in Budget → Manage.
3. If envelope is PIN Override mode, enter your PIN — but recognise this is the friction doing its job.
4. Adjust the cap permanently if it's consistently too tight.

**Do not**: Disable the envelope or change Hard block to Soft warning just to fix today's purchase.

### Haven't logged purchases for several days
Open Impulse Control → Quick Log. Batch-add each purchase one by one. Approximate amounts if needed. Underreporting is worse than approximating — log it all.

### App feels wrong — bad totals, strange state
1. Open Settings → Backup & Data → Download as file (backup current state).
2. If the issue is clearly a data entry error, fix it directly in Setup & Salary or Budget.
3. If the app state is deeply broken, restore from a recent backup via Settings → Import backup.

Your cloud-synced data is also recoverable — sign out and back in to force a fresh cloud load.

### Sync failed warning in Settings
1. Check your internet connection.
2. Click Retry in the Settings sync section.
3. If "Sync failed — permission error" appears, sign out and sign back in.
4. Your data has been saved locally — nothing is lost. Sync will resume when the auth issue clears.

### Lost / forgot your PIN
On the PIN entry screen, click "Forgot your PIN?" → submit a reason → send request. An admin will approve it. You'll see a prompt to set a new PIN on your next login.

---

## 7. Common Mistakes

**1. Entering profit instead of total balance in Trading Capital.**
The Capital field is your full broker account balance, not the month's P&L. Entering profit here breaks the high water mark and all drawdown calculations.

**2. Not updating Trading Capital weekly.**
The Drawdown Protocol requires current numbers. Monthly updates mean you're flying blind for most of the month.

**3. Setting unrealistic spending budgets.**
A budget below what you actually spend means every envelope blocks you constantly. Look at three months of bank statements and enter what you actually spend. Tighten over 3–6 months as habits change.

**4. Bypassing the Spending Gate regularly.**
"Just this once" is how the habit breaks. If a purchase is at or above your gate threshold, gate it every time.

**5. Setting all envelopes to Soft warning.**
Soft warning everywhere is no system at all. Discretionary envelopes need Hard block or PIN Override.

**6. Resetting high water to hide a drawdown.**
Reset is only for intentional capital withdrawals — when you physically moved money out on purpose. Resetting after a bad run removes the protection the protocol exists to provide.

**7. Forgetting to apply rollover.**
Set a calendar reminder for the 28th of every month. Without rollover, Sweep envelopes don't sweep and buffer doesn't grow from your discipline.

**8. Not taking snapshots.**
No snapshots = no History chart = no buffer-change metric in Review. Take one every month-end at minimum.

**9. Lying about triggers.**
The Trigger field is the most underrated input. Your aggregated trigger breakdown is only useful if it's honest. "I spend most when I've lost a trade and I'm stressed" is a fixable pattern — but only if you logged it accurately.

**10. Changing stage rules during a bad month.**
Editing your stage allocation percentages to release more lifestyle money during a drawdown is impulse spending wearing a different mask. Set rules once when calm, then leave them alone.

---

## 8. Success Metrics

Check these monthly. If three or more are off-target for two consecutive months, something needs adjusting.

| Metric | Target | Where to find |
|---|---|---|
| Impulse spending vs budget | < 80% of total cap | Budget tab — Total Spent vs Total Allocated |
| Buffer growth | Positive every month | Review tab — Buffer Change |
| Gate usage | > 90% of purchases ≥ threshold | Compare Impulse history to bank statement |
| PIN override frequency | < 2 per month | History & Triggers |
| Envelopes on target | All of them | Review tab — envelope performance |
| Drawdown zone | Normal | Trading P&L — Zone display |
| Cloud sync | Synced | Settings — sync status |

If buffer growth is flat for two months: either Spending Budget is too high (tighten envelopes) or Buffer Reserve is too low (increase it in Setup & Salary).

If PIN override is above 2/month: your envelope caps don't match your life. Adjust the caps, not the habit of overriding.

---

*Royal Ledger. Personal finance for the disciplined.*
