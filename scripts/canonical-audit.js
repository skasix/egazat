#!/usr/bin/env node

/**
 * Post-build canonical audit script.
 * Checks every generated .html file for correct self-referencing canonical tags.
 * Outputs canonical-audit.txt with PASS/FAIL per file.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '../dist');
const BASE_URL = 'https://egazat.com';

const countries = ['ae','sa','eg','jo','lb','sy','iq','kw','qa','bh','om','ye','ma','tn','dz','ly','sd','so','dj','km'];
const years = [2025, 2026, 2027, 2028];
const languages = ['ar', 'en'];

async function audit() {
  const results = [];
  const filesToCheck = [
    { file: 'index.html', expectedCanonical: `${BASE_URL}/` },
    { file: 'en.html', expectedCanonical: `${BASE_URL}/en.html` },
  ];

  for (const lang of languages) {
    for (const country of countries) {
      for (const year of years) {
        const filePath = `${lang}/country/${country}/${year}.html`;
        filesToCheck.push({
          file: filePath,
          expectedCanonical: `${BASE_URL}/${filePath}`
        });
      }
    }
  }

  for (const { file, expectedCanonical } of filesToCheck) {
    const fullPath = path.join(distDir, file);
    let status, before, after;

    try {
      const html = await fs.readFile(fullPath, 'utf8');
      const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
      
      if (!canonicalMatch) {
        before = 'missing';
        after = 'missing';
        status = 'FAIL';
      } else {
        before = canonicalMatch[1];
        after = canonicalMatch[1];
        
        // Check for duplicate canonical tags
        const allCanonicals = html.match(/<link[^>]*rel="canonical"[^>]*>/gi) || [];
        if (allCanonicals.length > 1) {
          status = 'FAIL';
          after = `${before} (DUPLICATE: ${allCanonicals.length} tags found)`;
        } else if (before === expectedCanonical) {
          status = 'PASS';
        } else {
          status = 'FAIL';
          after = `expected: ${expectedCanonical}`;
        }
      }
    } catch {
      before = 'FILE_NOT_FOUND';
      after = 'FILE_NOT_FOUND';
      status = 'FAIL';
    }

    results.push(`[${status}] /${file} | BEFORE: ${before} | AFTER: ${after}`);
  }

  const passCount = results.filter(r => r.startsWith('[PASS]')).length;
  const failCount = results.filter(r => r.startsWith('[FAIL]')).length;
  
  const report = [
    `Canonical Audit Report — ${new Date().toISOString()}`,
    `Total: ${results.length} | PASS: ${passCount} | FAIL: ${failCount}`,
    '─'.repeat(80),
    ...results,
    '─'.repeat(80),
    failCount === 0 ? '✅ All canonical tags are correct.' : `❌ ${failCount} file(s) have incorrect canonical tags.`
  ].join('\n');

  await fs.writeFile(path.join(__dirname, '../canonical-audit.txt'), report, 'utf8');
  console.log(report);

  if (failCount > 0) {
    process.exit(1);
  }
}

audit().catch(e => { console.error(e); process.exit(1); });
