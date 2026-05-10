# Workflow: Hotfix

> For critical bugs that must ship immediately without the full release process. Last updated: 2026-05-10.

---

## When to Use a Hotfix

Use this workflow when:
- A deployed bug is causing data loss, incorrect financial figures, or blocking users from signing in
- The bug has been confirmed in the current bundle (stale cache ruled out)
- Waiting for a full release cycle is not acceptable

Do NOT use for: UX confusion, cosmetic issues, low-severity functional bugs. Use the normal release process.

---

## Step 1 — Confirm It's a Real Bug in the Current Deploy

Before touching code:

1. Ask the user for their bundle hash from DevTools → Network (the `index-[hash].js` filename)
2. Compare against the current deployed hash
3. If hashes differ → stale cache. Do not hotfix. Instruct user to hard refresh or update.
4. If hashes match → confirmed current-bundle bug. Proceed.

---

## Step 2 — Reproduce Locally

```bash
npm run dev
```

Reproduce the exact steps the user reported. Confirm the bug before writing a fix.

---

## Step 3 — Write the Minimal Fix

Hotfix discipline: change **only** what is necessary to fix the specific bug. Do not:
- Refactor surrounding code
- Add features
- Change copy unrelated to the bug
- Merge other pending changes

The smaller the diff, the lower the risk of introducing a new bug.

---

## Step 4 — Verify

```bash
npm run build
```

Build must pass clean.

Manual test: reproduce the original steps — confirm the bug is gone. Also confirm:
- The fix doesn't break the complementary path (e.g. if you fixed something for Foundation, confirm Standard profile is unaffected)
- Sign in / sign out still works
- Data syncs ("Synced ✓" appears)

---

## Step 5 — Document

Even for hotfixes, document before committing:

1. **`CHANGELOG.md`** — add an entry. Use the next F0xx ID. Include:
   - What the user reported
   - Root cause (one paragraph)
   - What changed (table with file → change)
   - Build: Verified clean

2. **`TESTER_FEEDBACK_HANDBOOK.md`** — add or update the row for this feedback item.

3. **`DEVELOPMENT_NOTES.md`** — if the bug reveals a new gotcha or pattern that should be documented, add it to the Historical Bug Log (§5) or Critical Patterns (§4).

This documentation step must not be skipped. Undocumented hotfixes get re-introduced.

---

## Step 6 — Commit and Deploy

```bash
git add <specific files>
git commit -m "fix: <description of what was fixed>

<brief root cause explanation>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push origin main
```

Hosting platform auto-deploys on push.

---

## Step 7 — Verify the Hotfix Deploy

1. Wait for hosting platform to confirm build success
2. Hard refresh `https://my.royalledger.app/app`
3. Confirm new bundle hash (different from the broken one)
4. Reproduce the original bug steps — confirm fixed
5. Notify the affected user: "This is fixed. If you see a 'New version available' banner, click Update. Otherwise, do a hard refresh."

---

## Step 8 — Post-Hotfix

- [ ] Confirm the tester/user has updated and confirmed the fix
- [ ] Update the feedback log entry status to "Closed"
- [ ] Note what the stale bundle hash was (helps if others report the same issue before they update)
- [ ] Consider whether the bug class needs a prevention rule in `DEVELOPMENT_NOTES.md` or `memory/PATTERNS.md`

---

## Common Hotfix Scenarios

### ReferenceError: `setXxx is not defined` in a component

**Root cause:** A `useState` hook was removed but a call to its setter remains in `reset()` or an event handler.

**Fix pattern:** Run `Grep` for the setter name → find the orphan call → remove it. See memory/PATTERNS.md P018.

### Foundation progress bar drops to $0 at stage boundary

**Root cause:** `_goalSaved` is using stage-driven switching (comparing `progressStage`) instead of balance-driven (`futureGoals > 0`).

**Fix pattern:** Ensure `_goalSaved = futureGoals > 0 ? futureGoals : buffer`. See DECISIONS.md D012.

### Sync fails after a new field was added to `saveData`

**Root cause:** A new field was added to data but not to the `defaultData` spread in App.jsx. Old user rows don't have the field; the new read path throws `TypeError: Cannot read property of undefined`.

**Fix pattern:** Add the field with a safe default to `defaultData`. Defensive access (`?? default`) at the read site.
