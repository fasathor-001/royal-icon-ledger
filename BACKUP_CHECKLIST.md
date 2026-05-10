# Royal Ledger Weekly Backup — Friday Routine

Run this every Friday. Takes 5 minutes.

---

## Every week

- [ ] Open terminal
- [ ] Run the backup script: `~/scripts/backup-supabase.sh`
- [ ] Confirm the script printed a success message with file size
- [ ] Verify the new file exists in `~/RoyalLedger-Backups/` and is not 0 bytes
- [ ] Open Google Drive in browser → navigate to "RoyalLedger Backups" folder
- [ ] Drag the new `.sql` file from `~/RoyalLedger-Backups/` into that folder
- [ ] Confirm the upload completed (check file size in Drive matches local)
- [ ] Delete any backup files in `~/RoyalLedger-Backups/` older than 8 weeks

## Monthly (first Friday of the month)

- [ ] Open the most recent `.sql` file in a text editor
- [ ] Confirm it contains readable SQL (not empty, not garbled)
- [ ] Check the file size is consistent with previous months (large shrinkage = something wrong)
- [ ] Check Google Drive has at least 4 recent weeks of backups present

## Quarterly (once every 3 months)

- [ ] Do a full restoration test into a throwaway Supabase project
- [ ] See `BACKUP_RESTORE.md` for the exact steps
- [ ] Confirm the restored database has your real data

---

**Total weekly time: ~5 minutes**

---

## If the script fails

1. Check you are connected to the internet
2. Run `supabase --version` — if this fails, the CLI needs reinstalling
3. Run `supabase projects list` — if this fails, re-authenticate with `supabase login`
4. Check the Supabase dashboard at supabase.com to confirm the project is still active (free projects pause after 1 week of inactivity)

## If the Supabase project is paused

Free plan projects pause automatically after 1 week with no activity. To unpause:

1. Go to supabase.com → your project → click "Restore project"
2. Wait 2–3 minutes for it to come back online
3. Run the backup script again

---

*See `BACKUP_RESTORE.md` for how to restore from a backup if disaster strikes.*
