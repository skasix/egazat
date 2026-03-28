#!/usr/bin/env node

/**
 * Build-time verification: ensures no non-homepage .html file
 * has a canonical tag pointing to the homepage.
 * Exits with code 1 to halt the build if any violation is found.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');

async function findHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      files.push(full);
    }
  }
  return files;
}

async function verify() {
  const htmlFiles = await findHtmlFiles(distDir);
  const violations = [];

  for (const file of htmlFiles) {
    const rel = path.relative(distDir, file);
    // Skip homepage files
    if (rel === 'index.html' || rel === 'index.original.html') continue;

    const html = await fs.readFile(file, 'utf8');
    const canonicals = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/gi) || [];

    for (const tag of canonicals) {
      const hrefMatch = tag.match(/href="([^"]*)"/i);
      if (hrefMatch && hrefMatch[1] === 'https://egazat.com/') {
        violations.push(`❌ ${rel} → canonical points to homepage: ${hrefMatch[1]}`);
      }
    }

    // Check for duplicate canonical tags
    if (canonicals.length > 1) {
      violations.push(`❌ ${rel} → has ${canonicals.length} canonical tags (should be 1)`);
    }
  }

  if (violations.length > 0) {
    console.error('\n🚨 CANONICAL VERIFICATION FAILED:\n');
    violations.forEach(v => console.error(v));
    console.error(`\n${violations.length} violation(s) found. Build halted.\n`);
    process.exit(1);
  }

  console.log(`✅ Canonical verification passed — ${htmlFiles.length} files checked, no violations.`);
}

verify().catch(e => { console.error(e); process.exit(1); });
