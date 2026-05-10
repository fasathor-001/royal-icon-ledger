# Royal Ledger — Business Setup Checklist (Nigeria)

*Nigerian SaaS founder, pre-launch. You have an existing registered entity (showmeprice.ng) and are temporarily based in South Africa. Work through this in order.*

*Last updated: 8 May 2026.*

---

## Step 0: The legal entity decision

Before opening a new bank account or onboarding with payment processors, decide on your structure for Royal Ledger within your Nigerian legal context. You have two realistic options.

---

### Option A: Division / trading name under showmeprice.ng

**What it is:** Royal Ledger operates as a product or trading division of the existing showmeprice.ng company (already registered with the CAC). No new entity is created.

**Pros:**
- Zero registration cost.
- No new CAC paperwork.
- Existing TIN and FIRS relationship carries over.
- Existing bank account can receive Royal Ledger revenue (consider a separate sub-account for clean tracking).
- Fastest path to accepting payments.
- One set of annual returns to CAC.

**Cons:**
- Legal liability for Royal Ledger attaches to the same entity as showmeprice.ng — a claim against Royal Ledger is a claim against the whole company.
- Mixing two products in one company complicates bookkeeping and any future investor or acquisition conversation.
- If you later want to spin Royal Ledger off, the intellectual property transfer is more complex.
- Brand credibility: "Royal Ledger is a product of [showmeprice.ng company name]" may look odd to international customers.

**Best for:** Pre-revenue phase while validating whether Royal Ledger gains traction. Clean and fast.

---

### Option B: New separate private company (RC Ltd) registered with the CAC

**What it is:** A new Nigerian private limited liability company registered with the Corporate Affairs Commission (CAC), distinct from showmeprice.ng.

**Pros:**
- Clean legal separation between the two products.
- Cleaner financials, investor-ready from day one if needed.
- Royal Ledger's liability is contained within its own entity.
- Easier to bring in a co-founder or outside investment specifically for Royal Ledger.

**Cons:**
- CAC registration cost: ~₦10,000–₦30,000 for the name reservation and registration fees (varies; confirm current CAC fee schedule at cac.gov.ng).
- Annual returns filing required separately.
- New TIN needed from FIRS.
- New bank account required.
- More admin across two entities.

**Best for:** Once Royal Ledger has paying customers and is clearly a separate, viable business. Or if you plan to raise external funding specifically for Royal Ledger.

---

### Recommendation

**Start as a division under showmeprice.ng.** Register "Royal Ledger" as a business name or trading name under the existing company if needed for branding, and keep finances in a separate clearly labelled account or sub-account. Spin off into its own entity when you hit $500 MRR or when an investor or co-founder conversation makes it necessary — whichever comes first.

**Exception:** If there is any reason to expect significant liability exposure early (e.g. launching to thousands of users quickly, or taking external investment), register separately from the start.

---

## Phase 1: Confirm entity structure and CAC status

