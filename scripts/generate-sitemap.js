#!/usr/bin/env node

/**
 * Sitemap Generator for SEO
 * Generates XML sitemap with proper canonical URLs
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateSitemap = async () => {
  console.log('🗺️  Generating sitemap.xml...');
  
  const baseUrl = 'https://egazat.com';
  
  const countries = [
    'ae', 'sa', 'eg', 'jo', 'lb', 'sy', 'iq', 'kw', 'qa', 'bh', 'om', 'ye', 
    'ma', 'tn', 'dz', 'ly', 'sd', 'so', 'dj', 'km'
  ];
  const years = [2025, 2026, 2027, 2028];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  // Add Arabic home page (canonical root)
  sitemap += `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en.html" />
  </url>
`;

  // Add alternative Arabic home URLs (for consistency)
  sitemap += `  <url>
    <loc>${baseUrl}/ar.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en.html" />
  </url>
`;

  // Add English home page
  sitemap += `  <url>
    <loc>${baseUrl}/en.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en.html" />
  </url>
`;
  
  // Add country pages for both languages
  countries.forEach(country => {
    years.forEach(year => {
      // Arabic country page
      sitemap += `  <url>
    <loc>${baseUrl}/ar/country/${country}/${year}.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/ar/country/${country}/${year}.html" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/country/${country}/${year}.html" />
  </url>
`;
      
      // English country page
      sitemap += `  <url>
    <loc>${baseUrl}/en/country/${country}/${year}.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/ar/country/${country}/${year}.html" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/country/${country}/${year}.html" />
  </url>
`;

      // Legacy routes for backward compatibility (without language prefix)
      sitemap += `  <url>
    <loc>${baseUrl}/country/${country}/${year}.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/ar/country/${country}/${year}.html" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/country/${country}/${year}.html" />
  </url>
`;
    });
  });
  
  sitemap += `</urlset>`;
  
  // Write sitemap to public folder (for development) and dist folder (for production)
  const publicDir = path.join(__dirname, '../public');
  const distDir = path.join(__dirname, '../dist');
  
  // Ensure directories exist
  await fs.mkdir(publicDir, { recursive: true });
  
  // Write to public location (dist will be created during build)
  const publicSitemapPath = path.join(publicDir, 'sitemap.xml');
  await fs.writeFile(publicSitemapPath, sitemap, 'utf8');
  
  // Also write to dist if it exists
  try {
    await fs.mkdir(distDir, { recursive: true });
    const distSitemapPath = path.join(distDir, 'sitemap.xml');
    await fs.writeFile(distSitemapPath, sitemap, 'utf8');
  } catch (error) {
    // Dist folder may not exist in development
    console.log('Note: dist folder not found, skipping dist sitemap write');
  }
  
  const urlCount = (sitemap.match(/<url>/g) || []).length;
  console.log(`✅ Generated sitemap.xml with ${urlCount} URLs`);
  
  // Enhanced robots.txt with specific instructions
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1

# Allow specific search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Block access to admin or sensitive areas (if any)
User-agent: *
Disallow: /admin/
Disallow: /.htaccess
Disallow: /sw.js
`;
  
  const publicRobotsPath = path.join(publicDir, 'robots.txt');
  await fs.writeFile(publicRobotsPath, robotsTxt, 'utf8');
  
  try {
    const distRobotsPath = path.join(distDir, 'robots.txt');
    await fs.writeFile(distRobotsPath, robotsTxt, 'utf8');
  } catch (error) {
    console.log('Note: dist folder not found, skipping dist robots.txt write');
  }
  
  console.log('✅ Generated robots.txt');
  console.log(`📊 Sitemap Summary:`);
  console.log(`   - Homepage variants: 3 URLs (/, /ar.html, /en.html)`);
  console.log(`   - Country pages (ar): ${countries.length * years.length} URLs`);
  console.log(`   - Country pages (en): ${countries.length * years.length} URLs`);
  console.log(`   - Legacy country pages: ${countries.length * years.length} URLs`);
  console.log(`   - Total URLs: ${urlCount}`);
  console.log(`   - Countries covered: ${countries.length}`);
  console.log(`   - Years covered: ${years.join(', ')}`);
};

generateSitemap().catch(console.error);