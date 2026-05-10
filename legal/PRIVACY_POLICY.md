> Last updated: 8 May 2026. Effective: 8 May 2026.

# Privacy Policy — Royal Ledger

**Plain English first:** Royal Ledger stores the financial data you type into the app. We do not connect to your bank. We do not share your data with advertisers. You own your data and can export or delete it at any time.

---

## Who we are

Royal Ledger is operated by **[BUSINESS NAME]** (RC **[RC NUMBER]**), registered at **[REGISTERED ADDRESS]**, Nigeria.

For privacy questions: **[PRIVACY EMAIL]**

This policy applies to the web application at royalledger.app and any related services.

---

## 1. What data we collect

### 1.1 Account data
- Your **email address** — used to identify your account and send transactional emails (password resets, invoice receipts, important notices).
- A **hashed security PIN** — your 4–6 digit PIN is processed through a one-way cryptographic function (PBKDF2-SHA256) before storage. We cannot recover or read your PIN.

### 1.2 Financial data you enter
All of the following is data you type into the app. We do not collect it from any external source.

- Monthly expense entries (name, amount, category)
- Spending budget and buffer reserve amounts
- Account balances: savings buffer, trading capital, long-term investments, goals pool
- Envelope budgets, caps, and rollover history
- Impulse purchase logs (item name, amount, category, trigger, timestamp)
- Trading profit/loss history
- Profit allocation records
- Snapshot history (point-in-time balance records)
- Goals (name, target amount)
- Monthly review records

### 1.3 Technical and usage data
- Browser type and version (for compatibility and support)
- Device type (mobile / desktop)
- Login timestamps and session activity
- Push notification subscription tokens (only if you enable push notifications)
- IP address (collected by Cloudflare for security and DDoS protection; not stored by us beyond standard infrastructure logs)

### 1.4 Payment data
If you subscribe to a paid plan, payment is processed by **Paystack** (paystack.com) and/or **Stripe** (stripe.com). We receive from those processors: your subscription status, billing period, payment method type (e.g. "Visa ending 4242"), and invoice history. **We never see or store your full card number, CVV, or bank account credentials.**

---

## 2. What we do NOT collect

- **No bank credentials.** Royal Ledger does not connect to your bank, broker, or any financial institution. We have no access to your real accounts.
- **No transaction syncing.** We do not pull transaction data from external sources. All financial entries are typed by you.
- **No third-party financial data.** We do not use any financial data API (Plaid, Yodlee, Open Banking, etc.).
- **No biometrics.** We do not collect fingerprints, face data, or any biometric identifiers.
- **No precise location.** We do not track GPS or physical location.
- **No advertising identifiers.** We do not use advertising cookies or tracking pixels.
- **No third-party analytics beyond what is listed.** We do not embed Google Analytics, Facebook Pixel, or similar third-party tracking scripts.

---

## 3. How we use your data

| Purpose | Legal basis (GDPR / NDPA 2023) |
|---|---|
| Operate your account and sync data across devices | Contract — necessary to provide the service |
| Send transactional emails (receipts, password resets) | Contract |
| Enforce invite-only access controls | Contract |
| Detect and prevent fraud or abuse | Legitimate interest |
| Improve the app based on aggregated usage patterns | Legitimate interest |
| Verify tester activity during compensated testing phases | Legitimate interest |
| Comply with legal obligations | Legal obligation |

We do not use your data to serve you advertisements. We do not sell your data. We do not use your financial entries for any purpose other than displaying them back to you.

---

## 4. How your data is stored

- **Database:** Your data is stored in Supabase (PostgreSQL), hosted in the **[SUPABASE REGION]** region. Supabase encrypts data at rest using AES-256 and in transit using TLS 1.2+.
- **Row-level security:** Database access policies ensure each user can only read and write their own data. Even within the database, other users' rows are not accessible.
- **Local storage:** Your browser caches a copy of your data in localStorage for offline use. This copy is stored on your device and is not transmitted to any third party.
- **Backups:** Supabase performs automated database backups. These are used only for disaster recovery.

---

## 5. Who has access to your data

**You.** Your financial data is readable only by your account.

**Support access.** A small number of authorised admin accounts exist for support and operational purposes. Admin access to user data is logged and auditable. Admins do not access your data unless required to resolve a technical issue you have reported.

**No other humans** routinely access your financial entries.

