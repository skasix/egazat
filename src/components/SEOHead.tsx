import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getCountryMetadata } from '@/utils/seoRoutes';
import { buildEventSchema, buildItemListSchema, buildBreadcrumbSchema, buildWebsiteSchema } from '@/utils/schemaBuilder';
import { getHolidaysForCountryYear } from '@/pages/CountryPage';

interface SEOHeadProps {
  title?: string;
  description?: string;
  language?: string;
  countryCode?: string;
  year?: number;
  keywords?: string;
}

export const SEOHead = ({ title, description, language = 'ar', countryCode, year, keywords }: SEOHeadProps) => {
  const location = useLocation();
  
  const getCanonicalUrl = () => {
    let path = location.pathname;
    if (path === '/' || path === '/ar' || path === '/ar.html') {
      return 'https://egazat.com/';
    }
    if (path === '/en' || path === '/en.html') {
      return 'https://egazat.com/en.html';
    }
    if (!path.endsWith('.html') && !path.endsWith('/')) {
      path = `${path}.html`;
    }
    return `https://egazat.com${path}`;
  };
  
  const getHreflangUrls = () => {
    const currentPath = location.pathname;
    if (currentPath === '/' || currentPath === '/ar' || currentPath === '/ar.html' ||
        currentPath === '/en' || currentPath === '/en.html') {
      return {
        ar: 'https://egazat.com/',
        en: 'https://egazat.com/en.html'
      };
    }
    if (countryCode && year) {
      return {
        ar: `https://egazat.com/ar/country/${countryCode}/${year}.html`,
        en: `https://egazat.com/en/country/${countryCode}/${year}.html`
      };
    }
    const pathWithoutLang = currentPath.replace(/^\/(ar|en)/, '');
    return {
      ar: `https://egazat.com/ar${pathWithoutLang.endsWith('.html') ? pathWithoutLang : pathWithoutLang + '.html'}`,
      en: `https://egazat.com/en${pathWithoutLang.endsWith('.html') ? pathWithoutLang : pathWithoutLang + '.html'}`
    };
  };
  
  const canonicalUrl = getCanonicalUrl();
  const hreflangUrls = getHreflangUrls();
  
  const defaultKeywords = language === 'ar' 
    ? 'العطل الرسمية, العطل العربية, التقويم, الإجازات, العطل الوطنية'
    : 'public holidays, arab holidays, calendar, vacations, national holidays';
  
  const finalKeywords = keywords || defaultKeywords;
  
  // Build structured data arrays
  const structuredDataScripts: object[] = [];
  
  if (countryCode && year) {
    const countryMetadata = getCountryMetadata(countryCode, language);
    const countryName = countryMetadata.name || '';
    const holidays = getHolidaysForCountryYear(countryCode, year);
    
    // Get organizer info from countries.json
    const countriesArr = (countriesJsonData as any)?.countries || [];
    const cJson = countriesArr.find((c: any) => c.code === countryCode);
    const organizerName = cJson?.government_name_ar && language === 'ar'
      ? cJson.government_name_ar
      : cJson ? `Government of ${cJson.short_name_en || countryName}` : undefined;
    const governmentUrl = cJson?.government_url;
    
    // ItemList schema
    structuredDataScripts.push(buildItemListSchema(holidays, countryCode, year, countryName, language));
    
    // BreadcrumbList schema
    structuredDataScripts.push(buildBreadcrumbSchema(countryCode, year, countryName, language));
    
    // Event schema for each holiday
    holidays.forEach(holiday => {
      structuredDataScripts.push(buildEventSchema(holiday, countryCode, countryName, language, organizerName, governmentUrl));
    });
  } else {
    // Homepage — WebSite schema
    structuredDataScripts.push(buildWebsiteSchema(language));
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang Links */}
      <link rel="alternate" hrefLang="ar" href={hreflangUrls.ar} />
      <link rel="alternate" hrefLang="en" href={hreflangUrls.en} />
      <link rel="alternate" hrefLang="x-default" href={hreflangUrls.en} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Egazat" />
      <meta property="og:locale" content={language === 'ar' ? 'ar_AR' : 'en_US'} />
      <meta property="og:locale:alternate" content={language === 'ar' ? 'en_US' : 'ar_AR'} />
      <meta property="og:image" content={countryCode && year ? `https://egazat.com/og/${countryCode}-${year}.jpg` : 'https://egazat.com/og-image.jpg'} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={countryCode && year ? (language === 'ar' ? `العطل الرسمية ${year}` : `Public Holidays ${year}`) : (language === 'ar' ? 'دليل العطل الرسمية العربية' : 'Arabic Public Holidays Guide')} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={countryCode && year ? `https://egazat.com/og/${countryCode}-${year}.jpg` : 'https://egazat.com/og-image.jpg'} />
      <meta name="twitter:image:alt" content={countryCode && year ? (language === 'ar' ? `العطل الرسمية ${year}` : `Public Holidays ${year}`) : (language === 'ar' ? 'دليل العطل الرسمية العربية' : 'Arabic Public Holidays Guide')} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="Egazat" />
      <meta name="theme-color" content="#000000" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* All Structured Data */}
      {structuredDataScripts.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
