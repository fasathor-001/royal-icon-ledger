export const CURRENCIES = [
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand', flag: '🇿🇦', cc: 'za' },
  { code: 'USD', symbol: '$',    name: 'US Dollar',          flag: '🇺🇸', cc: 'us' },
  { code: 'GBP', symbol: '£',   name: 'British Pound',       flag: '🇬🇧', cc: 'gb' },
  { code: 'EUR', symbol: '€',   name: 'Euro',                flag: '🇪🇺', cc: 'eu' },
  { code: 'NGN', symbol: '₦',   name: 'Nigerian Naira',      flag: '🇳🇬', cc: 'ng' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar',     flag: '🇨🇦', cc: 'ca' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',   flag: '🇦🇺', cc: 'au' },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar',    flag: '🇸🇬', cc: 'sg' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham',          flag: '🇦🇪', cc: 'ae' },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen',        flag: '🇯🇵', cc: 'jp' },
];

// Returns a flag image URL from flagcdn.com (40px wide PNG).
// Works on all platforms including Windows, which does not render flag emoji.
export function flagUrl(cc) {
  return `https://flagcdn.com/w40/${cc}.png`;
}

export function getCurrency(code) {
  return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0];
}

export function makeFmt(code) {
  const { symbol } = getCurrency(code ?? 'ZAR');
  // Single space between symbol and digits: "AED 10,200", "R 8,500", "$ 1,200".
  // 'en-US' is pinned so comma thousand-separators are consistent on every
  // device locale — without it, SA/EU devices emit spaces instead of commas.
  const sep = ' ';
  return (n) => {
    if (n === null || n === undefined || isNaN(n)) return symbol + sep + '0';
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);
    if (abs >= 1_000_000) {
      return sign + symbol + sep + (abs / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + 'M';
    }
    return sign + symbol + sep + Math.round(abs).toLocaleString('en-US');
  };
}
