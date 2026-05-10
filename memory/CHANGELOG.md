# Royal Ledger — Changelog (Pointer)

The authoritative changelog lives at the **repository root**:

→ [`/CHANGELOG.md`](../CHANGELOG.md)

All feature entries, bug fix records, and tester feedback resolutions are documented there in newest-first order using the F0xx numbering system.

---

## Why it lives at the root

`CHANGELOG.md` predates the `memory/` knowledge base. It is the file referenced by `TESTER_FEEDBACK_HANDBOOK.md`, `DEVELOPMENT_NOTES.md`, and all commit message conventions. Moving it would break those cross-references and any external links. This pointer satisfies the `memory/CHANGELOG.md` requirement from `CLAUDE.md` without duplicating content.

---

## Summary of recent entries

| ID | Date | Type | Summary |
|---|---|---|---|
| F039 | 2026-05-10 | Bug | Future Goals subtitle shows "Starts at Stage 2" for Foundation Stage 1 users |
| F038 | 2026-05-10 | Bug | PIN gate added to Edit/Add goal entry points |
| F037 | 2026-05-10 | Bug | Foundation dashboard goal card was reading `data.futureGoals` directly |
| F036 | 2026-05-10 | Bug | `_goalSaved` balance-driven fix — Stage 1 zero + stage-boundary cliff |
| F035 | 2026-05-10 | Feature | Foundation onboarding Step 7 collects optional savings goal |
| F034 | 2026-05-10 | Feature | Goal system consolidated — `data.goals[0]` is canonical primary goal |
| F033 | 2026-05-10 | Bug | Drawdown Protocol gate restricted to `incomeType === 'variable'` |
| F032 | 2026-05-10 | Copy | Hybrid descriptor word order corrected in 5 locations |
| F030 | 2026-05-10 | Rename | "Mix" → "Hybrid" across all 6 user-facing touch points |
| F028 | 2026-05-10 | Bug | Trading-specific copy gated to Variable profile only |

For the full record, open `/CHANGELOG.md`.
