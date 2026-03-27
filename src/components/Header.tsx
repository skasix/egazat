import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Calendar, MapPin } from 'lucide-react';

export interface HeaderProps {
  selectedLanguage: string;
  selectedYear: number;
  selectedCountry: string;
  onLanguageChange: (language: string) => void;
  onYearChange: (year: number) => void;
  onCountryChange: (country: string) => void;
}

const arabicCountries = [
  { code: 'ae', name: 'United Arab Emirates', nameAr: 'دولة الإمارات العربية المتحدة' },
  { code: 'sa', name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية' },
  { code: 'eg', name: 'Egypt', nameAr: 'جمهورية مصر العربية' },
  { code: 'jo', name: 'Jordan', nameAr: 'المملكة الأردنية الهاشمية' },
  { code: 'lb', name: 'Lebanon', nameAr: 'الجمهورية اللبنانية' },
  { code: 'sy', name: 'Syria', nameAr: 'الجمهورية العربية السورية' },
  { code: 'iq', name: 'Iraq', nameAr: 'جمهورية العراق' },
  { code: 'kw', name: 'Kuwait', nameAr: 'دولة الكويت' },
  { code: 'qa', name: 'Qatar', nameAr: 'دولة قطر' },
  { code: 'bh', name: 'Bahrain', nameAr: 'مملكة البحرين' },
  { code: 'om', name: 'Oman', nameAr: 'سلطنة عمان' },
  { code: 'ye', name: 'Yemen', nameAr: 'الجمهورية اليمنية' },
  { code: 'ma', name: 'Morocco', nameAr: 'المملكة المغربية' },
  { code: 'tn', name: 'Tunisia', nameAr: 'الجمهورية التونسية' },
  { code: 'dz', name: 'Algeria', nameAr: 'الجمهورية الجزائرية الديمقراطية الشعبية' },
  { code: 'ly', name: 'Libya', nameAr: 'دولة ليبيا' },
  { code: 'sd', name: 'Sudan', nameAr: 'جمهورية السودان' },
  { code: 'so', name: 'Somalia', nameAr: 'جمهورية الصومال' },
  { code: 'dj', name: 'Djibouti', nameAr: 'جمهورية جيبوتي' },
  { code: 'km', name: 'Comoros', nameAr: 'جزر القمر' }
];

const years = [2026, 2027, 2028];

export const Header = ({
  selectedLanguage,
  selectedYear,
  selectedCountry,
  onLanguageChange,
  onYearChange,
  onCountryChange
}: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        {/* Title and Subtitle */}
        <div className="text-center mb-6">
          <a 
            href="https://egazat.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <h1 className={`text-4xl font-bold bg-gradient-to-r from-black to-yellow-500 bg-clip-text text-transparent mb-2 ${selectedLanguage === 'ar' ? 'arabic-text' : ''}`}>
              {selectedLanguage === 'ar' ? 'العطل الرسمية العربية' : 'Arabic Public Holidays'}
            </h1>
          </a>
          <h2 className={`text-xl text-muted-foreground ${selectedLanguage === 'ar' ? 'arabic-text' : ''}`}>
            {selectedLanguage === 'ar' 
              ? 'دليل شامل للعطل والمناسبات الرسمية في الدول العربية'
              : 'Complete Guide to Public Holidays in Arab Countries'
            }
          </h2>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-wrap items-center justify-center gap-4">
          {/* Language Toggle Slider */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div className="relative bg-muted rounded-lg p-1 flex items-center">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedLanguage === 'en' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                English
              </button>
              <button
                onClick={() => onLanguageChange('ar')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedLanguage === 'ar' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                العربية
              </button>
            </div>
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedYear.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country Selector */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCountry} onValueChange={onCountryChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {arabicCountries.map(country => (
                  <SelectItem key={country.code} value={country.code}>
                    {selectedLanguage === 'ar' ? country.nameAr : country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </nav>
      </div>
    </header>
  );
};