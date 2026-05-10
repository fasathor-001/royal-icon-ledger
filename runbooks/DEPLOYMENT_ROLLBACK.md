# Runbook: Deployment Rollback

> Use this when a deployed build is causing user-impacting issues and you need to roll back quickly. Last updated: 2026-05-10.

---

## When to Use This Runbook

- Users report a critical bug introduced by the most recent deploy
- The bug is confirmed on the latest bundle (hash verified — not a stale-cache false positive)
- The bug cannot be hot-patched in under 30 minutes

---

## Step 1 — Confirm the Bug Is Real (Not Stale Cache)

Before rolling back, verify the issue is in the current bundle.

1. Ask the user for their bundle hash:
   - DevTools → Network tab → look for `index-[hash].js` in the main JS file name
2. Compare to the current deployed hash:
   - Check Netlify/Vercel deploy → the latest deploy's asset file names
3. If hashes don't match → **stale cache, not a new bug**. Do not roll back. Instruct user to hard refresh.
4. If hashes match → proceed.

Also compare the stack trace line numbers against `wc -l src/App.jsx` (~5,300). If trace lines > source lines, it's a stale bundle.

---

## Step 2 — Identify the Last Known Good Deploy

```bash
git log --oneline -10
```

Note the commit hash of the last deploy before the broken one. Check the deploy history in your hosting platform (Netlify/Vercel/Cloudflare) for the corresponding deploy ID.

---

## Step 3 — Roll Back at the Hosting Platform

### Netlify

1. Open Netlify → Site → Deploys
2. Find the last successful deploy (before the broken one)
3. Click "Publish deploy" on that deploy
4. Netlify redeploys from the previously built assets — no rebuild needed

### Vercel

1. Open Vercel → Project → Deployments
2. Find the last successful deployment
3. Click "..." → "Promote to Production"

### Cloudflare Pages

1. Open Cloudflare → Pages → Project → Deployments
2. Find the target deployment
3. Click "..." → "Rollback to this deployment"

---

## Step 4 — Verify the Rollback

1. Hard refresh the app (Ctrl+Shift+R)
2. Open DevTools → Application → Service Workers → "Update on reload"
3. Confirm the bundle hash changed back to the previous version
4. Test the specific action that was broken — confirm it works
5. Sign in, make a data change, confirm "Synced ✓" appears

---

## Step 5 — Communicate

If any testers are actively using the app:
- "We've rolled back a recent update due to a stability issue. If you see a 'New version available' banner, update the app."

---

## Step 6 — Fix and Redeploy

1. Create a new branch from the last known good commit
2. Apply the fix
3. Run `npm run build` — confirm clean
4. Test in preview/staging
5. Deploy to production
6. Verify (Step 4 above)

---

## After the Incident

1. Add a bug entry to `DEVELOPMENT_NOTES.md` §5 (Historical Bug Log)
2. Add a CHANGELOG entry
3. Add a TESTER_FEEDBACK_HANDBOOK entry if a tester reported it
4. Document what the rollback trigger was and how long the broken deploy was live

---

## Notes

- The build output in `dist/` is not committed to git. Rollback is always done at the hosting platform level, not via git revert.
- Supabase data is not affected by a rollback — data writes during the broken deploy remain in the database.
- If the broken deploy wrote corrupt data to Supabase, use the `admin-reset-user-data.sql` to wipe the affected user's row and have them re-onboard from the cloud backup. (This is a last resort — use only if data is genuinely corrupt.)
