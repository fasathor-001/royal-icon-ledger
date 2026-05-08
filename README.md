# Royal Ledger

Personal finance OS for variable-income earners, freelancers, and traders. Invite-only PWA deployed at [royalledger.app](https://royalledger.app).

---

## Developer docs

| Document | Purpose |
|---|---|
| `DEVELOPMENT_NOTES.md` | Architecture, data model, critical patterns, historical bugs, tech debt. **Read this before touching the code.** |
| `RELEASE_CHECKLIST.md` | Pre-deploy checklist. Run through it before every production push. |
| `INTEGRATION.md` | Supabase table schema and setup SQL. |
| `USER_GUIDE.md` | End-user feature documentation. |

---

## Local development

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### Setup

```bash
npm install
```

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Without these, the app runs in local-only mode — no auth, no cloud sync. A warning is printed to the console.

```bash
npm run dev       # dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the dist/ build locally
```

### Release check

```bash
npm run release:check   # build + reminder to run RELEASE_CHECKLIST.md
```

---

## Stack

- **React 19** — UI
- **Vite 7** — build tool
- **Supabase** — auth (PKCE) + Postgres (single-table JSONB strategy)
- **Tailwind CSS 3** — utility classes via global stylesheet
- **vite-plugin-pwa** — service worker, installable PWA
- **recharts** — charts
- **lucide-react** — icons

---

## Deployment

Deployed on **Cloudflare Pages**. Every push to `main` auto-deploys.

Build settings:
- Build command: `npm run build`
- Build output: `dist`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

The app subdomain (`my.royalledger.app`) must be configured as a Cloudflare Pages custom domain. See `INTEGRATION.md` for Supabase URL allowlist and redirect URL configuration required for auth to work correctly in production.

---

## Architecture in 30 seconds

```
index.html
  └─ src/main_v2.jsx        ← active entry point (BrowserRouter)
       ├─ /app  → App_v2.jsx  ← auth wrapper + cloud sync
       │            └─ App.jsx  ← all app logic and tab components
       └─ /*   → MarketingSite ← public marketing site
```

Data lives in `localStorage` under key `open-trader-finance-v2` (do not rename — users have data there) and is synced to Supabase `user_data` table (one row per user, JSONB `data` column).

For everything else, see `DEVELOPMENT_NOTES.md`.
