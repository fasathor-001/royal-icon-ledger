# Royal Ledger — User Guide

*Personal finance for the disciplined.*

---

## 1. App Philosophy

Royal Ledger is a discipline system, not a tracker. Most finance apps tell you what you've already spent — this one prevents you from spending what you shouldn't. Every feature exists to enforce a single principle: **protect family money first, build future money second**. The pause between impulse and payment is where wealth is built. If you remove the pause, no budget survives.

---

## 2. Tab-by-Tab Guide

### Command

**Purpose**: The home screen. Shows your current state at a glance — total assets, buffer status, current stage, drawdown zone, backup reminders, and quick-action buttons. This is where you start every session.

**When to use**: Daily. Open the app, glance at Command, close it. 30 seconds.

**Key actions**:
- Read the four top metric cards (Buffer, Trading Capital, Long-term, Total)
- Note the Stage banner — tells you which financial stage you're in
- Check warning banners — backup reminders, drawdown alerts, rollover prompts
- Use Quick Action buttons to jump to Profit Allocator, Impulse Control, Trading P&L, or Monthly Review
- Click the **Snapshot** button (top right) to record current state for history

**Discipline rule**: Do not skip the Command tab. The first 30 seconds tell you whether to act normally, tighten up, or pause completely. Skipping it means you're trading on autopilot.

---

### Setup & Salary

**Purpose**: Defines the foundation of your entire system. Your monthly expenses, spending budget, buffer reserve, buffer target, and stage thresholds all live here. Every other number in the app derives from this tab.

**When to use**: Once during initial setup, then quarterly to update for life changes (rent increase, new dependent, salary change).

**Key actions**:
- Add monthly expenses with name, amount, category
- Set Monthly Spending Budget (discretionary money for the month)
- Set Buffer Reserve from Salary (auto-feed into buffer each payday)
- Set Buffer Target (number of months of full salary stored as cash)
- Adjust Spending Gate threshold (default: any purchase ≥ this amount triggers the gate)
- View calculated salary total (expenses + spending + reserve)

**Discipline rule**: The numbers here must reflect reality, not aspiration. If you "want" to spend R3,000 but actually spend R5,000, set it to R5,000 and tighten over time. Lying to yourself here breaks every downstream feature.

---

### Budget

**Purpose**: Splits your spending budget into envelopes (categories) with individual rules. Each envelope has a cap, a block mode (what happens when you exceed it), and a rollover mode (what happens at month-end). This is where impulse spending dies.

**When to use**: Initial setup once, then weekly check-in to see envelope progress, monthly to apply rollover.

**Key actions**:
- Click **Generate envelopes** on first setup — system suggests envelopes based on your expenses
- Review each envelope: name, cap, block mode, rollover mode
- Click **Manage** to edit, add, or remove envelopes anytime
- Watch progress bars during the month — green (under 50%), yellow (50–80%), orange (80–100%), red (over)
- Watch pace projections — system tells you if your spending velocity will exceed cap by month-end
- Apply month-end rollover when prompted (sweeps eligible envelopes to buffer)

**Discipline rule**: Total envelope caps must equal your spending budget exactly. If they don't, either the budget is wrong or the envelopes are wrong. Reconcile both.

---

### Profit Allocator

**Purpose**: When trading produces profit, this tab decides where it goes. Applies the waterfall rule based on your current stage — buffer first, then trading capital, then long-term investments. Also reserves money for tax.

**When to use**: After every profitable trading week or month, before you touch the money. Never spend trading profit without running it through here.

**Key actions**:
- Enter the profit amount
- Set tax reserve percentage (default 25% — adjust to your tax bracket)
- System shows the waterfall split based on your current stage
- Review the breakdown (buffer / trading / long-term / tax)
- Click **Apply allocation** to record the split and update balances
- Click **Cancel** to start over

**Discipline rule**: Profit is not income until it has passed through the allocator. Money you never see in your spending account is money you cannot impulse-spend.

---

### Trading P&L

**Purpose**: Tracks monthly trading performance over time. Shows win rate, average win/loss ratio, current trading capital, year-to-date P&L. Houses the Drawdown Protocol — the trader's risk discipline system.

