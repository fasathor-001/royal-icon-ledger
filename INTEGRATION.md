# Royal Ledger — Supabase Integration Guide

Complete setup for cloud sync, cross-device access, and the v2 auth layer.

---

## Part 1 — Create the Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (free account).
2. Click **New project**. Name it `royal-icon-ledger`. Choose a strong database password and save it.
3. Wait ~2 minutes for the project to provision.
4. From the project dashboard, go to **Project Settings → API**.
   - Copy the **Project URL** → this becomes `VITE_SUPABASE_URL`
   - Copy the **anon / public key** → this becomes `VITE_SUPABASE_ANON_KEY`
   - **Never copy or use the service_role key in client code.**

---

## Part 2 — Create the Database Table

In your Supabase project, go to **SQL Editor** and run this:

```sql
-- Single-table strategy: one row per user, JSONB data blob.
-- Simple, fast, RLS-isolated. Perfect for personal use.
-- SAAS-MIGRATION: split into normalized tables here when going multi-tenant.

CREATE TABLE IF NOT EXISTS user_data (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data        JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_data_user_id_unique UNIQUE (user_id)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS user_data_user_id_idx ON user_data (user_id);

-- Row Level Security: every user sees only their own row
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON user_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON user_data FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
  ON user_data FOR DELETE
  USING (auth.uid() = user_id);
```

Click **Run**. You should see "Success. No rows returned."

---

## Part 3 — Configure Auth Settings

In Supabase → **Authentication → Settings**:

- **Site URL**: set to your app URL (e.g., `https://my-ledger.pages.dev`)
- **Redirect URLs**: add your app URL + `/?reset=true` (for password reset)
- **Session expiry**: set to `604800` seconds (7 days) under JWT settings
- **Email confirmations**: you can disable these for personal use (Auth → Providers → Email → toggle off "Confirm email")

To create your account:
1. Go to **Authentication → Users → Invite user**
2. Enter your email. You'll receive a setup email.
3. Set your password. That's your only account — no public registration is exposed.

---

## Part 4 — Install the Supabase Client

```bash
npm install @supabase/supabase-js
```

---

## Part 5 — Set Environment Variables

Create a `.env.local` file in the project root (never commit this):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key...
```

For Cloudflare Pages deployment, add these as **environment variables** in:
Workers & Pages → your project → Settings → Environment variables → Production.

---

## Part 6 — Switch to the Auth Entry Point

Open `index.html` and change the script tag:

```html
<!-- Before -->
<script type="module" src="/src/main.jsx"></script>

<!-- After -->
<script type="module" src="/src/main_v2.jsx"></script>
```

Restart the dev server: `npm run dev`

The app now shows a login page. Sign in with the account you created in Part 3.

---

## Part 7 — First Login & Migration

On first login, if you have existing localStorage data, the app shows:

> **"Import existing data?"**

Click **Import to cloud** — your local data uploads to Supabase and localStorage is cleared. Your data is now in the cloud and available on any device.

If you click "Start fresh", local data stays in this browser. You can always export it manually from the Rules tab.

---

## How Sync Works

| Scenario | Behaviour |
|---|---|
| Normal use | Every data change auto-saves to Supabase (1.5s debounce) |
| App opens | Loads from Supabase first; falls back to localStorage |
| Offline | Reads/writes localStorage; syncs when connection returns |
| Two devices conflict | Server timestamp wins — most recent cloud save is authoritative |
| Supabase not configured | App runs in local-only mode (same as before) |

A small "Syncing…" indicator appears bottom-right during saves. Errors show "Sync failed — data saved locally" and retry on next change.

---

## File Map

```
src/
  lib/
    supabase.js          ← Supabase client (reads env vars)
    dataLayer.js         ← All DB operations (load/save/migrate)
  contexts/
    AuthContext.jsx      ← Auth state, login/logout/magic link/reset
  components/
    MigrationModal.jsx   ← One-time localStorage → cloud import
  App_v2.jsx             ← Auth wrapper + sync layer
  main_v2.jsx            ← New entry point (replaces main.jsx)
```

---

## Future SaaS Migration Notes

Markers left in code: `// SAAS-MIGRATION:`

- `App_v2.jsx`: Add a `/signup` route and expose `supabase.auth.signUp()`
- `dataLayer.js`: Split JSONB blob into normalized tables (one row per impulse, etc.)
- `AuthContext.jsx`: Add org/workspace context for multi-tenancy
- SQL schema: `user_id` foreign keys are already in place throughout — multi-tenant RLS is a policy change, not a schema change

---

## Troubleshooting

**"Missing env vars" warning in console**
→ Check `.env.local` exists and Vite restarted after creating it.

**Login works but data doesn't load**
→ Check the SQL in Part 2 ran successfully. Open Supabase → Table Editor → `user_data` to verify the table exists.

**RLS errors (403 / permission denied)**
→ Verify all four RLS policies were created. In SQL Editor: `SELECT * FROM pg_policies WHERE tablename = 'user_data';`

**Magic link not arriving**
→ Check spam. Supabase free tier uses a shared email server with rate limits. For production, configure a custom SMTP in Auth → SMTP Settings.

**Build fails on Cloudflare**
→ Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set as production environment variables in Cloudflare Pages settings, not just in `.env.local`.
