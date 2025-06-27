import { beforeAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => {
    return localStorageMock[key] || null;
  },
  setItem: (key: string, value: string) => {
    localStorageMock[key] = value;
  },
  removeItem: (key: string) => {
    delete localStorageMock[key];
  },
  clear: () => {
    Object.keys(localStorageMock).forEach(key => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete localStorageMock[key];
      }
    });
  }
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock Intl APIs for consistent testing
Object.defineProperty(window, 'Intl', {
  value: {
    DateTimeFormat: function(locale: string, options?: any) {
      return {
        format: (date: Date) => date.toLocaleDateString(locale, options)
      };
    },
    NumberFormat: function(locale: string, options?: any) {
      return {
        format: (number: number) => {
          if (options?.style === 'currency') {
            return `${options.currency} ${number}`;
          }
          return number.toString();
        }
      };
    },
    RelativeTimeFormat: function(locale: string, options?: any) {
      return {
        format: (value: number, unit: string) => `${value} ${unit} ago`
      };
    }
  }
});

beforeAll(() => {
  // Setup global test environment
});

afterEach(() => {
  cleanup();
  localStorageMock.clear();
});