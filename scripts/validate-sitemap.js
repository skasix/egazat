#!/usr/bin/env node

/**
 * Sitemap Validator
 * Validates that all app routes are included in sitemap
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validateSitemap = async () => {
  console.log('🔍 Validating sitemap coverage...');
  
  const countries = [
    'ae', 'sa', 'eg', 'jo', 'lb', 'sy', 'iq', 'kw', 'qa', 'bh', 'om', 'ye', 
    'ma', 'tn', 'dz', 'ly', 'sd', 'so', 'dj', 'km'
  ];
  const years = [2026, 2027, 2028];
  const languages = ['ar', 'en'];
  
  // Expected URLs
  const expectedUrls = new Set();
  
  // Add homepage variants - ROOT SERVES ARABIC DIRECTLY
  expectedUrls.add('https://egazat.com/');          // Arabic homepage (root)
  expectedUrls.add('https://egazat.com/en.html');   // English homepage
  // Note: /ar.html is NO LONGER USED
  
  // Add all country pages
  languages.forEach(lang => {
    countries.forEach(country => {
      years.forEach(year => {
        expectedUrls.add(`https://egazat.com/${lang}/country/${country}/${year}.html`);
      });
    });
  });
  
  // Add legacy routes
  countries.forEach(country => {
    years.forEach(year => {
      expectedUrls.add(`https://egazat.com/country/${country}/${year}.html`);
    });
  });
  
  console.log(`📊 Expected URLs: ${expectedUrls.size} (updated for root Arabic homepage)`);
  console.log(`   - Root homepage: https://egazat.com/ (Arabic)`);
  console.log(`   - English homepage: https://egazat.com/en.html`);
  console.log(`   - Note: /ar.html removed - root serves Arabic directly`);
  
  // Read generated sitemap
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  
  try {
    const sitemapContent = await fs.readFile(sitemapPath, 'utf8');
    
    // Extract URLs from sitemap
    const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
    const sitemapUrls = new Set(
      urlMatches?.map(match => match.replace('<loc>', '').replace('</loc>', '')) || []
    );
    
    console.log(`📊 Sitemap URLs: ${sitemapUrls.size}`);
    
    // Find missing URLs
    const missingUrls = [...expectedUrls].filter(url => !sitemapUrls.has(url));
    const extraUrls = [...sitemapUrls].filter(url => !expectedUrls.has(url));
    
    if (missingUrls.length > 0) {
      console.log('❌ Missing URLs from sitemap:');
      missingUrls.forEach(url => console.log(`   - ${url}`));
    }
    
    if (extraUrls.length > 0) {
      console.log('⚠️  Extra URLs in sitemap:');
      extraUrls.forEach(url => console.log(`   - ${url}`));
    }
    
    if (missingUrls.length === 0 && extraUrls.length === 0) {
      console.log('✅ Sitemap validation passed! All URLs are correctly included.');
    }
    
    // Validate XML structure
    if (sitemapContent.includes('<?xml version="1.0" encoding="UTF-8"?>') &&
        sitemapContent.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"') &&
        sitemapContent.includes('</urlset>')) {
      console.log('✅ XML structure is valid');
    } else {
      console.log('❌ Invalid XML structure');
    }
    
    // Check hreflang attributes
    const hreflangCount = (sitemapContent.match(/hreflang/g) || []).length;
    console.log(`📊 Hreflang attributes: ${hreflangCount}`);
    
    // Summary
    console.log(`\n📈 Sitemap Summary:`);
    console.log(`   - Total expected URLs: ${expectedUrls.size}`);
    console.log(`   - Total sitemap URLs: ${sitemapUrls.size}`);
    console.log(`   - Missing URLs: ${missingUrls.length}`);
    console.log(`   - Extra URLs: ${extraUrls.length}`);
    console.log(`   - Hreflang attributes: ${hreflangCount}`);
    console.log(`   - Homepage structure: / (Arabic root), /en.html (English)`);
    console.log(`   - Countries: ${countries.length}, Years: ${years.length}`);
    
  } catch (error) {
    console.error('❌ Error reading sitemap:', error);
    console.log('💡 Make sure to run the sitemap generator first');
  }
};

validateSitemap().catch(console.error);