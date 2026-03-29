#!/usr/bin/env node

/**
 * Post-build meta tag injection script.
 * Reads countries.json and holidays.json, then injects optimized
 * title, meta description, OG, and Twitter tags into every static HTML file.
 * Supports both Arabic (/ar/country/...) and English (/en/country/...) pages.
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

const countriesData = require('../src/data/countries.json');
const holidaysData = require('../src/data/holidays.json');

const countriesMap = new Map(countriesData.countries.map(c => [c.code, c]));

// ──────────────────────────────────────────────
// Date formatting for English
// ──────────────────────────────────────────────

function formatDateEn(dateStr) {
  const d = new Date(dateStr);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ──────────────────────────────────────────────
// Title generation
// ──────────────────────────────────────────────

function generateTitle(countryCode, year, lang = 'ar') {
  if (!countryCode) {
    if (lang === 'en') {
      return 'Arab Public Holidays 2026 — Official Calendar | Egazat';
    }
    return 'إجازات الدول العربية 2026 — دليل العطل الرسمية | إجازات';
  }

  const country = countriesMap.get(countryCode);
  if (!country) return null;

  if (lang === 'en') {
    const keyword = country.title_keyword_en;
    let title = `${keyword} ${year} — Official Dates & Calendar | Egazat`;
    if (title.length > 60) {
      title = `${keyword} ${year} — Official Dates | Egazat`;
    }
    if (title.length > 60) {
      title = `${keyword} ${year} | Egazat`;
    }
    return title;
  }

  const keyword = country.title_keyword;
  const mid = 'العطل الرسمية والأعياد الوطنية';
  let title = `${keyword} ${year} — ${mid} | إجازات`;
  if (title.length > 60) {
    title = `${keyword} ${year} — العطل الرسمية | إجازات`;
  }
  if (title.length > 60) {
    title = `${keyword} ${year} | إجازات`;
  }
  return title;
}

function generateEidTitle(year, lang = 'ar') {
  if (lang === 'en') {
    let t = `Eid Al-Fitr & Eid Al-Adha ${year} Dates — All Arab Countries | Egazat`;
    if (t.length > 60) t = `Eid Al-Fitr & Eid Al-Adha ${year} | Egazat`;
    return t;
  }
  let t = `مواعيد عيد الفطر وعيد الأضحى ${year} — جميع الدول العربية | إجازات`;
  if (t.length > 60) t = `مواعيد عيد الفطر وعيد الأضحى ${year} | إجازات`;
  return t;
}

function generateEidDescription(year, lang = 'ar') {
  if (lang === 'en') {
    return `Eid Al-Fitr and Eid Al-Adha ${year} dates for Saudi Arabia, UAE, Egypt and all Arab countries. Official and expected dates updated by moon sighting.`;
  }
  return `مواعيد عيد الفطر وعيد الأضحى ${year} في السعودية والإمارات ومصر وجميع الدول العربية. تواريخ رسمية ومتوقعة محدّثة.`;
}

// ──────────────────────────────────────────────
// Next holiday lookup
// ──────────────────────────────────────────────

function getNextHoliday(countryCode, year) {
  const yearStr = String(year);
  const holidays = holidaysData[countryCode]?.[yearStr];
  if (!holidays || holidays.length === 0) return null;

  const now = new Date();
  for (const h of holidays) {
    if (new Date(h.date) >= now) return h;
  }
  return holidays[0];
}

// ──────────────────────────────────────────────
// Meta description generation
// ──────────────────────────────────────────────

function generateDescription(countryCode, year, lang = 'ar') {
  if (!countryCode) {
    if (lang === 'en') {
      return 'Complete guide to public holidays across all Arab countries — Saudi Arabia, Egypt, UAE, Morocco and more. Accurate dates for 2026.';
    }
    return 'دليل شامل للعطل الرسمية في جميع الدول العربية — السعودية، مصر، الإمارات، والمغرب وأكثر. تواريخ دقيقة ومحدّثة لعام 2026.';
  }

  const country = countriesMap.get(countryCode);
  if (!country) return '';

  const holiday = getNextHoliday(countryCode, year);

  if (lang === 'en') {
    const name = country.short_name_en;
    if (!holiday) {
      return `Discover all public holidays in ${name} for ${year}. Complete and updated calendar. Plan your time off now.`;
    }
    const dateEn = formatDateEn(holiday.date);
    let desc = `Discover ${name} public holidays for ${year}: ${holiday.name_en} on ${dateEn}, plus all national and religious holidays. Full updated calendar.`;
    if (desc.length > 155) {
      desc = `${name} public holidays ${year}: ${holiday.name_en} on ${dateEn}. Full updated calendar.`;
    }
    if (desc.length < 140) {
      const cta = ' Plan your time off now.';
      if (desc.length + cta.length <= 155) desc += cta;
    }
    return desc;
  }

  // Arabic
  if (!holiday) {
    return `تعرّف على العطل الرسمية في ${country.short_name_ar} لعام ${year}. تقويم كامل ومحدّث. ابدأ تخطيط إجازاتك الآن.`;
  }

  let desc = `تعرّف على العطل الرسمية في ${country.short_name_ar} لعام ${year}: ${holiday.name_ar} في ${holiday.date_ar}، وجميع الأعياد الوطنية والدينية. تقويم كامل ومحدّث.`;
  if (desc.length > 155) {
    desc = `تعرّف على العطل الرسمية في ${country.short_name_ar} لعام ${year}: ${holiday.name_ar} في ${holiday.date_ar}. تقويم كامل ومحدّث.`;
  }
  if (desc.length > 155) {
    desc = `العطل الرسمية في ${country.short_name_ar} ${year}: ${holiday.name_ar} في ${holiday.date_ar}. تقويم كامل ومحدّث.`;
  }
  if (desc.length < 140) {
    const cta = ' ابدأ تخطيط إجازاتك الآن.';
    if (desc.length + cta.length <= 155) desc += cta;
  }
  return desc;
}

// ──────────────────────────────────────────────
// HTML injection helpers
// ──────────────────────────────────────────────

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function replaceMeta(html, name, content) {
  const regex = new RegExp(`<meta\\s+name="${name}"[^>]*>`, 'gi');
  const tag = `<meta name="${name}" content="${escapeAttr(content)}" />`;
  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
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

// ──────────────────────────────────────────────
// Core injection
// ──────────────────────────────────────────────

async function injectMeta(filePath, countryCode, year, lang = 'ar') {
  let html = await fs.readFile(filePath, 'utf8');

  const title = generateTitle(countryCode, year, lang);
  const description = generateDescription(countryCode, year, lang);

  if (!title || !description) {
    return { status: 'SKIP', reason: 'no data' };
  }

  const canonicalUrl = countryCode && year
    ? `${BASE_URL}/${lang}/country/${countryCode}/${year}.html`
    : (lang === 'en' ? `${BASE_URL}/en.html` : `${BASE_URL}/`);

  const locale = lang === 'en' ? 'en_US' : 'ar_AR';
  const siteName = lang === 'en' ? 'Egazat' : 'إجازات';

  // 1. Title
  html = html.replace(/<title>.*?<\/title>/g, '');
  html = html.replace('<head>', `<head>\n    <title>${escapeAttr(title)}</title>`);

  // 2. Meta description
  html = replaceMeta(html, 'description', description);

  // 3. OG tags
  html = replaceProperty(html, 'og:title', title);
  html = replaceProperty(html, 'og:description', description);
  html = replaceProperty(html, 'og:type', 'website');
  html = replaceProperty(html, 'og:url', canonicalUrl);
  html = replaceProperty(html, 'og:locale', locale);
  html = replaceProperty(html, 'og:site_name', siteName);

  // 4. Twitter card
  html = replaceMeta(html, 'twitter:card', 'summary');
  html = replaceMeta(html, 'twitter:title', title);
  html = replaceMeta(html, 'twitter:description', description);

  // 5. lang/dir attributes
  const expectedLang = lang === 'en' ? 'en' : 'ar';
  const expectedDir = lang === 'en' ? 'ltr' : 'rtl';
  if (!new RegExp(`<html[^>]*lang="${expectedLang}"`).test(html)) {
    html = html.replace(/<html[^>]*>/, `<html lang="${expectedLang}" dir="${expectedDir}">`);
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

  // Helper to process a single file
  async function processFile(relPath, countryCode, year, lang) {
    const filePath = path.join(distDir, relPath);
    try {
      await fs.access(filePath);
    } catch {
      auditLines.push(`[SKIP] /${relPath} | FILE_NOT_FOUND`);
      skipped++;
      return;
    }
    try {
      const result = await injectMeta(filePath, countryCode, year, lang);
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

  // Arabic homepage
  await processFile('index.html', null, null, 'ar');

  // English homepage
  await processFile('en.html', null, null, 'en');

  const countries = countriesData.countries;
  const years = countriesData.years;

  // Eid tracker pages
  for (const lang of ['ar', 'en']) {
    await processEidFile(`${lang}/eid.html`, 2026, lang);
    for (const year of years) {
      await processEidFile(`${lang}/eid/${year}.html`, year, lang);
    }
  }

  for (const country of countries) {
    for (const year of years) {
      // Arabic page
      await processFile(`ar/country/${country.code}/${year}.html`, country.code, year, 'ar');
      // English page
      await processFile(`en/country/${country.code}/${year}.html`, country.code, year, 'en');
    }
  }

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
