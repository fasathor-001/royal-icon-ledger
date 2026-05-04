export const CURRENCIES = [
  { code: 'ZAR', symbol: 'R',    name: 'South African Rand', flag: '🇿🇦' },
  { code: 'USD', symbol: '$',    name: 'US Dollar',          flag: '🇺🇸' },
  { code: 'GBP', symbol: '£',   name: 'British Pound',       flag: '🇬🇧' },
  { code: 'EUR', symbol: '€',   name: 'Euro',                flag: '🇪🇺' },
  { code: 'NGN', symbol: '₦',   name: 'Nigerian Naira',      flag: '🇳🇬' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar',     flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',   flag: '🇦🇺' },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar',    flag: '🇸🇬' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham',          flag: '🇦🇪' },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen',        flag: '🇯🇵' },
];

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
