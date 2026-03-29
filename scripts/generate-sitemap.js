#!/usr/bin/env node

/**
 * Sitemap Generator — produces sitemap-index.xml + per-country sitemaps + main sitemap.xml
 * Updated with priority hierarchy per Layer 6
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://egazat.com';
const countries = [
  'ae', 'sa', 'eg', 'jo', 'lb', 'sy', 'iq', 'kw', 'qa', 'bh', 'om', 'ye',
  'ma', 'tn', 'dz', 'ly', 'sd', 'so', 'dj', 'km'
];
const years = [2026, 2027, 2028];
const eidYears = [2025, 2026, 2027, 2028];
const today = new Date().toISOString().split('T')[0];
const currentYear = new Date().getFullYear();

// Priority hierarchy
const gulfCountries = ['ae', 'sa', 'kw', 'qa', 'bh', 'om'];
const levantCountries = ['jo', 'lb', 'sy', 'iq', 'eg'];
const northAfricaCountries = ['ma', 'tn', 'dz', 'ly'];
const hornAfricaCountries = ['ye', 'sd', 'so', 'dj', 'km'];

const getCountryPriority = (country, year) => {
  const isCurrent = year === currentYear;
  if (!isCurrent) return '0.60';
  if (gulfCountries.includes(country)) return '0.85';
  if (levantCountries.includes(country)) return '0.80';
  if (northAfricaCountries.includes(country)) return '0.75';
  if (hornAfricaCountries.includes(country)) return '0.70';
  return '0.70';
};

const generateCountrySitemap = (country) => {
  const urls = [];
  
  ['ar', 'en'].forEach(lang => {
    years.forEach(year => {
      const isCurrent = year === currentYear;
      const isFuture = year > currentYear;
      const isPast = year < currentYear;
      const priority = getCountryPriority(country, year);
      const changefreq = isCurrent ? 'weekly' : isFuture ? 'monthly' : 'yearly';
      const lastmod = isPast ? `${year}-12-31` : today;

      urls.push(`  <url>
    <loc>${BASE_URL}/${lang}/country/${country}/${year}.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${BASE_URL}/ar/country/${country}/${year}.html" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en/country/${country}/${year}.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/country/${country}/${year}.html" />
  </url>`);
    });
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
};

const generateSitemapIndex = () => {
  const sitemaps = countries.map(country => `  <sitemap>
    <loc>${BASE_URL}/sitemap-${country}.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
${sitemaps}
</sitemapindex>`;
};

const generatePagesSitemap = () => {
  let urls = [];
  
  // Home pages — priority 1.0
  urls.push(`  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${BASE_URL}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en.html" />
  </url>`);
  urls.push(`  <url>
    <loc>${BASE_URL}/en.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${BASE_URL}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en.html" />
  </url>`);

  // Eid tracker pages — priority 0.9
  ['ar', 'en'].forEach(lang => {
    eidYears.forEach(year => {
      const isCurrent = year === currentYear;
      const priority = isCurrent ? '0.9' : '0.7';
      const changefreq = isCurrent ? 'weekly' : 'monthly';
      urls.push(`  <url>
    <loc>${BASE_URL}/${lang}/eid/${year}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${BASE_URL}/ar/eid/${year}.html" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en/eid/${year}.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/eid/${year}.html" />
  </url>`);
    });
  });

  // Sitemap page
  urls.push(`  <url>
    <loc>${BASE_URL}/sitemap.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
};

// Flat sitemap.xml for backward compatibility
const generateFlatSitemap = () => {
  let urls = [];
  
  urls.push(`  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${BASE_URL}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en.html" />
  </url>`);

  urls.push(`  <url>
    <loc>${BASE_URL}/en.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${BASE_URL}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en.html" />
  </url>`);

  // Eid tracker pages — priority 0.9
  ['ar', 'en'].forEach(lang => {
    eidYears.forEach(year => {
      const isCurrent = year === currentYear;
      const priority = isCurrent ? '0.90' : '0.70';
      urls.push(`  <url>
    <loc>${BASE_URL}/${lang}/eid/${year}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${BASE_URL}/ar/eid/${year}.html" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en/eid/${year}.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/eid/${year}.html" />
  </url>`);
    });
  });

  countries.forEach(country => {
    years.forEach(year => {
      const isPast = year < currentYear;
      const lastmod = isPast ? `${year}-12-31` : today;
      const priority = getCountryPriority(country, year);
      const isCurrent = year === currentYear;
      const isFuture = year > currentYear;
      const changefreq = isCurrent ? 'weekly' : isFuture ? 'monthly' : 'yearly';

      ['ar', 'en'].forEach(lang => {
        urls.push(`  <url>
    <loc>${BASE_URL}/${lang}/country/${country}/${year}.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${BASE_URL}/ar/country/${country}/${year}.html" />
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/en/country/${country}/${year}.html" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en/country/${country}/${year}.html" />
  </url>`);
      });
    });
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;
};

const generateSitemap = async () => {
  console.log('🗺️  Generating sitemaps...');
  
  const publicDir = path.join(__dirname, '../public');
  const distDir = path.join(__dirname, '../dist');
  
  await fs.mkdir(publicDir, { recursive: true });

  const writeFile = async (filename, content) => {
    await fs.writeFile(path.join(publicDir, filename), content, 'utf8');
    try {
      await fs.mkdir(distDir, { recursive: true });
      await fs.writeFile(path.join(distDir, filename), content, 'utf8');
    } catch (e) {
      // dist may not exist yet
    }
  };

  await writeFile('sitemap-index.xml', generateSitemapIndex());
  console.log('✅ Generated sitemap-index.xml');

  await writeFile('sitemap-pages.xml', generatePagesSitemap());
  console.log('✅ Generated sitemap-pages.xml');

  for (const country of countries) {
    await writeFile(`sitemap-${country}.xml`, generateCountrySitemap(country));
  }
  console.log(`✅ Generated ${countries.length} country sitemaps`);

  await writeFile('sitemap.xml', generateFlatSitemap());
  
  const totalUrls = 2 + countries.length * years.length * 2;
  console.log(`✅ Generated sitemap.xml with ${totalUrls} URLs`);
  
  console.log(`📊 Sitemap Summary:`);
  console.log(`   - Sitemap index: 1 + ${countries.length} child sitemaps`);
  console.log(`   - Total URLs: ${totalUrls}`);
  console.log(`   - Countries: ${countries.length}`);
  console.log(`   - Years: ${years.join(', ')}`);
  console.log(`   - Priority: Gulf=0.85, Levant+Egypt=0.80, N.Africa=0.75, Horn=0.70, Non-current year=0.60`);
};

generateSitemap().catch(console.error);
