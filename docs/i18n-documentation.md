# Internationalization (i18n) Documentation

## Overview

This documentation covers the comprehensive internationalization system implemented for the SlotEase application using react-i18next. The system supports multiple languages, RTL layouts, and provides extensive localization features.

## Supported Languages

- **English (en)** - Default language
- **Spanish (es)** - Español
- **French (fr)** - Français
- **German (de)** - Deutsch
- **Chinese (zh)** - 中文
- **Arabic (ar)** - العربية (RTL support)

## Project Structure

```
src/
├── i18n/
│   └── index.ts                 # i18n configuration
├── hooks/
│   └── useTranslation.ts        # Enhanced translation hooks
├── components/
│   ├── LanguageSelector.tsx     # Language switching component
│   └── RTLProvider.tsx          # RTL layout provider
├── utils/
│   └── i18nHelpers.ts          # Translation utility functions
└── main.tsx                     # i18n initialization

public/
└── locales/
    ├── en/
    │   ├── common.json
    │   ├── landing.json
    │   └── errors.json
    ├── es/
    │   └── common.json
    ├── fr/
    │   └── common.json
    ├── de/
    │   └── common.json
    ├── zh/
    │   └── common.json
    └── ar/
        └── common.json
```

## Configuration

### Language Detection

The system automatically detects user language preferences in this order:
1. localStorage (`slotease-language`)
2. Browser navigator language
3. HTML lang attribute
4. URL path
5. Subdomain
6. Fallback to English

### Namespaces

Translation files are organized into namespaces:
- `common` - Shared UI elements, navigation, buttons
- `landing` - Landing page content
- `auth` - Authentication related text
- `dashboard` - Dashboard specific content
- `booking` - Booking flow translations
- `errors` - Error messages and validation

## Usage

### Basic Translation

```tsx
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation('common');
  
  return (
    <button>{t('buttons.save')}</button>
  );
};
```

### Translation with Variables

```tsx
const { t } = useTranslation();

// Translation: "Welcome {{name}}"
const welcomeMessage = t('welcome', { name: 'John' });
```

### Pluralization

```tsx
const { t } = useTranslation();

// Translation keys: "minutes" and "minutes_plural"
const timeText = t('time.minutes', { count: 5 });
```

### Enhanced Hooks

#### useTranslation Hook

```tsx
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const {
    t,                    // Translation function
    i18n,                 // i18n instance
    currentLanguage,      // Current language config
    isRTL,               // RTL direction check
    formatCurrency,      // Currency formatting
    formatDate,          // Date formatting
    formatTime,          // Time formatting
    formatRelativeTime,  // Relative time formatting
    changeLanguage,      // Language switching
    availableLanguages   // Available languages list
  } = useTranslation();
  
  return (
    <div>
      <p>{t('common:buttons.save')}</p>
      <p>{formatCurrency(100)}</p>
      <p>{formatDate(new Date())}</p>
    </div>
  );
};
```

#### useCommonTranslations Hook

```tsx
import { useCommonTranslations } from '../hooks/useTranslation';

const MyComponent = () => {
  const { nav, btn, form, time, status } = useCommonTranslations();
  
  return (
    <div>
      <button>{btn('save')}</button>
      <label>{form('name')}</label>
      <span>{status('completed')}</span>
    </div>
  );
};
```

#### useErrorTranslations Hook

```tsx
import { useErrorTranslations } from '../hooks/useTranslation';

const MyComponent = () => {
  const { general, validation, booking } = useErrorTranslations();
  
  const handleError = (error: string) => {
    return general(error) || 'Unknown error';
  };
  
  return <div>{handleError('networkError')}</div>;
};
```

## Components

### LanguageSelector

```tsx
import { LanguageSelector } from '../components/LanguageSelector';

// Dropdown variant (default)
<LanguageSelector />

// Inline variant
<LanguageSelector variant="inline" />

// Custom styling
<LanguageSelector 
  className="custom-class"
  showFlag={true}
  showNativeName={true}
/>
```

### RTLProvider

Automatically handles RTL layout switching:

```tsx
import { RTLProvider } from '../components/RTLProvider';

<RTLProvider>
  <App />
</RTLProvider>
```

## Utility Functions

### Formatting Helpers

```tsx
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  formatLocalizedNumber,
  formatLocalizedRelativeTime
} from '../utils/i18nHelpers';

// Currency formatting
const price = formatLocalizedCurrency(99.99, 'en', 'USD');

// Date formatting
const date = formatLocalizedDate(new Date(), 'en');

// Number formatting
const number = formatLocalizedNumber(1234.56, 'en');

// Relative time
const relativeTime = formatLocalizedRelativeTime(new Date(), 'en');
```

### Translation Helpers

```tsx
import {
  getNestedTranslation,
  formatPlural,
  interpolateTranslation,
  getErrorMessage
} from '../utils/i18nHelpers';

// Nested translations
const text = getNestedTranslation(t, 'section.subsection.key');

// Pluralization
const plural = formatPlural(t, 'items', 5);

// Variable interpolation
const interpolated = interpolateTranslation(t, 'welcome', { name: 'John' });

// Error messages with fallback
const error = getErrorMessage(t, 'networkError', 'Connection failed');
```

