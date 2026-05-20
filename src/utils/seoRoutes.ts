// SEO-friendly route utilities for static HTML generation

export const generateSEOUrl = (lang: string, countryCode?: string, year?: number): string => {
  if (countryCode && year) {
    return `/${lang}/country/${countryCode}/${year}.html`;
  }
  return `/${lang}.html`;
};

export const generateHomeUrl = (lang: string): string => {
  // Arabic home page should use root path, English uses .html
  return lang === 'ar' ? '/' : `/${lang}.html`;
};

export const generateCountryUrl = (lang: string, countryCode: string, year: number): string => {
  return `/${lang}/country/${countryCode}/${year}.html`;
};

// Generate all static routes for build-time generation
export const getAllStaticRoutes = (): string[] => {
  const routes: string[] = [];
  
  const countries = [
    'ae', 'sa', 'eg', 'jo', 'lb', 'sy', 'iq', 'kw', 'qa', 'bh', 'om', 'ye', 
    'ma', 'tn', 'dz', 'ly', 'sd', 'so', 'dj', 'km'
  ];
  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  const languages = ['en', 'ar'];
  
  // Add home pages
  languages.forEach(lang => {
    routes.push(`/${lang}.html`);
  });
  
  // Add country pages
  languages.forEach(lang => {
    countries.forEach(country => {
      years.forEach(year => {
        routes.push(`/${lang}/country/${country}/${year}.html`);
      });
    });
  });
  
  return routes;
};

// Country metadata for SEO
export const getCountryMetadata = (countryCode: string, lang: string) => {
  const countries: Record<string, { name: string; nameAr: string }> = {
    'ae': { name: 'United Arab Emirates', nameAr: 'دولة الإمارات العربية المتحدة' },
    'sa': { name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية' },
    'eg': { name: 'Egypt', nameAr: 'جمهورية مصر العربية' },
    'jo': { name: 'Jordan', nameAr: 'المملكة الأردنية الهاشمية' },
    'lb': { name: 'Lebanon', nameAr: 'الجمهورية اللبنانية' },
    'sy': { name: 'Syria', nameAr: 'الجمهورية العربية السورية' },
    'iq': { name: 'Iraq', nameAr: 'جمهورية العراق' },
    'kw': { name: 'Kuwait', nameAr: 'دولة الكويت' },
    'qa': { name: 'Qatar', nameAr: 'دولة قطر' },
    'bh': { name: 'Bahrain', nameAr: 'مملكة البحرين' },
    'om': { name: 'Oman', nameAr: 'سلطنة عمان' },
    'ye': { name: 'Yemen', nameAr: 'الجمهورية اليمنية' },
    'ma': { name: 'Morocco', nameAr: 'المملكة المغربية' },
    'tn': { name: 'Tunisia', nameAr: 'الجمهورية التونسية' },
    'dz': { name: 'Algeria', nameAr: 'الجمهورية الجزائرية الديمقراطية الشعبية' },
    'ly': { name: 'Libya', nameAr: 'دولة ليبيا' },
    'sd': { name: 'Sudan', nameAr: 'جمهورية السودان' },
    'so': { name: 'Somalia', nameAr: 'جمهورية الصومال' },
    'dj': { name: 'Djibouti', nameAr: 'جمهورية جيبوتي' },
    'km': { name: 'Comoros', nameAr: 'جزر القمر' }
  };
  
  const country = countries[countryCode];
  return {
    name: lang === 'ar' ? country?.nameAr : country?.name,
    code: countryCode.toUpperCase()
  };
};