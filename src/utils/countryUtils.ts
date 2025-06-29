export const fallbackCountries = [
  { code: 'US', name: 'United States', callingCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', callingCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', callingCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', callingCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', callingCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', callingCode: '+33', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', callingCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', callingCode: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', callingCode: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'India', callingCode: '+91', flag: '🇮🇳' }
];

export function getFallbackCountries() {
  return fallbackCountries;
} 