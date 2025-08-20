#!/usr/bin/env node

/**
 * Quick Sitemap Test
 * Test the current sitemap generation to verify URLs
 */

import './generate-sitemap.js';

console.log('\n🔍 Running sitemap validation after generation...\n');

// Wait a moment then run validation
setTimeout(async () => {
  const { default: validateScript } = await import('./validate-sitemap.js');
}, 1000);