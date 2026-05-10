# Royal Ledger — Business Decision Notes

*Internal document. Not for publication. For founder reference, investor briefings, and lawyer review.*

*Last updated: 8 May 2026.*

---

## Purpose of this document

This document records the reasoning behind key structural decisions for Royal Ledger. It exists so that:

1. Future-you (6–12 months from now) can remember why things are set up the way they are.
2. A lawyer, accountant, or investor can quickly understand the rationale without needing a full verbal briefing.
3. Annual reviews can assess whether the original reasoning still holds or whether restructuring is warranted.

---

## Decision 1: Nigerian jurisdiction over South African jurisdiction

### What was decided

Royal Ledger is registered and operated under Nigerian law, not South African law.

### Why

**Existing infrastructure.** showmeprice.ng is already a registered Nigerian entity with CAC registration, FIRS TIN, and a Nigerian business bank account. Building Royal Ledger under the same Nigerian entity or jurisdiction avoids duplicating this administrative infrastructure in South Africa.

**Temporary SA presence.** The founder is currently based in South Africa on a temporary basis. South Africa is not the long-term base for the business or the founder. Registering in SA would create ongoing compliance obligations (CIPC annual returns, SARS registration, potential POPIA registration) that would need to be maintained indefinitely from abroad once the founder returns to Nigeria.

**Cost and simplicity.** Nigerian company registration and annual compliance are well understood within the founder's existing accountant/lawyer relationships. Starting fresh in South Africa would require a new professional network, new entity, and new banking relationships for a temporary situation.

**Payment processing.** Paystack — the most practical payment processor for African-first SaaS — is designed for Nigerian entities. Stripe's payout support for Nigerian accounts is limited, making a South African Stripe account (with ZAR payouts) less useful given the target market and international payment strategy.

### Trade-offs acknowledged

- South African Stripe support (ZAR payouts, simpler international billing) is not available via the Nigerian entity. Mitigation: Paystack handles African payments; Lemon Squeezy or Flutterwave handles international USD billing.
- Nigerian banking and FX rules are more complex for USD receipts than South African banking. Mitigation: domiciliary USD account, and ongoing legal advice on CBN FX regulations.
- Legal documents are written under Nigerian law, which is less familiar to many international customers than UK or EU law. Mitigation: documents are clearly written, and Nigerian law is a legitimate and recognised international legal system.

---

## Decision 2: Division under showmeprice.ng vs separate company

### What was decided (current default)

Royal Ledger operates as a **division / trading activity under the existing showmeprice.ng company**, not as a separately registered company.

### Why

**Speed.** Using the existing entity allows payment processor onboarding to begin immediately. Registering a new Nigerian company takes 5–15 business days (or longer if there are CAC portal issues) and delays everything downstream.

**Cost.** No additional registration fees, no additional accountant retainer for a second company, no second set of annual returns.

**Current stage.** Royal Ledger is pre-revenue and in a compensated testing phase. Spending time and money on a clean separate entity is premature. The priority is validating the product, not optimising the corporate structure.

**Precedent.** Many successful SaaS companies start as a product within an existing founder entity before spinning off. This is a normal pre-product-market-fit stage.

### Trade-offs acknowledged

- **Liability mixing:** A claim against Royal Ledger attaches to showmeprice.ng and vice versa. This is a real risk but a manageable one at the current pre-revenue stage. Royal Ledger is a finance organiser tool, not a financial adviser — liability exposure is moderate.
- **IP ownership:** All Royal Ledger intellectual property (code, brand, content) is owned by showmeprice.ng at this stage. If Royal Ledger is later spun off, an IP assignment agreement will be required. Mitigation: document this now so there is no ambiguity later.
- **Accounting complexity:** Two products in one company entity requires clean bookkeeping to separate Royal Ledger revenue and costs from showmeprice.ng revenue and costs. This is achievable with a dedicated sub-account and cost-centre tracking — it just requires discipline.

---

## Trigger conditions for restructuring (separate entity)

Review the entity structure and spin Royal Ledger off into its own Nigerian company (new CAC registration) when **any one** of the following conditions is met:

| Trigger | Why it matters |
|---|---|
| Royal Ledger reaches **$500 MRR** | Business is validated; clean accounting matters more; liability separation becomes worth the admin cost |
| An external investor expresses serious interest in Royal Ledger specifically | Investors typically require a clean entity with no cross-contamination from other products |
| A co-founder joins Royal Ledger | Equity structuring is much cleaner in a separate entity |
| Royal Ledger receives a formal legal complaint or regulatory inquiry | Liability separation becomes urgent |
| showmeprice.ng undergoes a significant transaction (investment, acquisition) | Entanglement with Royal Ledger could complicate due diligence |
| Annual turnover across both products exceeds ₦50M in the same entity | Two products at this scale create meaningful audit and tax complexity |

