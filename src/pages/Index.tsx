import { useState } from 'react';
import { Header } from '@/components/Header';
import { CountryCards } from '@/components/CountryCards';

const Index = () => {
  const [language, setLanguage] = useState('en');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedCountry, setSelectedCountry] = useState('ae');

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
  };

  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        selectedLanguage={language}
        selectedYear={selectedYear}
        selectedCountry={selectedCountry}
        onLanguageChange={handleLanguageChange}
        onYearChange={handleYearChange}
        onCountryChange={handleCountryChange}
      />
      
      <main className="container mx-auto px-4 py-12">
        <CountryCards language={language} year={selectedYear} />
      </main>
    </div>
  );
};

export default Index;
