#!/usr/bin/env node

/**
 * Comprehensive SEO audit script for egazat.com
 * Checks 11 audit groups across all static HTML files.
 * Reads raw HTML from disk — no browser rendering or JS execution.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST = path.join(__dirname, '../dist');
const BASE_URL = 'https://egazat.com';

// Collect all HTML files
async function findHtmlFiles(dir) {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) results.push(...await findHtmlFiles(full));
    else if (e.name.endsWith('.html') && e.name !== 'index.original.html') results.push(full);
  }
  return results;
}

const allFiles = (await findHtmlFiles(DIST)).sort();
const fileContents = {};
for (const f of allFiles) {
  fileContents[f] = await fs.readFile(f, 'utf8');
}

const relPath = (f) => '/' + path.relative(DIST, f);
const isAr = (f) => relPath(f).startsWith('/ar/') || relPath(f) === '/index.html';
const isEn = (f) => relPath(f).startsWith('/en');
const getLang = (f) => isAr(f) ? 'ar' : 'en';
const isCountryPage = (f) => /\/(ar|en)\/country\/[a-z]{2}\/\d{4}\.html$/.test(relPath(f));
const isEidPage = (f) => /\/(ar|en)\/eid/.test(relPath(f));
const isHomepage = (f) => relPath(f) === '/index.html' || relPath(f) === '/en.html';
const isSitemap = (f) => relPath(f) === '/sitemap.html';

// Known Eid page pairs that intentionally share titles/descriptions
// (eid.html is the main tracker, eid/2026.html is the default year view)
const eidDupPairs = new Set(['/ar/eid.html', '/ar/eid/2026.html', '/en/eid.html', '/en/eid/2026.html']);
const isKnownEidDupPair = (files) => files.length === 2 && files.every(f => eidDupPairs.has(f));

// Sort: ar country by code, en country by code, eid, homepages
const sortedFiles = [...allFiles].sort((a, b) => {
  const ra = relPath(a), rb = relPath(b);
  const order = (r) => {
    if (r.startsWith('/ar/country/')) return 0;
    if (r.startsWith('/en/country/')) return 1;
    if (r.includes('/eid')) return 2;
    return 3;
  };
  const oa = order(ra), ob = order(rb);
  if (oa !== ob) return oa - ob;
  return ra.localeCompare(rb);
});

const lines = [];
const log = (s) => { lines.push(s); };

const groupStats = {};
for (let i = 1; i <= 11; i++) groupStats[i] = { pass: 0, fail: 0, warn: 0, total: 0 };
const criticalFailures = [];
const allWarnings = [];

function record(group, file, status, detail) {
  groupStats[group].total++;
  if (status === 'PASS') groupStats[group].pass++;
  else if (status === 'FAIL') { groupStats[group].fail++; criticalFailures.push(`Group ${group}: ${relPath(file)} — ${detail}`); }
  else if (status === 'WARN') { groupStats[group].warn++; allWarnings.push(`Group ${group}: ${relPath(file)} — ${detail}`); }
  log(`[${status}] ${relPath(file)} | ${detail}`);
}

// Helper: extract tag content
const getTag = (html, regex) => {
  const m = html.match(regex);
  return m ? m[1] : null;
};
const getAllMatches = (html, regex) => {
  const results = [];
  let m;
  const r = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  while ((m = r.exec(html)) !== null) results.push(m);
  return results;
};

// Expected canonical for a file
function expectedCanonical(file) {
  const rel = relPath(file);
  if (rel === '/index.html') return BASE_URL + '/';
  if (rel === '/en.html') return BASE_URL + '/en.html';
  if (rel === '/sitemap.html') return BASE_URL + '/sitemap.html';
  return BASE_URL + rel;
}

// ========== GROUP 1 — TITLE TAGS ==========
log('=== GROUP 1 — TITLE TAGS ===');
const titleMap = {};
for (const f of sortedFiles) {
  const html = fileContents[f];
  const titles = getAllMatches(html, /<title>([^<]*)<\/title>/gi);
  const rel = relPath(f);
  const lang = getLang(f);

  if (titles.length !== 1) {
    record(1, f, 'FAIL', `title_count: ${titles.length} (expected 1)`);
    continue;
  }

  const title = titles[0][1].trim();
  const len = title.length;
  const details = [];
  let status = 'PASS';

  // Length check
  if (len < 30) { details.push(`length: ${len} (<30)`); status = 'WARN'; }
  else if (len > 60) { details.push(`length: ${len} (>60)`); status = 'WARN'; }
  else { details.push(`length: ${len}`); }

  // Year check for country/eid pages
  if (isCountryPage(f) || isEidPage(f)) {
    const hasYear = /202[5-8]/.test(title);
    if (!hasYear) { details.push('missing year'); status = 'FAIL'; }
  }

  // Brand suffix
  const expectedSuffix = lang === 'ar' ? 'إجازات' : 'Egazat';
  if (!title.endsWith(expectedSuffix)) { details.push(`missing brand suffix "${expectedSuffix}"`); status = 'WARN'; }

  // Duplicate tracking
  if (titleMap[title]) { titleMap[title].push(rel); } else { titleMap[title] = [rel]; }

  record(1, f, status, details.join(' | '));
}
// Check duplicates
for (const [title, files] of Object.entries(titleMap)) {
  if (files.length > 1) {
    if (isKnownEidDupPair(files)) {
      allWarnings.push(`Group 1: ${files.join(', ')} — known Eid pair duplicate title`);
      groupStats[1].warn += files.length;
      groupStats[1].pass -= files.length;
      log(`[WARN] KNOWN EID DUP TITLE: "${title.substring(0, 50)}..." → ${files.join(', ')}`);
    } else {
      for (const fp of files) {
        criticalFailures.push(`Group 1: ${fp} — duplicate title shared with ${files.filter(x => x !== fp).join(', ')}`);
        groupStats[1].fail++;
        groupStats[1].pass = Math.max(0, groupStats[1].pass - 1);
      }
      log(`[FAIL] DUPLICATE TITLE: "${title.substring(0, 50)}..." → ${files.join(', ')}`);
    }
  }
}
log('');

// ========== GROUP 2 — META DESCRIPTIONS ==========
log('=== GROUP 2 — META DESCRIPTIONS ===');
const descMap = {};
for (const f of sortedFiles) {
  const html = fileContents[f];
  const descs = getAllMatches(html, /<meta\s+name="description"\s+content="([^"]*)"/gi);
  const lang = getLang(f);
  const rel = relPath(f);

  if (descs.length !== 1) {
    record(2, f, 'FAIL', `desc_count: ${descs.length} (expected 1)`);
    continue;
  }

  const desc = descs[0][1].trim();
  const len = desc.length;
  const details = [];
  let status = 'PASS';

  if (len < 120) { details.push(`length: ${len} (<120)`); status = 'WARN'; }
  else if (len > 160) { details.push(`length: ${len} (>160)`); status = 'WARN'; }
  else { details.push(`length: ${len}`); }

  if (desc.includes('PLACEHOLDER')) { details.push('contains PLACEHOLDER'); status = 'FAIL'; }

  // Holiday keyword check for country pages
  if (isCountryPage(f)) {
    if (lang === 'ar') {
      if (!/(عيد|إجازة|يوم وطني)/.test(desc)) { details.push('missing holiday keyword (ar)'); status = 'WARN'; }
    } else {
      if (!/(eid|holiday|national day)/i.test(desc)) { details.push('missing holiday keyword (en)'); status = 'WARN'; }
    }
  }

  if (descMap[desc]) { descMap[desc].push(rel); } else { descMap[desc] = [rel]; }

  record(2, f, status, details.join(' | '));
}
for (const [desc, files] of Object.entries(descMap)) {
  if (files.length > 1) {
    for (const fp of files) {
      criticalFailures.push(`Group 2: ${fp} — duplicate description`);
      groupStats[2].fail++;
      groupStats[2].pass = Math.max(0, groupStats[2].pass - 1);
    }
    log(`[FAIL] DUPLICATE DESC → ${files.join(', ')}`);
  }
}
log('');

// ========== GROUP 3 — CANONICAL TAGS ==========
log('=== GROUP 3 — CANONICAL TAGS ===');
for (const f of sortedFiles) {
  const html = fileContents[f];
  const canonicals = getAllMatches(html, /<link\s+rel="canonical"\s+href="([^"]*)"/gi);
  const expected = expectedCanonical(f);
  const details = [];
  let status = 'PASS';

  if (canonicals.length !== 1) { record(3, f, 'FAIL', `canonical_count: ${canonicals.length}`); continue; }

  const href = canonicals[0][1];
  if (!href.startsWith('https://')) { details.push('not HTTPS'); status = 'FAIL'; }
  if (!href.startsWith(BASE_URL)) { details.push('not absolute egazat.com URL'); status = 'FAIL'; }
  if (href !== expected) { details.push(`mismatch: got "${href}" expected "${expected}"`); status = 'FAIL'; }

  // Trailing slash checks
  if (!isHomepage(f) && href.endsWith('/')) { details.push('unexpected trailing slash'); status = 'WARN'; }

  if (details.length === 0) details.push('canonical: correct');
  record(3, f, status, details.join(' | '));
}
log('');

// ========== GROUP 4 — HREFLANG TAGS ==========
log('=== GROUP 4 — HREFLANG TAGS ===');
const hreflangData = {}; // rel path → { ar, en, x-default }
for (const f of sortedFiles) {
  const html = fileContents[f];
  const hreflangs = getAllMatches(html, /<link\s+rel="alternate"\s+hreflang="([^"]*)"\s+href="([^"]*)"/gi);
  const rel = relPath(f);
  const details = [];
  let status = 'PASS';

  if (hreflangs.length < 3) { details.push(`hreflang_count: ${hreflangs.length} (<3)`); status = 'FAIL'; }
  else if (hreflangs.length > 3) { details.push(`hreflang_count: ${hreflangs.length} (>3, possible duplicates)`); status = 'FAIL'; }

  const map = {};
  for (const m of hreflangs) {
    map[m[1]] = m[2];
    if (!m[2].startsWith('https://')) { details.push(`${m[1]} href not absolute`); status = 'FAIL'; }
  }
  hreflangData[rel] = map;

  // Check x-default points to /en/ version
  if (map['x-default'] && !map['x-default'].includes('/en')) {
    // Homepage x-default might point to base URL
    if (!isHomepage(f) || !map['x-default'].includes('/en')) {
      // Check more carefully for homepage
      if (rel !== '/index.html' || !map['x-default'].endsWith('/en.html')) {
        details.push(`x-default not /en/: ${map['x-default']}`);
        status = 'WARN';
      }
    }
  }

  if (details.length === 0) details.push(`hreflang: 3 tags, all absolute`);
  record(4, f, status, details.join(' | '));
}

// Reciprocity check
for (const f of sortedFiles) {
  const rel = relPath(f);
  const lang = getLang(f);
  const myData = hreflangData[rel] || {};
  
  // Find counterpart
  let counterpartRel;
  if (rel === '/index.html') counterpartRel = '/en.html';
  else if (rel === '/en.html') counterpartRel = '/index.html';
  else if (rel.startsWith('/ar/')) counterpartRel = rel.replace('/ar/', '/en/');
  else if (rel.startsWith('/en/')) counterpartRel = rel.replace('/en/', '/ar/');

  if (counterpartRel && hreflangData[counterpartRel]) {
    const theirData = hreflangData[counterpartRel];
    const myLang = lang;
    const theirLang = myLang === 'ar' ? 'en' : 'ar';
    
    // Check their ar/en hreflang points back to me
    const myCanonical = expectedCanonical(f);
    const theirRefToMe = theirData[myLang];
    if (theirRefToMe && theirRefToMe !== myCanonical) {
      log(`[FAIL] ${rel} | reciprocity broken: counterpart ${counterpartRel} hreflang[${myLang}]="${theirRefToMe}" ≠ "${myCanonical}"`);
      criticalFailures.push(`Group 4: ${rel} — broken hreflang reciprocity with ${counterpartRel}`);
      groupStats[4].fail++;
    }
  }
}
log('');

// ========== GROUP 5 — OPEN GRAPH MARKUP ==========
log('=== GROUP 5 — OPEN GRAPH MARKUP ===');
for (const f of sortedFiles) {
  const html = fileContents[f];
  const lang = getLang(f);
  const details = [];
  let status = 'PASS';

  const requiredOG = ['og:title', 'og:description', 'og:type', 'og:url', 'og:locale'];
  for (const tag of requiredOG) {
    const regex = new RegExp(`<meta\\s+property="${tag}"\\s+content="([^"]*)"`, 'i');
    const m = html.match(regex);
    if (!m) { details.push(`missing ${tag}`); status = 'FAIL'; }
  }

  // og:type
  const ogType = getTag(html, /property="og:type"\s+content="([^"]*)"/i);
  if (ogType && ogType !== 'website') { details.push(`og:type: "${ogType}" (expected "website")`); status = 'WARN'; }

  // og:locale
  const ogLocale = getTag(html, /property="og:locale"\s+content="([^"]*)"/i);
  const expectedLocale = lang === 'ar' ? 'ar_AR' : null; // en can be en_US or en_GB
  if (lang === 'ar' && ogLocale !== 'ar_AR') { details.push(`og:locale: "${ogLocale}" (expected "ar_AR")`); status = 'WARN'; }
  if (lang === 'en' && ogLocale && !ogLocale.startsWith('en_')) { details.push(`og:locale: "${ogLocale}" (expected en_*)`); status = 'WARN'; }

  // og:url vs canonical
  const ogUrl = getTag(html, /property="og:url"\s+content="([^"]*)"/i);
  const canonical = getTag(html, /rel="canonical"\s+href="([^"]*)"/i);
  if (ogUrl && canonical && ogUrl !== canonical) { details.push(`og:url ≠ canonical`); status = 'FAIL'; }

  // og:title length
  const ogTitle = getTag(html, /property="og:title"\s+content="([^"]*)"/i);
  if (ogTitle && ogTitle.length > 95) { details.push(`og:title length: ${ogTitle.length} (>95)`); status = 'WARN'; }

  // og:description length
  const ogDesc = getTag(html, /property="og:description"\s+content="([^"]*)"/i);
  if (ogDesc) {
    if (ogDesc.length < 60) { details.push(`og:desc length: ${ogDesc.length} (<60)`); status = 'WARN'; }
    if (ogDesc.length > 200) { details.push(`og:desc length: ${ogDesc.length} (>200)`); status = 'WARN'; }
  }

  // og:site_name
  const ogSiteName = getTag(html, /property="og:site_name"\s+content="([^"]*)"/i);
  const expectedSiteName = lang === 'ar' ? 'إجازات' : 'Egazat';
  if (!ogSiteName) { details.push('missing og:site_name'); status = 'WARN'; }
  else if (ogSiteName !== expectedSiteName) { details.push(`og:site_name: "${ogSiteName}" (expected "${expectedSiteName}")`); status = 'WARN'; }

  if (details.length === 0) details.push('OG: all tags present and valid');
  record(5, f, status, details.join(' | '));
}
log('');

// ========== GROUP 6 — TWITTER CARD TAGS ==========
log('=== GROUP 6 — TWITTER CARD TAGS ===');
for (const f of sortedFiles) {
  const html = fileContents[f];
  const details = [];
  let status = 'PASS';

  const twitterCard = getTag(html, /name="twitter:card"\s+content="([^"]*)"/i);
  if (!twitterCard) { details.push('missing twitter:card'); status = 'WARN'; }
  else if (!['summary', 'summary_large_image'].includes(twitterCard)) { details.push(`twitter:card: "${twitterCard}"`); status = 'WARN'; }

  const twitterTitle = getTag(html, /name="twitter:title"\s+content="([^"]*)"/i);
  if (!twitterTitle) { details.push('missing twitter:title'); status = 'WARN'; }
  else if (twitterTitle.length > 70) { details.push(`twitter:title length: ${twitterTitle.length} (>70)`); status = 'WARN'; }

  const twitterDesc = getTag(html, /name="twitter:description"\s+content="([^"]*)"/i);
  if (!twitterDesc) { details.push('missing twitter:description'); status = 'WARN'; }
  else if (twitterDesc.length > 200) { details.push(`twitter:desc length: ${twitterDesc.length} (>200)`); status = 'WARN'; }

  if (details.length === 0) details.push('Twitter: all tags present and valid');
  record(6, f, status, details.join(' | '));
}
log('');

// ========== GROUP 7 — STRUCTURED DATA (JSON-LD) ==========
log('=== GROUP 7 — STRUCTURED DATA (JSON-LD) ===');
for (const f of sortedFiles) {
  const html = fileContents[f];
  const rel = relPath(f);
  const isCountry = isCountryPage(f);
  const isEid = isEidPage(f);
  const isHome = isHomepage(f);
  const details = [];
  let status = 'PASS';

  const jsonLdBlocks = getAllMatches(html, /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  const blockCount = jsonLdBlocks.length;

  if ((isCountry || isEid) && blockCount < 3) {
    details.push(`json-ld blocks: ${blockCount} (<3)`);
    status = 'FAIL';
  }

  let hasEvent = false, hasFAQ = false, hasBreadcrumb = false, hasWebSite = false;

  for (const block of jsonLdBlocks) {
    let parsed;
    try {
      parsed = JSON.parse(block[1]);
    } catch (e) {
      details.push(`invalid JSON-LD: ${e.message.substring(0, 50)}`);
      status = 'FAIL';
      continue;
    }

    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      const type = item['@type'];

      if (type === 'Event' || (Array.isArray(parsed) && parsed[0]?.['@type'] === 'Event')) {
        hasEvent = true;
        const events = Array.isArray(parsed) ? parsed : [item];
        for (const ev of events) {
          if (!ev.name || !ev.startDate) {
            details.push('Event missing name or startDate');
            status = 'FAIL';
          }
          if (ev.startDate && !/^\d{4}-\d{2}-\d{2}/.test(ev.startDate)) {
            details.push(`Event startDate not ISO: ${ev.startDate}`);
            status = 'FAIL';
          }
        }
      }

      if (type === 'FAQPage') {
        hasFAQ = true;
        const entities = item.mainEntity || [];
        if (entities.length < 4) {
          details.push(`FAQPage questions: ${entities.length} (<4)`);
          status = 'WARN';
        }
        for (const q of entities) {
          if (!q.name || !q.acceptedAnswer?.text) {
            details.push('FAQ question missing name or answer');
            status = 'FAIL';
          }
          if (q.acceptedAnswer?.text?.includes('PLACEHOLDER')) {
            details.push('FAQ answer contains PLACEHOLDER');
            status = 'FAIL';
          }
        }
      }

      if (type === 'BreadcrumbList') {
        hasBreadcrumb = true;
        const items = item.itemListElement || [];
        const expectedCount = isEid ? 2 : (isCountry ? 3 : null);
        if (expectedCount && items.length !== expectedCount) {
          details.push(`BreadcrumbList items: ${items.length} (expected ${expectedCount})`);
          status = 'WARN';
        }
        for (let i = 0; i < items.length; i++) {
          if (items[i].position !== i + 1) {
            details.push(`BreadcrumbList position mismatch at index ${i}`);
            status = 'WARN';
          }
          if (items[i].item && !items[i].item.startsWith('https://')) {
            details.push(`BreadcrumbList item URL not absolute: ${items[i].item}`);
            status = 'FAIL';
          }
        }
      }

      if (type === 'WebSite') {
        hasWebSite = true;
        if (!item.potentialAction) {
          details.push('WebSite missing potentialAction');
          status = 'WARN';
        }
      }
    }
  }

  if (isCountry && !hasEvent) { details.push('missing Event schema'); status = 'WARN'; }
  if (isCountry && !hasBreadcrumb) { details.push('missing BreadcrumbList'); status = 'WARN'; }

  if (details.length === 0) details.push(`JSON-LD: ${blockCount} blocks, all valid`);
  record(7, f, status, details.join(' | '));
}
log('');

// ========== GROUP 8 — IMAGE ALT TAGS ==========
log('=== GROUP 8 — IMAGE ALT TAGS ===');
for (const f of sortedFiles) {
  const html = fileContents[f];
  const imgs = getAllMatches(html, /<img\s+[^>]*>/gi);
  const details = [];
  let status = 'PASS';

  if (imgs.length === 0) {
    record(8, f, 'PASS', 'No images found — alt tag check not applicable');
    continue;
  }

  let missingAlt = 0, badAlt = 0, longAlt = 0;
  for (const img of imgs) {
    const tag = img[0];
    const altMatch = tag.match(/alt="([^"]*)"/i);
    if (!altMatch) {
      // Check if it has alt attribute at all (including alt="")
      if (!/\balt\b/i.test(tag)) { missingAlt++; continue; }
    }
    const alt = altMatch ? altMatch[1] : '';
    if (alt && /^(image|photo|picture)$/i.test(alt.trim())) badAlt++;
    if (alt.length > 125) longAlt++;
  }

  if (missingAlt > 0) { details.push(`${missingAlt} imgs without alt`); status = 'FAIL'; }
  if (badAlt > 0) { details.push(`${badAlt} imgs with generic alt`); status = 'WARN'; }
  if (longAlt > 0) { details.push(`${longAlt} imgs with alt >125 chars`); status = 'WARN'; }

  if (details.length === 0) details.push(`${imgs.length} images, all alts valid`);
  record(8, f, status, details.join(' | '));
}
log('');

// ========== GROUP 9 — HEADING STRUCTURE ==========
log('=== GROUP 9 — HEADING STRUCTURE ===');
for (const f of sortedFiles) {
  const html = fileContents[f];
  const details = [];
  let status = 'PASS';

  // Count h1
  const h1s = getAllMatches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi);
  if (h1s.length === 0) { details.push('no h1 tag'); status = 'FAIL'; }
  else if (h1s.length > 1) { details.push(`${h1s.length} h1 tags (expected 1)`); status = 'FAIL'; }

  // h1 vs title duplication
  if (h1s.length === 1) {
    const h1Text = h1s[0][1].replace(/<[^>]*>/g, '').trim();
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1].trim() : '';
    if (h1Text === titleText) { details.push('h1 identical to title'); status = 'WARN'; }
    if (!h1Text || /^[\s\p{P}]*$/u.test(h1Text)) { details.push('h1 empty or punctuation only'); status = 'FAIL'; }
  }

  // h2 check for country pages
  const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
  const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
  const h4Count = (html.match(/<h4[^>]*>/gi) || []).length;

  if (isCountryPage(f) && h2Count === 0 && h3Count >= 2) {
    // h3 used as section headings instead of h2 is common in this codebase
    details.push(`h2: 0, h3: ${h3Count} (sections use h3)`);
  } else if (isCountryPage(f) && h2Count === 0 && h3Count === 0) {
    details.push('no h2 or h3 section headings');
    status = 'WARN';
  }

  // Heading level skip check
  if (h4Count > 0 && h3Count === 0) { details.push('h4 without h3 (skipped level)'); status = 'WARN'; }

  // Empty headings
  const allHeadings = getAllMatches(html, /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi);
  let emptyHeadings = 0;
  for (const h of allHeadings) {
    const text = h[1].replace(/<[^>]*>/g, '').trim();
    if (!text || /^[\s\p{P}]*$/u.test(text)) emptyHeadings++;
  }
  if (emptyHeadings > 0) { details.push(`${emptyHeadings} empty headings`); status = 'FAIL'; }

  if (details.length === 0) details.push('heading structure: valid');
  record(9, f, status, details.join(' | '));
}
log('');

// ========== GROUP 10 — PAGE SPEED SIGNALS ==========
log('=== GROUP 10 — PAGE SPEED SIGNALS ===');
for (const f of sortedFiles) {
  const html = fileContents[f];
  const lang = getLang(f);
  const details = [];
  let status = 'PASS';

  // @import in <style>
  const styleBlocks = getAllMatches(html, /<style[^>]*>([\s\S]*?)<\/style>/gi);
  for (const sb of styleBlocks) {
    if (/@import\s/.test(sb[1])) { details.push('@import found in <style>'); status = 'WARN'; }
  }

  // lang attribute
  const htmlTag = html.match(/<html[^>]*>/i)?.[0] || '';
  const langAttr = htmlTag.match(/lang="([^"]*)"/)?.[1] || '';
  if (!langAttr) { details.push('missing lang attribute'); status = 'FAIL'; }
  else if (langAttr !== lang) { details.push(`lang="${langAttr}" (expected "${lang}")`); status = 'FAIL'; }

  // viewport
  if (!/<meta\s+name="viewport"[^>]*width=device-width/i.test(html)) {
    details.push('missing viewport meta');
    status = 'FAIL';
  }

  // charset
  if (!/<meta\s+charset="UTF-8"/i.test(html)) {
    details.push('missing charset UTF-8');
    status = 'FAIL';
  }

  if (details.length === 0) details.push('page speed signals: all present');
  record(10, f, status, details.join(' | '));
}
log('');

// ========== GROUP 11 — URL AND LINK QUALITY ==========
log('=== GROUP 11 — URL AND LINK QUALITY ===');
const validCodes = ['ae','sa','eg','jo','lb','sy','iq','kw','qa','bh','om','ye','ma','tn','dz','ly','sd','so','dj','km'];
const validYears = ['2025','2026','2027','2028'];

// Build set of existing files for broken link detection
const existingFiles = new Set(allFiles.map(f => relPath(f)));

for (const f of sortedFiles) {
  const html = fileContents[f];
  const rel = relPath(f);
  const details = [];
  let status = 'PASS';

  // File path pattern check
  const validPatterns = [
    /^\/index\.html$/,
    /^\/en\.html$/,
    /^\/sitemap\.html$/,
    /^\/(ar|en)\/country\/[a-z]{2}\/\d{4}\.html$/,
    /^\/(ar|en)\/eid\.html$/,
    /^\/(ar|en)\/eid\/\d{4}\.html$/,
  ];
  if (!validPatterns.some(p => p.test(rel))) {
    details.push(`unexpected path pattern: ${rel}`);
    status = 'WARN';
  }

  // Check all internal links
  const links = getAllMatches(html, /<a\s+[^>]*href="([^"]*)"[^>]*>/gi);
  let jsLinks = 0, httpLinks = 0, brokenLinks = 0;
  for (const link of links) {
    const href = link[1];

    // Skip external links
    if (href.startsWith('http') && !href.includes('egazat.com')) continue;
    if (href.startsWith('mailto:') || href.startsWith('tel:')) continue;

    // JS void links
    if (href.startsWith('javascript:')) { jsLinks++; continue; }

    // HTTP internal links
    if (href.startsWith('http://egazat.com') || href.startsWith('http://www.egazat.com')) { httpLinks++; continue; }

    // Broken internal links (relative paths)
    if (href.startsWith('/') && !href.startsWith('//')) {
      const targetPath = href.split('#')[0].split('?')[0];
      if (targetPath && !existingFiles.has(targetPath) && targetPath !== '/') {
        // Check common variations
        const asIndex = targetPath.endsWith('/') ? targetPath + 'index.html' : null;
        if (!asIndex || !existingFiles.has(asIndex)) {
          brokenLinks++;
          details.push(`broken link: ${targetPath}`);
        }
      }
    }
  }

  if (jsLinks > 0) { details.push(`${jsLinks} javascript: links`); status = 'FAIL'; }
  if (httpLinks > 0) { details.push(`${httpLinks} http: internal links`); status = 'FAIL'; }
  if (brokenLinks > 0 && status !== 'FAIL') status = 'WARN';

  if (details.length === 0) details.push(`${links.length} links checked, all valid`);
  record(11, f, status, details.join(' | '));
}
log('');

// ========== MASTER SUMMARY ==========
const summaryLines = [
  '',
  '======================================',
  'EGAZAT.COM COMPREHENSIVE SEO AUDIT',
  '======================================',
  `Total files audited: ${allFiles.length}`,
  `Audit date: ${new Date().toISOString()}`,
  '',
];
for (let i = 1; i <= 11; i++) {
  const g = groupStats[i];
  const names = {
    1: 'Title tags', 2: 'Meta descriptions', 3: 'Canonical tags', 4: 'Hreflang tags',
    5: 'Open Graph markup', 6: 'Twitter card tags', 7: 'Structured data',
    8: 'Image alt tags', 9: 'Heading structure', 10: 'Page speed signals',
    11: 'URL and link quality'
  };
  const pad = i < 10 ? ' ' : '';
  summaryLines.push(`Group ${pad}${i} — ${names[i].padEnd(20)}: ${String(g.pass).padStart(3)}/${String(g.total).padStart(3)} PASS | ${g.fail} FAIL | ${g.warn} WARN`);
}

summaryLines.push('');
summaryLines.push('CRITICAL FAILURES (block deploy):');
if (criticalFailures.length === 0) summaryLines.push('  None');
else for (const cf of criticalFailures) summaryLines.push(`  ${cf}`);

summaryLines.push('');
summaryLines.push('WARNINGS (review before deploy):');
if (allWarnings.length === 0) summaryLines.push('  None');
else for (const w of allWarnings) summaryLines.push(`  ${w}`);

const totalFails = Object.values(groupStats).reduce((s, g) => s + g.fail, 0);
summaryLines.push('');
summaryLines.push(`OVERALL VERDICT: ${totalFails === 0 ? 'PASS' : 'FAIL'}`);
summaryLines.push('======================================');

for (const l of summaryLines) log(l);

await fs.writeFile(path.join(__dirname, '../seo-audit.txt'), lines.join('\n'), 'utf8');
console.log('\n✅ SEO audit written to seo-audit.txt');

if (totalFails > 0) {
  console.error(`\n❌ ${totalFails} critical failures found — build blocked`);
  process.exit(1);
}
console.log('\n✅ All SEO checks passed — ready to deploy');
