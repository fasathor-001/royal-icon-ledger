# Royal Ledger — Project Context

> Quick-load context for AI agents and new developers. Read this first.

---

## What This Project Is

**Royal Ledger** — a personal finance OS PWA for variable-income earners, freelancers, and traders. Invite-only closed beta. Live at `my.royalledger.app/app`. Marketing at `royalledger.app`.

---

## Stack (no TypeScript)

| Layer | Tech | Version |
|---|---|---|
| Frontend | React | 19 |
| Build | Vite | 7 |
| PWA | vite-plugin-pwa | 1.2.0 |
| Auth + DB | Supabase / supabase-js | 2.105 |
| Charts | Recharts | 3.8 |
| Icons | Lucide React | 1.14 |
| Routing | React Router DOM | 7.14 |

---

## Key Files

| File | What it does |
|---|---|
| `index.html` | Single HTML shell. Loads `src/main_v2.jsx`. |
| `src/main_v2.jsx` | **Entry point.** BrowserRouter: `/app` → AppShell, `/*` → MarketingSite. |
| `src/App_v2.jsx` | Auth wrapper: login page, session, cloud load/save, conflict modal, sync indicator. |
| `src/App.jsx` | **Everything else** (~5,300 lines). All tabs, all state, all business logic. |
| `src/components/Onboarding.jsx` | 10-step first-run wizard. |
| `src/lib/dataLayer.js` | All Supabase operations. |
| `src/lib/supabase.js` | Supabase client (PKCE, explicit localStorage, stable storageKey). |
| `src/lib/currency.js` | 10-currency list + `makeFmt(code)` formatter. |
| `src/contexts/AuthContext.jsx` | Auth state + 3-layer PKCE recovery detection. |

---

## Data Model Summary

Single JSONB blob per user in `user_data.data`. Written to localStorage first (sync), then Supabase (debounced 800ms). New fields are added via `{ ...defaultData, ...loadedData }` spread on load.

Key fields:
- `incomeType`: `'foundation' | 'fixed' | 'variable' | 'mixed' | null`
- `buffer`: emergency savings balance
- `futureGoals`: goals pool balance
- `goals[]`: named goal definitions
- `envelopes[]`: budget envelopes
- `impulses[]`: spending log
- `stageRules`: profit allocation percentages per stage
- `pinHash`: PBKDF2 hashed PIN

---

## Income Profiles — The Core Design

| Display label | Internal value | Features |
|---|---|---|
| 🌱 Building from zero | `'foundation'` | Foundation Arc (4-stage savings journey) |
| 💼 Salary | `'fixed'` | Surplus Allocator |
| 📈 Trading / Self-employed | `'variable'` | Trading P&L, Drawdown Protocol, Capital Pool |
| ⚡ Hybrid | `'mixed'` | Capital Pool, Profit Allocator (no Drawdown) |

**Internal values are immutable.** Display labels change. Never rename the values.

**`isFoundation` derivation:** `data.mode === 'foundation' || data.incomeType === 'foundation'` (both must be checked — legacy `mode` field predates `incomeType`).

---

## Current State (2026-05-10)

- Closed beta. Invite-only signup.
- F039 is the most recent shipped fix (Future Goals subtitle)
- 6 commits pending push to GitHub (from `f8f0ad1` to `1624200`)
- Known open design gap: Foundation Arc time guard (F024 — monitoring, no code yet)
- Fixed profile "Capital %" column label mismatch (F029 — pending tester surface)
- AdminDashboard + EarlyAccess still show "Mixed" instead of "Hybrid" (F031 — deliberate hold)

---

## Must-Know Rules

1. **localStorage key is sacred**: `open-trader-finance-v2` — never rename
2. **`incomeType` values are sacred** — `'foundation'`, `'fixed'`, `'variable'`, `'mixed'` — display labels can change, values cannot
3. **`isFoundation`** always checks BOTH `data.mode` and `data.incomeType`
4. **`showTrading`** is explicitly `data?.incomeType === 'variable'` — not `!isFoundation && !isFixed`
5. **Drawdown Protocol** gates on `incomeType === 'variable'` explicitly — not on `!== 'fixed'`
6. **Discretionary envelope** must never have `rolloverMode: 'reset'` — three defense layers enforce this
7. **Currency formatting** — always `makeFmt(data.currency)` → `fmt(amount)`, never manual
8. **All `user_*` tables with FK to `auth.users`** must have `ON DELETE CASCADE`

---

## Reference Links

- Docs: `docs/` directory
- Memory: `memory/` directory (this file + DECISIONS.md, PATTERNS.md, KNOWN_ISSUES.md, ROADMAP.md)
- Runbooks: `runbooks/` directory
- Workflows: `workflows/` directory
- Dev notes: `DEVELOPMENT_NOTES.md`
- Changelog: `CHANGELOG.md`
- Feedback log: `TESTER_FEEDBACK_HANDBOOK.md`
