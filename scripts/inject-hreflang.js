#!/usr/bin/env node

/**
 * Post-build hreflang injection script.
 * Ensures every static HTML page has correct reciprocal hreflang tags.
 * x-default always points to the ENGLISH version.
 *
 * Pipeline position: inject-meta → inject-hreflang → canonical-verify
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

function computeHreflang(relPath) {
  // Homepage
  if (relPath === 'index.html') {
    return { ar: `${BASE_URL}/`, en: `${BASE_URL}/en.html` };
  }
  if (relPath === 'en.html') {
    return { ar: `${BASE_URL}/`, en: `${BASE_URL}/en.html` };
  }

  // Eid pages: ar/eid.html, ar/eid/2026.html, en/eid.html, en/eid/2026.html
  const eidMatch = relPath.match(/^(ar|en)\/eid(?:\/(\d{4}))?\.html$/);
  if (eidMatch) {
    const yearPart = eidMatch[2] ? `/${eidMatch[2]}` : '';
    return {
      ar: `${BASE_URL}/ar/eid${yearPart}.html`,
      en: `${BASE_URL}/en/eid${yearPart}.html`
    };
  }

  // Country pages: ar/country/sa/2026.html, en/country/sa/2026.html
  const countryMatch = relPath.match(/^(ar|en)\/country\/([a-z]{2})\/(\d{4})\.html$/);
  if (countryMatch) {
    const [, , code, year] = countryMatch;
    return {
      ar: `${BASE_URL}/ar/country/${code}/${year}.html`,
      en: `${BASE_URL}/en/country/${code}/${year}.html`
    };
  }

  // Sitemap or other pages — no hreflang needed
  return null;
}

async function injectHreflang() {
  console.log('🔗 Injecting hreflang tags into static HTML files...');

  const htmlFiles = await findHtmlFiles(distDir);
  let updated = 0;
  let skipped = 0;

  for (const file of htmlFiles) {
    const rel = path.relative(distDir, file);
    const urls = computeHreflang(rel);

    if (!urls) {
      skipped++;
      continue;
    }

    let html = await fs.readFile(file, 'utf8');

    // Strip existing hreflang tags to prevent duplicates
    html = html.replace(/<link[^>]*rel="alternate"[^>]*hreflang[^>]*>\s*/gi, '');

    // Build hreflang tags
    const tags = [
      `<link rel="alternate" hreflang="ar" href="${urls.ar}" />`,
      `<link rel="alternate" hreflang="en" href="${urls.en}" />`,
      `<link rel="alternate" hreflang="x-default" href="${urls.en}" />`
    ].join('\n    ');

    // Inject before </head>
    html = html.replace('</head>', `    ${tags}\n  </head>`);

    await fs.writeFile(file, html, 'utf8');
    updated++;
  }

  console.log(`✅ Hreflang injection complete — ${updated} files updated, ${skipped} skipped`);
}

injectHreflang().catch(e => { console.error(e); process.exit(1); });