When a trigger condition is met, initiate the following:
1. Consult Nigerian corporate lawyer → new CAC registration
2. Execute an IP assignment agreement from showmeprice.ng to the new Royal Ledger entity
3. New FIRS TIN application
4. New dedicated bank account (NGN + USD domiciliary)
5. Update all legal documents with new RC number and entity name
6. Migrate Paystack account to new entity
7. Update Privacy Policy and Terms of Service effective date

---

## South African tax residency monitoring

### Current position (as of 8 May 2026)

The founder is temporarily based in South Africa. Nigeria remains the primary home and business base.

### Why this needs monitoring

South Africa taxes on a **residency basis** — meaning SA tax residents pay tax on worldwide income to SARS, regardless of where it is earned. If the founder inadvertently becomes an SA tax resident, Nigerian business income (salary, dividends from showmeprice.ng / Royal Ledger) could be subject to SA tax in addition to Nigerian tax.

There are two SA tax residency tests:
- **Ordinary residence test:** SA is your "usual home" or the place you naturally return to. This is a facts-and-circumstances test, not purely a day count. If Nigeria is clearly your home and SA is a temporary working stay, you are likely not ordinarily resident in SA.
- **Physical presence test:** Triggered by spending specified numbers of days in SA over a multi-year period. The exact thresholds should be confirmed with a South African tax adviser — this document does not reproduce them because they need to be applied to your specific entry dates.

### Practical actions

- [ ] **Record your SA arrival date.** Start counting from the day you arrived.
- [ ] **Track days in SA vs days in Nigeria (and other countries) in a simple spreadsheet.** One row per trip. You need this if you are ever questioned by SARS or FIRS.
- [ ] **Get a formal SA tax residency assessment** from a South African tax adviser before you have been in SA for 6 months. This is not something to manage based on general guidance — get a professional opinion specific to your facts.
- [ ] **Understand the Nigeria–SA Double Taxation Agreement (DTA).** If both countries assert a tax claim, the DTA determines which has primary taxing rights. Know the tie-breaker provisions before you are in the middle of a dispute.
- [ ] **Do not commingle SA-sourced income with Nigerian business income** without advice. If you do any freelance, consulting, or employment work while in SA, that income may be SA-sourced regardless of your residency status.

---

## Annual review checklist

Run through this every 12 months (suggested: January, aligned with the calendar year).

### Corporate structure
- [ ] Is the "division under showmeprice.ng" structure still appropriate, or has a trigger condition been met? (See trigger table above)
- [ ] Are CAC annual returns up to date for showmeprice.ng (and for any new Royal Ledger entity)?
- [ ] Has the MEMART of the operating entity been reviewed and is it still fit for purpose for both showmeprice.ng and Royal Ledger's activities?

### Tax and accounting
- [ ] Has Royal Ledger revenue been cleanly separated from showmeprice.ng revenue in the books?
- [ ] Have FIRS company income tax returns been filed for the last financial year?
- [ ] Is the business below, at, or approaching the VAT registration threshold (₦25M annual turnover)?
- [ ] Are any international VAT obligations (EU, UK) triggered by accumulated international revenue?
- [ ] Has a provisional tax assessment been filed with FIRS as required?

### Data protection (NDPA 2023)
- [ ] Is Royal Ledger's user count still below the NDPC registration threshold?
- [ ] Have any material changes to data processing activities been made that require updating the Privacy Policy or triggering NDPC registration?
- [ ] If registered with NDPC: has the annual data protection audit been completed by a licensed DPCO?

### South African presence
- [ ] What is the current SA day count for this calendar year and for the rolling period used by the physical presence test?
- [ ] Has a South African tax adviser confirmed your non-resident status (or advised on a potential residency issue)?

### Legal documents
- [ ] Are the Privacy Policy and Terms of Service still accurate? (Check: any new third-party services added, any changes to payment processors, any changes to data handling?)
- [ ] Have the documents been reviewed by a lawyer in the last 12 months, or have there been significant legal changes in Nigeria that require updates (new NDPA regulations, FCCPA enforcement guidance, CBN directives)?

### Payment and banking
- [ ] Are Paystack settlement bank account details still current?
- [ ] Is the domiciliary USD account still active and receiving international revenue without FX compliance issues?
- [ ] Have CBN FX rules changed in a way that affects the international payment strategy?

---

## Open questions (as of 8 May 2026)

These are unresolved items that need professional input before launch:

1. **NDPC registration threshold** — the exact user volume that triggers mandatory registration under the NDPA 2023 was being finalised in NDPC guidelines as of early 2025. Confirm before launch.
2. **Nigerian VAT on SaaS subscriptions** — confirm whether digital subscription services are standard-rated, zero-rated, or exempt under the Nigerian VAT Act for both local and international customers.
3. **CBN FX compliance for USD subscriptions** — confirm the correct procedure for receiving and retaining USD subscription fees from international customers in a Nigerian domiciliary account, and whether any CBN reporting obligations apply.
4. **MEMART objects clause** — confirm whether showmeprice.ng's existing objects clause covers "SaaS personal finance software" or whether an amendment is required to bring Royal Ledger activities within scope.
5. **SA tax residency confirmation** — obtain formal written opinion from an SA tax adviser on current residency status.
