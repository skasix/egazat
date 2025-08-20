#!/usr/bin/env node

/**
 * Static HTML Generation Script for SEO
 * Generates static HTML files for all routes with proper .html extensions
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate all routes that need static HTML files
const generateRoutes = () => {
  const routes = [];
  
  const countries = [
    'ae', 'sa', 'eg', 'jo', 'lb', 'sy', 'iq', 'kw', 'qa', 'bh', 'om', 'ye', 
    'ma', 'tn', 'dz', 'ly'
  ];
  const years = [2025, 2026, 2027, 2028];
  const languages = ['en', 'ar'];
  
  // Add home pages
  languages.forEach(lang => {
    routes.push({
      path: `/${lang}.html`,
      route: `/${lang}`,
      lang,
      title: lang === 'ar' ? 'العطل الرسمية العربية' : 'Arabic Public Holidays',
      description: lang === 'ar' 
        ? 'دليل شامل للعطل والمناسبات الرسمية في الدول العربية'
        : 'Complete Guide to Public Holidays in Arab Countries'
    });
  });
  
  // Add country pages
  languages.forEach(lang => {
    countries.forEach(country => {
      years.forEach(year => {
        const countryNames = {
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
          'ly': { name: 'Libya', nameAr: 'دولة ليبيا' }
        };
        
        const countryData = countryNames[country];
        const countryName = lang === 'ar' ? countryData.nameAr : countryData.name;
        
        routes.push({
          path: `/${lang}/country/${country}/${year}.html`,
          route: `/${lang}/country/${country}/${year}`,
          lang,
          country,
          year,
          title: lang === 'ar' 
            ? `${countryName} العطل الرسمية ${year}`
            : `${countryName} Public Holidays ${year}`,
          description: lang === 'ar'
            ? `دليل شامل للعطل الإسلامية والأيام الوطنية وجدول العمل في ${countryName} لعام ${year}`
            : `Complete Guide to Islamic Holidays, National Days & Work Schedule in ${countryName} for ${year}`
        });
      });
    });
  });
  
  return routes;
};

// Create directory structure
const createDirectories = async (routes) => {
  const distDir = path.join(__dirname, '../dist');
  
  for (const route of routes) {
    const filePath = path.join(distDir, route.path);
    const dir = path.dirname(filePath);
    
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
};

// Generate HTML template
const generateHTML = (route) => {
  const { title, description, lang } = route;
  
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} | Egazat</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="arabic holidays, public holidays, arab countries, middle east holidays, islamic holidays, national holidays, ${route.country || ''}" />
    <meta name="author" content="Egazat" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:locale" content="${lang === 'ar' ? 'ar_SA' : 'en_US'}" />
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://egazat.com${route.path}" />
    
    <!-- Arabic Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
    
    <!-- Redirect to SPA route -->
    <script>
      // Redirect to the SPA route for dynamic content
      window.location.replace('${route.route}');
    </script>
    
    <!-- Fallback content for crawlers -->
    <noscript>
      <meta http-equiv="refresh" content="0; url=${route.route}" />
    </noscript>
  </head>
  
  <body>
    <div id="root">
      <!-- SEO fallback content -->
      <h1>${title}</h1>
      <p>${description}</p>
      <p>Loading content...</p>
    </div>
    
    <!-- SPA will replace this content -->
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
};

// Generate all static files
const generateStaticFiles = async () => {
  console.log('🚀 Generating static HTML files for SEO...');
  
  const routes = generateRoutes();
  console.log(`📄 Found ${routes.length} routes to generate`);
  
  await createDirectories(routes);
  
  for (const route of routes) {
    const html = generateHTML(route);
    const filePath = path.join(__dirname, '../dist', route.path);
    
    try {
      await fs.writeFile(filePath, html, 'utf8');
      console.log(`✅ Generated: ${route.path}`);
    } catch (error) {
      console.error(`❌ Error generating ${route.path}:`, error);
    }
  }
  
  console.log('🎉 Static HTML generation complete!');
};

// Run the generator
generateStaticFiles().catch(console.error);