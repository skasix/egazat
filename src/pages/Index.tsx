import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CountryCards } from '@/components/CountryCards';
import { CountryQuickSelector } from '@/components/CountryQuickSelector';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { generateHomeUrl } from '@/utils/seoRoutes';
import { SEOHead } from '@/components/SEOHead';
import { useSmartPrefetch } from '@/hooks/usePrefetch';

const Index = () => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState('ar');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedCountry, setSelectedCountry] = useState('ae');

  // Smart prefetching for likely next pages
  useSmartPrefetch(location.pathname);

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

  // Sync local language state with URL param, default to Arabic for root path
  useEffect(() => {
    if (!lang) {
      // Root path, default to Arabic
      setLanguage('ar');
    } else {
      setLanguage(lang === 'en' ? 'en' : 'ar');
    }
  }, [lang]);

  // Update document language and direction
  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'ar';
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  }, [language]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={language === 'ar' 
          ? 'العطل الرسمية العربية - دليل شامل | Egazat.com'
          : 'Arabic Public Holidays - Complete Guide | Egazat.com'
        }
        description={language === 'ar' 
          ? 'دليل شامل للعطل والمناسبات الرسمية في جميع الدول العربية. تقويم كامل للعطل الرسمية والإجازات الوطنية.'
          : 'Complete guide to public holidays and official celebrations in all Arab countries. Full calendar of official holidays and national vacations.'
        }
        language={language}
        keywords={language === 'ar'
          ? 'العطل الرسمية العربية, التقويم العربي, الإجازات الرسمية, العطل الوطنية, التقويم الهجري'
          : 'arabic public holidays, arab calendar, official holidays, national holidays, islamic calendar'
        }
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
        <CountryCards language={language} year={selectedYear} />
      </main>
    </div>
  );
};

export default Index;
