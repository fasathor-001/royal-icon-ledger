# Royal Ledger — Routing

> Describes URL structure, domain behaviour, and navigation state. Last updated: 2026-05-10.

---

## Entry Point

`index.html` loads `src/main_v2.jsx`. This is the single HTML shell — all routing is client-side (SPA).

---

## Top-Level Routes (`src/main_v2.jsx`)

```
BrowserRouter
  ├── /app      → AppShell (auth dashboard)
  ├── /login    → AppShell (same component — LoginPage renders when no session)
  └── /*
        ├── on my.royalledger.app → <Navigate to="/login" replace />
        └── on royalledger.app   → MarketingSite (src/marketing/)
```

### Domain split

| Domain | Catches | Behaviour |
|---|---|---|
| `my.royalledger.app` | `/app`, `/login`, and all other paths | `/app` and `/login` → AppShell. Everything else → redirect to `/login`. |
| `royalledger.app` | `/app`, `/login`, `/*` | `/app` and `/login` → AppShell. `/*` → MarketingSite. |

This is implemented in `main_v2.jsx` via `window.location.hostname === 'my.royalledger.app'` check inside `Root`.

---

## In-App Navigation (Tab System)

There is no React Router inside the app. All navigation is state-based using a `tab` string:

```js
const [tab, setTab] = useState('command');
```

`setTab` is called by `MobileBottomNav` button clicks, by CTA links in the Command tab, and by `onComplete` callbacks in Onboarding.

### Tab IDs

| `tab` value | Label | Who sees it |
|---|---|---|
| `command` | Home | All profiles |
| `impulse` | Impulse | All profiles |
| `budget` | Budget | All profiles |
| `trading` | Trade | `incomeType === 'variable'` only |
| `profit` | Profit Allocator / Money Allocator / Surplus Allocator | All profiles (label varies) |
| `setup` | Setup & Salary / Setup & Income | All profiles (label varies for Foundation) |
| `history` | History | All profiles |
| `rules` | Rules | All profiles |
| `settings` | Settings | All profiles (only when logged in) |
| `admin` | Admin | Emails in `ADMIN_MOBILE_EMAILS` only |

### Mobile navigation structure

- **Primary bar** (always shown on mobile): Home, Impulse, Budget, Trade (variable only), More
- **More sheet** (slides up from bottom): Setup, Profit Allocator, History, Rules, Settings, Admin, Sign out

The "More" button shows a backdrop overlay and animates the secondary items into view. Active secondary tab keeps the "More" button highlighted.

---

## PWA Launch URL

The web app manifest sets:
```json
"start_url": "/app?source=pwa"
```

When users launch from their home screen, they land at `/app`. The `?source=pwa` query param is available for analytics purposes but not currently read by any app logic.

---

## Password Reset / Magic Link Callback

Both password reset and magic links redirect back to the app's origin with:
- PKCE flow: `?code=xxx` appended to the `redirectTo` URL
- `?type=recovery` embedded in `redirectTo` so Layer 1b detection works

Example callback URL:
```
https://my.royalledger.app/app?type=recovery&code=abc123
```

The `AppShell` → `AppV2` → `AuthContext` chain detects the `?code=` and `?type=recovery` parameters at module-load time (before React renders) and switches to `SetNewPasswordPage` / `isPasswordRecovery` mode.

**Do not** add server-side redirects for the callback URL — the PKCE code must arrive at the client in the query string.

---

## Auth State and Page Rendering

`App_v2.jsx` (`AppShell`) renders one of four states based on auth:

| Condition | Renders |
|---|---|
| `authLoading` | Skeleton loader |
| `isPasswordRecovery` | `SetNewPasswordPage` (set new password form) |
| `!user` | `LoginPage` (sign in / sign up / request access forms) |
| `user` | `OpenFinanceApp` (full dashboard) |

---

## Marketing Site Routes

`MarketingSite` (at `royalledger.app` on `/*`) is a separate React Router sub-tree. It handles its own pages: Home, How It Works, For Who, Product, About, Investors, Security, Privacy, EarlyAccess, NotFound.

These routes are entirely separate from the app. Marketing pages never import from `src/App.jsx` or `src/App_v2.jsx`.

---

## What Not to Break

1. **`/app` path** — PWA manifest `start_url` is `/app`. If the route changes, installed PWA users get a blank screen on launch.
2. **Auth callback URL** — `redirectTo: window.location.origin` in `AuthContext` must not include a custom path suffix that the Supabase dashboard Redirect URL allowlist doesn't cover.
3. **Hostname check** — `window.location.hostname === 'my.royalledger.app'` in `main_v2.jsx` controls the catch-all redirect. Do not hardcode a different hostname without updating hosting config.
