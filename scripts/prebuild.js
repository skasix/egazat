#!/usr/bin/env node

/**
 * Pre-build script to generate sitemap before Vite build
 * This ensures sitemap.xml is available in public/ before build starts
 */

import './generate-sitemap.js';

console.log('✅ Pre-build complete');
