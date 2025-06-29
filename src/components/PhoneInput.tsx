import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { getFallbackCountries } from '../utils/countryUtils';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string, isValid: boolean) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

interface Country {
  code: string;
  name: string;
  callingCode: string;
  flag: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter phone number',
  className = '',
  required = false
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        // Try to fetch countries from API
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag');
        if (response.ok) {
          const data = await response.json();
          const formattedCountries = data.map((country: Record<string, unknown>) => ({
            code: country.cca2 as string,
            name: (country.name as Record<string, unknown>).common as string,
            callingCode: country.idd?.root ? `+${(country.idd as Record<string, unknown>).root}` : '',
            flag: country.flag as string
          })).filter((country: Country) => country.callingCode);
          
          setCountries(formattedCountries);
          setSelectedCountry(formattedCountries.find((c: Country) => c.code === 'US') || formattedCountries[0]);
        } else {
          throw new Error('Failed to fetch countries');
        }
      } catch (error) {
        console.warn('Using fallback country list:', error);
        const fallbackCountries = getFallbackCountries();
        setCountries(fallbackCountries);
        setSelectedCountry(fallbackCountries.find(c => c.code === 'US') || fallbackCountries[0]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCountries();
  }, []);

  const validatePhone = (phone: string): boolean => {
    // Basic phone validation - can be enhanced
    const phoneRegex = /^\+?[\d\s\-()]{7,}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    const valid = validatePhone(phone);
    setIsValid(valid);
    onChange(phone, valid);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = countries.find(c => c.code === e.target.value);
    if (country) {
      setSelectedCountry(country);
      // Update phone number with new country code if it doesn't already have one
      if (!value.startsWith('+')) {
        const newPhone = country.callingCode + value.replace(/^\+\d+/, '');
        const valid = validatePhone(newPhone);
        setIsValid(valid);
        onChange(newPhone, valid);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 p-3 border border-gray-300 rounded-lg ${className}`}>
        <div className="animate-pulse bg-gray-200 h-4 w-4 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-4 flex-1 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 ${className}`}>
      <Phone className="h-4 w-4 text-gray-400" />
      
      <select
        value={selectedCountry?.code || ''}
        onChange={handleCountryChange}
        className="flex-shrink-0 bg-transparent border-none outline-none text-sm"
      >
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.flag} {country.callingCode}
          </option>
        ))}
      </select>
      
      <input
        type="tel"
        value={value}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        required={required}
        className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-400"
      />
      
      {value && (
        <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
      )}
    </div>
  );
};