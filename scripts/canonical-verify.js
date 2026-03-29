#!/usr/bin/env node

/**
 * Build-time verification: ensures every .html file has correct
 * canonical tags, reciprocal hreflang tags, and no violations.
 * Exits with code 1 to halt the build if any violation is found.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const BASE_URL = 'https://egazat.com';

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

function needsHreflang(rel) {
  if (rel === 'index.html' || rel === 'en.html') return true;
  if (/^(ar|en)\/eid/.test(rel)) return true;
  if (/^(ar|en)\/country\//.test(rel)) return true;
  return false;
}

async function verify() {
  const htmlFiles = await findHtmlFiles(distDir);
  const violations = [];
  const auditLines = [];

  for (const file of htmlFiles) {
    const rel = path.relative(distDir, file);
    // Skip backup files
    if (rel === 'index.original.html') continue;

    const html = await fs.readFile(file, 'utf8');

    // Check canonical tags
    const canonicals = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/gi) || [];
    let canonicalUrl = '';

    if (canonicals.length > 1) {
      violations.push(`❌ ${rel} → has ${canonicals.length} canonical tags (should be 1)`);
    }

    if (canonicals.length >= 1) {
      const hrefMatch = canonicals[0].match(/href="([^"]*)"/i);
      canonicalUrl = hrefMatch ? hrefMatch[1] : '';
    }

    // No non-homepage file should have canonical pointing to homepage
    if (rel !== 'index.html' && canonicalUrl === `${BASE_URL}/`) {
      violations.push(`❌ ${rel} → canonical points to homepage: ${canonicalUrl}`);
    }

    // No /en/ page should have canonical pointing to its /ar/ equivalent
    if (rel.startsWith('en/') && canonicalUrl.includes('/ar/')) {
      violations.push(`❌ ${rel} → EN page canonical points to AR page: ${canonicalUrl}`);
    }

    // Hreflang checks for pages that need them
    const hreflangAr = (html.match(/<link[^>]*hreflang="ar"[^>]*href="([^"]*)"[^>]*>/gi) || []).length;
    const hreflangEn = (html.match(/<link[^>]*hreflang="en"[^>]*href="([^"]*)"[^>]*>/gi) || []).length;
    const hreflangXd = (html.match(/<link[^>]*hreflang="x-default"[^>]*href="([^"]*)"[^>]*>/gi) || []).length;

    if (needsHreflang(rel)) {
      if (hreflangAr === 0) violations.push(`❌ ${rel} → missing hreflang="ar" tag`);
      if (hreflangEn === 0) violations.push(`❌ ${rel} → missing hreflang="en" tag`);
      if (hreflangXd === 0) violations.push(`❌ ${rel} → missing hreflang="x-default" tag`);

      // x-default must point to English
      const xdMatch = html.match(/<link[^>]*hreflang="x-default"[^>]*href="([^"]*)"[^>]*>/i);
      if (xdMatch && !xdMatch[1].includes('/en')) {
        // Exception: homepage x-default can point to /en.html
        if (rel !== 'index.html' || xdMatch[1] !== `${BASE_URL}/en.html`) {
          // For ar homepage, x-default should be en.html
          if (rel === 'index.html' && xdMatch[1] === `${BASE_URL}/en.html`) {
            // OK
          } else if (!xdMatch[1].includes('/en/') && !xdMatch[1].includes('/en.html')) {
            violations.push(`❌ ${rel} → x-default points to non-English URL: ${xdMatch[1]}`);
          }
        }
      }
    }

    auditLines.push(`[${violations.length === 0 ? 'PASS' : 'FAIL'}] /${rel} | CANONICAL: ${canonicalUrl} | HREFLANG_AR: ${hreflangAr > 0 ? 'present' : 'missing'} | HREFLANG_EN: ${hreflangEn > 0 ? 'present' : 'missing'} | HREFLANG_XDEFAULT: ${hreflangXd > 0 ? 'present' : 'missing'}`);
  }

  // Write audit file
  const report = [
    `Canonical & Hreflang Audit — ${new Date().toISOString()}`,
    `Total files: ${htmlFiles.length} | Violations: ${violations.length}`,
    '─'.repeat(80),
    ...auditLines,
    '─'.repeat(80),
    violations.length === 0 ? '✅ All verifications passed.' : `❌ ${violations.length} violation(s) found.`
  ].join('\n');

  await fs.writeFile(path.join(__dirname, '../canonical-audit.txt'), report, 'utf8');

  if (violations.length > 0) {
    console.error('\n🚨 CANONICAL/HREFLANG VERIFICATION FAILED:\n');
    violations.forEach(v => console.error(v));
    console.error(`\n${violations.length} violation(s) found. Build halted.\n`);
    process.exit(1);
  }

  console.log(`✅ Canonical & hreflang verification passed — ${htmlFiles.length} files checked, no violations.`);
}

verify().catch(e => { console.error(e); process.exit(1); });
