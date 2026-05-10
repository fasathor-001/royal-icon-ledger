# Royal Ledger — Currency System

> How currency is stored, formatted, and rendered across the app. Last updated: 2026-05-10.

---

## Supported Currencies

Defined in `src/lib/currency.js`:

| Code | Symbol | Name | Flag cc |
|---|---|---|---|
| ZAR | R | South African Rand | za |
| USD | $ | US Dollar | us |
| GBP | £ | British Pound | gb |
| EUR | € | Euro | eu |
| NGN | ₦ | Nigerian Naira | ng |
| CAD | CA$ | Canadian Dollar | ca |
| AUD | A$ | Australian Dollar | au |
| SGD | S$ | Singapore Dollar | sg |
| AED | AED | UAE Dirham | ae |
| JPY | ¥ | Japanese Yen | jp |

Default: **ZAR**. Stored in `data.currency` (ISO 4217 code string).

---

## Storage

`data.currency` — a string like `'ZAR'`. Written during onboarding (Step 1) and changeable via Settings → Currency (requires admin patch via `admin_patch_user_data` RPC — currency is not user-self-serviceable post-onboarding).

---

## Formatting Rule

**Always** use `makeFmt(data.currency)` to produce a formatter function, then call `fmt(amount)`. Never construct currency strings manually.

```js
// At the top of any component that formats money:
const fmt = makeFmt(data.currency);

// Then use:
fmt(12500)         // → "R 12,500"
fmt(1_500_000)     // → "R 1.5M"
fmt(-200)          // → "-R 200"
fmt(null)          // → "R 0"
fmt(undefined)     // → "R 0"
fmt(NaN)           // → "R 0"
```

### Why `en-US` locale is pinned

`makeFmt` internally uses `toLocaleString('en-US', ...)`. Without pinning the locale, South African and European devices emit spaces or periods as thousand separators instead of commas, producing "R 12 500" or "R 12.500" instead of "R 12,500". The `en-US` pin makes formatting consistent across all device locales regardless of OS settings.

### Abbreviation at ≥1M

Values ≥ 1,000,000 are abbreviated with a single decimal and "M" suffix:
- `1_500_000` → "R 1.5M"
- `12_300_000` → "R 12.3M"
- `1_000_000` → "R 1M"

Values below 1M are shown as whole numbers (no fractional cents):
- `12_500.75` → "R 12,501" (rounded)

---

## Flag Display

Windows does not render flag emoji. Flag images are served from `flagcdn.com`:

```js
export function flagUrl(cc) {
  return `https://flagcdn.com/w40/${cc}.png`;
}
```

Use `flagUrl(getCurrency(code).cc)` to get the flag image URL. The `cc` field is the two-letter country code for flagcdn.com.

---

## `getCurrency(code)`

Returns the full currency object (code, symbol, name, flag, cc) for a given ISO 4217 code. Falls back to ZAR if the code is not found:

```js
getCurrency('USD')  // → { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', cc: 'us' }
getCurrency('XXX')  // → { code: 'ZAR', ... } (fallback)
```

---

## Currency Picker (Onboarding Step 1 + Settings)

The picker displays all 10 currencies as cards with:
- Flag image (from flagcdn.com)
- Symbol
- Name
- Code

The picker uses `flagUrl(c.cc)` for images, not emoji, to ensure consistent rendering on all platforms including Windows.

---

## Post-Onboarding Currency Change

Currency is not self-serviceable by the user after onboarding. It requires an admin RPC call:

```sql
-- Admin patch RPC (admin_patch_user_data)
select admin_patch_user_data('user@example.com', 'USD', null);
```

This writes the new currency code directly into the user's `data` JSONB. The user sees the new currency symbol on their next load.

**Why it's admin-only:** Currency changes affect all historical data display. A self-service path could silently reinterpret historical balances in a different currency without conversion, creating confusion. Admin involvement ensures the change is deliberate and communicated.

---

## What Not to Break

1. **`makeFmt` pattern** — never manually format currency strings. `fmt(amount)` is the only correct path.
2. **`en-US` locale pin** — do not pass a different locale or remove the pin. SA/EU devices will produce wrong separators.
3. **`data.currency` fallback** — `getCurrency(null)` and `getCurrency(undefined)` both fall back to ZAR. `makeFmt(null)` and `makeFmt(undefined)` work correctly. Do not add `data.currency ?? 'ZAR'` guards everywhere — the function handles it.
4. **Flag images, not emoji** — keep `flagUrl(cc)` for any currency flag display. Removing it produces broken or invisible flags on Windows.
