#!/usr/bin/env node

/**
 * Post-build meta tag injection script.
 * Reads countries.json and holidays.json, then injects optimized
 * title, meta description, OG, and Twitter tags into every static HTML file.
 * 
 * Pipeline position: generate-static → inject-meta → canonical-verify
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const distDir = path.join(__dirname, '../dist');
const BASE_URL = 'https://egazat.com';

// Load JSON data files
const countriesData = require('../src/data/countries.json');
const holidaysData = require('../src/data/holidays.json');

const countriesMap = new Map(countriesData.countries.map(c => [c.code, c]));

// ──────────────────────────────────────────────
// Title generation
// ──────────────────────────────────────────────

function generateTitle(countryCode, year) {
  if (!countryCode) {
    // Homepage
    return 'إجازات الدول العربية 2026 — دليل العطل الرسمية | إجازات';
  }

  const country = countriesMap.get(countryCode);
  if (!country) return null;

  const keyword = country.title_keyword;
  const mid = 'العطل الرسمية والأعياد الوطنية';
  let title = `${keyword} ${year} — ${mid} | إجازات`;

  // Truncate middle segment if > 60 chars
  if (title.length > 60) {
    title = `${keyword} ${year} — العطل الرسمية | إجازات`;
  }
  if (title.length > 60) {
    title = `${keyword} ${year} | إجازات`;
  }

  return title;
}

// ──────────────────────────────────────────────
// Meta description generation
// ──────────────────────────────────────────────

function getNextHoliday(countryCode, year) {
  const yearStr = String(year);
  const holidays = holidaysData[countryCode]?.[yearStr];
  if (!holidays || holidays.length === 0) return null;

  const now = new Date();
  // Find next upcoming holiday
  for (const h of holidays) {
    if (new Date(h.date) >= now) {
      return h;
    }
  }
  // If no upcoming, use first holiday of the year
  return holidays[0];
}

function generateDescription(countryCode, year) {
  if (!countryCode) {
    // Homepage
    return 'دليل شامل للعطل الرسمية في جميع الدول العربية — السعودية، مصر، الإمارات، والمغرب وأكثر. تواريخ دقيقة ومحدّثة لعام 2026.';
  }

  const country = countriesMap.get(countryCode);
  if (!country) return '';

  const holiday = getNextHoliday(countryCode, year);
  if (!holiday) {
    return `تعرّف على العطل الرسمية في ${country.short_name_ar} لعام ${year}. تقويم كامل ومحدّث. ابدأ تخطيط إجازاتك الآن.`;
  }

  let desc = `تعرّف على العطل الرسمية في ${country.short_name_ar} لعام ${year}: ${holiday.name_ar} في ${holiday.date_ar}، وجميع الأعياد الوطنية والدينية. تقويم كامل ومحدّث.`;

  // If too long (>155), shorten
  if (desc.length > 155) {
    desc = `تعرّف على العطل الرسمية في ${country.short_name_ar} لعام ${year}: ${holiday.name_ar} في ${holiday.date_ar}. تقويم كامل ومحدّث.`;
  }
  if (desc.length > 155) {
    desc = `العطل الرسمية في ${country.short_name_ar} ${year}: ${holiday.name_ar} في ${holiday.date_ar}. تقويم كامل ومحدّث.`;
  }

  // If too short (<140), append CTA
  if (desc.length < 140) {
    const cta = ' ابدأ تخطيط إجازاتك الآن.';
    if (desc.length + cta.length <= 155) {
      desc += cta;
    }
  }

  return desc;
}

// ──────────────────────────────────────────────
// HTML injection
// ──────────────────────────────────────────────

function replaceMeta(html, name, content) {
  const regex = new RegExp(`<meta\\s+name="${name}"[^>]*>`, 'gi');
  const tag = `<meta name="${name}" content="${escapeAttr(content)}" />`;
  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
  // Insert before </head>
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function replaceProperty(html, property, content) {
  const regex = new RegExp(`<meta\\s+property="${property}"[^>]*>`, 'gi');
  const tag = `<meta property="${property}" content="${escapeAttr(content)}" />`;
  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function injectMeta(filePath, countryCode, year) {
  let html = await fs.readFile(filePath, 'utf8');

  const title = generateTitle(countryCode, year);
  const description = generateDescription(countryCode, year);

  if (!title || !description) {
    return { status: 'SKIP', reason: 'no data' };
  }

  const canonicalUrl = countryCode && year
    ? `${BASE_URL}/ar/country/${countryCode}/${year}.html`
    : `${BASE_URL}/`;

  // 1. Title tag — remove duplicates, set single title
  html = html.replace(/<title>.*?<\/title>/g, '');
  html = html.replace('<head>', `<head>\n    <title>${escapeAttr(title)}</title>`);

  // 2. Meta description
  html = replaceMeta(html, 'description', description);

  // 3. OG tags
  html = replaceProperty(html, 'og:title', title);
  html = replaceProperty(html, 'og:description', description);
  html = replaceProperty(html, 'og:type', 'website');
  html = replaceProperty(html, 'og:url', canonicalUrl);
  html = replaceProperty(html, 'og:locale', 'ar_AR');
  html = replaceProperty(html, 'og:site_name', 'إجازات');

  // 4. Twitter card tags
  html = replaceMeta(html, 'twitter:card', 'summary');
  html = replaceMeta(html, 'twitter:title', title);
  html = replaceMeta(html, 'twitter:description', description);

  // 5. Ensure lang and dir attributes
  if (!/<html[^>]*lang="ar"/.test(html)) {
    html = html.replace(/<html[^>]*>/, '<html lang="ar" dir="rtl">');
  }

  await fs.writeFile(filePath, html, 'utf8');

  return {
    status: 'PASS',
    title,
    descLength: description.length,
    ogPresent: true,
    langDir: true
  };
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main() {
  console.log('🏷️  Injecting optimized meta tags into static HTML files...');

  const auditLines = [];
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  // Process homepage
  const homePath = path.join(distDir, 'index.html');
  try {
    const result = await injectMeta(homePath, null, null);
    auditLines.push(`[${result.status}] /index.html | TITLE: ${result.title} | DESC_LENGTH: ${result.descLength} | OG: present | LANG_DIR: present`);
    updated++;
  } catch (e) {
    auditLines.push(`[FAIL] /index.html | ERROR: ${e.message}`);
    errors++;
  }

  // Process all country/year pages (Arabic only — /ar/country/...)
  const countries = countriesData.countries;
  const years = countriesData.years;

  for (const country of countries) {
    for (const year of years) {
      const relPath = `ar/country/${country.code}/${year}.html`;
      const filePath = path.join(distDir, relPath);

      try {
        await fs.access(filePath);
      } catch {
        auditLines.push(`[SKIP] /${relPath} | FILE_NOT_FOUND`);
        skipped++;
        continue;
      }

      try {
        const result = await injectMeta(filePath, country.code, year);
        if (result.status === 'SKIP') {
          auditLines.push(`[SKIP] /${relPath} | ${result.reason}`);
          skipped++;
        } else {
          auditLines.push(`[${result.status}] /${relPath} | TITLE: ${result.title} | DESC_LENGTH: ${result.descLength} | OG: present | LANG_DIR: present`);
          updated++;
        }
      } catch (e) {
        auditLines.push(`[FAIL] /${relPath} | ERROR: ${e.message}`);
        errors++;
      }
    }
  }

  // Write audit report
  const report = [
    `Meta Injection Audit — ${new Date().toISOString()}`,
    `Updated: ${updated} | Skipped: ${skipped} | Errors: ${errors}`,
    '─'.repeat(80),
    ...auditLines,
    '─'.repeat(80),
    errors === 0 ? '✅ All meta tags injected successfully.' : `❌ ${errors} file(s) had errors.`
  ].join('\n');

  await fs.writeFile(path.join(__dirname, '../meta-audit.txt'), report, 'utf8');
  console.log(report);

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