**When to use**: Monthly to log P&L. Weekly during volatile periods to check drawdown zone.

**Key actions**:
- Update Capital field if it changed (high water mark auto-updates when reaching new peak)
- Log each month's P&L with the **Log monthly P&L** form
- Review chart for trend visibility
- Read Win Rate and Avg W/L stats
- Check Drawdown Protocol — current zone, recovery needed, active rules

**Discipline rule**: Trading P&L is not personal money. Withdrawing from trading capital before completing the profit waterfall through the Allocator is forbidden. Capital protects family income; emotional withdrawals destroy it.

---

### Impulse Control

**Purpose**: Three sub-views: Spending Gate (24-hour pause for purchases ≥ threshold), Quick Log (retroactive logging), and History & Triggers (pattern analysis of what triggers your spending).

**When to use**:
- Spending Gate: Before any purchase ≥ R100 you didn't already plan
- Quick Log: When you've already bought something — log it without judgment
- History & Triggers: Weekly pattern review

**Key actions**:
- **Spending Gate**: Enter what + amount + category + envelope + trigger. The gate calculates hours of work the purchase represents and 30-year compound cost. Pick Skip / Sleep on it / Buy.
- **Quick Log**: Same fields but no gate — just records the purchase
- **History & Triggers**: Read the trigger breakdown — bored, stressed, social, etc. Knowing the trigger is half the fix. Use the × button to delete bad test entries.

**Discipline rule**: Every purchase ≥ R100 goes through the gate. No exceptions. The discipline isn't in saying no — it's in always asking the question.

---

### History

**Purpose**: Long-term view. Stacked area chart of buffer / trading / long-term over time, list of all snapshots, ability to delete snapshots if needed.

**When to use**: Monthly. After taking a month-end snapshot, review the chart to see your trajectory.

**Key actions**:
- Read the chart — buffer in orange, trading in blue, long-term in green
- Scroll the snapshot list to see specific dates
- Delete bad/test snapshots with the × button
- Compare current state to where you were 3, 6, 12 months ago

**Discipline rule**: Only meaningful snapshots get kept. Delete test data immediately. Your history must be honest or it lies to future-you.

---

### Review (Monthly Review)

**Purpose**: Guided end-of-month wrap-up. Shows top-line metrics (spending, P&L, savings rate, buffer change), envelope performance, stage progress, and walks you through three required actions: log P&L, apply rollover, take snapshot.

**When to use**: Last 3 days of every month, or first 3 days of next month. The system auto-popups during this window if you haven't reviewed yet.

**Key actions**:
- Review the four metric cards
- Read envelope performance — note which were on target, which weren't, and why
- See the discipline reward (sweep total going to buffer)
- Read the auto-generated takeaway message
- Click through the three end-of-month actions
- Click **Mark month as reviewed** when done

**Discipline rule**: A month doesn't end until it's reviewed. Skipping monthly review is how patterns hide. Even if numbers were bad, especially if numbers were bad, you review.

---

### Rules

**Purpose**: System configuration — buffer protection thresholds, stage definitions, gate thresholds, sweep rules. Also where you re-run onboarding, manage backup/restore, and reset data.

**When to use**: Initial setup to confirm rules. Quarterly to check thresholds match your situation. As-needed for backup/restore.

