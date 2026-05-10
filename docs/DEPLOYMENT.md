# Royal Ledger — Deployment

> How to build, deploy, and verify a release. Last updated: 2026-05-10.

---

## Build

```bash
npm run build
```

Produces `dist/` with:
- `dist/index.html` — the SPA shell
- `dist/assets/index-[hash].js` — main bundle
- `dist/sw.js` — Service Worker (injectManifest strategy)
- `dist/sw.mjs` — Service Worker module build (used internally by vite-plugin-pwa)
- `dist/manifest.webmanifest` — PWA manifest
- Icons, fonts, static assets

The build must pass cleanly before any deploy. Run `npm run build` and confirm `✓ built in X.XXs` with no errors or warnings that affect functionality (chunk size warnings are acceptable).

### Release check script

```bash
npm run release:check
```

This runs `npm run build` and, on success, prints a reminder to work through `RELEASE_CHECKLIST.md`. It does not deploy.

---

## Environment Variables

All env vars must be set in the hosting platform (Netlify/Vercel/etc.) before deployment. For local dev, put them in `.env.local` (gitignored).

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Hosting env + `.env.local` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Hosting env + `.env.local` | Supabase anonymous key (safe for frontend) |
| `VITE_VAPID_PUBLIC_KEY` | Hosting env + `.env.local` | Web Push VAPID public key |

**Never commit** `.env.local` or any file containing the service role key. The service role key lives on the server only (Supabase Edge Functions).

If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing, the app runs in local-only mode (no cloud sync, no auth). This is logged as a console warning by `supabase.js`.

---

## Hosting

The app is a static SPA. Any static host works (Netlify, Vercel, Cloudflare Pages, etc.). Requirements:
- Serve `dist/` as the document root
- **SPA fallback**: all routes must serve `index.html` (not 404). Without this, direct URL navigation or browser refresh on any path other than the root breaks.
- **HTTPS required**: Service Worker and Web Push require a secure origin.
- **Domain structure**: `my.royalledger.app` hosts the app. `royalledger.app` hosts the marketing site.

---

## Supabase Configuration

### Authentication → URL Configuration

Ensure the **Redirect URL allowlist** includes a wildcard pattern so `?type=recovery` is preserved on password reset callbacks:

```
https://my.royalledger.app**
```

Without the wildcard, Supabase strips query params from the redirect URL and Layer 1b PKCE detection fails. Layer 2 (localStorage verifier) handles same-browser resets as a fallback, but the wildcard keeps Layer 1b working as the primary signal.

### Site URL

Set **Site URL** in Supabase Authentication → URL Configuration to `https://my.royalledger.app`. This is the fallback redirect URL for emails sent without `emailRedirectTo`.

The app always passes `emailRedirectTo: window.location.origin` in all auth calls (signup, magic link, reset), so the Site URL is a last-resort fallback only.

---

## Supabase Database Migrations

Run migration SQL files in the `supabase/` directory in order. All files use `CREATE IF NOT EXISTS` / `CREATE OR REPLACE` and are safe to re-run.

Order matters for files with dependencies. Critical order:
1. `early-access-schema.sql`
2. `admin-migration.sql`
3. `leads-status-migration.sql`
4. `validate-invite-code.sql`
5. `invite-code-expiry-migration.sql` ← depends on #4
6. `pin-migration.sql`
7. `pin-reset-migration.sql`
8. `rls-fix-migration.sql`
9. `admin-access-fix.sql`
10. `activity-logs-migration.sql`
11. `get-tester-activity-rpc.sql`
12. `auth-user-sync-trigger.sql`
13. `sync-users-from-auth.sql` ← one-time backfill
14. `notification-queue-migration.sql`
15. `admin-patch-user-data.sql`
16. `admin-reset-user-data.sql`

Run each once in the Supabase SQL Editor. "Success. No rows returned" confirms success. Re-running is safe.

---

## PWA Behaviour

The PWA uses the **injectManifest** strategy. `src/sw.js` is the custom service worker. Vite-plugin-pwa injects the precache manifest into it at build time.

`registerSW` in `main_v2.jsx` registers the service worker. When a new version is deployed, the service worker detects a new manifest and sets `updateReady = true`, showing the "New version available" banner. User clicks "Update" → `updateSW(true)` → service worker activates → page reloads.

### PWA Install Prompt

`InstallPrompt.jsx` handles the `beforeinstallprompt` event and shows a custom A2HS (Add to Home Screen) banner. It defers the browser's native prompt until the user interacts with the banner.

---

## Post-Deploy Verification

1. **Hard refresh** the app (Ctrl+Shift+R / Cmd+Shift+R) or open in incognito to clear cached service worker
2. Confirm the bundle hash in DevTools → Sources matches the `dist/assets/index-[hash].js` filename
3. Open DevTools → Application → Service Workers — confirm the new SW is activated
4. Sign in, make a change, verify Synced ✓ indicator appears
5. Open Settings and confirm currency symbol is correct
6. Check DevTools → Console for any errors

**If users report a bug that you can't reproduce:** Check whether their bundle hash matches the latest deploy. If it doesn't, the issue is a stale cache — do not re-fix the already-fixed code. Instruct the user to hard refresh or reinstall the PWA. See `TROUBLESHOOTING.md` for the full diagnostic.

---

## What Not to Break

1. **SPA fallback at host** — all paths must serve `index.html`. Without it, `/app` on direct navigation returns 404.
2. **HTTPS** — required for ServiceWorker and Web Push. Never deploy to HTTP.
3. **Bundle hash verification** — runtime errors with line numbers exceeding the source file length indicate stale cache, not new bugs. Always verify the bundle hash before re-fixing.
4. **Supabase Redirect URL allowlist wildcard** — without `https://my.royalledger.app**`, password reset links lose the `?type=recovery` parameter.
