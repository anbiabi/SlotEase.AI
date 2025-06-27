import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'dropdown' | 'modal' | 'inline';
  showFlag?: boolean;
  showNativeName?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'dropdown',
  showFlag = true,
  showNativeName = true
}) => {
  const { i18n, currentLanguage, availableLanguages, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {availableLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              i18n.language === lang.code
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showFlag && <span className="mr-2">{lang.flag}</span>}
            {showNativeName ? lang.nativeName : lang.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="h-4 w-4 text-gray-500" />
        {showFlag && <span>{currentLanguage.flag}</span>}
        <span className="text-sm font-medium text-gray-700">
          {showNativeName ? currentLanguage.nativeName : currentLanguage.name}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
              Select Language
            </div>
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors ${
                  i18n.language === lang.code ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
                role="option"
                aria-selected={i18n.language === lang.code}
              >
                <div className="flex items-center space-x-3">
                  {showFlag && <span className="text-lg">{lang.flag}</span>}
                  <div className="text-left">
                    <div className="font-medium">{lang.name}</div>
                    {showNativeName && lang.nativeName !== lang.name && (
                      <div className="text-xs text-gray-500">{lang.nativeName}</div>
                    )}
                  </div>
                </div>
                {i18n.language === lang.code && (
                  <Check className="h-4 w-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};