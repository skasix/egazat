#!/usr/bin/env node

/**
 * Quick check of current sitemap structure
 */

console.log('📊 Current Sitemap Structure Check:\n');

const countries = [
  'ae', 'sa', 'eg', 'jo', 'lb', 'sy', 'iq', 'kw', 'qa', 'bh', 'om', 'ye', 
  'ma', 'tn', 'dz', 'ly', 'sd', 'so', 'dj', 'km'
];
const years = [2026, 2027, 2028];

// Calculate expected URLs
let expectedCount = 0;

// Homepage variants (NEW STRUCTURE)
console.log('🏠 Homepage URLs:');
console.log('   - https://egazat.com/ (Arabic homepage - ROOT)');
console.log('   - https://egazat.com/en.html (English homepage)');
expectedCount += 2;

// Country pages
const countryPages = countries.length * years.length * 2; // ar + en
console.log(`\n📍 Country Pages: ${countryPages} total`);
console.log(`   - Arabic: ${countries.length * years.length} pages`);
console.log(`   - English: ${countries.length * years.length} pages`);
expectedCount += countryPages;

// Legacy routes  
const legacyPages = countries.length * years.length;
console.log(`\n🔗 Legacy Routes: ${legacyPages} pages`);
console.log(`   - /country/{code}/{year}.html format`);
expectedCount += legacyPages;

console.log(`\n📈 TOTAL EXPECTED URLs: ${expectedCount}`);
console.log(`\n✅ Changes Made:`);
console.log(`   - Removed /ar.html from sitemap`);
console.log(`   - Root https://egazat.com/ now serves Arabic directly`);
console.log(`   - Total URLs reduced from 243 to ${expectedCount}`);

console.log(`\n🚀 To verify, run:`);
console.log(`   node scripts/generate-sitemap.js && node scripts/validate-sitemap.js`);