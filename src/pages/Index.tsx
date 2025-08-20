import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CountryCards } from '@/components/CountryCards';
import { CountryQuickSelector } from '@/components/CountryQuickSelector';
import { useParams, useNavigate } from 'react-router-dom';
import { generateHomeUrl } from '@/utils/seoRoutes';
import { SEOHead } from '@/components/SEOHead';

const Index = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedCountry, setSelectedCountry] = useState('ae');

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    navigate(generateHomeUrl(newLanguage));
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
  };

  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
  };

  // Sync local language state with URL param
  useEffect(() => {
    setLanguage(lang === 'ar' ? 'ar' : 'en');
  }, [lang]);

  // Update document language and direction
  useEffect(() => {
    document.documentElement.lang = language === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={language === 'ar' ? 'العطل الرسمية العربية' : 'Arabic Public Holidays'}
        description={language === 'ar' 
          ? 'دليل شامل للعطل والمناسبات الرسمية في الدول العربية'
          : 'Complete Guide to Public Holidays in Arab Countries'
        }
        language={language}
      />
      <Header
        selectedLanguage={language}
        selectedYear={selectedYear}
        selectedCountry={selectedCountry}
        onLanguageChange={handleLanguageChange}
        onYearChange={handleYearChange}
        onCountryChange={handleCountryChange}
      />
      
      <CountryQuickSelector language={language} year={selectedYear} />
      
      <main className="container mx-auto px-4 py-12">
        {/* Main Title with Gradient */}
        <div className="text-center mb-16">
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-500 to-yellow-500 bg-clip-text text-transparent ${language === 'ar' ? 'arabic-text' : ''}`}>
            {language === 'ar' ? 'العطل الرسمية العربية' : 'Arabic Public Holidays'}
          </h1>
          <p className={`text-xl text-muted-foreground max-w-3xl mx-auto ${language === 'ar' ? 'arabic-text' : ''}`}>
            {language === 'ar' 
              ? 'دليل شامل للعطل والمناسبات الرسمية في جميع الدول العربية'
              : 'Your Complete Guide to Public Holidays in All Arab Countries'
            }
          </p>
        </div>
        
        <CountryCards language={language} year={selectedYear} />
      </main>
    </div>
  );
};

export default Index;
