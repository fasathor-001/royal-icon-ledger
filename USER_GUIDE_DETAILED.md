# Royal-Icon Ledger — User Guide

A field manual for setting up and operating the app correctly.

---

## Table of Contents

1. [App Philosophy](#1-app-philosophy)
2. [Tab-by-Tab Guide](#2-tab-by-tab-guide)
   - [2.1 Command](#21-command)
   - [2.2 Setup & Salary](#22-setup--salary)
   - [2.3 Budget](#23-budget)
   - [2.4 Profit Allocator](#24-profit-allocator)
   - [2.5 Trading P&L](#25-trading-pl)
   - [2.6 Impulse Control](#26-impulse-control)
   - [2.7 History](#27-history)
   - [2.8 Review](#28-review)
   - [2.9 Rules](#29-rules)
3. [Feature Deep-Dives](#3-feature-deep-dives)
   - [3.1 Spending Gate](#31-spending-gate)
   - [3.2 Envelope System](#32-envelope-system)
   - [3.3 Stage System](#33-stage-system)
   - [3.4 Profit Allocator](#34-profit-allocator)
   - [3.5 Drawdown Protocol](#35-drawdown-protocol)
   - [3.6 PIN System](#36-pin-system)
   - [3.7 Auto-Rollover](#37-auto-rollover)
   - [3.8 Snapshot System](#38-snapshot-system)
   - [3.9 Backup & Restore](#39-backup--restore)
4. [How to Actually Use This App (Daily Workflow)](#4-how-to-actually-use-this-app-daily-workflow)
5. [Common Mistakes](#5-common-mistakes)
6. [Success Metrics](#6-success-metrics)

---

## 1. App Philosophy

Royal-Icon Ledger is a discipline system, not a tracker. Generic finance apps tell you what you've already spent. This one prevents the spending you shouldn't do, automates the saving you said you'd do, and protects the money your family depends on.

Three operating principles:

1. **Family money first.** Buffer (cash reserves for survival) is funded before any other allocation. Trading capital, long-term investments, and lifestyle spending all wait their turn behind family protection.
2. **Trading is a job, not a windfall.** Profits flow through a tax reserve and a stage-based waterfall. Money you never see in your spending account is money you cannot impulse-spend.
3. **The pause is the system.** The Spending Gate inserts a moment between impulse and payment. That moment — not willpower, not motivation — is what protects your wealth.

The app is field-driven. Every calculation, warning, and rule depends on real numbers entered correctly. Garbage in, garbage out. Read this guide once before you start; reference it whenever a field is unclear.

---

## 2. Tab-by-Tab Guide

### 2.1 Command

#### A. Purpose
Home screen. Shows current state — net worth, balances, salary, stage, drawdown zone, and any active warnings. Provides quick navigation to other tabs and the Snapshot button.

#### B. When to use
Daily. First thing you open. 30-second glance.

#### C. Step-by-step usage
1. Open the app — Command loads by default.
2. Read the four balance cards (Family Buffer / Trading Capital / Long-term / Net Worth).
3. Read the Stage banner and Months Stored display.
4. Check warning banners (drawdown, backup, rollover) and act on any that are present.
5. If anything has changed (e.g. you deposited cash to your buffer account), edit the balance fields directly.
6. Click Snapshot to record current state when meaningful changes have happened.
7. Use Quick Action buttons to jump to another tab.

#### D. Field Reference

**Field: Family Buffer**
- *What it is*: Cash reserves held outside trading and investment accounts. Survival money.
- *What to enter*: The current total balance of your buffer/savings account.
- *Where to get it*: Login to your savings or money-market bank account, copy the current balance.
- *When to update*: Whenever the balance changes — deposit, withdrawal, monthly buffer reserve transfer, profit allocation.
- *Why it matters*: Drives Stage detection, Months Stored, and the buffer progress bar. If wrong, the system can't tell which stage you're in or how protected your family actually is.

**Field: Trading Capital**
- *What it is*: Current balance in your trading/broker account.
- *What to enter*: The full account balance you trade with.
- *Where to get it*: Your broker dashboard or app (e.g. equity/total balance line).
- *When to update*: At least weekly. Daily is better during active periods.
- *Why it matters*: Drives the Drawdown Protocol. The high water mark and zone calculations are wrong if this isn't current.

**Field: Long-term**
- *What it is*: Total value of long-term investments (TFSA, retirement annuity, ETFs, index funds).
- *What to enter*: Sum of all long-term investment account values.
- *Where to get it*: Investment platform dashboards (Easy Equities, Allan Gray, 10X, etc.).
- *When to update*: Monthly. Long-term values change slowly.
- *Why it matters*: Counted in Net Worth. Affects history chart and review metrics.

**Field: Net Worth (display only)**
- *What it is*: Auto-calculated total of Family Buffer + Trading Capital + Long-term.
- *What to enter*: Nothing. Auto-calculated.
- *Where to get it*: Derived from the three balance fields.
- *When to update*: Updates automatically when any balance changes.
- *Why it matters*: Top-level view of total wealth. Snapshots this value over time.

**Field: Monthly Salary (display only)**
- *What it is*: Auto-calculated total monthly salary you pay yourself from trading income.
- *What to enter*: Nothing. Auto-calculated from Setup & Salary tab.
- *Where to get it*: Derived from Total Expenses + Spending Budget + Buffer Reserve.
- *When to update*: Updates automatically when you edit those components.
- *Why it matters*: Drives Months Stored, Buffer Target, gate "hours of work" calculation.

**Field: Stage banner (display only)**
- *What it is*: Current stage of the system (1, 1.5, 2, or 3).
- *What to enter*: Nothing. Auto-detected.
- *Where to get it*: Calculated from Family Buffer ÷ Monthly Salary against Stage thresholds in Rules tab.
- *When to update*: Updates automatically as buffer grows.
- *Why it matters*: Stage controls how trading profits are allocated.

**Field: Months Stored (display only)**
- *What it is*: How many months of full salary your buffer can cover.
- *What to enter*: Nothing. Auto-calculated.
- *Where to get it*: Family Buffer ÷ Monthly Salary.
- *When to update*: Auto.
- *Why it matters*: Direct measure of family financial protection. Goal is to reach your Buffer Target Months number.

**Field: Snapshot button**
- *What it is*: Records a dated copy of all current balances and stats.
- *What to enter*: Nothing. Click triggers capture.
- *Where to get it*: N/A.
- *When to update*: Take one at month-end always; also after major changes (deposits, large profits, big purchases).
- *Why it matters*: Snapshots build the History chart and enable Review buffer-change calculation. Also auto-downloads a backup file.

**Warning Banners**

| Banner | When it appears | What to do |
|---|---|---|
| Backup Reminder | 7+ days since last backup | Click → goes to Rules → click Download as file |
| Drawdown Alert | Trading capital is in Caution / Defensive / Stop zone | Click Review → goes to Trading P&L for zone rules |
| Rollover Prompt | Last 3 days of month or first 3 days of next month, rollover not yet applied | Click → goes to Budget tab → click Apply rollover |

---

### 2.2 Setup & Salary

#### A. Purpose
The foundation. Defines monthly expenses, spending budget, buffer reserve, and buffer target. Every other tab in the app derives numbers from this one.

#### B. When to use
Once during initial setup. Then quarterly to update for life changes (rent increase, new dependent, salary change). Don't fiddle with it weekly — that's noise.

#### C. Step-by-step usage
1. Add each fixed monthly expense one at a time (name, amount, category, click Add).
2. Continue until you've covered every recurring debit on your bank statement.
3. Enter Spending Budget — your discretionary money for the month.
4. Enter Buffer Reserve — the amount of salary that auto-funds your buffer monthly.
5. Set Buffer Target Months — how many months of full salary to keep as buffer.
6. Set Buffer Protect Months — when buffer-protect mode activates.
7. Verify the auto-calculated Monthly Salary at the top is what you intend to pay yourself.
8. Verify Buffer Target is realistic.

#### D. Field Reference

**Field: Expense name**
- *What it is*: Description of a recurring monthly expense.
- *What to enter*: A name you'll recognize (e.g. "Rent", "Groceries", "Mom's allowance").
- *Where to get it*: Your bank statement — every recurring debit needs a row here.
- *When to update*: When you add new expenses or rename existing ones.
- *Why it matters*: Labels only. Doesn't affect calculations.

**Field: Expense amount**
- *What it is*: Monthly cost of this expense.
- *What to enter*: The Rand value as a number (no commas, no currency symbol).
- *Where to get it*: Bank statement. For variable expenses (groceries, utilities), use the average of the last 3 months.
- *When to update*: When the actual amount changes (rent increase, school fee adjustment, etc.).
- *Why it matters*: Sums into Total Expenses, which feeds Monthly Salary, Buffer Target, and the savings rate calculation. If wrong, your salary calculation is wrong.

**Field: Expense category**
- *What it is*: The type of expense.
- *What to enter*: Pick the closest match from the dropdown.
- *Where to get it*: N/A — your judgment.
- *When to update*: Rarely. Only if you want to recategorize for clarity.
- *Why it matters*: Categories `Family support` and `Childcare/Kids` trigger the dependent-aware envelope suggestion in Budget. If an expense is in the wrong category, the auto-suggestion may miss your situation.

**Field: Add button**
- *What it is*: Saves the current expense entry to the list.
- *What to enter*: Click after filling name + amount + category.
- *Where to get it*: N/A.
- *When to update*: Every time you've finished entering one expense.
- *Why it matters*: Without clicking Add, the expense isn't saved.

**Field: Spending Budget**
- *What it is*: Total discretionary money for the month — the pool that gets split into envelopes.
- *What to enter*: A realistic amount based on what you actually spend on non-essentials (eating out, personal items, household extras).
- *Where to get it*: Look at three months of bank statements. Subtract fixed expenses from total spending. The remainder is your real spending budget — that's the number to enter, not what you "wish" you spent.
- *When to update*: Quarterly, or after a meaningful life change.
- *Why it matters*: Drives the Budget tab's envelope total. If too low, every envelope blocks you constantly and you'll abandon the system. If too high, the system can't constrain impulse spending.

**Field: Buffer Reserve**
- *What it is*: Amount of monthly salary that auto-feeds your buffer (separate from trading profit allocation).
- *What to enter*: A number you can sustainably set aside every month, even in bad trading months.
- *Where to get it*: Your decision. Look at Monthly Salary minus Total Expenses minus Spending Budget — there should be room for at least R500–R3,000 here.
- *When to update*: Quarterly, or when you want to accelerate buffer growth.
- *Why it matters*: Adds to Monthly Salary calculation and to monthly buffer growth. Affects months-to-fortified projection in Review.

**Field: Buffer Target Months**
- *What it is*: How many months of full salary you want to hold as buffer.
- *What to enter*: A whole number — typically 6, 12, or 18.
- *Where to get it*: Recommended values: variable income with dependents = 18; mixed income = 9–12; fixed salary = 6.
- *When to update*: When your income type or family responsibility changes.
- *Why it matters*: Multiplied by Monthly Salary to compute the Buffer Target. Drives stage detection thresholds and progress bar.

**Field: Buffer Protect Months**
- *What it is*: Threshold below which buffer-protect mode activates.
- *What to enter*: A number 2–3 less than your Buffer Target Months (e.g. 16 if target is 18).
- *Where to get it*: Your decision.
- *When to update*: When you change the target.
- *Why it matters*: When buffer drops below this in months, buffer-protect mode activates and changes how profits are allocated.

**Field: Total Expenses (display only)**
- *What it is*: Sum of all expense amounts.
- *What to enter*: Nothing. Auto-summed.
- *Where to get it*: Derived.
- *When to update*: Auto.
- *Why it matters*: Component of Monthly Salary.

**Field: Monthly Salary (display only)**
- *What it is*: The total monthly amount you pay yourself.
- *What to enter*: Nothing. Auto-calculated.
- *Where to get it*: Total Expenses + Spending Budget + Buffer Reserve.
- *When to update*: Auto.
- *Why it matters*: This is the salary you transfer to yourself on payday. Drives stage detection, gate hours-of-work, profit allocator math, and pretty much every calculation downstream.

**Field: Buffer Target (display only)**
- *What it is*: The total Rand amount you're aiming to hold in buffer.
- *What to enter*: Nothing. Auto-calculated.
- *Where to get it*: Monthly Salary × Buffer Target Months.
- *When to update*: Auto.
- *Why it matters*: The destination. Stage 3 (fortified) is reached when Family Buffer ≥ Buffer Target.

---

### 2.3 Budget

#### A. Purpose
Splits Spending Budget into named envelopes (categories). Each envelope has a cap, a block mode (what happens when you exceed it), and a rollover mode (what happens at month-end).

#### B. When to use
Once during initial setup. Then weekly to check progress, monthly to apply rollover.

#### C. Step-by-step usage
1. On first visit, click **Generate envelopes**. The system suggests envelopes based on your expenses + spending budget.
2. On the review screen, adjust each envelope: name, cap, block mode, rollover mode.
3. Confirm Total Allocated equals your Spending Budget exactly.
4. Click **Confirm envelopes**.
5. Refresh — your live Budget view appears.
6. Throughout the month, your purchases (logged via Spending Gate or Quick Log) populate the envelopes.
7. Watch the progress bars. Read the pace projection.
8. Last 3 days of month: click **Apply rollover** to sweep, roll, or reset envelopes per their mode.
9. Use **Manage** anytime to edit envelopes.

#### D. Field Reference

**Field: Generate envelopes button**
- *What it is*: Auto-suggestion engine.
- *What to enter*: Click once on first setup.
- *Where to get it*: N/A.
- *When to update*: Only if you want to rebuild from scratch (use the reset button in Manage instead for partial changes).
- *Why it matters*: Generates a starting point you can edit. The suggestion uses your expense categories — if family/child expenses exist, you get a 7-envelope dependent-aware split; otherwise a simpler 5-envelope split.

**Field: Envelope name**
- *What it is*: Label for the envelope.
- *What to enter*: A category name (e.g. "Eating Out", "Personal", "Wife", "Family & Kids").
- *Where to get it*: Your decision.
- *When to update*: When relabeling.
- *Why it matters*: Labels only. Doesn't affect math.

**Field: Cap**
- *What it is*: Hard monthly limit for spending in this envelope.
- *What to enter*: A Rand amount.
- *Where to get it*: Distribute your Spending Budget across envelopes. The sum of all caps must equal your Spending Budget exactly.
- *When to update*: When the realistic spend for that category changes, or when redistributing budget after the first month of real data.
- *Why it matters*: This is the limit the block mode enforces against. If wrong, either you'll get blocked too often (cap too tight) or never (cap too loose).

**Field: Block mode**
- *What it is*: What happens when this envelope's spending hits the cap.
- *What to enter*: Pick one — Soft warning / Hard block / PIN override.
- *Where to get it*: Your decision per envelope. Recommended: essentials = soft; discretionary = hard; safety-valve categories = pin.
- *When to update*: If a mode is wrong for the category in practice (e.g. groceries on hard block keeps blocking food purchases — switch to soft).
- *Why it matters*: Soft = warning, allow. Hard = refuse purchase outright. PIN = refuse unless 4-digit PIN entered. This is the discipline mechanism.

**Field: Rollover mode**
- *What it is*: What happens to unspent money at month-end.
- *What to enter*: Pick one — Reset / Roll over / Sweep to buffer.
- *Where to get it*: Your decision per envelope. Recommended: groceries = reset; lumpy categories = roll; discretionary you want to under-spend = sweep.
- *When to update*: Rarely. Set thoughtfully once.
- *Why it matters*: Reset throws unspent money away. Roll carries it to next month's cap. Sweep transfers it directly to your Family Buffer — the wealth-building option that converts discipline into savings.

**Field: Add custom envelope button**
- *What it is*: Adds a new blank envelope.
- *What to enter*: Click to add, then fill name + cap + block mode + rollover mode.
- *Where to get it*: N/A.
- *When to update*: When you need a category the auto-generation didn't include (e.g. "Pet care", "Petrol").
- *Why it matters*: Total caps must always equal Spending Budget.

**Field: Manage button**
- *What it is*: Opens edit mode for all envelopes.
- *What to enter*: Click to open.
- *Where to get it*: N/A.
- *When to update*: When you want to change caps, modes, or remove envelopes.
- *Why it matters*: The only way to edit existing envelopes after initial setup.

**Field: Progress bar (per envelope)**
- *What it is*: Visual indicator of how much of the cap you've spent this month.
- *What to enter*: Nothing. Auto-rendered.
- *Where to get it*: Sum of impulses tagged to this envelope this month ÷ cap.
- *When to update*: Auto.
- *Why it matters*: At a glance shows which envelopes are healthy (green), warming up (yellow/orange), or blown (red).

**Field: Pace projection (per envelope)**
- *What it is*: Predicted total spending for this envelope by month-end at current rate.
- *What to enter*: Nothing. Auto-calculated.
- *Where to get it*: (Spent ÷ days elapsed) × days in month.
- *When to update*: Auto.
- *Why it matters*: Catches problems early. If you spend R50 in three days on a R500 cap, pace shows R517 — projects you'll be R17 over by month-end.

**Field: Apply rollover button**
- *What it is*: Executes month-end rollover logic on all envelopes.
- *What to enter*: Click during the last 3 days of the month or first 3 days of the next month.
- *Where to get it*: N/A.
- *When to update*: Once per month.
- *Why it matters*: Reset envelopes lose unspent. Roll envelopes carry forward. Sweep envelopes transfer unspent to your Family Buffer. Without clicking this, the rollover doesn't happen.

**Field: Total Allocated / Total Spent / Total Remaining (displays)**
- *What it is*: Sum across all envelopes — caps, spending, remainder.
- *What to enter*: Nothing.
- *Where to get it*: Auto-summed.
- *When to update*: Auto.
- *Why it matters*: Total Allocated should always equal your Spending Budget. If it doesn't, you have an envelope sizing error.

---

### 2.4 Profit Allocator

#### A. Purpose
Routes trading profit through tax reserve and a stage-based waterfall (buffer / long-term / trading / lifestyle). Prevents profit from becoming impulse-spendable income.

#### B. When to use
Every time you have realized trading profit. Before you transfer any of it anywhere.

#### C. Step-by-step usage
1. Enter Gross Profit (the raw profit from trading).
2. Read Tax Reserve (auto-calculated using your Tax Reserve % from Rules).
3. Read Net Profit (Gross − Tax Reserve).
4. Read the four allocation amounts (To Buffer / To Long-term / To Trading / To Lifestyle) — the system computes these based on your current stage.
5. If you agree with the split, click **Apply allocation**. If not, click **Cancel** and adjust your stage rules in the Rules tab.
6. Apply moves the actual amounts into the relevant balance fields and records the allocation in History.

#### D. Field Reference

**Field: Gross Profit**
- *What it is*: Total trading profit before any deductions.
- *What to enter*: A Rand number.
- *Where to get it*: Your broker monthly P&L statement, or the realized profit you're about to allocate.
- *When to update*: Per allocation event.
- *Why it matters*: All downstream allocation amounts derive from this.

**Field: Tax Reserve (display only)**
- *What it is*: Amount set aside for tax.
- *What to enter*: Nothing. Auto-calculated.
- *Where to get it*: Gross Profit × Tax Reserve % (from Rules tab).
- *When to update*: Auto. Edit Tax Reserve % in Rules to change it.
- *Why it matters*: Reserved tax money should be physically transferred to a separate account untouched until tax filing.

**Field: Net Profit (display only)**
- *What it is*: Profit after tax reserve.
- *What to enter*: Nothing. Auto-calculated.
- *Where to get it*: Gross Profit − Tax Reserve.
- *When to update*: Auto.
- *Why it matters*: This is what flows down the waterfall.

**Fields: To Buffer / To Long-term / To Trading / To Lifestyle (displays)**
- *What it is*: How Net Profit gets split based on your current stage.
- *What to enter*: Nothing. Auto-calculated using stage % rules.
- *Where to get it*: Net Profit × Stage % for that bucket.
- *When to update*: Auto. Edit stage % in Rules tab to change behavior.
- *Why it matters*: Tells you exactly how much to physically transfer to which account.

**Field: Apply allocation button**
- *What it is*: Commits the split.
- *What to enter*: Click to apply.
- *Where to get it*: N/A.
- *When to update*: Per allocation event.
- *Why it matters*: Updates Family Buffer / Trading Capital / Long-term balances and records the allocation in history. After clicking, you should physically transfer matching amounts in your real bank/broker accounts.

**Field: Cancel button**
- *What it is*: Discards the current allocation without applying.
- *What to enter*: Click.
- *Where to get it*: N/A.
- *When to update*: When you want to redo.
- *Why it matters*: Nothing changes if you cancel.

**Field: Allocation History list**
- *What it is*: Record of every applied allocation.
- *What to enter*: Nothing.
- *Where to get it*: Auto-populated.
- *When to update*: Auto.
- *Why it matters*: Audit trail. Lets you reconcile against your real bank movements at tax time.

---

### 2.5 Trading P&L

#### A. Purpose
Tracks monthly P&L performance, computes win-rate stats, and runs the Drawdown Protocol — a discipline system that automatically reduces position sizes as your trading capital falls.

#### B. When to use
Update Capital weekly minimum. Log P&L monthly. Check the Drawdown Protocol whenever you're trading.

#### C. Step-by-step usage
1. Update the **Capital** field if your trading account balance has changed.
2. Read your stats (YTD P&L / Win Rate / Avg W/L) at the top.
3. To log a month, enter Month + Net P&L → click Log P&L.
4. Read the Drawdown Protocol section at the bottom. Note the zone you're in and the rule it enforces.
5. The high water mark auto-updates when your capital reaches a new peak.

#### D. Field Reference

**Field: Capital**
- *What it is*: **Current trading account balance.** Not profit. Not deposits. Not buffer money. The total equity in your trading account right now.
- *What to enter*: The full balance shown in your broker dashboard.
- *Where to get it*: Your broker — account equity / total balance line.
- *When to update*: Weekly minimum. Daily during volatile periods. Update immediately after deposits, withdrawals, or large profit/loss events.
- *Why it matters*: Drives the entire Drawdown Protocol. The high water mark, current drawdown percentage, recovery target, and zone all derive from this number. **If you enter profit instead of total balance, the system thinks your account has grown 10× and your drawdown calculation breaks.**

**Field: YTD P&L (display only)**
- *What it is*: Year-to-date sum of all logged monthly P&L entries.
- *What to enter*: Nothing.
- *Where to get it*: Auto-summed from logged P&L history.
- *When to update*: Auto.
- *Why it matters*: Annual view of trading performance.

**Field: Win Rate (display only)**
- *What it is*: Percentage of months with positive P&L.
- *What to enter*: Nothing.
- *Where to get it*: Auto-calculated from P&L history.
- *When to update*: Auto.
- *Why it matters*: Performance metric. Below 50% combined with Avg W/L below 1.0 means losing strategy.

**Field: Avg W/L (display only)**
- *What it is*: Ratio of average winning month to average losing month.
- *What to enter*: Nothing.
- *Where to get it*: Auto-calculated.
- *When to update*: Auto.
- *Why it matters*: Above 1.5 + 50% win rate = healthy strategy.

**Field: Month**
- *What it is*: The month you're logging P&L for.
- *What to enter*: Format YYYY-MM (e.g. 2026-05).
- *Where to get it*: Defaults to current month.
- *When to update*: Per log entry.
- *Why it matters*: Identifies which month the entry belongs to.

**Field: Net P&L**
- *What it is*: Profit or loss for that specific month.
- *What to enter*: A Rand number — positive for profit, negative for loss.
- *Where to get it*: Your broker monthly statement.
- *When to update*: Once per month after the month closes.
- *Why it matters*: Feeds YTD, Win Rate, Avg W/L, and the Review tab's monthly P&L card.

**Field: Log P&L button**
- *What it is*: Saves the P&L entry.
- *What to enter*: Click after filling Month + Net P&L.
- *Where to get it*: N/A.
- *When to update*: Once per month.
- *Why it matters*: Without clicking, the entry isn't saved.

**Field: P&L chart (display only)**
- *What it is*: Bar chart of monthly P&L over time.
- *What to enter*: Nothing.
- *Where to get it*: Auto-rendered from logged entries.
- *When to update*: Auto.
- *Why it matters*: Visual trend check — you can spot drawdown patterns, seasonality, strategy shifts.

**Field: High Water (display only)**
- *What it is*: The highest value Trading Capital has ever reached.
- *What to enter*: Nothing.
- *Where to get it*: Auto-tracked.
- *When to update*: Auto-updates when current Capital exceeds it.
- *Why it matters*: Reference point for drawdown calculation.

**Field: Current Drawdown (display only)**
- *What it is*: How far below the high water mark your trading capital is, as a percentage.
- *What to enter*: Nothing.
- *Where to get it*: (High Water − Capital) ÷ High Water × 100.
- *When to update*: Auto, updates whenever Capital changes.
- *Why it matters*: Drives the Zone classification.

**Field: To Break Even (display only)**
- *What it is*: Percentage gain needed on current capital to recover the high water mark.
- *What to enter*: Nothing.
- *Where to get it*: Drawdown ÷ (100 − Drawdown) × 100.
- *When to update*: Auto.
- *Why it matters*: Reality check. 30% drawdown needs 43% recovery. 50% needs 100%. 70% needs 233%. Big drawdowns are catastrophic to recover from.

**Field: Zone (display only)**
- *What it is*: Discipline classification — Normal / Caution / Defensive / Stop.
- *What to enter*: Nothing.
- *Where to get it*: Based on drawdown % thresholds (10/20/30%).
- *When to update*: Auto.
- *Why it matters*: Each zone has a behavioral rule. See section 3.5.

**Field: Reset high water button**
- *What it is*: Manually sets High Water to current Capital.
- *What to enter*: Click only after intentional capital withdrawal (not after losses).
- *Where to get it*: N/A.
- *When to update*: When you withdrew profit and don't want the system to register it as a drawdown.
- *Why it matters*: Misuse breaks the entire drawdown protocol. Only reset for intentional structural changes, never to "fix" a bad month.

---

### 2.6 Impulse Control

Three sub-tabs: **Spending Gate**, **Quick Log**, and **History & Triggers**.

#### A. Purpose
Spending Gate prevents impulse purchases by inserting a 24-hour pause. Quick Log records purchases you already made. History & Triggers shows your spending patterns and triggers.

#### B. When to use
- **Spending Gate**: Before any purchase ≥ R100 you didn't already plan.
- **Quick Log**: When you've already bought something and need to record it.
- **History & Triggers**: Weekly, to spot patterns.

#### C. Step-by-step usage (Spending Gate)
1. Open Spending Gate sub-tab.
2. Fill in: What is it? + Amount + Category + Envelope + Trigger.
3. Click **Run through the gate**.
4. The gate either (a) blocks instantly if envelope is in Hard Block mode and would be exceeded, (b) requires PIN if envelope is in PIN Override mode and would be exceeded, or (c) shows the decision screen.
5. On the decision screen, read the three calculated cards: Hours of work / Left this month / 30-year value.
6. Choose: **Skip it** / **Sleep on it** / **Buy now**.
7. The result is recorded.

#### D. Field Reference (Spending Gate)

**Field: What is it?**
- *What it is*: Description of the item.
- *What to enter*: Brief text (e.g. "Wireless headphones").
- *Where to get it*: The thing you're considering.
- *When to update*: Per purchase consideration.
- *Why it matters*: Labels the entry. Helpful when reviewing history later.

**Field: Amount**
- *What it is*: Cost of the item.
- *What to enter*: Rand number.
- *Where to get it*: Price tag, online listing, or quote.
- *When to update*: Per purchase consideration.
- *Why it matters*: Drives the gate threshold check, hours-of-work calculation, envelope cap check, and 30-year compound estimate.

**Field: Category**
- *What it is*: Type of purchase.
- *What to enter*: Pick from dropdown — food / clothes / tech / online / family / other.
- *Where to get it*: Your judgment.
- *When to update*: Per purchase.
- *Why it matters*: Used in spending pattern analysis. Doesn't drive blocking.

**Field: Envelope**
- *What it is*: Which envelope this purchase comes out of.
- *What to enter*: Pick from dropdown — your configured envelopes appear with remaining amount shown (e.g. "Personal — R750 left").
- *Where to get it*: Your judgment about which category this fits.
- *When to update*: Per purchase.
- *Why it matters*: This is what links the purchase to the envelope cap. Wrong envelope = wrong tracking = wrong rule enforced.

**Field: Trigger**
- *What it is*: Why are you about to buy this? Psychological state or circumstance.
- *What to enter*: Tap one of the buttons — Bored / Stressed / Tired / Won a trade / Lost a trade / Family pressure / Scrolling / Saw an ad. Leave blank if none apply.
- *Where to get it*: Honest self-observation.
- *When to update*: Per purchase.
- *Why it matters*: This is the most underrated field in the entire app. Aggregated triggers reveal your spending patterns. "I spend most when I'm Stressed and have lost a trade" is a pattern you can fix once you see it. Lying about triggers makes the data useless.

**Field: Run through the gate button**
- *What it is*: Triggers gate logic.
- *What to enter*: Click.
- *Where to get it*: N/A.
- *When to update*: Per consideration.
- *Why it matters*: Initiates block check, decision screen flow.

**Field: Hours of work card (display only)**
- *What it is*: How many hours of your work this purchase represents.
- *What to enter*: Nothing.
- *Where to get it*: Amount ÷ (Monthly Salary ÷ 160 hours).
- *When to update*: Auto.
- *Why it matters*: Reframes the purchase in time, not money. R1,500 in headphones = ~6 hours of trading work.

**Field: Left this month card (display only)**
- *What it is*: How much spending budget remains for the month if you do buy this.
- *What to enter*: Nothing.
- *Where to get it*: Spending Budget − month-to-date impulses.
- *When to update*: Auto.
- *Why it matters*: Forward-looking awareness.

**Field: 30-year value card (display only)**
- *What it is*: What this amount would compound to at 7% annual return over 30 years.
- *What to enter*: Nothing.
- *Where to get it*: Amount × (1.07)^30.
- *When to update*: Auto.
- *Why it matters*: Reframes today's purchase as a 30-year future cost. R1,500 today = R11,418 not had at retirement.

**Field: Skip it / Sleep on it / Buy now buttons**
- *What it is*: Three decision options.
- *What to enter*: Click one.
- *Where to get it*: N/A.
- *When to update*: Per gate event.
- *Why it matters*: 
  - **Skip it** — abandon, log nothing, return to clean state.
  - **Sleep on it** — add to pending list with envelope tagged. Decide tomorrow.
  - **Buy now** — confirm purchase. Logs to impulses, increments envelope spending.

**Field: Override (PIN) button**
- *What it is*: Appears only when envelope is in PIN Override mode and would be exceeded by this purchase.
- *What to enter*: Click → enter your 4-digit PIN.
- *Where to get it*: PIN comes from Rules tab.
- *When to update*: When the override is genuinely justified.
- *Why it matters*: Allows exceptional bypass with friction. Each override is recorded with a PIN OVERRIDE badge in History & Triggers — review weekly. If overrides are >2/month, your caps are unrealistic or your discipline is slipping.

#### Quick Log Sub-tab

Identical fields to Spending Gate (What is it? / Amount / Category / Trigger) but **no envelope picker, no gate, no decision step**. Just records the purchase.

**Field: Log it button**
- *What it is*: Saves the purchase.
- *What to enter*: Click after filling fields.
- *Where to get it*: N/A.
- *When to update*: When you've already bought something and need to log it retroactively.
- *Why it matters*: Quick Log is for retroactive recording. It does NOT enforce envelope rules — use Spending Gate for that. Use Quick Log only for honest catch-up of past purchases.

#### History & Triggers Sub-tab

**Field: This month list**
- *What it is*: All impulses logged this month.
- *What to enter*: Nothing — auto-populated.
- *Where to get it*: All impulse entries.
- *When to update*: Auto.
- *Why it matters*: Where you can review and delete bad entries.

**Field: Delete (×) button per entry**
- *What it is*: Removes an entry.
- *What to enter*: Click × on the entry, confirm.
- *Where to get it*: N/A.
- *When to update*: When you have a wrong/test entry that needs removal.
- *Why it matters*: Bad data corrupts every downstream calculation. Cleaning up is essential.

**Field: PIN OVERRIDE badge**
- *What it is*: Tag indicating this purchase used the PIN override.
- *What to enter*: Nothing — auto-applied.
- *Where to get it*: Auto-set when Override (PIN) button is used in the gate.
- *When to update*: Auto.
- *Why it matters*: Pattern detection — spot how often you override.

**Field: All triggers list / Trigger bars**
- *What it is*: Aggregate of all triggers across all-time spending.
- *What to enter*: Nothing.
- *Where to get it*: Auto-aggregated from all impulses with triggers.
- *When to update*: Auto.
- *Why it matters*: Reveals your dominant spending triggers. The largest bar is the pattern you most need to address.

---

### 2.7 History

#### A. Purpose
Long-term view. Stacked area chart of buffer / trading / long-term over time. List of all snapshots with delete option.

#### B. When to use
Monthly, after taking a month-end snapshot. Also any time you want to compare current state to a past state.

#### C. Step-by-step usage
1. Read the chart at the top — orange = buffer, blue = trading, green = long-term.
2. Scroll the snapshot list below.
3. For any snapshot, see Date / Buffer / Trading / Long-term / Total / Change from previous.
4. Click × on any bad snapshot to delete it.

#### D. Field Reference

**Field: Net worth chart (display only)**
- *What it is*: Visual trajectory of total assets over time, broken into the three components.
- *What to enter*: Nothing.
- *Where to get it*: Auto-rendered from snapshots.
- *When to update*: Auto. New snapshots add new data points.
- *Why it matters*: Visual confirmation of progress. Stagnant or declining lines mean the system isn't working.

**Field: Snapshot list**
- *What it is*: All snapshots, oldest first.
- *What to enter*: Nothing. Auto-populated.
- *Where to get it*: Each Snapshot button click.
- *When to update*: Auto.
- *Why it matters*: Audit trail.

**Field: Date (per snapshot)**
- *What it is*: Day the snapshot was taken.
- *What to enter*: Nothing.
- *Where to get it*: Auto-tagged on capture.
- *When to update*: Cannot edit. Take new snapshot, delete old one.
- *Why it matters*: Time anchor.

**Field: Buffer / Trading / Long-term / Total Assets (per snapshot)**
- *What it is*: Captured balances at the moment of snapshot.
- *What to enter*: Nothing.
- *Where to get it*: Auto-captured.
- *When to update*: Cannot edit. Re-snapshot if needed.
- *Why it matters*: Historical record.

**Field: Change from previous snapshot**
- *What it is*: Delta between this snapshot and the previous one.
- *What to enter*: Nothing.
- *Where to get it*: This Total − Previous Total.
- *When to update*: Auto.
- *Why it matters*: Quick view of progress between snapshots.

**Field: Delete (×) button per snapshot**
- *What it is*: Removes a snapshot.
- *What to enter*: Click × and confirm.
- *Where to get it*: N/A.
- *When to update*: When a snapshot is wrong or test data.
- *Why it matters*: Bad snapshots distort the chart.

---

### 2.8 Review

#### A. Purpose
End-of-month guided wrap-up. Aggregates monthly spending, envelope performance, P&L, savings rate, buffer change, and stage progress into a single page. Walks you through three required end-of-month actions.

#### B. When to use
Last 3 days of every month, or first 3 days of the next month. The system auto-popups during this window if you haven't reviewed yet. Click the Review tab manually any other time.

#### C. Step-by-step usage
1. Read the four metric cards at the top: Spent / Trading P&L / Savings Rate / Buffer Change.
2. Read envelope performance — see which were on target, which weren't.
3. Read Stage Progress — current buffer + months covered + months to fortified.
4. Read the auto-generated Takeaway message.
5. Complete the three end-of-month actions:
   - **Log P&L** if not already done — click the action button → goes to Trading P&L.
   - **Apply rollover** if not already done — click → goes to Budget tab.
   - **Take snapshot** — click → captures current state and downloads backup.
6. Click **Mark month as reviewed** when done.

#### D. Field Reference

All fields in Review are display-only. They aggregate data from other tabs.

**Spent / Trading P&L / Savings Rate / Buffer Change** — top-line cards. Auto-calculated from monthly impulses, logged P&L, snapshot diffs.

**Envelope performance** — list of every envelope showing spent vs cap, on-target indicator, sweep amount where applicable.

**Stage Progress** — current buffer + months covered + projected months to fortified.

**Discipline Reward** — total amount eligible to sweep to buffer this month.

**Takeaway message** — auto-generated paragraph based on your numbers.

**Action buttons** — Log P&L / Apply Rollover / Take Snapshot. Each navigates or executes inline.

**Mark month as reviewed button** — records this month as reviewed; auto-popup won't show again until next month.

---

### 2.9 Rules

#### A. Purpose
System configuration. Defines tax reserve %, stage allocation %s, spending gate threshold, override PIN. Also where you re-run onboarding, manage backup/restore, and reset everything.

#### B. When to use
Once during initial setup to confirm defaults match your situation. Quarterly to verify thresholds are still right. As-needed for backups.

#### C. Step-by-step usage
1. Read each section. Defaults are sensible — you may not need to change anything.
2. Adjust Tax Reserve % to match your tax bracket.
3. Optionally tune stage allocation %s if you want different waterfall behavior.
4. Adjust Spending Gate threshold if R100 is too low/high for your context.
5. Set or change Override PIN.
6. Use Backup buttons regularly.
7. Re-run setup wizard if you want to redo expense entry from scratch.

#### D. Field Reference

**Field: Tax Reserve %**
- *What it is*: Percentage of every gross trading profit set aside for tax.
- *What to enter*: Number 0–100.
- *Where to get it*: Your South African tax bracket. Most retail traders are 18–36%. Default 25% is reasonable for most.
- *When to update*: Annually, after tax assessment, or when income tier changes.
- *Why it matters*: Drives Profit Allocator's tax line. If too low, you'll under-reserve and have a tax shock. If too high, more money sits idle.

**Field: Stage 1 — Buffer / Long-term / Trading / Lifestyle %**
- *What it is*: How net profit is allocated when you're in Stage 1 (buffer < 6 months covered).
- *What to enter*: Four percentages summing to 100.
- *Where to get it*: Default: 100 / 0 / 0 / 0 (everything goes to buffer).
- *When to update*: Almost never. Stage 1 = survival = 100% to buffer is the right call.
- *Why it matters*: Wrong values here let trading profit leak into lifestyle before family is protected.

**Field: Stage 1.5 — Buffer / Long-term / Trading / Lifestyle %**
- *What it is*: Allocation when buffer is 6–12 months covered.
- *What to enter*: Four percentages summing to 100.
- *Where to get it*: Default: 70 / 0 / 30 / 0. Some buffer growth, some trading capital growth.
- *When to update*: Rarely.
- *Why it matters*: Defines stage 1.5 behavior.

**Field: Stage 2 — Buffer / Long-term / Trading / Lifestyle %**
- *What it is*: Allocation when buffer is 12–18 months covered.
- *What to enter*: Four percentages summing to 100.
- *Where to get it*: Default: 80 / 20 / 0 / 0. Long-term investments unlock here.
- *When to update*: Rarely.
- *Why it matters*: First stage where wealth-building (long-term) starts.

**Field: Stage 3 — Buffer / Long-term / Trading / Lifestyle %**
- *What it is*: Allocation at fortified position (18+ months).
- *What to enter*: Four percentages summing to 100.
- *Where to get it*: Default: 50 / 30 / 0 / 20. First stage where lifestyle spending is allowed.
- *When to update*: Rarely.
- *Why it matters*: This is the only stage where personal use of trading profit is permitted.

**Field: Spending Gate threshold**
- *What it is*: Minimum purchase amount that triggers the gate's pause logic.
- *What to enter*: A Rand number. Default R100.
- *Where to get it*: Default R100 is reasonable for South African context.
- *When to update*: If R100 forces too many gate events on trivial purchases, raise it. If you find yourself slipping by buying R99 items repeatedly, lower it.
- *Why it matters*: Below this amount, the gate skips its pause logic and just records the purchase.

**Field: Override PIN**
- *What it is*: 4-digit code that bypasses Hard block on PIN Override envelopes.
- *What to enter*: Four digits.
- *Where to get it*: Default 0000. Change it on day one.
- *When to update*: When you want a different PIN.
- *Why it matters*: The PIN works because of friction, not security. Anyone could guess yours. The point is the pause — the moment of "do I really want to override?"

**Field: Remove PIN button**
- *What it is*: Resets PIN to default 0000.
- *What to enter*: Click and confirm.
- *Where to get it*: N/A.
- *When to update*: When you forget your PIN.
- *Why it matters*: Fallback if you lock yourself out.

**Field: Re-run setup wizard button**
- *What it is*: Re-launches the onboarding flow.
- *What to enter*: Click.
- *Where to get it*: N/A.
- *When to update*: When you want to redo expense entry from scratch.
- *Why it matters*: Clears your expenses (snapshots, P&L, allocations preserved). Use carefully.

**Field: Download as file button**
- *What it is*: Exports all your data as a JSON file.
- *What to enter*: Click.
- *Where to get it*: N/A.
- *When to update*: At least every 7 days. The Command tab will remind you.
- *Why it matters*: Your only protection against losing data if browser cache clears.

**Field: Import backup button**
- *What it is*: Restores data from a backup JSON file.
- *What to enter*: Click → select a backup JSON file from your computer.
- *Where to get it*: A previously downloaded backup.
- *When to update*: After accidental data loss or when migrating to a new device.
- *Why it matters*: Replaces all current data. Take a backup of current state first if there's anything you want to preserve.

**Field: Reset all data button**
- *What it is*: Wipes everything — back to first-launch state.
- *What to enter*: Click and confirm twice.
- *Where to get it*: N/A.
- *When to update*: Almost never.
- *Why it matters*: Destructive. Take a backup first. Then, if needed, you can re-import after the reset.

---

## 3. Feature Deep-Dives

### 3.1 Spending Gate

The Spending Gate is the heart of impulse control. Three buttons after the pause:

1. **Skip it** — Don't need it. Closes the gate. Nothing logged.
2. **Sleep on it** — Add to pending list. Decide tomorrow. The pending entry keeps the envelope and amount tagged so when you come back to confirm/cancel, the system handles it correctly.
3. **Buy now** — Confirm purchase. Logs to impulses, increments envelope spending.

Before those buttons appear, the gate runs envelope rule checks:
- If envelope is in **Hard block** mode and the purchase would exceed the cap → blocked screen, no buttons, no purchase.
- If envelope is in **PIN Override** mode and the purchase would exceed → PIN prompt. Wrong PIN = blocked. Correct PIN = continue to decision buttons.
- If envelope is in **Soft warning** mode → continues to decision regardless of cap.

Use the gate every time you're considering a purchase ≥ R100. The discipline is in the asking, not in the answering.

### 3.2 Envelope System

Envelopes are named monthly spending categories with three settings each.

**Block modes** (what happens at cap):
- **Soft warning** — purchase allowed, warning shown. Use for essentials (groceries, transport).
- **Hard block** — purchase refused. Use for discretionary categories (eating out, personal).
- **PIN override** — refused unless PIN entered. Use for safety-valve categories (emergency, family).

**Rollover modes** (what happens to unspent at month-end):
- **Reset** — unspent lost. Use it or lose it. Best for groceries.
- **Roll over** — unspent carries to next month's cap. Best for lumpy categories (gifts, household repair).
- **Sweep to buffer** — unspent transfers directly to your Family Buffer. **The wealth-building option.** Best for personal/eating-out envelopes you want to under-spend.

**Strategic combination**: Set discretionary envelopes to Hard Block + Sweep. The system literally cannot let you over-spend, and rewards under-spending with savings. This converts your daily discipline into automatic wealth-building.

### 3.3 Stage System

Your buffer determines stage. Each stage changes how trading profit gets allocated.

| Stage | Threshold | Default Allocation |
|---|---|---|
| Stage 1 — Survive | < 6 months covered | 100% buffer |
| Stage 1.5 — Stabilize | 6–12 months | 70% buffer / 30% trading |
| Stage 2 — Build | 12–18 months | 80% buffer / 20% long-term |
| Stage 3 — Fortified | 18+ months | 50% buffer / 30% long-term / 20% lifestyle |

Stages auto-detect based on Family Buffer ÷ Monthly Salary against the buffer target months you set in Setup.

You don't skip stages. Stage 1 with R20,000 in buffer and a R5,000 lifestyle urge does not become Stage 3.

### 3.4 Profit Allocator

Process:
1. Enter gross trading profit.
2. Tax reserve subtracted first.
3. Net profit flows down the waterfall based on current stage.
4. System shows the four target amounts.
5. Apply moves the amounts to the relevant balance fields.
6. **You then physically transfer matching amounts in your real bank/broker accounts.**

The tax reserve money should sit in a separate sub-account untouched until tax filing. Treat it as already paid.

### 3.5 Drawdown Protocol

The system auto-tracks the highest value Trading Capital has ever reached (high water mark). Drawdown = how far below that you currently are.

Zones and rules:

| Zone | Drawdown | Rule |
|---|---|---|
| Normal | 0–9% | Full position sizes. Trade your plan. |
| Caution | 10–19% | Reduce position sizes by 25%. Review last 10 trades. |
| Defensive | 20–29% | Reduce position sizes by 50%. Consider a week off. |
| Stop | 30%+ | Stop trading. Strategy review required. |

The Command tab shows a warning banner when you cross into Caution or worse.

Math reality: down 30% needs +43% to recover. Down 50% needs +100%. Down 70% needs +233%. The protocol changes behavior automatically before the math becomes catastrophic.

### 3.6 PIN System

The Override PIN bypasses Hard block on envelopes set to PIN Override mode. Configured in Rules → Override PIN field. Default is 0000 — change it on day one.

The PIN works because of friction, not security. Anyone could guess yours. The point is the pause — the moment of "do I really want to override this?"

Every PIN-bypassed purchase is tagged with a **PIN OVERRIDE badge** in History & Triggers. You can filter to view only override-bypassed purchases. If you have more than 2 overrides per month, your envelope caps are unrealistic OR your discipline is slipping. Either way, address it.

### 3.7 Auto-Rollover

At month-end, each envelope handles unspent money based on its rollover mode (set per envelope in the Budget tab).

- Reset envelopes lose their unspent balance.
- Roll over envelopes carry unspent to next month's cap.
- Sweep envelopes transfer unspent directly to your Family Buffer.

**The trigger is manual**: in the last 3 days of the month or first 3 days of the next month, the Budget tab shows an **Apply rollover** button. You click it. The system executes the rollover and records the month so you can't apply twice.

Why manual? Forces you to acknowledge the month is closing. Also means you can verify everything is logged correctly before the rollover commits.

### 3.8 Snapshot System

A snapshot captures your full financial state at a point in time:
- Family Buffer
- Trading Capital
- Long-term
- Total Assets
- Salary
- Months Covered
- Stage

Take a snapshot:
- After any meaningful change (deposit, withdrawal, profit allocation).
- Always at month-end as part of the Review ritual.
- Before any major life change you want to mark.

Every Snapshot button click also auto-downloads a backup JSON file. Two birds, one stone.

Snapshots feed:
- The History tab's stacked area chart.
- The Review tab's buffer-change calculation.

### 3.9 Backup & Restore

Your data lives in your browser's localStorage. Fast and private — but fragile. Clear browser cache, switch device, or wipe the app and the data is gone.

Three layers of protection:

1. **Manual export**: Rules → Download as file → JSON saves to Downloads folder.
2. **Auto-backup on snapshot**: Every snapshot also downloads a backup file.
3. **Backup reminder banner**: Command tab nags you when 7+ days have passed without a backup.

**Where to keep backups**: Your Downloads folder isn't enough. Email backups to yourself, save to Google Drive, or copy to a USB. Multiple copies, multiple locations.

**Restore process**: Rules → Import backup → select a JSON → confirms → loads. All current data is replaced.

---

## 4. How to Actually Use This App (Daily Workflow)

### Morning (30 seconds)
1. Open the app.
2. Glance at Command tab — Net Worth, Stage, Months Stored.
3. Read any warning banners. Act on them or note them.
4. Close the app.

### Before any purchase ≥ R100
1. Open Impulse Control → Spending Gate.
2. Fill: What is it? + Amount + Category + Envelope + Trigger.
3. Click Run through the gate.
4. Read Hours of work / Left this month / 30-year value.
5. Click Skip / Sleep / Buy.

### After any purchase you didn't gate (already bought)
1. Open Impulse Control → Quick Log.
2. Fill: What did you buy? + Amount + Category + Trigger.
3. Click Log it.

### Sunday weekly pulse (5 minutes)
1. Command — overall state.
2. Budget — envelope pace, anything trending over.
3. Impulse Control → History & Triggers — what triggered me this week.
4. Adjust if needed (tighten an envelope, talk with wife about a pattern).

### Month-end ritual (15 minutes, last day of month)
1. Open Review tab (or click the auto-popup).
2. Read all four metric cards.
3. Read envelope performance.
4. Click Log P&L action → enter month's net P&L in Trading P&L.
5. Click Apply rollover action → applies sweep in Budget.
6. Click Take snapshot action → captures state and downloads backup.
7. Click Mark month as reviewed.
8. Email the backup file to yourself (or save to Google Drive).

---

## 5. Common Mistakes

### 1. Entering profit instead of capital in Trading P&L → Capital field
The Capital field is your **total trading account balance**, not the month's profit. Profit goes in Net P&L when logging a month. If you put profit in Capital, your high water mark and drawdown protocol break completely. Always read the field label before entering.

### 2. Not updating trading capital regularly
The Drawdown Protocol depends on Capital being current. If you update Capital monthly but trade weekly, you're flying blind on drawdown for most of the month. Update at least weekly.

### 3. Setting unrealistic spending budgets
A R2,000 spending budget feels disciplined but if you actually spend R5,000, every envelope blocks you constantly and you abandon the system. Look at three months of bank statements. Enter what you actually spend. Tighten over time as habits change.

### 4. Bypassing the Spending Gate ("just this once")
The gate works because it's used every time. Bypassing it on "small" purchases trains your brain to bypass it on large ones too. If a purchase is ≥ R100, gate it. No exceptions.

### 5. Setting all envelopes to Soft warning
Soft warning everywhere = no system at all. Discretionary envelopes (eating out, personal) need Hard block or PIN. Otherwise you're just looking at warnings while spending continues.

### 6. Setting all envelopes to Reset rollover
Reset is fine for groceries (you eat fresh each month) but bad for lumpy categories. Roll for household/family. Sweep for personal. Use all three modes strategically.

### 7. Forgetting to Apply rollover
The Apply rollover button must be clicked at month-end. Without it, sweep envelopes don't sweep, and your buffer doesn't grow from disciplined under-spending. Set a calendar reminder for the 28th of every month.

### 8. Not taking snapshots
No snapshots = no History chart, no Buffer Change in Review, no audit trail. Take a snapshot at every month-end minimum.

### 9. Treating Long-term balance as touchable
Long-term is for retirement / wealth growth. Including it in your "available money" calculations is how lifestyle creep happens. It exists to compound, not to spend.

### 10. Resetting High Water mark to "fix" a drawdown
Resetting High Water is for intentional capital withdrawals (you took R10,000 out of trading for a major expense). Resetting because you don't like seeing the drawdown destroys the protocol's whole purpose. Sit with the drawdown. The zone rule exists for a reason.

### 11. Lying about triggers
The Trigger field is the most underrated input. If you log "Bored" as the trigger when actually you were "Stressed," your trigger analysis becomes useless. Honesty here is what makes pattern detection work.

### 12. Not backing up
Browser cache clears. Devices die. Without backups, you lose everything. Take a backup every 7 days minimum. Save it somewhere outside your Downloads folder.

---

## 6. Success Metrics

Check these monthly. If three or more are off-target for two consecutive months, something needs adjustment.

| Metric | Target | Where to find |
|---|---|---|
| Impulse spending vs budget | < 80% of total cap | Budget tab — Total Spent vs Total Allocated |
| Buffer growth | +R1,500/month minimum | Review tab — Buffer Change |
| Gate usage rate | > 90% of purchases ≥ R100 | Compare Impulse Control entries to your bank statement |
| PIN override frequency | < 2 per month | History & Triggers — filter by override-only |
| App opens per week | > 5 | Self-tracked — habit indicator |
| Envelopes on target | All of them | Review tab — envelope performance count |
| Months to fortified | Trending down | Review tab — pace projection |
| Drawdown zone | Normal | Trading P&L — Zone display |

If buffer growth is below target two months in a row, either Spending Budget is too high (tighten) or Buffer Reserve is too low (raise it).

If gate usage is below 90%, you're slipping back into auto-pilot spending. Recommit to running every purchase through the gate.

If PIN override is above 2/month, your envelope caps don't match reality. Edit the caps or change the block modes — don't keep overriding.

---

*Royal-Icon Ledger. Personal finance for the disciplined.*
