# Workflow: Early Access and Invite Management

> How to manage beta access requests, generate invite codes, onboard testers, and track their activity. Last updated: 2026-05-10.

---

## Access Control Overview

Royal Ledger uses an invite-only signup gate. Users must have an invite code to create an account. There are two code systems:

| System | Where | Use case |
|---|---|---|
| `early_access_leads` codes | Admin-sent via AdminDashboard → Leads tab | Primary path — tied to a specific email |
| `invite_codes` table | Legacy — manual creation in AdminDashboard → Invite Codes | Fallback path — can be email-restricted or open |

Signup validates against `early_access_leads` first (via `validate_lead_invite_code` RPC), then falls back to the `invite_codes` table (via `use_invite_code` RPC).

---

## Processing an Access Request

When a user submits the early access form (at `royalledger.app/early-access`):
1. A row is inserted into `access_requests` table
2. An admin notification is queued (via `notify-lead` Edge Function)
3. A trigger syncs the email to `early_access_leads` (via `auth-user-sync-trigger.sql`)

### Review in AdminDashboard

1. Open `my.royalledger.app/app` → Admin tab
2. Go to **Access Requests** section
3. Review the request — email, message, date
4. Choose:
   - **Approve** → generates an invite code tied to their email. Copy it and email to the user.
   - **Reject** → marks the request as rejected. No code generated.

### Communicating approval

Email template:
```
Subject: Your Royal Ledger invite

Hi [name],

You're in. Here's your invite code: [CODE]

Go to my.royalledger.app/app and click "Create account."
Enter your email, a password, and the invite code above.

[Optional: any specific testing context or focus areas]

Let me know once you're set up.

[Your name]
```

---

## Generating a Direct Invite (No Access Request)

When you want to invite someone proactively:

1. AdminDashboard → Invite Codes → **Create**
2. Optionally restrict to their email (recommended — prevents the code being used by someone else)
3. Copy the generated code
4. Send via email or direct message

---

## Code Expiry

Invite codes in `early_access_leads` can have an `invite_code_expires_at` timestamp. The `validate_lead_invite_code` RPC rejects expired codes. If a user tries to sign up with an expired code:
- Error: "Invite code not recognised or already used"
- Fix: Generate a fresh code via AdminDashboard and resend

---

## Resetting an Accidentally Burned Code

If a user tried to sign up with a code but it failed midway (e.g. they entered the wrong email or had a network error), the code may be marked as "used" even though no account was created.

**Reset the code:**
```js
// Via AdminDashboard → Invite Codes → find the code → Reset
// Or programmatically:
await resetInviteCode(codeId);
```

The `resetInviteCode` function in `dataLayer.js` sets `used: false` and clears `used_by_email`. The user can then retry signup with the same code.

Note: The `validate_lead_invite_code` RPC is **idempotent** — if the same email already claimed the same code in a previous attempt, it returns `true` and lets the signup proceed. So for same-email retries, the code doesn't need to be reset.

---

## Onboarding a New Tester

After a tester signs up:
1. They'll see the onboarding wizard on first load
2. Walk them through: choose their income profile → add expenses → set budget → starting balances → PIN → notifications
3. Direct them to start with: Impulse Control (log a purchase) → Budget tab (add an envelope) → Command tab (review their snapshot)

Send them the tester guide (`tester-guide.html`).

---

## Tracking Tester Activity

AdminDashboard → **Tester Activity** tab shows:
- Active testers with last-seen date
- Snapshot count per tester (proxy for engagement)
- Impulse log count

The data comes from the `get_tester_activity_summary()` RPC. If the tab shows a loading spinner that never resolves, run `get-tester-activity-rpc.sql` in the Supabase SQL Editor. See `docs/TROUBLESHOOTING.md` for the full diagnosis.

---

## Removing a Tester

If a tester needs to be removed:

1. In Supabase → Authentication → Users → find the user → Delete
   - This deletes their auth account
   - Their `user_data` row is **not** auto-deleted (no cascade on `user_data`)
   - Their `user_activity_events` rows **are** auto-deleted (has `ON DELETE CASCADE`)

2. To also clean up their data:
```sql
-- Admin utility (admin-reset-user-data.sql)
delete from user_data where user_id = '<user_uuid>';
```

3. If the `early_access_leads` row should also be cleaned:
```sql
delete from early_access_leads where email = 'tester@example.com';
```

---

## Monitoring Beta Health

Weekly checks:
- How many testers have logged in this week? (Tester Activity tab)
- Any access requests pending? (Access Requests tab)
- Any PIN reset requests pending? (PIN Resets tab)
- Any feedback from testers that hasn't been logged? (Feedback Handbook)

Triggers to expand access:
- No P1 bugs open
- At least 2 tester feedback loops fully closed (reported → fixed → tester confirmed)
- Core loop tested across at least 2 income profiles
