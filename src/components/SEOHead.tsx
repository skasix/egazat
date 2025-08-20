import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getCountryMetadata } from '@/utils/seoRoutes';

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
  
  // Build canonical URL (ensure .html extension for proper canonicals)
  const getCanonicalUrl = () => {
    let path = location.pathname;
    
    // If path doesn't end with .html and it's not the root, add .html
    if (!path.endsWith('.html') && path !== '/' && !path.endsWith('/')) {
      path = `${path}.html`;
    }
    
    return `https://egazat.com${path}`;
  };
  
  const canonicalUrl = getCanonicalUrl();
  
  // Generate keywords
  const defaultKeywords = language === 'ar' 
    ? 'العطل الرسمية, العطل العربية, التقويم, الإجازات, العطل الوطنية'
    : 'public holidays, arab holidays, calendar, vacations, national holidays';
  
  const finalKeywords = keywords || defaultKeywords;
  
  // Generate structured data for country pages
  let structuredData = null;
  if (countryCode && year) {
    const countryMetadata = getCountryMetadata(countryCode, language);
    structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "description": description,
      "url": canonicalUrl,
      "inLanguage": language,
      "about": {
        "@type": "Country",
        "name": countryMetadata.name,
        "alternateName": countryMetadata.code
      },
      "mainEntity": {
        "@type": "Event",
        "name": language === 'ar' 
          ? `العطل الرسمية ${countryMetadata.name} ${year}`
          : `${countryMetadata.name} Public Holidays ${year}`,
        "description": description,
        "location": {
          "@type": "Country",
          "name": countryMetadata.name
        },
        "startDate": `${year}-01-01`,
        "endDate": `${year}-12-31`
      }
    };
  } else {
    // Homepage structured data
    structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Egazat",
      "description": description,
      "url": canonicalUrl,
      "inLanguage": language,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://egazat.com/{lang}/country/{country}/{year}"
        },
        "query-input": "required name=country"
      }
    };
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Egazat" />
      <meta property="og:locale" content={language === 'ar' ? 'ar_SA' : 'en_US'} />
      <meta property="og:image" content="https://egazat.com/og-image.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={language === 'ar' ? 'دليل العطل الرسمية العربية' : 'Arabic Public Holidays Guide'} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://egazat.com/og-image.jpg" />
      <meta name="twitter:image:alt" content={language === 'ar' ? 'دليل العطل الرسمية العربية' : 'Arabic Public Holidays Guide'} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="Egazat" />
      <meta name="theme-color" content="#000000" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};