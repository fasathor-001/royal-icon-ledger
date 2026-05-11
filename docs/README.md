# Royal Ledger — docs/ Navigation Index

This directory is the technical reference for Royal Ledger's implementation.
Each file covers one topic area — read the relevant file before working in
that area, not the whole directory.

---

## Operational reference

**[ARCHITECTURE.md](ARCHITECTURE.md)** — The full system picture: stack,
entry point, component hierarchy, data flow from `setData` to Supabase,
storage keys, and hard invariants that must never change.

**[PRODUCT_OVERVIEW.md](PRODUCT_OVERVIEW.md)** — The four income profiles,
their frozen internal values, the Foundation Arc stage table, and the feature
matrix across all profiles.

**[ROUTING.md](ROUTING.md)** — BrowserRouter structure, domain split
(`royalledger.app` vs `my.royalledger.app`), tab state system, PWA launch
URL, and the password reset callback flow.

**[ONBOARDING.md](ONBOARDING.md)** — The full 10-step onboarding map, what
each step collects, the `finish()` field list, the mismatch modal flow, and
what must not break.

**[BUDGET_AND_ENVELOPES.md](BUDGET_AND_ENVELOPES.md)** — Envelope data
model, block and rollover modes, the Discretionary envelope rules, impulse
attribution forms, and the cap-sync delta pattern.

**[NOTIFICATIONS.md](NOTIFICATIONS.md)** — VAPID configuration, notification
types and preference fields, the `push_subscriptions` table schema, iOS
requirements, and the notification queue flow.

**[SYNC_SYSTEM.md](SYNC_SYSTEM.md)** — The localStorage-first write path,
version conflict detection, ConflictModal choices, SyncIndicator states,
and error classification.

**[CURRENCY_SYSTEM.md](CURRENCY_SYSTEM.md)** — The 10-currency table, the
`makeFmt` usage pattern, why the `en-US` locale is pinned, and the `flagUrl`
helper.

**[DEPLOYMENT.md](DEPLOYMENT.md)** — What it takes to deploy Royal Ledger —
build, environment, Supabase config, migration order, and post-deploy checks.

**[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — The stale-bundle check rule,
CORS diagnosis approach, and eight common failure scenarios with step-by-step
resolution.

---

## Reasoning doctrine

**[ENGINEERING_DOCTRINE.md](ENGINEERING_DOCTRINE.md)** — Analytical
discipline, tradeoff reasoning, and mentorship patterns — consulted on demand
for genuinely hard problems, not on every session. See CLAUDE.md for the
specific triggers.

---

## Where to find other knowledge

| What you need | Where it lives |
|---|---|
| Operational rules, safety rules, invariants | `CLAUDE.md` (root) |
| Project state, decisions, patterns, known issues, roadmap | `memory/` |
| Incident response procedures | `runbooks/` |
| Engineering processes (release, hotfix, feedback, access) | `workflows/` |
| Full change history | `CHANGELOG.md` (root) |
