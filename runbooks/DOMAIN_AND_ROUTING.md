# Runbook: Domain and Routing Issues

> Resolving URL, redirect, auth callback, and SPA routing problems. Last updated: 2026-05-10.

---

## Domain Architecture

| Domain | Purpose | Routing behaviour |
|---|---|---|
| `royalledger.app` | Marketing site | `/*` → MarketingSite. `/app` and `/login` → AppShell. |
| `my.royalledger.app` | App dashboard | `/app` and `/login` → AppShell. `/*` → redirect to `/login`. |

Both domains serve the same `dist/` build. The domain-split behaviour is implemented in `src/main_v2.jsx` via `window.location.hostname === 'my.royalledger.app'`.

---

## Common Routing Issues

### Issue: Blank page or 404 when navigating to `/app` directly

**Cause:** Hosting platform is not configured with an SPA fallback. The server looks for a physical file at `/app` and returns 404 when it doesn't find one.

**Fix:** Add a rewrite rule so all paths serve `index.html`:

```toml
# Netlify: netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

```json
// Vercel: vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

```
# Cloudflare Pages: _redirects file in public/
/* /index.html 200
```

**Test:** Open `https://my.royalledger.app/app` directly in a new tab. Should load the app (or login page if not signed in). Should NOT return 404.

---

### Issue: Password reset link lands on login page instead of "Set new password"

**Cause:** The `?type=recovery` parameter was stripped by Supabase because the Redirect URL allowlist doesn't include a wildcard.

**Fix:** In Supabase → Authentication → URL Configuration:
- Add to Redirect URL allowlist: `https://my.royalledger.app**`
- Ensure the wildcard pattern matches query strings (`**` matches `?type=recovery&code=xxx`)

**Test:**
1. Trigger a password reset via "Forgot password" on the login page
2. Copy the link from the email without clicking it
3. Verify the URL contains `?type=recovery&code=xxx`
4. Click the link — should land on "Set new password" form, not login page

**If still broken after allowlist update:**
- Layer 2 (localStorage PKCE verifier) should handle same-browser flows automatically
- Cross-browser flows will still fail — the user must open the link in the same browser they requested the reset from

---

### Issue: Signing up redirects to wrong URL

**Cause:** Supabase Site URL is set to a localhost or staging URL.

**Fix:** In Supabase → Authentication → URL Configuration:
- Set **Site URL** to `https://my.royalledger.app`
- The app always passes explicit `emailRedirectTo: window.location.origin` in all auth calls, so Site URL is only a fallback. But if the hosted app's `window.location.origin` is wrong (e.g. behind a proxy), the Site URL becomes the primary redirect.

---

### Issue: Marketing site paths not working (e.g. `/how-it-works` 404s)

**Cause:** MarketingSite uses React Router for its own routes. If the hosting platform returns 404 for `/how-it-works` before the SPA handles it, React Router never runs.

**Fix:** Same SPA fallback as above — all paths must serve `index.html`. The root-level BrowserRouter in `main_v2.jsx` handles the path split:
- `royalledger.app/*` → MarketingSite (which has its own sub-routes for each marketing page)
- Any marketing sub-path must reach the JS before React Router can parse it

---

### Issue: Users on `my.royalledger.app` see the marketing site

**Cause:** The hostname check in `main_v2.jsx` failed, or the domains are misconfigured to serve the same routing behaviour.

**Verify:** Check `window.location.hostname` in the browser console on `my.royalledger.app`. Should return `'my.royalledger.app'` exactly (no `www.`, no port).

If the subdomain is configured but not resolving: check DNS records — `my` subdomain should have a CNAME pointing to the hosting platform.

---

## Supabase URL Configuration Reference

Required entries in Supabase → Authentication → URL Configuration:

| Setting | Value |
|---|---|
| Site URL | `https://my.royalledger.app` |
| Redirect URLs | `https://my.royalledger.app**` |

The `**` wildcard ensures `?type=recovery`, `?type=invite`, `?code=xxx`, and any other query params are preserved when Supabase redirects back to the app.

Without the wildcard entry, only exact-match redirect URLs are allowed. Supabase would strip all query params from the redirect, breaking Layer 1b PKCE detection and forcing reliance on Layer 2 (same-browser localStorage only).

---

## PWA Start URL

The web app manifest `start_url` is `/app?source=pwa`. When users launch from their Home Screen, they always land at `/app` (not `/`). The hosting platform must serve `index.html` for `/app`.

If `/app` returns 404 on direct access, the PWA will show a blank page every time it's launched from the home screen.

---

## Verifying Domain Configuration

Checklist:

1. `https://royalledger.app` → marketing homepage loads
2. `https://royalledger.app/app` → app login page or dashboard loads
3. `https://my.royalledger.app` → redirects to `/login` (or shows login page)
4. `https://my.royalledger.app/app` → app login page or dashboard loads
5. `https://my.royalledger.app/some-random-path` → redirects to `/login`
6. Hard refresh on `https://my.royalledger.app/app` → loads correctly (no 404)
7. Password reset link → lands on "Set new password" form (contains `?type=recovery` in URL)
