import React, { useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface RTLProviderProps {
  children: React.ReactNode;
}

export const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const { isRTL, i18n } = useTranslation();

  useEffect(() => {
    // Update document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;

    // Add RTL class to body for CSS targeting
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }

    // Update Tailwind CSS direction classes
    const htmlElement = document.documentElement;
    if (isRTL) {
      htmlElement.classList.add('rtl');
    } else {
      htmlElement.classList.remove('rtl');
    }
  }, [isRTL, i18n.language]);

  return <>{children}</>;
};