---

## 6. Data sharing with third parties

We share data with the following service providers only to the extent necessary to operate the service. These providers are contractually bound to protect your data and may not use it for their own purposes.

| Provider | Purpose | Data shared |
|---|---|---|
| Supabase | Database and authentication | All app data |
| Paystack | Payment processing (primary) | Email, subscription status |
| Stripe | Payment processing (international) | Email, subscription status |
| Cloudflare | Hosting, CDN, DDoS protection | IP address, request metadata |
| Push notification service (if applicable) | Delivering push notifications | Push subscription token |

**We do not share your data with:**
- Advertisers or data brokers
- Financial institutions
- Credit agencies
- Any third party for marketing purposes

If we are compelled by law enforcement or a court order to disclose data, we will notify you to the extent permitted by law before complying.

---

## 7. Your rights

You have the following rights regarding your personal data, drawn from the **Nigeria Data Protection Act 2023 (NDPA)** and, where applicable to EU/UK users, the **General Data Protection Regulation (GDPR)**:

- **Right to access** — You can request a copy of all personal data we hold about you.
- **Right to export** — You can download all your financial data at any time from within the app (Settings → Backup & Data → Download as file).
- **Right to correction** — You can edit your data directly within the app at any time, or request correction of inaccurate records.
- **Right to deletion (erasure)** — **You can request deletion of your account and all associated data. We will complete deletion within 30 days of a verified request.**
- **Right to restrict processing** — You can request that we limit how we process your data while a dispute is resolved.
- **Right to object** — You can object to processing based on legitimate interest.
- **Right to data portability** — Your exported backup file is in JSON format, readable by any developer.
- **Right to withdraw consent** — Where we process data based on your consent, you may withdraw that consent at any time without affecting the lawfulness of prior processing.

To exercise any of these rights, email **[PRIVACY EMAIL]**. We will respond within **30 days** (or within the timeframe required by applicable law, whichever is shorter). We will not charge a fee for reasonable requests.

**Nigerian users** may also lodge a complaint with the **Nigeria Data Protection Commission (NDPC)** at ndpb.gov.ng.

**EU and UK users** may lodge a complaint with their local supervisory authority (e.g. the ICO in the UK, or the relevant EU member state authority).

---

## 8. Cookies and tracking

We use a minimal set of cookies and browser storage:

| Name / type | Purpose | Duration |
|---|---|---|
| `sb-auth-token` | Supabase authentication session | Session + persistent refresh |
| `open-trader-finance-v2` | Local data cache (localStorage, not a cookie) | Persistent until cleared |
| Cloudflare cookies | Security, bot detection | Session |

We do not use advertising cookies. We do not use third-party tracking cookies. You can clear your browser's cookies and localStorage at any time, which will sign you out and remove any locally cached data.

---

## 9. Push notifications

If you enable push notifications, we store a push subscription token in our database linked to your account. This token is used only to deliver notifications you have opted into (daily reminders, monthly summaries). You can disable push notifications at any time from within the app (Settings → Notifications) or through your browser or device settings.

---

## 10. Data retention

- **Active accounts:** Data is retained for as long as your account is active.
- **Cancelled subscriptions:** After a subscription ends, your account and data remain accessible unless you request deletion.
- **Deletion requests:** All personal data will be permanently deleted within **30 days** of a verified deletion request. Payment processors may retain billing history for their own legal obligations independently of this.
- **Backups:** Deleted data may persist in automated backup systems for up to 90 days before being overwritten, during which time it is inaccessible to users and staff.
- **Activity event records:** Usage event logs (login, session activity) are cleaned up on a rolling 90-day basis once the user base grows beyond 50 users.

---

## 11. Children's data

Royal Ledger is not directed at or intended for use by anyone under the age of 18. We do not knowingly collect personal data from children under 18. If we become aware that a user is under 18, we will terminate the account and delete all associated data promptly. If you believe a child has provided us with personal data, contact **[PRIVACY EMAIL]**.

---

## 12. International data transfers

Our infrastructure involves services based in different countries. Your data may be processed in regions other than where you live. Specifically:

