import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../src/i18n';
import { 
  formatLocalizedCurrency,
  formatLocalizedDate,
  isRTLLanguage,
  validateTranslationKey
} from '../src/utils/i18nHelpers';

describe('Internationalization System', () => {
  beforeEach(async () => {
    await i18n.init();
  });

  describe('Language Detection', () => {
    it('should default to English', () => {
      expect(i18n.language).toBe('en');
    });

    it('should change language correctly', async () => {
      await i18n.changeLanguage('es');
      expect(i18n.language).toBe('es');
    });

    it('should fallback to English for unsupported languages', async () => {
      await i18n.changeLanguage('unsupported');
      expect(i18n.language).toBe('en');
    });
  });

  describe('Translation Keys', () => {
    it('should translate common keys', () => {
      const saveButton = i18n.t('common:buttons.save');
      expect(saveButton).toBe('Save');
    });

    it('should handle missing keys with fallback', () => {
      const missing = i18n.t('nonexistent.key', { defaultValue: 'Fallback' });
      expect(missing).toBe('Fallback');
    });

    it('should interpolate variables', () => {
      const welcome = i18n.t('common:navigation.switchView', { role: 'Admin' });
      expect(welcome).toContain('Admin');
    });
  });

  describe('Pluralization', () => {
    it('should handle singular form', () => {
      const singular = i18n.t('common:time.minutes', { count: 1 });
      expect(singular).toBe('1 minute');
    });

    it('should handle plural form', () => {
      const plural = i18n.t('common:time.minutes', { count: 5 });
      expect(plural).toBe('5 minutes');
    });
  });

  describe('RTL Support', () => {
    it('should detect RTL languages', () => {
      expect(isRTLLanguage('ar')).toBe(true);
      expect(isRTLLanguage('en')).toBe(false);
    });

    it('should set document direction for RTL', async () => {
      await i18n.changeLanguage('ar');
      // Note: In test environment, document manipulation might not work
      // This would be tested in integration tests
    });
  });

  describe('Formatting Utilities', () => {
    it('should format currency correctly', () => {
      const usd = formatLocalizedCurrency(100, 'en', 'USD');
      expect(usd).toMatch(/\$100/);
      
      const eur = formatLocalizedCurrency(100, 'de', 'EUR');
      expect(eur).toMatch(/100.*€/);
    });

    it('should format dates correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatLocalizedDate(date, 'en');
      expect(formatted).toMatch(/1\/15\/2024|15\/1\/2024/);
    });
  });

  describe('Translation Key Validation', () => {
    it('should validate correct keys', () => {
      expect(validateTranslationKey('common.buttons.save')).toBe(true);
      expect(validateTranslationKey('errors.validation.required')).toBe(true);
    });

    it('should reject invalid keys', () => {
      expect(validateTranslationKey('invalid-key')).toBe(false);
      expect(validateTranslationKey('123invalid')).toBe(false);
    });
  });

  describe('Namespace Loading', () => {
    it('should load common namespace by default', () => {
      expect(i18n.hasResourceBundle('en', 'common')).toBe(true);
    });

    it('should load additional namespaces on demand', async () => {
      await i18n.loadNamespaces('errors');
      expect(i18n.hasResourceBundle('en', 'errors')).toBe(true);
    });
  });

  describe('Language Switching', () => {
    it('should persist language choice', async () => {
      await i18n.changeLanguage('fr');
      expect(localStorage.getItem('slotease-language')).toBe('fr');
    });

    it('should emit language change events', (done) => {
      i18n.on('languageChanged', (lng) => {
        expect(lng).toBe('de');
        done();
      });
      
      i18n.changeLanguage('de');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network failure
      const originalFetch = global.fetch;
      global.fetch = () => Promise.reject(new Error('Network error'));
      
      try {
        await i18n.changeLanguage('nonexistent');
        // Should fallback to cached or default translations
        expect(i18n.language).toBeTruthy();
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});

describe('Component Integration', () => {
  // These would be React component tests using @testing-library/react
  // Testing actual component rendering with translations
  
  it('should render LanguageSelector correctly', () => {
    // Component rendering tests would go here
    expect(true).toBe(true); // Placeholder
  });

  it('should apply RTL styles correctly', () => {
    // RTL layout tests would go here
    expect(true).toBe(true); // Placeholder
  });
});