## Adding New Languages

### 1. Update Language Configuration

Add the new language to `src/i18n/index.ts`:

```typescript
export const languages = {
  // ... existing languages
  it: {
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    dir: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: 'HH:mm',
    currency: 'EUR',
    currencySymbol: '€'
  }
};
```

### 2. Create Translation Files

Create translation files in `public/locales/it/`:

```
public/locales/it/
├── common.json
├── landing.json
└── errors.json
```

### 3. Add to Supported Languages

Update the `supportedLngs` array in i18n configuration:

```typescript
supportedLngs: Object.keys(languages),
```

## Translation File Structure

### Common Structure

```json
{
  "meta": {
    "language": "English",
    "direction": "ltr",
    "dateFormat": "MM/dd/yyyy",
    "timeFormat": "h:mm a"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "appointments": "Appointments"
  },
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "forms": {
    "name": "Name",
    "email": "Email"
  },
  "time": {
    "minutes": "{{count}} minute",
    "minutes_plural": "{{count}} minutes"
  }
}
```

### Pluralization Rules

```json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items",
  "items_zero": "No items"
}
```

### Variable Interpolation

```json
{
  "welcome": "Welcome {{name}}!",
  "greeting": "Hello {{name}}, you have {{count}} messages"
}
```

## RTL Support

### Automatic RTL Detection

The system automatically applies RTL layout for Arabic and other RTL languages:

```css
/* Automatic RTL classes applied */
.rtl .text-left { text-align: right; }
.rtl .text-right { text-align: left; }
.rtl .ml-2 { margin-left: 0; margin-right: 0.5rem; }
```

### RTL-Aware Components

Components automatically adapt to RTL layout:

```tsx
const MyComponent = () => {
  const { isRTL } = useTranslation();
  
  return (
    <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <span>Content</span>
    </div>
  );
};
```

## Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

test('renders translated text', () => {
  renderWithI18n(<MyComponent />);
  expect(screen.getByText('Save')).toBeInTheDocument();
});
```

### Language Switching Tests

```typescript
test('changes language correctly', async () => {
  const { changeLanguage } = useTranslation();
  
  await changeLanguage('es');
  
  expect(screen.getByText('Guardar')).toBeInTheDocument();
});
```

### RTL Layout Tests

```typescript
test('applies RTL layout for Arabic', async () => {
  const { changeLanguage } = useTranslation();
  
  await changeLanguage('ar');
  
  expect(document.documentElement.dir).toBe('rtl');
  expect(document.body).toHaveClass('rtl');
});
```

## Performance Optimization

### Lazy Loading

Translation files are loaded on demand:

```typescript
// Automatic lazy loading configured in i18n
backend: {
  loadPath: '/locales/{{lng}}/{{ns}}.json'
}
```

### Preloading

Critical languages can be preloaded:

```typescript
preload: ['en', 'es'], // Preload English and Spanish
```

### Caching

Translations are cached in localStorage:

```typescript
detection: {
  caches: ['localStorage']
}
```

## Best Practices

### 1. Translation Keys

- Use descriptive, hierarchical keys
- Group related translations
- Avoid deeply nested structures

```json
// Good
{
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  }
}

// Avoid
{
  "ui": {
    "components": {
      "forms": {
        "buttons": {
          "save": "Save"
        }
      }
    }
  }
}
```

### 2. Pluralization

Always provide plural forms:

```json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items",
  "items_zero": "No items"
}
```

### 3. Context

Use context for ambiguous terms:

```json
{
  "close_verb": "Close",
  "close_adjective": "Close"
}
```

### 4. Fallbacks

Always provide fallback values:

```tsx
const text = t('key', { defaultValue: 'Fallback text' });
```

## Troubleshooting

### Common Issues

1. **Missing translations**: Check console for missing key warnings
2. **RTL layout issues**: Verify CSS classes are properly applied
3. **Date/time formatting**: Ensure locale is properly set
4. **Performance**: Check if unnecessary namespaces are being loaded

### Debug Mode

Enable debug mode in development:

```typescript
debug: process.env.NODE_ENV === 'development'
```

### Missing Key Handler

Custom handler for missing translations:

```typescript
missingKeyHandler: (lng, ns, key, fallbackValue) => {
  console.warn(`Missing translation: ${ns}:${key} for ${lng}`);
}
```

## Migration Guide

### From Existing i18n

1. Export existing translations to JSON format
2. Restructure according to namespace organization
3. Update component imports
4. Test all translation keys
5. Verify RTL layouts

### Adding to Existing Project

1. Install dependencies
2. Copy i18n configuration
3. Add translation files
4. Wrap app with RTLProvider
5. Update components to use hooks

This comprehensive i18n system provides robust internationalization support with RTL layouts, automatic language detection, and extensive localization features for the SlotEase application.