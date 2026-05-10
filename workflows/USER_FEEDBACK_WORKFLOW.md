# Workflow: User / Tester Feedback

> How to receive, triage, and resolve tester feedback. Read `TESTER_FEEDBACK_HANDBOOK.md` for the full protocol. This workflow is the quick-reference version. Last updated: 2026-05-10.

---

## When a Tester Reports Something

### Step 1 — Read before diagnosing

Read the tester's full message. Do not start diagnosing before finishing reading. The first sentence is rarely the whole story.

### Step 2 — Assign a category

| Category | Signs | Response time |
|---|---|---|
| 🔴 Critical Bug | Data loss, wrong financial number, can't sign in, app blank | Fix within 24h. Communicate ETA within 2h. |
| 🟠 Functional Bug | Feature doesn't work correctly, shows wrong info | Diagnose within 24h. Fix within 48–72h. |
| 🟡 UX Confusion | "I don't understand X" or "I couldn't find Y" | Respond with explanation within 24h. Then decide if UI needs changing. |
| 🟢 Design Suggestion | Wants a new feature or different behaviour | Log it. Acknowledge. Don't commit to building. |
| ⚪ Housekeeping | Copy error, label inconsistency | Log it. Fix when passing through that code. |

### Step 3 — Log it immediately

Open `TESTER_FEEDBACK_HANDBOOK.md` → feedback log table → add a row with:
- Next sequential F0xx ID
- Date (today)
- Tester alias
- Profile type
- Category
- Description (tester's words, not your interpretation)
- Status: `New`

**Log it before investigating.** This ensures nothing falls through if you get interrupted.

### Step 4 — Reproduce

Try to reproduce the bug on your own test account or in dev mode. If you can't reproduce:
- Ask one clarifying question (the minimum needed to reproduce)
- Do not ask for multiple things at once

### Step 5 — Diagnose

When investigating:
1. Check if the bundle hash is stale — if so, stop. Don't re-fix old code.
2. Check if the issue is profile-specific (Foundation? Fixed? Variable? Hybrid?)
3. Grep for the relevant code section
4. Trace the data flow from user action to rendered output

### Step 6 — Fix

Apply the minimal fix. Document first (CHANGELOG + TESTER_FEEDBACK_HANDBOOK) before or alongside writing the fix. Do not ship undocumented fixes.

### Step 7 — Verify and deploy

Run `npm run build`. Confirm the fix works. Deploy. Notify the tester.

### Step 8 — Close the loop

After confirming the tester can reproduce the fix:
- Update their feedback log entry status to "Closed"
- Note the commit hash and bundle hash in the resolution column

---

## Tester Response Templates

### Acknowledging receipt (any category)

> "Received — logging this now. I'll look into it and come back with findings."

### UX Confusion response

> "Here's what [feature] does: [explanation]. Does that make sense now, or does it still feel confusing?"

If they say "still confusing after the explanation" → UX improvement needed, not just copy.

### Cannot reproduce

> "I'm having trouble reproducing this. Can you tell me: [one specific question — what step exactly, or which profile]?"

### Stale cache

> "I think your app is running an older version. Can you try a hard refresh? On mobile: close and reopen the app. If you see a 'New version available' banner, tap Update. Let me know if that helps."

---

## Feedback Patterns to Watch

Check these every week:

- **Same issue from 2+ testers?** → It's real. Prioritise. Don't wait for n=3.
- **Multiple reports from one tester?** → May be a profile fit issue. Is this person the intended user for their chosen profile?
- **Testers going quiet after reporting?** → Disengage risk. Follow up.
- **Bug cluster in one area?** → Systemic issue. Add a regression guard (test or pattern rule) after fixing.

---

## Voucher / Compensation Rules

See `TESTER_FEEDBACK_HANDBOOK.md` Section 3 (Response Templates) for voucher eligibility criteria. The `tester-terms.html` file contains the public-facing terms.

In summary:
- Voucher is for documented, reproducible bugs only
- UX confusion feedback earns a voucher if the explanation reveals a product gap (not just a tester misread)
- Owner makes final voucher decisions
