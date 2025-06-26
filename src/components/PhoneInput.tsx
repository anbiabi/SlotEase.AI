import React, { useState, useEffect } from 'react';
import { Phone, ChevronDown, Check } from 'lucide-react';
import { parsePhoneNumber, isValidPhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js';

interface Country {
  code: string;
  name: string;
  callingCode: string;
  flag: string;
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  error?: string;
  placeholder?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  placeholder = "Enter your phone number"
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Initialize countries list
  useEffect(() => {
    const initializeCountries = async () => {
      try {
        // Fetch country data from REST Countries API
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag');
        const countryData = await response.json();
        
        const formattedCountries: Country[] = countryData
          .filter((country: any) => country.idd?.root && country.idd?.suffixes?.length > 0)
          .map((country: any) => ({
            code: country.cca2,
            name: country.name.common,
            callingCode: country.idd.root + (country.idd.suffixes[0] || ''),
            flag: country.flag
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

        setCountries(formattedCountries);
        
        // Set default country (US)
        const defaultCountry = formattedCountries.find(c => c.code === 'US') || formattedCountries[0];
        setSelectedCountry(defaultCountry);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
        // Fallback to basic country list
        const fallbackCountries: Country[] = [
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
        setCountries(fallbackCountries);
        setSelectedCountry(fallbackCountries[0]);
      }
    };

    initializeCountries();
  }, []);

  // Handle phone number input
  const handlePhoneChange = (inputValue: string) => {
    setPhoneNumber(inputValue);
    
    if (selectedCountry) {
      const fullNumber = selectedCountry.callingCode + inputValue.replace(/^\+/, '');
      const isValid = validatePhoneNumber(fullNumber);
      onChange(fullNumber, isValid);
    }
  };

  // Validate phone number
  const validatePhoneNumber = (fullNumber: string): boolean => {
    try {
      return isValidPhoneNumber(fullNumber);
    } catch (error) {
      return false;
    }
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchTerm('');
    
    // Update the full phone number with new country code
    if (phoneNumber) {
      const fullNumber = country.callingCode + phoneNumber.replace(/^\+/, '');
      const isValid = validatePhoneNumber(fullNumber);
      onChange(fullNumber, isValid);
    }
  };

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.callingCode.includes(searchTerm)
  );

  // Parse and format the current value for display
  useEffect(() => {
    if (value && selectedCountry) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed && parsed.country === selectedCountry.code) {
          setPhoneNumber(parsed.nationalNumber);
        } else if (value.startsWith(selectedCountry.callingCode)) {
          setPhoneNumber(value.substring(selectedCountry.callingCode.length));
        }
      } catch (error) {
        // If parsing fails, extract the number part
        if (value.startsWith(selectedCountry.callingCode)) {
          setPhoneNumber(value.substring(selectedCountry.callingCode.length));
        }
      }
    }
  }, [value, selectedCountry]);

  const isValid = value ? validatePhoneNumber(value) : false;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Phone Number *
      </label>
      
      <div className="relative flex">
        {/* Country Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center px-3 py-3 border border-r-0 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors ${
              error ? 'border-error-500' : 'border-gray-300'
            }`}
          >
            <span className="text-lg mr-2">{selectedCountry?.flag}</span>
            <span className="text-sm font-medium text-gray-700 mr-1">
              {selectedCountry?.callingCode}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {/* Country Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="w-full flex items-center px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="text-lg mr-3">{country.flag}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{country.name}</div>
                      <div className="text-xs text-gray-500">{country.callingCode}</div>
                    </div>
                    {selectedCountry?.code === country.code && (
                      <Check className="h-4 w-4 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={`w-full pl-10 pr-10 py-3 border rounded-r-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              error ? 'border-error-500' : 'border-gray-300'
            }`}
            placeholder={placeholder}
          />
          
          {/* Validation Indicator */}
          {value && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValid ? (
                <Check className="h-5 w-5 text-accent-500" />
              ) : (
                <div className="h-5 w-5 rounded-full bg-error-500 flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-error-600">{error}</p>
      )}

      {/* Validation Message */}
      {value && !error && (
        <p className={`mt-2 text-sm ${isValid ? 'text-accent-600' : 'text-error-600'}`}>
          {isValid ? '✓ Valid phone number' : '✗ Please enter a valid phone number'}
        </p>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};