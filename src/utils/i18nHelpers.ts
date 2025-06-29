import { TFunction } from 'i18next';

// Helper function to get nested translation keys
export const getNestedTranslation = (t: TFunction, keyPath: string, fallback?: string): string => {
  const result = t(keyPath, { defaultValue: fallback || keyPath });
  return result;
};

// Helper function to format pluralized strings
export const formatPlural = (
  t: TFunction,
  key: string,
  count: number,
  options?: Record<string, any>
): string => {
  return t(key, { count, ...options });
};

// Helper function to interpolate variables in translations
export const interpolateTranslation = (
  t: TFunction,
  key: string,
  variables: Record<string, any>
): string => {
  return t(key, variables);
};

// Helper function to get error message with fallback
export const getErrorMessage = (
  t: TFunction,
  errorKey: string,
  fallbackMessage: string = 'An error occurred'
): string => {
  return t(`errors.${errorKey}`, { defaultValue: fallbackMessage });
};

// Helper function to format validation errors
export const formatValidationError = (
  t: TFunction,
  field: string,
  rule: string,
  params?: Record<string, any>
): string => {
  return t(`errors.validation.${rule}`, { field: t(`forms.${field}`), ...params });
};

// Helper function to get localized date format
export const getLocalizedDateFormat = (language: string): string => {
  const formats: Record<string, string> = {
    en: 'MM/dd/yyyy',
    es: 'dd/MM/yyyy',
    fr: 'dd/MM/yyyy',
    de: 'dd.MM.yyyy',
    zh: 'yyyy/MM/dd',
    ar: 'dd/MM/yyyy'
  };
  return formats[language] || formats.en;
};

// Helper function to get localized time format
export const getLocalizedTimeFormat = (language: string): string => {
  const formats: Record<string, string> = {
    en: 'h:mm a',
    es: 'HH:mm',
    fr: 'HH:mm',
    de: 'HH:mm',
    zh: 'HH:mm',
    ar: 'HH:mm'
  };
  return formats[language] || formats.en;
};

// Helper function to check if language is RTL
export const isRTLLanguage = (language: string): boolean => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language);
};

// Helper function to get currency symbol for language
export const getCurrencySymbol = (language: string): string => {
  const currencies: Record<string, string> = {
    en: '$',
    es: '€',
    fr: '€',
    de: '€',
    zh: '¥',
    ar: 'ر.س'
  };
  return currencies[language] || '$';
};

// Helper function to format numbers according to locale
export const formatLocalizedNumber = (
  number: number,
  language: string,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(language, options).format(number);
};

// Helper function to format currency according to locale
export const formatLocalizedCurrency = (
  amount: number,
  language: string,
  currency?: string
): string => {
  const currencyMap: Record<string, string> = {
    en: 'USD',
    es: 'EUR',
    fr: 'EUR',
    de: 'EUR',
    zh: 'CNY',
    ar: 'SAR'
  };

  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currency || currencyMap[language] || 'USD'
  }).format(amount);
};

// Helper function to format dates according to locale
export const formatLocalizedDate = (
  date: Date | string,
  language: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(language, options).format(dateObj);
};

// Helper function to format relative time according to locale
export const formatLocalizedRelativeTime = (
  date: Date | string,
  language: string
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
  const diffInSeconds = (dateObj.getTime() - Date.now()) / 1000;
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(Math.round(diffInSeconds), 'second');
  } else if (Math.abs(diffInSeconds) < 3600) {
    return rtf.format(Math.round(diffInSeconds / 60), 'minute');
  } else if (Math.abs(diffInSeconds) < 86400) {
    return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
  } else {
    return rtf.format(Math.round(diffInSeconds / 86400), 'day');
  }
};

// Helper function to validate translation keys
export const validateTranslationKey = (key: string): boolean => {
  // Check if key follows the expected pattern (namespace.section.key)
  const keyPattern = /^[a-zA-Z]+(\.[a-zA-Z]+)*$/;
  return keyPattern.test(key);
};

// Helper function to extract namespace from translation key
export const extractNamespace = (key: string): string => {
  const parts = key.split('.');
  return parts.length > 1 ? parts[0] : 'common';
};

// Helper function to build translation key
export const buildTranslationKey = (namespace: string, section: string, key: string): string => {
  return `${namespace}.${section}.${key}`;
};