- [ ] **Review showmeprice.ng's current CAC status:** Confirm the company's annual returns are up to date at cac.gov.ng. Lapsed annual returns must be filed before the entity is in good standing for onboarding with payment processors.
- [ ] **Decision: division or new entity** (see Step 0 above)
- [ ] If operating as a division: No CAC action needed. Proceed to Phase 2.
- [ ] If registering a new entity:
  - [ ] Reserve company name at cac.gov.ng (CAC Company Name Availability Search)
  - [ ] Complete CAC registration (can be done fully online via the CAC portal; you will need directors' BVN, NIN, passport photos, and proposed MEMART)
  - [ ] Obtain Certificate of Incorporation (CAC Form 7) and Certified True Copy of MEMART
  - [ ] Note your RC number — this goes on all legal documents and correspondence
- [ ] If operating as a division but using "Royal Ledger" as a distinct trading name: register the business name at cac.gov.ng under your existing company. Cost: ~₦5,000–₦10,000. **[NOTE: Confirm current CAC fee schedule.]**

---

## Phase 2: Tax registration (FIRS / TIN)

- [ ] **Confirm existing TIN:** Your showmeprice.ng company already has a Tax Identification Number (TIN) from FIRS. Locate this — it appears on your CAC documents and any prior FIRS correspondence.
- [ ] If operating as a division: the same TIN applies to Royal Ledger revenue. No new registration needed.
- [ ] If registering a new entity: apply for a TIN for the new company via the FIRS eTax portal (etax.firs.gov.ng) or at any FIRS tax office. The TIN is issued within a few business days.
- [ ] **VAT registration:** VAT registration is compulsory once annual turnover exceeds **₦25,000,000 (₦25 million)**. Below this threshold, registration is voluntary but can be commercially useful (you can issue VAT invoices and reclaim input VAT on business expenses). Confirm current threshold with your accountant — the Finance Acts have adjusted this threshold in recent years.

---

## Phase 3: Banking

### Existing showmeprice.ng account

- [ ] Confirm your existing business account can receive USD or international currency transfers, or instruct customers through a payment processor that handles conversion.
- [ ] Create a dedicated sub-account or cost-centre label for Royal Ledger transactions within your existing account, so revenue and expenses are clearly attributable.

### Domiciliary account (USD) — important for international payments

Most Nigerian banks offer **domiciliary accounts** that hold USD, GBP, or EUR. You will need a USD domiciliary account to:
- Receive international subscription revenue in USD
- Fund international SaaS tools (Supabase, Cloudflare, etc.)
- Meet the account requirements of international payment processors

- [ ] **Open a USD domiciliary account** at your existing bank (Zenith, GTBank, Access, First Bank, UBA, or similar — any of the top-tier Nigerian commercial banks offer this).
- [ ] Documents typically required: existing account relationship, BVN, valid ID (national ID, international passport, or driver's licence), proof of address, company documents if opening in company name.
- [ ] Note: domiciliary account opening may take 1–5 business days depending on your bank.
- [ ] **Separate accounts = clean books.** Keep Royal Ledger revenue clearly separated from showmeprice.ng revenue from day one.

---

## Phase 4: Payment processor onboarding

### Paystack (primary — Nigerian and African payments)

Paystack is the recommended primary processor for Nigerian and African customers. It is owned by Stripe and processes NGN, GHS, KES, and ZAR card payments plus Nigerian bank transfers.

- [ ] Create a Paystack business account at dashboard.paystack.com
- [ ] Select "Business" account type
- [ ] Upload: CAC Certificate of Incorporation (or showmeprice.ng cert if using existing entity), company TIN, director BVN, valid government-issued ID, proof of business address
- [ ] Add your NGN settlement bank account
- [ ] Complete website verification — your website must be live and include:
  - [ ] Privacy Policy at a public URL (e.g. royalledger.app/privacy)
  - [ ] Terms of Service at a public URL (e.g. royalledger.app/terms)
  - [ ] Clear description of what Royal Ledger does and what customers are paying for
  - [ ] Pricing page
  - [ ] Contact email address
- [ ] Request activation for recurring billing (subscriptions) — Paystack has a specific approval flow for subscription products
- [ ] Note: initial payouts may be held for a verification period (typically 14–30 days)

### Stripe (international fallback / USD billing)

Stripe is useful for customers outside Africa paying in USD. Stripe does **not** support Nigerian bank account payouts directly. Workaround options:

- **Option A — Lemon Squeezy or Paddle as Merchant of Record:** These platforms act as the seller of record, handle all payment processing, tax compliance, and pay you as a vendor (they support payouts to Nigerian accounts via USD wire or Payoneer). Recommended for international USD subscriptions if Stripe payout limitations are a blocker.
- **Option B — Stripe + Payoneer:** Connect your Stripe account to a Payoneer USD account, then transfer from Payoneer to your Nigerian domiciliary account. Adds complexity and fees.
- **Option C — Flutterwave:** Nigerian-founded processor that supports USD card payments and can settle in NGN or USD to a Nigerian bank. A good single-processor option covering both local and international.

- [ ] **Decide on your international payment strategy** before launch: Paystack-only (NGN), Flutterwave (NGN + USD), or Paystack + Lemon Squeezy/Paddle (split by region).
- [ ] **[NOTE: This decision requires input from a payments consultant or lawyer familiar with Nigerian FX regulations. CBN foreign exchange rules change regularly and may affect your ability to receive and retain USD subscriptions from international customers.]**

---

## Phase 5: NDPC (Data Protection) registration

The **Nigeria Data Protection Commission (NDPC)** requires data controllers and processors to register once they process personal data above specified thresholds, or when processing sensitive categories of data.

- [ ] Determine whether Royal Ledger's user count or data processing activities trigger NDPC registration at your launch stage.
- [ ] If registration is required: register via the NDPC online portal (ndpb.gov.ng — confirm current URL as NDPC was rebranded from NITDA's NDPR regime). Annual registration fee applies (confirm current schedule).
- [ ] Appoint a **Data Protection Compliance Organisation (DPCO)** or in-house Data Protection Officer (DPO) if required by the NDPA 2023 — currently mandatory for data controllers processing above a certain scale. **[NOTE: Confirm threshold with a Nigerian data protection lawyer.]**
- [ ] File a **Data Protection Audit** annually once required by the NDPA. Audits must be conducted by a licensed DPCO.

---

## Phase 6: Legal documents

Before Paystack or any payment processor will approve your account for live payments, your website needs working, accessible legal documents.

- [ ] Privacy Policy live at a public URL (e.g. royalledger.app/privacy)
- [ ] Terms of Service live at a public URL (e.g. royalledger.app/terms)
- [ ] Both reviewed by a Nigerian lawyer familiar with SaaS and consumer protection
- [ ] Privacy Policy link visible in the footer on every page
- [ ] Terms of Service link visible and accepted during sign-up / checkout flow
- [ ] Pricing clearly stated (including currency and whether VAT-inclusive or exclusive)

---

## Phase 7: Tax and compliance ongoing

### VAT (once registered)
- [ ] Add 7.5% VAT to prices for Nigerian customers once VAT-registered.
- [ ] File VAT returns with FIRS monthly (due by the 21st of the following month).
- [ ] For international customers (EU, UK, US): these are typically zero-rated exports of services under Nigerian VAT law, but confirm with your accountant before treating them as zero-rated.
- [ ] International EU customers: EU VAT on digital services may apply separately. Get advice before you exceed ~€10,000 in EU revenue.

### Company income tax
- [ ] Nigerian company income tax is payable at **30%** for companies with annual gross turnover above ₦100 million; **20%** for medium companies (₦25M–₦100M turnover); **0%** for small companies (below ₦25M) under the Finance Act 2019 small company exemption. Confirm current thresholds.
- [ ] File annual tax returns (Companies Income Tax) with FIRS within 6 months of your financial year-end.
- [ ] Pay estimated tax (provisional assessment) as required by FIRS.

### CAC annual returns
- [ ] File annual returns with the CAC for your operating entity within 42 days of the annual general meeting (or within 42 days of the incorporation anniversary for single-member companies). Failure attracts penalties.

---

## Phase 8: Bookkeeping setup

- [ ] **Use a cloud accounting tool:**
  - **Zoho Books** — supports Nigerian VAT invoicing, connects to Paystack, free up to 1 user. Best option for solo founder.
  - **QuickBooks Online** — more widely used by Nigerian accountants; useful if you will hire a bookkeeper.
  - **Wave Accounting** — free, simpler; lacks Nigerian-specific VAT features but workable pre-VAT-registration.
  - **Google Sheet** — acceptable pre-VAT if you record: date / customer / amount / currency / payment processor / purpose for every transaction.

- [ ] **What to record for every inbound payment:**
  - Date
  - Customer (or "Paystack payout")
  - Gross amount charged
  - Processor fee deducted
  - Net amount received
  - Currency
  - Plan / billing period
  - Whether NGN or USD

- [ ] **What to record for every expense:**
  - Date
  - Supplier (Supabase, Cloudflare, Paystack fees, etc.)
  - Amount and currency
  - Purpose
  - Whether deductible (almost all SaaS operating expenses are)

- [ ] **When to hire an accountant:** At VAT registration, or when annual turnover approaches ₦25 million, whichever comes first. VAT filings in Nigeria are monthly and penalties for late or incorrect filing are material.

---

## Phase 9: South Africa temporary residency — practical notes

You are currently temporarily based in South Africa. These notes are for awareness — not legal advice. **Verify every point with a cross-border tax specialist before the end of your first full year in SA.**

- [ ] **South African tax residency:** South Africa taxes on a residency basis. You may become an SA tax resident through either the "ordinary residence" test (SA is your usual home) or the "physical presence" test (spending sufficient days in SA over multiple years). Since you intend to return to Nigeria and Nigeria is your home base, you are likely **not** ordinarily resident in SA. However, if you remain in SA for extended periods across multiple years, the physical presence test could apply. Track your days in SA from the date of arrival.
- [ ] **183-day awareness:** Various tax treaties and domestic rules use 183-day thresholds. As a general precaution, be aware of how long you have been and plan to be physically present in SA. **[NOTE: Get specific advice on the SA physical presence test criteria from a South African tax adviser — the thresholds and conditions are specific and this document should not be relied upon for tax decisions.]**
- [ ] **Double Taxation Agreement:** Nigeria and South Africa have a Double Taxation Agreement (DTA). If you are assessed as a tax resident in both countries simultaneously, the DTA tie-breaker provisions will determine which country has the primary right to tax your income. Know this exists and get advice before filing taxes in either country.
- [ ] **Nigerian tax residency:** For Nigerian income tax purposes, you remain a Nigerian tax resident as long as Nigeria is your principal base or permanent home, regardless of time spent abroad. Your company income is Nigerian-sourced and taxable in Nigeria regardless of your personal location.
- [ ] **Personal vs corporate:** Keep personal income tax (your salary from the company, if any) separate from corporate income tax. You are subject to Nigerian personal income tax (PAYE from the company, or direct assessment if self-employed under the company). This is unaffected by your temporary SA presence unless SA also has a claim on your personal income.

---

## Suggested order of operations

1. **Confirm CAC status** of showmeprice.ng — ensure annual returns are current
2. **Decide: division under existing entity or new company** — execute if new entity
3. **Open a USD domiciliary account** at your Nigerian bank
4. **Get Privacy Policy and Terms of Service reviewed** by a Nigerian lawyer
5. **Publish Privacy Policy and Terms of Service** at public URLs on royalledger.app
6. **Create Paystack account** → complete business verification → add settlement bank account
7. **Decide on international payment strategy** (Paystack-only, Flutterwave, or Paystack + Lemon Squeezy)
8. **Set up bookkeeping** (Zoho Books or spreadsheet)
9. **Begin NDPC compliance assessment** — determine if/when registration is required
10. **Launch paid subscriptions**
11. **Monitor VAT threshold** — register when approaching ₦25M/year
12. **Annual: file CAC returns, FIRS returns, NDPC audit** (once required)

---

## Things to verify with a Nigerian lawyer and/or accountant before launch

1. **CAC structure decision:** Confirm whether operating Royal Ledger as a division of showmeprice.ng creates any legal or compliance complications, particularly if the MEMART (objects clause) of showmeprice.ng needs to be amended to cover financial SaaS products.
2. **NDPA 2023 registration trigger:** Confirm the exact user/data volume threshold that triggers mandatory NDPC registration and DPCO appointment. The NDPC has published transitional guidelines — confirm these are current.
3. **CBN FX rules for USD subscription revenue:** Confirm with a payments lawyer that receiving USD subscription fees from international customers and retaining them in a Nigerian domiciliary account complies with current Central Bank of Nigeria (CBN) foreign exchange regulations. CBN policy in this area changes frequently.
4. **VAT on digital services:** Confirm whether Royal Ledger's subscription service is subject to Nigerian VAT, the correct rate, and whether any small-business exemption applies at your current revenue level. Also confirm the treatment of international customer subscriptions (export zero-rating vs standard rate).
5. **SA cross-border tax position:** Have a cross-border tax specialist (one familiar with both Nigerian and South African tax law) assess your personal tax residency position given your current SA stay. This is important to resolve before you file taxes in either country.
