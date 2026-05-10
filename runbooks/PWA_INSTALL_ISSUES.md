# Runbook: PWA Install Issues

> Diagnosis and resolution for A2HS (Add to Home Screen) failures and PWA behaviour problems. Last updated: 2026-05-10.

---

## Symptoms

- "Add to Home Screen" prompt doesn't appear
- Installed PWA shows a blank screen on launch
- Installed PWA loses session after closing and reopening
- "New version available" banner doesn't appear after a deploy
- Service worker fails to activate

---

## A2HS Prompt Not Appearing

### Check browser eligibility

The `beforeinstallprompt` event (which powers `InstallPrompt.jsx`) requires:
- Chrome/Edge on Android or desktop
- The app is served over HTTPS
- The app has a valid web manifest with required fields
- The user hasn't previously dismissed or installed the prompt

**iOS does not fire `beforeinstallprompt`.** iOS users must manually tap Share → Add to Home Screen. `InstallPrompt.jsx` should detect iOS and show a guide instead.

### Check the manifest

Open DevTools → Application → Manifest. Verify:
- `name`, `short_name`, `icons` (192x192 and 512x512 minimum)
- `display: 'standalone'`
- `start_url: '/app?source=pwa'`
- `scope: '/'`

If the manifest has errors, Chrome shows a "Manifest not valid" warning.

### Check service worker

Open DevTools → Application → Service Workers. Confirm:
- Service worker is registered and activated
- No "Installation failed" error

If the SW failed to install: check the `dist/sw.js` file exists and is accessible (Network tab → search for `sw.js`).

---

## Blank Screen on PWA Launch

### Cause 1: SPA fallback missing

The app requires all paths to serve `index.html`. If the hosting platform returns 404 for `/app`, the PWA launch URL (`/app?source=pwa`) shows a blank or 404 page.

**Fix:** Add a catch-all redirect or rewrite rule in your hosting config:
```
# Netlify: netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Vercel: vercel.json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### Cause 2: Stale service worker serving old assets

If a deploy changed asset URLs and the service worker is still serving the old precache, the browser loads a cached `index.html` that references non-existent JS files.

**Fix:**
1. Open DevTools → Application → Service Workers
2. Click "Update" to force the new SW to install
3. Click "Skip waiting"
4. Reload the page
5. If still broken: "Clear storage" → Clear site data → reload

### Cause 3: Session lost in iOS PWA sandboxed storage

iOS PWA uses a sandboxed localStorage separate from Safari. If `supabase.js` uses the default storage behaviour, the session token may not persist.

**This is why `storage: window.localStorage` and `storageKey: 'sb-auth-token'` are explicit in `src/lib/supabase.js`.** If these were removed, iOS users would lose their session on every close.

Verify: open DevTools on desktop (Safari → Develop → Your Device → inspect the PWA), check Application → localStorage for `sb-auth-token`. If absent after reopening, the storage key configuration has been lost.

---

## "New Version Available" Banner Not Appearing

The banner is powered by `registerSW` from `vite-plugin-pwa`. It shows when `onNeedRefresh` fires (new SW detected).

### Why it might not appear

1. **Service worker not updating:** Chrome throttles SW update checks to once per 24 hours in some conditions. The user must visit the app URL (not just have it open in background) for the check to run.

2. **Browser caching the old SW:** The `sw.js` file must be served with `Cache-Control: no-cache` headers. If it's cached by the hosting platform, the browser never sees the updated file.
   - **Fix:** Ensure `sw.js` is excluded from caching rules. In Netlify:
     ```toml
     [[headers]]
       for = "/sw.js"
       [headers.values]
         Cache-Control = "no-cache"
     ```

3. **PWA was installed before service workers were added:** Very old installs may not have a service worker registered. User must uninstall and reinstall the PWA.

### Forcing an update for a specific user

If a user needs to update immediately:
1. Open DevTools → Application → Service Workers
2. Click "Skip waiting" next to the waiting SW
3. Reload the page — app updates and loads the new version

Or: unregister the SW completely → reload → SW reinstalls fresh.

---

## Service Worker Registration Failure

Check the browser console for SW registration errors. Common causes:

| Error | Cause | Fix |
|---|---|---|
| `Failed to register: SecurityError` | Not served over HTTPS | Deploy to HTTPS or use localhost |
| `TypeError: Failed to fetch` | `sw.js` not found at the expected path | Check `dist/sw.js` exists after build |
| `An unknown error occurred when fetching the script` | Bad SW file contents | Run `npm run build` and check for build errors |

---

## iOS Install Guide

When a user on iOS tries to enable notifications without installing the app first, `NotificationSettings.jsx` renders `IOSInstallGuide` with step-by-step instructions:

1. Tap the Share button in Safari
2. Tap "Add to Home Screen"
3. Open the app from the Home Screen
4. Return to Settings → Notifications to enable

This guide is shown when `isIOS && !isStandalone`. Do not remove this logic.

---

## Manifest Icons Check

The PWA requires icons at specific sizes. Verify these files exist in `public/`:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)
- `apple-touch-icon.png` (180×180)
- `favicon.ico`

If any icon is missing, the browser may refuse to show the install prompt or display a broken icon on the home screen.
