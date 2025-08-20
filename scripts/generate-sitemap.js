#!/usr/bin/env node

/**
 * Sitemap Generator for SEO
 * Generates XML sitemap with .html routes
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
  const languages = ['en', 'ar'];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  // Add home pages
  languages.forEach(lang => {
    sitemap += `  <url>
    <loc>${baseUrl}/${lang}.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="${lang === 'ar' ? 'ar' : 'en'}" href="${baseUrl}/${lang}.html" />
  </url>
`;
  });
  
  // Add country pages
  languages.forEach(lang => {
    countries.forEach(country => {
      years.forEach(year => {
        sitemap += `  <url>
    <loc>${baseUrl}/${lang}/country/${country}/${year}.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="${lang === 'ar' ? 'ar' : 'en'}" href="${baseUrl}/${lang}/country/${country}/${year}.html" />
  </url>
`;
      });
    });
  });
  
  sitemap += `</urlset>`;
  
  // Write sitemap to dist folder
  const distDir = path.join(__dirname, '../dist');
  await fs.mkdir(distDir, { recursive: true });
  
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  await fs.writeFile(sitemapPath, sitemap, 'utf8');
  
  console.log(`✅ Generated sitemap.xml with ${(sitemap.match(/<url>/g) || []).length} URLs`);
  
  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
  
  const robotsPath = path.join(distDir, 'robots.txt');
  await fs.writeFile(robotsPath, robotsTxt, 'utf8');
  
  console.log('✅ Generated robots.txt');
};

generateSitemap().catch(console.error);