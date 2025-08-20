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
    'ma', 'tn', 'dz', 'ly', 'sd', 'so', 'dj', 'km'
  ];
  const years = [2025, 2026, 2027, 2028];
  const languages = ['en', 'ar'];
  
  // Add home pages
  // Root path serves Arabic homepage directly
  routes.push({
    path: '/index.html',
    route: '/',
    lang: 'ar',
    title: 'العطل الرسمية العربية',
    description: 'دليل شامل للعطل والمناسبات الرسمية في الدول العربية'
  });
  
  // English homepage
  routes.push({
    path: '/en.html',
    route: '/en',
    lang: 'en',
    title: 'Arabic Public Holidays',
    description: 'Complete Guide to Public Holidays in Arab Countries'
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
          'ly': { name: 'Libya', nameAr: 'دولة ليبيا' },
          'sd': { name: 'Sudan', nameAr: 'جمهورية السودان' },
          'so': { name: 'Somalia', nameAr: 'جمهورية الصومال' },
          'dj': { name: 'Djibouti', nameAr: 'جمهورية جيبوتي' },
          'km': { name: 'Comoros', nameAr: 'جزر القمر' }
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

// Generate HTML template using the built index.html as base
const generateHTML = async (route) => {
  const { title, description, lang } = route;
  const distDir = path.join(__dirname, '../dist');
  
  // Read the built index.html to get correct script references
  let baseHtml;
  try {
    // Try to read from backup first, then original
    const backupPath = path.join(distDir, 'index.original.html');
    const indexPath = path.join(distDir, 'index.html');
    
    try {
      baseHtml = await fs.readFile(backupPath, 'utf8');
    } catch {
      baseHtml = await fs.readFile(indexPath, 'utf8');
    }
  } catch (error) {
    console.error('Error reading built index.html:', error);
    // Fallback to basic template
    baseHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Egazat</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
  }
  
  // Update the HTML with route-specific content
  const updatedHtml = baseHtml
    .replace(/<html[^>]*>/, `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">`)
    .replace(/<title>.*?<\/title>/, `<title>${title} | Egazat</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta name="keywords"[^>]*>/, `<meta name="keywords" content="arabic holidays, public holidays, arab countries, middle east holidays, islamic holidays, national holidays, ${route.country || ''}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:locale"[^>]*>/, `<meta property="og:locale" content="${lang === 'ar' ? 'ar_SA' : 'en_US'}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${description}" />`)
.replace(/<div id="root"><\/div>/, `<div id="root">
      <noscript>
        <!-- SEO fallback content -->
        <h1>${title}</h1>
        <p>${description}</p>
        <p>Loading content...</p>
      </noscript>
    </div>`);
  
  // Add canonical URL if not present
  if (!updatedHtml.includes('rel="canonical"')) {
    const canonicalTag = `<link rel="canonical" href="https://egazat.com${route.path === '/index.html' ? '/' : route.path}" />`;
    const headCloseIndex = updatedHtml.indexOf('</head>');
    const htmlWithCanonical = updatedHtml.slice(0, headCloseIndex) + 
      '    ' + canonicalTag + '\n  ' + 
      updatedHtml.slice(headCloseIndex);
    return htmlWithCanonical;
  }
  
  return updatedHtml;
};

// Generate all static files
const generateStaticFiles = async () => {
  console.log('🚀 Generating static HTML files for SEO...');
  
  const distDir = path.join(__dirname, '../dist');
  const indexPath = path.join(distDir, 'index.html');
  const backupPath = path.join(distDir, 'index.original.html');
  
  // Backup the original built index.html
  try {
    await fs.copyFile(indexPath, backupPath);
    console.log('📋 Backed up original index.html');
  } catch (error) {
    console.error('⚠️  Could not backup index.html:', error);
  }
  
  const routes = generateRoutes();
  console.log(`📄 Found ${routes.length} routes to generate`);
  
  await createDirectories(routes);
  
  for (const route of routes) {
    const html = await generateHTML(route);
    // For root homepage, generate as dist/index.html directly
    const fileName = route.path === '/index.html' ? 'index.html' : route.path;
    const filePath = path.join(__dirname, '../dist', fileName);
    
    try {
      await fs.writeFile(filePath, html, 'utf8');
      console.log(`✅ Generated: ${fileName}`);
    } catch (error) {
      console.error(`❌ Error generating ${fileName}:`, error);
    }
  }
  
  console.log('🎉 Static HTML generation complete!');
};

// Run the generator
generateStaticFiles().catch(console.error);