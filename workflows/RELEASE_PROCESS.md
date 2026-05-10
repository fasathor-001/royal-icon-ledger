# Workflow: Release Process

> Standard flow for shipping a feature or bug fix to production. Last updated: 2026-05-10.

---

## Overview

Releases are deployed by pushing to the `main` branch. The hosting platform auto-deploys on push. There is no staging environment — preview deployments via the hosting platform serve as staging.

---

## Pre-Release Checklist

Before any deploy, run through this checklist. The `release:check` script automates the build step:

```bash
npm run release:check
```

### Code quality

- [ ] `npm run build` passes with no errors (only acceptable warnings: chunk size)
- [ ] No `console.error` left in code paths that ship to users (debug logs acceptable)
- [ ] No hardcoded user data or test values

### Documentation

- [ ] `CHANGELOG.md` has an entry for every change (use the F0xx format)
- [ ] `TESTER_FEEDBACK_HANDBOOK.md` has matching entries if a tester reported the issue
- [ ] `DEVELOPMENT_NOTES.md` updated if a new pattern, bug class, or architectural decision was added
- [ ] `memory/` files updated if relevant (PATTERNS.md, DECISIONS.md, KNOWN_ISSUES.md, ROADMAP.md)

### Correctness checks

- [ ] Income-type gates verified (Foundation, Salary, Trading, Hybrid all behave correctly)
- [ ] `isFoundation` check uses both `data.mode` and `data.incomeType`
- [ ] `showTrading` is `data?.incomeType === 'variable'` (not a negation)
- [ ] Any new `useState` hook removals: grep for setter references before committing
- [ ] Any new data fields: added to `defaultData` in `App.jsx`

### Data integrity

- [ ] Any new field added to `defaultData` has a safe default value
- [ ] No code assumes a new field exists without a fallback (use `?? default`)
- [ ] No field renames (data field names in the stored object are permanent)

---

## Deploy Steps

### 1. Commit all changes

```bash
git add <specific files>
git commit -m "descriptive commit message

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

Always add specific files — never `git add -A` (risks including `.env.local` or build artifacts).

### 2. Push to remote

```bash
git push origin main
```

The hosting platform auto-deploys on push to `main`.

### 3. Verify the deploy

1. Check the hosting platform (Netlify/Vercel) — confirm the build succeeded
2. Open `https://my.royalledger.app/app` in a fresh browser tab
3. Open DevTools → Network → confirm the bundle hash matches the new deploy
4. If the "New version available" banner appears → click Update
5. Sign in, make a change → confirm "Synced ✓"

---

## Post-Deploy

- [ ] Note the bundle hash from the deployed assets (useful for diagnosing stale-cache reports)
- [ ] Inform active testers if the update is significant: "New update deployed — you may see a 'New version available' banner. Click Update to get it."
- [ ] Monitor for error reports for 30 minutes after deploy

---

## Hotfixes

For urgent bugs that need to ship immediately without the full release process:

See `workflows/HOTFIX_WORKFLOW.md`.

---

## What Must Never Ship

- [ ] `VITE_SUPABASE_SERVICE_ROLE_KEY` in any frontend file
- [ ] Plain-text PIN in any data field (always use `pinHash`)
- [ ] `data.overridePin` values (legacy — must be cleared by migration, not shipped)
- [ ] Console logs containing PII (user emails, balances, etc.)
- [ ] Hardcoded production invite codes or user IDs
