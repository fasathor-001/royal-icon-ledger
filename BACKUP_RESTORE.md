# Royal Ledger — Backup Restoration Guide

**Read this before you need it.** Test the restoration process at least once now, while you have few users and nothing critical to lose. Many people set up backups and discover they're broken only when they actually need them.

---

## Understanding your backup files

Each weekly backup consists of one `.sql` file (full backup — schema + data combined).

| Backup type | Flag used | What it contains | When to use it |
|---|---|---|---|
| Full | *(no flag)* | Schema (tables, indexes, policies) + all data rows | **This is what you restore from.** Use this. |
| Schema-only | `--schema-only` | Table definitions only, no data rows | Useful for setting up a new empty project |
| Data-only | `--data-only` | Data rows only, no table definitions | Only useful if the schema already exists |

**For disaster recovery: always restore from the full backup.** Apply schema first, then data, unless you captured them in a single full file (in which case apply the full file once).

---

## When you would need to restore

- Your Supabase project was accidentally deleted
- Data was corrupted or accidentally wiped
- You need to migrate to a new Supabase project or organisation
- You want to test your backup (the most common legitimate reason)

---

## Step-by-step restoration

### Step 1: Get your backup file

Locate the most recent `.sql` backup file. If your local copy is gone, download it from Google Drive.

The file will be named something like `2026-W18-royal-ledger-supabase-full.sql`.

---

### Step 2: Create a fresh Supabase project for restoration

**Do not restore into your live production project.** Always restore into a new throwaway project first to verify the backup is good.

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Name it something obvious: `royal-ledger-restore-test`.
4. Choose any region (match your production region if you want accurate timing).
5. Set a database password — note it down, you'll need it.
6. Wait for the project to fully initialise (green status, ~2 minutes).
7. Go to **Project Settings → General** and copy the **Project Reference ID** for this new project.

---

### Step 3: Get the database connection string

You have two options for applying the SQL file:

**Option A — psql with direct connection string (recommended for full SQL files)**

1. Go to your restore project in the Supabase dashboard.
2. Navigate to **Project Settings → Database → Connection string**.
3. Select the **URI** tab and copy the connection string. It will look like:
   `postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres`
4. Replace `[YOUR-PASSWORD]` with the database password you set when creating the project.

Then apply the backup (Windows PowerShell):

```powershell
psql "postgresql://postgres:[YOUR-PASSWORD]@db.YOUR-RESTORE-PROJECT-REF.supabase.co:5432/postgres" `
  -f "$HOME\RoyalLedger-Backups\2026-W18-royal-ledger-full.sql"
```

On macOS/Linux:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.YOUR-RESTORE-PROJECT-REF.supabase.co:5432/postgres" \
  < ~/RoyalLedger-Backups/2026-W18-royal-ledger-full.sql
```

> Note: `psql` must be installed separately. On Windows: download from postgresql.org (install "Command Line Tools" only — no need for the full server). On macOS: `brew install libpq`. On Ubuntu: `sudo apt install postgresql-client`.

**Option B — Supabase Dashboard SQL Editor (no psql needed, for small databases)**

1. In the new project's dashboard, go to **SQL Editor**.
2. Open your `.sql` backup file in a text editor.
3. Copy the entire contents.
4. Paste into the SQL Editor.
5. Click **Run**.

> Warning: The SQL Editor has a size limit. For large files (>1MB), use Option A.

---

### Step 4: Apply the backup in the correct order (if you have separate files)

If you took separate schema and data dumps:

1. Apply the **schema dump first**: `schema.sql`
2. Apply the **data dump second**: `data.sql`

If you have a single full dump file: apply it once and it handles the correct order internally.

---

### Step 5: Verify the restoration worked

After applying the SQL, verify the data is present:

1. In the Supabase dashboard for your restore project, go to **Table Editor**.
2. Check that the `user_data` table exists and contains rows.
3. Check that the number of rows is roughly what you'd expect.
4. Or verify via psql using the connection string from Project Settings → Database:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.YOUR-RESTORE-PROJECT-REF.supabase.co:5432/postgres" \
  -c "SELECT COUNT(*) FROM user_data;"
```

Expected: a row count matching (roughly) your production user count at the time of the backup.

---

### Step 6: Delete the test project when done

After verifying:

1. Go to the restore project → **Project Settings → General → Delete project**.
2. Free plan allows up to 2 projects. Deleting the test project frees that slot.

---

## Restoring to production (actual disaster recovery)

> **Only do this if your production project is unrecoverable.**

If you need to replace production:

1. Create a **new** Supabase project (or use the old project if it still exists but is empty).
2. Get the new project reference ID.
3. Apply your most recent full backup SQL file using Option A or B above.
4. Update your `.env.local` / Cloudflare Pages environment variables with the new project's URL and anon key.
5. Redeploy the app if the Supabase URL changed.
6. Verify the app connects and user data loads correctly.
7. Notify users if there was any data loss between the backup date and the incident.

---

## What you cannot recover

- Data entered by users **after** the date of the most recent backup.
- Supabase Auth users (email addresses, passwords, sessions) — the `supabase db dump` command only dumps the `public` schema by default. Auth users live in the `auth` schema.

### How to include auth users in your backup

Add the `--schema auth` flag to include the auth schema:

```bash
supabase db dump --project-ref YOUR-PROJECT-REF -f backup-full-with-auth.sql --schema auth --schema public
```

> ⚠️ Auth dumps contain hashed passwords and email addresses. Treat these files as highly sensitive. Store them encrypted or separately from the data dump. Do not commit them to git.

For most Royal Ledger scenarios, users can simply re-register with the same email. The financial data in `user_data` is what is irreplaceable — and that is captured in the standard dump.

---

## How often to test restoration

| Stage | Frequency |
|---|---|
| Pre-launch / few users | Once before launch, then quarterly |
| 1–10 paying users | Quarterly |
| 10+ paying users | Monthly (and seriously consider upgrading to Supabase Pro for automated backups) |

---

## When to upgrade to Supabase Pro for automated backups

Manual weekly backups are fine when:
- You are pre-launch or have very few users.
- You can afford to lose up to one week of data in the absolute worst case.

Consider upgrading to Supabase Pro (~$25/month) when:
- You have your **first paying customer** (their data has commercial/legal obligations attached).
- You have **10+ active users**.
- You have **missed a manual backup** — the habit didn't stick, and automation is the honest solution.
- You need **point-in-time recovery** (ability to restore to any minute, not just last Friday).

Supabase Pro includes daily automated backups with 7-day retention and point-in-time recovery. At the revenue level where this matters, $25/month is trivial.

---

*For the weekly backup routine, see `BACKUP_CHECKLIST.md`.*