**Key actions**:
- Review and edit Stage thresholds (when do you graduate from Stage 1 → 2 → 3)
- Review buffer protect threshold (when buffer drops below this, system warns you)
- Edit Spending Gate threshold (default usually fine)
- Click **Re-run setup wizard** to redo onboarding
- Click **Download as file** to export full backup as JSON
- Click **Import backup** to restore from a JSON file
- Click **Reset everything** as a nuclear option (don't unless you have a backup)

**Discipline rule**: Rules drift over time. Set them once thoughtfully, then leave them alone. Changing rules during a bad month to make yourself feel better is just impulse spending wearing a different mask.

---

## 3. Feature Deep-Dives

### Spending Gate

The gate is the heart of impulse control. When you log a purchase ≥ your gate threshold (default R100):

1. You enter what + amount + category + envelope + trigger
2. System calculates: hours of work this represents (based on your hourly rate from salary), what you'd have if invested for 30 years at 7%
3. Three buttons appear:
   - **Skip it** — Don't need it. Closes the gate, logs nothing.
   - **Sleep on it** — Adds to pending list. Decide tomorrow.
   - **Buy now** — Logs as a real purchase. Records to envelope.

The gate also enforces envelope rules. If your envelope is in Hard Block mode and the purchase would exceed the cap, the gate refuses regardless of which button you press. Soft Warning mode allows it but flags it. PIN Override mode requires the 4-digit PIN.

**Use the gate every time.** The discipline is in the asking, not in the answering.

---

### Envelope System

Each envelope has three settings:

**Block modes** (what happens when you exceed cap):
- **Soft warning** — Shows you're over but allows the purchase. Use for essentials (groceries, transport).
- **Hard block** — Refuses purchases that would exceed the cap. Use for discretionary (eating out, personal).
- **PIN override** — Hard block but bypassable with a 4-digit PIN. Use for envelopes where you need a safety valve but want friction.

**Rollover modes** (what happens at month-end):
- **Reset** — Use it or lose it. Fresh budget each month. Best for groceries (you eat fresh each month anyway).
- **Roll over** — Unspent amount carries to next month. Best for lumpy spending (gifts, household repairs).
- **Sweep to buffer** — Unspent goes straight to your savings buffer. **The wealth-building option.** Best for discretionary categories you want to under-spend.

**Strategic combination**: Set discretionary envelopes (Eating Out, Personal) to Hard Block + Sweep. The system literally cannot let you over-spend, and rewards under-spending with savings. Discipline becomes automation.

---

### Stage System

Your buffer determines which stage you're in. Each stage has different rules for how trading profit gets allocated.

**Stage 1 — Survive** (Buffer < 6 months of salary)
- Goal: Reach 6 months of expenses covered
- Profit allocation: 100% to buffer (after tax)
- Rules: No personal use of trading profit. Family protection only.

**Stage 1.5 — Stabilize** (6–12 months)
- Goal: Reach 12 months coverage
- Profit allocation: 70% buffer / 30% trading capital growth
- Rules: Slight reinvestment allowed, but most still goes to buffer.

**Stage 2 — Build** (12–18 months)
- Goal: Reach 18 months — the fortified position
- Profit allocation: 80% buffer / 20% long-term investments
- Rules: Long-term investments unlocked. Still no spending of profit.

**Stage 3 — Compound** (18+ months, fortified)
- Goal: Wealth growth
- Profit allocation: 50% buffer top-up / 30% long-term / 20% spending
- Rules: First stage where personal spending of profit is allowed. By design — you've earned the right.

**Discipline rule**: You don't skip stages. Stage 1 with R20,000 in buffer and a R5,000 lifestyle upgrade urge does not become Stage 3. Earn it.

---

### Profit Allocator

The waterfall logic prevents profit from becoming impulse spending.

**Process**:
1. Enter profit amount (e.g., R5,000)
2. Tax reserve subtracted first (e.g., 25% = R1,250)
3. Net profit (R3,750) flows down the waterfall based on current stage
4. System shows breakdown card with exact allocation
5. **Apply** button updates buffer/trading/long-term balances
6. **Cancel** discards and starts over

**Why this matters**: Trading profit feels like a windfall. Windfalls trigger lifestyle creep and impulse spending — both kill long-term wealth. The allocator turns profit into a structured deposit, not a check.

**Tax reserve**: Set this once based on your tax bracket. South African traders typically reserve 18–36% depending on income tier. Default 25% is reasonable for most. Reserved tax money should sit in a separate sub-account untouched until tax time.

---

### Drawdown Protocol

Your trading capital gets a high-water mark — the highest it has ever been. Drawdown is how far below that you currently are.

**Zones and rules**:
- **0–9% (Normal)**: Full position sizes. Trade your plan.
- **10–19% (Caution)**: Reduce position sizes by 25%. Review your last 10 trades for pattern issues.
- **20–29% (Defensive)**: Reduce position sizes by 50%. Consider a week off. Review strategy assumptions.
- **30%+ (Stop)**: Stop trading. Mandatory strategy review before resuming.

**Why this matters**: Drawdowns compound brutally. Down 30% requires +43% to break even. Down 50% requires +100%. Down 70% requires +233%. Most blown trading accounts didn't blow up — they slow-bled because the trader couldn't reduce size when down.

The protocol changes behavior automatically based on math, not emotion. The Command tab shows a warning banner when you cross into Caution or worse.

---

### PIN Override

For envelopes set to PIN Override mode, exceeding the cap triggers a 4-digit PIN prompt.

**Default PIN**: `0000`. You should change this.

**To change the PIN**: Currently requires editing the source code (find `if (pin !== '0000')` in App.jsx and change). A proper PIN settings screen is on the roadmap.

**When to use**: Set this on envelopes where occasional overage is legitimate but should be rare — like an Emergency Buffer envelope or a Family envelope. Hard Block is too rigid; Soft Warning is too lax; PIN sits in between.

**Accountability**: The PIN works because of friction, not security. Anyone could guess `0000`. The point is the pause — the moment of "do I really want to override this?" That moment is where discipline lives.

---

### Auto-Rollover

At month-end, each envelope handles its unspent money based on its rollover mode:

- **Reset** envelopes lose their unspent balance (groceries, eating out by default)
- **Roll over** envelopes carry unspent to next month (household, family by default)
- **Sweep** envelopes send unspent directly to buffer (personal, emergency by default)

**Trigger**: The Budget tab shows a "Apply rollover" button during the last 3 days of the month. Click it to execute the rollover. The button records that month so it can't be applied twice.

**Manual or automatic**: Currently manual (you click the button). This is intentional — forces you to acknowledge the month is closing.

**Result**: Your buffer balance grows automatically from disciplined under-spending. R200 unspent in Personal × 12 months = R2,400/year of pure discipline savings.

---

### Snapshot System

A snapshot captures your full financial state at a point in time:
- Buffer balance
- Trading capital balance
- Long-term balance
- Total assets
- Salary
- Months covered
- Current stage

**When to take one**: Take a snapshot after any meaningful change — month-end, after a profit allocation, after a major expense, after restoring from backup.

**What snapshots enable**: The History tab uses snapshots to draw your stacked area chart. The Monthly Review uses snapshots to calculate buffer change for the month.

**Backup connection**: Every snapshot also auto-downloads a backup JSON file. Two birds, one stone.

---

### Backup & Restore

Your data lives in your browser's localStorage. This is fast and private but fragile — clear browser cache, switch devices, or wipe the app and the data is gone.

**Three layers of backup**:

1. **Manual export**: Rules tab → Backup section → "Download as file." Saves a timestamped JSON to your Downloads folder.

2. **Auto-backup on snapshot**: Every snapshot you take also downloads a backup. Take snapshots monthly minimum.

3. **Backup reminder banner**: If you haven't backed up in 7+ days, the Command tab shows a reminder banner. Click "Back up" to download immediately.

**Restore process**: Rules tab → "Import backup" → select a backup JSON file → confirms → loads. Replaces all current data.

**Where to keep backups**: Your Downloads folder isn't enough. Email backups to yourself, save to Google Drive, or copy to a USB. The discipline is the same as the buffer — multiple layers of protection.

---

## 4. Daily / Weekly / Monthly Ritual

### Morning (30 seconds)
- [ ] Open app
- [ ] Glance at Command tab
- [ ] Read banners (backup reminder, drawdown warning, rollover prompt)
- [ ] Close app

### Before any purchase ≥ R100
- [ ] Open Impulse Control → Spending Gate
- [ ] Enter what + amount + category + envelope + trigger
- [ ] Read the "hours of work" and "30-year cost"
- [ ] Choose: Skip / Sleep / Buy
- [ ] Done

### After any purchase you forgot to gate
- [ ] Open Impulse Control → Quick Log
- [ ] Log without judgment
- [ ] Note the trigger — it's the most useful field

### Sunday (5 minutes — weekly pulse)
- [ ] Command tab — overall state
- [ ] Budget tab — which envelopes are pacing over
- [ ] Impulse Control → History & Triggers — what triggered me this week
- [ ] One adjustment if needed (tighten an envelope, talk to wife about a spending area)

### Month-end (15 minutes)
- [ ] Open Review tab (or click the auto-popup)
- [ ] Read all metrics top to bottom
- [ ] Log this month's trading P&L
- [ ] Apply envelope rollover (sweeps to buffer)
- [ ] Take a snapshot (auto-downloads backup)
- [ ] Click "Mark month as reviewed"
- [ ] Email the backup file to yourself

---

## 5. Emergency Scenarios

### Hard block fired on a legitimate need
**Example**: Eating Out envelope is at R0 but mom is in town and wants dinner.

**Options, in order**:
1. Use a Soft Warning envelope instead (Family if you have one)
2. Move money between envelopes via the Manage screen
3. If the envelope has PIN Override, enter the PIN — but recognize this is the friction working
4. Adjust the cap permanently in Manage if R0 is too tight every month

**What not to do**: Disable the envelope or change Hard Block to Soft Warning to "fix" today's problem. That's not solving the issue — it's removing the system.

---

### Forgot to log purchases for the past few days
- Open Impulse Control → Quick Log
- Batch-add each purchase one by one
- Use approximate amounts if you don't remember exactly
- This isn't ideal, but underreporting is worse — log it all, mark it as a lesson

---

### App feels broken — wrong totals, blank screens, weird state
1. **First**: Open Rules tab and click "Download as file" to back up current state
2. Open browser DevTools (F12) → Application → Local Storage
3. Find your storage key, delete it
4. Refresh the app — onboarding will appear
5. Skip onboarding, then go to Rules → "Import backup" → select your backup
6. App should restore to working state

If that doesn't work, the backup JSON itself can be opened in any text editor — your data is recoverable.

---

### Down trading day + urge to spend
1. **Stop**. Don't open the spending gate yet.
2. Open Trading P&L tab
3. Read your drawdown zone
4. If Caution or worse: position sizes need to come down, not lifestyle expenses
5. Wait 24 hours minimum
6. If still want to buy after 24 hours, run the gate normally
7. Read the History & Triggers chart — bad day → bored/stressed → spending is a known pattern

The pattern of "lose money trading → spend money to feel better" loses you twice. The 24-hour pause exists specifically for this scenario.

---

### Wife asks "How are we doing?"
- Open Command tab, show her these three numbers:
  - **Buffer balance** — months of expenses covered
  - **Total remaining for the month** (from Budget tab) — what we have left to spend
  - **Buffer growth this month** (from Review tab) — how much we added

Three numbers in 30 seconds. If she wants more detail, the Review tab is the full picture. Total transparency builds trust faster than any explanation.

---

## 6. Success Metrics (check monthly)

| Metric | Target | Where to find |
|--------|--------|---------------|
| Impulse spending vs budget | < 80% of cap | Budget tab — envelope progress |
| Buffer growth | +R1,500/month minimum | Review tab — buffer change |
| Gate usage rate | > 90% of purchases ≥ R100 | Compare gate logs to bank statement |
| Override frequency | < 2 per month | Track manually for now |
| App opens per week | > 5 | Habit indicator |
| Envelopes on target | All of them | Review tab — envelope performance |
| Months to fortified | Trending down | Review tab — pace |

If three or more metrics are off-target for two consecutive months, something in the system needs adjustment. Go to Setup & Salary or Budget and tighten — don't loosen.

---

## 7. Quick Reference Card

### 5 tabs you use daily
1. **Command** — 30-second state check
2. **Impulse Control** — every purchase ≥ R100
3. **Budget** — envelope progress
4. **Trading P&L** — drawdown zone
5. **Review** — month-end ritual

### 3 numbers that matter most
1. **Buffer balance** — your family's protection
2. **Months covered** — your buffer in time
3. **This month's spending vs budget** — your discipline today

### 1 rule you never break
**Every purchase ≥ R100 goes through the Spending Gate.**

The discipline isn't in saying no. The discipline is in always asking the question.

---

*Royal Ledger. Personal finance for the disciplined.*
