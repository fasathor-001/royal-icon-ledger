/**
 * Royal-Icon Ledger — MVP curated IANA timezone list
 *
 * 13 zones covering target regions:
 *   Nigeria · South Africa · UK · Europe · United States · Canada
 *   UAE · Singapore · Japan · Australia
 *
 * Phase 2 (future): The Cloudflare worker will switch to using the `iana`
 * field with Intl.DateTimeFormat for DST-correct notification timing.
 * Until then `offset` remains the active fallback for all push scheduling.
 *
 * Supabase SQL — run once before deploying:
 *   ALTER TABLE push_subscriptions
 *     ADD COLUMN IF NOT EXISTS timezone_iana text;
 */

/**
 * @typedef {{ iana: string, label: string, offset: number, hasDst: boolean, currencies: string[] }} TzEntry
 * @type {TzEntry[]}
 */
export const TIMEZONES = [
  // ── Africa ────────────────────────────────────────────────────────────────
  { iana: 'Africa/Lagos',        label: 'Lagos / Abuja',            offset:  1,   hasDst: false, currencies: ['NGN'] },
  { iana: 'Africa/Johannesburg', label: 'Johannesburg / Cape Town', offset:  2,   hasDst: false, currencies: ['ZAR'] },

  // ── Europe ────────────────────────────────────────────────────────────────
  { iana: 'Europe/London',       label: 'London',                   offset:  0,   hasDst: true,  currencies: ['GBP'] },
  { iana: 'Europe/Paris',        label: 'Paris / Berlin',           offset:  1,   hasDst: true,  currencies: ['EUR'] },

  // ── Americas ──────────────────────────────────────────────────────────────
  { iana: 'America/New_York',    label: 'New York (US East)',       offset: -5,   hasDst: true,  currencies: ['USD'] },
  { iana: 'America/Los_Angeles', label: 'Los Angeles (US West)',    offset: -8,   hasDst: true,  currencies: ['USD'] },
  { iana: 'America/Toronto',     label: 'Toronto (Canada East)',    offset: -5,   hasDst: true,  currencies: ['CAD'] },
  { iana: 'America/Vancouver',   label: 'Vancouver (Canada West)',  offset: -8,   hasDst: true,  currencies: ['CAD'] },

  // ── Middle East / Asia ────────────────────────────────────────────────────
  { iana: 'Asia/Dubai',          label: 'Dubai / Abu Dhabi',       offset:  4,   hasDst: false, currencies: ['AED'] },
  { iana: 'Asia/Singapore',      label: 'Singapore',               offset:  8,   hasDst: false, currencies: ['SGD'] },
  { iana: 'Asia/Tokyo',          label: 'Tokyo / Osaka',           offset:  9,   hasDst: false, currencies: ['JPY'] },

  // ── Australia ─────────────────────────────────────────────────────────────
  { iana: 'Australia/Sydney',    label: 'Sydney / Melbourne',      offset: 10,   hasDst: true,  currencies: ['AUD'] },
  { iana: 'Australia/Perth',     label: 'Perth',                   offset:  8,   hasDst: false, currencies: ['AUD'] },
];

/**
 * Format a numeric UTC offset as a compact string.
 * Examples: 1 → "UTC+1", -5 → "UTC−5", 5.5 → "UTC+5:30"
 *
 * @param {number} offset
 * @returns {string}
 */
export function offsetLabel(offset) {
  const abs = Math.abs(offset);
  const h   = Math.floor(abs);
  const m   = Math.round((abs - h) * 60);
  const sign = offset >= 0 ? '+' : '−';
  return m > 0
    ? `UTC${sign}${h}:${String(m).padStart(2, '0')}`
    : `UTC${sign}${h}`;
}

/**
 * Try to auto-map a legacy { timezoneOffset, currency } pair to a single
 * IANA zone from our curated list.
 *
 * Resolution order:
 *   1. currency + offset  → single match → confident (auto-write silently)
 *   2. offset alone       → single match → confident
 *   3. ambiguous / no hit → return candidates for the user to confirm
 *
 * @param {number}  offset    — numeric UTC offset (e.g. 1, -5, 5.5)
 * @param {string}  currency  — ISO currency code (e.g. 'NGN', 'USD')
 * @returns {{ iana: string|null, confident: boolean, candidates?: TzEntry[] }}
 */
export function normalizeTimezone(offset, currency) {
  // 1. Currency + offset (strongest signal in our 13-entry list)
  const byCurrAndOffset = TIMEZONES.filter(
    tz => tz.offset === offset && tz.currencies.includes(currency)
  );
  if (byCurrAndOffset.length === 1) {
    return { iana: byCurrAndOffset[0].iana, confident: true };
  }

  // 2. Offset alone — unambiguous in list (e.g. UTC+0 → Europe/London only)
  const byOffset = TIMEZONES.filter(tz => tz.offset === offset);
  if (byOffset.length === 1) {
    return { iana: byOffset[0].iana, confident: true };
  }

  // 3. Ambiguous or offset not in MVP list — surface candidates
  return {
    iana:       null,
    confident:  false,
    candidates: byOffset.length > 0 ? byOffset : TIMEZONES,
  };
}