- **Supabase** hosts data in **[SUPABASE REGION]**. Supabase provides Standard Contractual Clauses (SCCs) for transfers from the European Economic Area and UK.
- **Cloudflare** operates a global network. Your requests are processed by Cloudflare edge nodes globally. Cloudflare provides SCCs for EU/UK data.
- **Paystack** is headquartered in Nigeria and processes payments under Nigerian law.
- **Stripe** is headquartered in the United States and provides SCCs for EEA/UK transfers.

When your data is transferred outside Nigeria, we rely on mechanisms such as Standard Contractual Clauses or equivalent safeguards required under the NDPA 2023. When your data is transferred outside the EEA or UK, we rely on adequacy decisions or SCCs as required by GDPR.

---

## 13. NDPC registration

The Nigeria Data Protection Act 2023 requires data controllers and data processors that process the personal data of more than a specified number of data subjects, or that process sensitive categories of data, to register with the **Nigeria Data Protection Commission (NDPC)**. We will register with the NDPC when required by applicable thresholds or regulations. **[NOTE: Confirm current registration threshold with a Nigerian data protection lawyer before launch.]**

---

## 14. Security measures

We take reasonable steps to protect your data:

- All data in transit is encrypted using HTTPS/TLS.
- All data at rest in Supabase is encrypted using AES-256.
- PINs are hashed using PBKDF2-SHA256 (100,000 iterations, 256-bit output, email-as-salt) before storage. The raw PIN is never stored.
- Row-level security (RLS) policies in the database enforce that users can only access their own data.
- Admin access is restricted to a small number of accounts and all access is logged.

No security system is perfect. If you discover a vulnerability, please report it to **[PRIVACY EMAIL]** before disclosing it publicly.

---

## 15. Data breach notification

In the event of a personal data breach:

1. We will notify the **Nigeria Data Protection Commission (NDPC)** within **72 hours** of becoming aware of a breach that poses a risk to data subjects' rights and freedoms, as required by the NDPA 2023.
2. For EU/UK users, we will additionally notify the relevant supervisory authority within 72 hours as required by GDPR Article 33.
3. We will notify affected users **without undue delay** where the breach is likely to result in a high risk to their rights and freedoms.
4. All breaches will be documented in an internal breach register regardless of notification requirements.

---

## 16. Governing law

This Privacy Policy is governed by the laws of the **Federal Republic of Nigeria**. Any disputes arising from this policy will be subject to the jurisdiction of the courts of Lagos State, Nigeria.

This policy is also designed to comply with the **General Data Protection Regulation (GDPR)** for users in the European Economic Area and the UK, and applicable data protection laws in other jurisdictions where we serve users.

---

## 17. Changes to this policy

We may update this policy from time to time. If we make material changes, we will notify you by email at least **14 days** before the change takes effect. Continued use of the app after that date constitutes acceptance of the updated policy. The current version and effective date are always shown at the top of this document.

---

## 18. Contact

For privacy questions, access requests, deletion requests, or to exercise any of your rights:

**Email:** [PRIVACY EMAIL]
**Company:** [BUSINESS NAME] (RC [RC NUMBER])
**Address:** [REGISTERED ADDRESS], Nigeria

This Privacy Policy should be read together with the [Terms of Service](TERMS_OF_SERVICE.md).

---

## Things to verify with a Nigerian lawyer before going live

1. **NDPA 2023 registration threshold:** Confirm the current NDPC registration requirement — the threshold and registration process were still being clarified by the NDPC as of 2025. Determine whether Royal Ledger's user volume requires registration before or immediately after launch.
2. **NDPA lawful basis alignment:** Confirm that the lawful bases listed in Section 3 (particularly "legitimate interest") are recognised under the NDPA 2023 in the same manner as GDPR, or whether Nigerian law imposes additional requirements for specific processing activities.
3. **International transfer mechanism — Nigeria to EU:** Confirm whether Nigeria has an adequacy decision from the EU Commission, or whether SCCs are required when Nigerian-resident users interact with Supabase infrastructure in EU regions. The NDPA cross-border transfer provisions differ from GDPR in some respects.
4. **Breach notification timeline:** Confirm whether the NDPA 2023 breach notification window is 72 hours (GDPR-equivalent) or a different period, as implementing regulations may modify this.
5. **Consumer-facing disclosure requirements:** The NDPA and FCCPA 2018 may require specific wording in the consent and disclosure process during sign-up. Have a lawyer confirm whether the privacy policy link in the footer is sufficient, or whether an affirmative consent checkbox at registration is legally required.
