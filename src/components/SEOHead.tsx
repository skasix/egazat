import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getCountryMetadata } from '@/utils/seoRoutes';

interface SEOHeadProps {
  title?: string;
  description?: string;
  language?: string;
  countryCode?: string;
  year?: number;
}

export const SEOHead = ({ title, description, language = 'en', countryCode, year }: SEOHeadProps) => {
  const location = useLocation();

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | Egazat`;
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    }

    // Update language and direction
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

    // Update canonical URL (remove .html for canonical)
    const canonicalUrl = `https://egazat.com${location.pathname.replace('.html', '')}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Update Open Graph tags
    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    if (title) {
      updateOGTag('og:title', title);
    }
    if (description) {
      updateOGTag('og:description', description);
    }
    updateOGTag('og:url', canonicalUrl);
    updateOGTag('og:locale', language === 'ar' ? 'ar_SA' : 'en_US');

    // Update Twitter tags
    const updateTwitterTag = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    if (title) {
      updateTwitterTag('twitter:title', title);
    }
    if (description) {
      updateTwitterTag('twitter:description', description);
    }

    // Add structured data for country pages
    if (countryCode && year) {
      const countryMetadata = getCountryMetadata(countryCode, language);
      const structuredData = {
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
          "name": `${countryMetadata.name} Public Holidays ${year}`,
          "description": description,
          "location": {
            "@type": "Country",
            "name": countryMetadata.name
          },
          "startDate": `${year}-01-01`,
          "endDate": `${year}-12-31`
        }
      };

      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, language, countryCode, year, location]);

  return null;
};