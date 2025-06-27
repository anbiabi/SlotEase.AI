import { useTranslation as useI18nTranslation, UseTranslationOptions } from 'react-i18next';
import { languages } from '../i18n';

// Enhanced useTranslation hook with additional utilities
export const useTranslation = (ns?: string | string[], options?: UseTranslationOptions) => {
  const { t, i18n, ready } = useI18nTranslation(ns, options);

  // Get current language configuration
  const currentLanguage = languages[i18n.language as keyof typeof languages] || languages.en;

  // Format currency
  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency || currentLanguage.currency
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(i18n.language, options).format(dateObj);
  };

  // Format time
  const formatTime = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(i18n.language, {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    }).format(dateObj);
  };

  // Format relative time
  const formatRelativeTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' });
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

  // Format number
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(i18n.language, options).format(number);
  };

  // Get direction for current language
  const isRTL = currentLanguage.dir === 'rtl';

  // Change language
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // Get available languages
  const availableLanguages = Object.entries(languages).map(([code, config]) => ({
    code,
    ...config
  }));

  return {
    t,
    i18n,
    ready,
    currentLanguage,
    isRTL,
    formatCurrency,
    formatDate,
    formatTime,
    formatRelativeTime,
    formatNumber,
    changeLanguage,
    availableLanguages
  };
};

// Hook for common translation patterns
export const useCommonTranslations = () => {
  const { t } = useTranslation('common');

  return {
    // Navigation
    nav: (key: string) => t(`navigation.${key}`),
    
    // Buttons
    btn: (key: string) => t(`buttons.${key}`),
    
    // Forms
    form: (key: string) => t(`forms.${key}`),
    
    // Time
    time: (key: string, options?: any) => t(`time.${key}`, options),
    
    // Status
    status: (key: string) => t(`status.${key}`),
    
    // Accessibility
    accessibility: (key: string) => t(`accessibility.${key}`)
  };
};

// Hook for error translations
export const useErrorTranslations = () => {
  const { t } = useTranslation('errors');

  return {
    general: (key: string) => t(`general.${key}`),
    validation: (key: string, options?: any) => t(`validation.${key}`, options),
    booking: (key: string) => t(`booking.${key}`),
    location: (key: string) => t(`location.${key}`)
  };
};