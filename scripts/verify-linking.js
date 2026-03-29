#!/usr/bin/env node

/**
 * Comprehensive 6-layer internal linking verification script.
 * Checks cluster nav, bridge links, Eid bidirectional links,
 * year navigation anchors, homepage clusters, and sitemap priorities.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST = path.join(__dirname, '../dist');

// Load countries.json
const countriesJson = JSON.parse(await fs.readFile(path.join(__dirname, '../src/data/countries.json'), 'utf8'));
const clusters = countriesJson.clusters || [];
const countriesMap = {};
for (const c of countriesJson.countries) countriesMap[c.code] = c;

const allCodes = countriesJson.countries.map(c => c.code);
const years = [2026, 2027, 2028];
const languages = ['ar', 'en'];

const bridgeLinksData = {
  eg: ['sa', 'jo', 'ma', 'tn'],
  sa: ['ae', 'eg', 'jo', 'ma']
};

const gulfCodes = new Set(['ae', 'sa', 'kw', 'qa', 'bh', 'om']);

// Helper: check if file exists
async function fileExists(relPath) {
  // Normalize: /index.html -> index.html
  let p = relPath.startsWith('/') ? relPath.slice(1) : relPath;
  try {
    await fs.access(path.join(DIST, p));
    return true;
  } catch { return false; }
}

// Helper: read file
async function readFile(relPath) {
  let p = relPath.startsWith('/') ? relPath.slice(1) : relPath;
  try {
    return await fs.readFile(path.join(DIST, p), 'utf8');
  } catch { return null; }
}

// Find cluster for a country code
function getCluster(code) {
  return clusters.find(cl => cl.countries.includes(code));
}

const report = [];
const summary = { layer1: { pass: 0, total: 0 }, layer2: { pass: 0, total: 0 }, layer3: { pass: 0, total: 0 }, layer4: { pass: 0, total: 0 }, layer5: { pass: 0, total: 0 }, layer6: { pass: 0, total: 0 }, brokenLinks: 0 };

// ─── LAYER 1: Cluster Navigation Bar ───
report.push('=== LAYER 1 — CLUSTER NAVIGATION BAR ===\n');

for (const lang of languages) {
  for (const code of allCodes) {
    for (const year of years) {
      const filePath = `/${lang}/country/${code}/${year}.html`;
      const html = await readFile(filePath);
      summary.layer1.total++;

      if (!html) {
        report.push(`[FAIL] ${filePath}\n  | FILE NOT FOUND\n`);
        continue;
      }

      const cluster = getCluster(code);
      if (!cluster) {
        report.push(`[FAIL] ${filePath}\n  | NO CLUSTER DEFINED for ${code}\n`);
        continue;
      }

      const clusterSize = cluster.countries.length;
      const expectedLinks = clusterSize - 1;

      // Find cluster nav section - look for cluster heading + links to cluster members
      // The static HTML has <h3>ClusterName</h3> followed by pill links
      const clusterHeading = lang === 'ar' ? cluster.name_ar : cluster.name_en;
      const hasClusterSection = html.includes(clusterHeading);

      // Count links to other cluster members
      const clusterLinks = [];
      const brokenClusterLinks = [];
      for (const memberCode of cluster.countries) {
        if (memberCode === code) continue; // current page should not be linked
        const linkHref = `/${lang}/country/${memberCode}/${year}.html`;
        if (html.includes(`href="${linkHref}"`) || html.includes(`href="${linkHref}"`)) {
          clusterLinks.push(linkHref);
          if (!(await fileExists(linkHref))) {
            brokenClusterLinks.push(linkHref);
            summary.brokenLinks++;
          }
        }
      }

      const pass = hasClusterSection && clusterLinks.length === expectedLinks && brokenClusterLinks.length === 0;
      if (pass) summary.layer1.pass++;

      report.push(`[${pass ? 'PASS' : 'FAIL'}] ${filePath}`);
      report.push(`  | CLUSTER: ${cluster.slug}`);
      report.push(`  | LINKS_FOUND: ${clusterLinks.length}`);
      report.push(`  | LINKS_EXPECTED: ${expectedLinks}`);
      report.push(`  | BROKEN_LINKS: ${brokenClusterLinks.length > 0 ? brokenClusterLinks.join(', ') : 'none'}`);
      if (!hasClusterSection) report.push(`  | NOTE: Cluster heading "${clusterHeading}" not found in HTML`);
      report.push('');
    }
  }
}

// ─── LAYER 2: Bridge Links ───
report.push('\n=== LAYER 2 — BRIDGE LINKS ===\n');

for (const lang of languages) {
  for (const code of allCodes) {
    for (const year of years) {
      const filePath = `/${lang}/country/${code}/${year}.html`;
      const html = await readFile(filePath);
      summary.layer2.total++;

      if (!html) {
        report.push(`[FAIL] ${filePath} | FILE NOT FOUND\n`);
        continue;
      }

      const hasBridgeData = bridgeLinksData[code];
      const bridgeTitle = lang === 'ar' ? 'دول عربية أخرى' : 'Other Arab Countries';
      const hasBridgeSection = html.includes(bridgeTitle);

      if (hasBridgeData) {
        // Should have bridge links
        const cluster = getCluster(code);
        // Bridge links that are NOT in the same cluster
        const expectedBridge = hasBridgeData.filter(bc => !cluster?.countries.includes(bc));
        const foundBridge = [];
        const brokenBridge = [];
        for (const bc of expectedBridge) {
          const href = `/${lang}/country/${bc}/${year}.html`;
          if (html.includes(href)) {
            foundBridge.push(href);
            if (!(await fileExists(href))) {
              brokenBridge.push(href);
              summary.brokenLinks++;
            }
          }
        }

        const pass = hasBridgeSection && foundBridge.length === expectedBridge.length && brokenBridge.length === 0;
        if (pass) summary.layer2.pass++;

        report.push(`[${pass ? 'PASS' : 'FAIL'}] ${filePath} | BRIDGE_LINKS: ${foundBridge.length}/${expectedBridge.length} | BROKEN: ${brokenBridge.length > 0 ? brokenBridge.join(', ') : 'none'}`);
      } else {
        // Should NOT have bridge section
        const pass = !hasBridgeSection;
        if (pass) summary.layer2.pass++;
        if (!pass) report.push(`[FAIL] ${filePath} | UNEXPECTED bridge links section found`);
        else report.push(`[PASS] ${filePath} | NO_BRIDGE (correct)`);
      }
    }
  }
}

// ─── LAYER 3: Eid Bidirectional Linking ───
report.push('\n=== LAYER 3 — EID BIDIRECTIONAL LINKING ===\n');

// Load holidaysDB from generate-static (we can't import it, so we use holidays.json)
const holidaysJsonRaw = JSON.parse(await fs.readFile(path.join(__dirname, '../src/data/holidays.json'), 'utf8'));

// Check country pages for Eid links
for (const lang of languages) {
  for (const code of allCodes) {
    for (const year of years) {
      const filePath = `/${lang}/country/${code}/${year}.html`;
      const html = await readFile(filePath);
      summary.layer3.total++;

      if (!html) {
        report.push(`[FAIL] ${filePath} | FILE NOT FOUND`);
        continue;
      }

      // Check if country has Eid holidays for this year
      const hjData = holidaysJsonRaw[code]?.[String(year)] || [];
      const hasEid = hjData.some(h => (h.name_en || '').toLowerCase().includes('eid'));

      // Check for Eid tracker link
      const eidLink = `/${lang}/eid/${year}.html`;
      const hasEidLink = html.includes(eidLink) || html.includes(`/${lang}/eid.html`);

      let pass;
      let status;
      if (hasEid) {
        pass = hasEidLink;
        status = `EID_HOLIDAY_EXISTS: yes | EID_LINK_PRESENT: ${hasEidLink ? 'yes' : 'no'} | LINK_TARGET: ${eidLink}`;
      } else {
        pass = true; // If no eid, we don't require the link (but it's ok if present via static generator which uses holidaysDB)
        status = `EID_HOLIDAY_EXISTS: no | EID_LINK_PRESENT: not-applicable`;
      }

      if (pass) summary.layer3.pass++;
      report.push(`[${pass ? 'PASS' : 'FAIL'}] ${filePath}`);
      report.push(`  | ${status}`);
      report.push('');
    }
  }
}

// Check Eid pages link to all 20 countries
for (const lang of languages) {
  for (const year of years) {
    const eidPath = `/${lang}/eid/${year}.html`;
    const html = await readFile(eidPath);
    summary.layer3.total++;

    if (!html) {
      report.push(`[FAIL] ${eidPath} | FILE NOT FOUND`);
      continue;
    }

    let countryLinksFound = 0;
    const missing = [];
    for (const code of allCodes) {
      // Eid page links to country pages (could be any year)
      const hasLink = html.includes(`/${lang}/country/${code}/`);
      if (hasLink) countryLinksFound++;
      else missing.push(code);
    }

    const pass = countryLinksFound === 20;
    if (pass) summary.layer3.pass++;
    report.push(`[${pass ? 'PASS' : 'FAIL'}] ${eidPath}`);
    report.push(`  | COUNTRY_LINKS: ${countryLinksFound}/20`);
    if (missing.length) report.push(`  | MISSING: ${missing.join(', ')}`);
    report.push('');
  }

  // Also check main eid.html
  const eidMainPath = `/${lang}/eid.html`;
  const html = await readFile(eidMainPath);
  summary.layer3.total++;
  if (html) {
    let found = 0;
    const missing = [];
    for (const code of allCodes) {
      if (html.includes(`/${lang}/country/${code}/`)) found++;
      else missing.push(code);
    }
    const pass = found === 20;
    if (pass) summary.layer3.pass++;
    report.push(`[${pass ? 'PASS' : 'FAIL'}] ${eidMainPath} | COUNTRY_LINKS: ${found}/20${missing.length ? ' | MISSING: ' + missing.join(', ') : ''}`);
  } else {
    report.push(`[FAIL] ${eidMainPath} | FILE NOT FOUND`);
  }
}

// ─── LAYER 4: Year Navigation as Plain Anchors ───
report.push('\n=== LAYER 4 — YEAR NAVIGATION AS PLAIN ANCHORS ===\n');

for (const lang of languages) {
  for (const code of allCodes) {
    for (const year of years) {
      const filePath = `/${lang}/country/${code}/${year}.html`;
      const html = await readFile(filePath);
      summary.layer4.total++;

      if (!html) {
        report.push(`[FAIL] ${filePath} | FILE NOT FOUND`);
        continue;
      }

      // Check for year links as <a href=...>
      const otherYears = years.filter(y => y !== year);
      let yearLinksAsAnchors = 0;
      const brokenYearLinks = [];
      for (const y of otherYears) {
        const href = `/${lang}/country/${code}/${y}.html`;
        const pattern = `href="${href}"`;
        if (html.includes(pattern)) {
          yearLinksAsAnchors++;
          if (!(await fileExists(href))) {
            brokenYearLinks.push(href);
            summary.brokenLinks++;
          }
        }
      }

      // Check current year is NOT linked (should be span.year-active or similar)
      const currentYearLinked = html.includes(`href="/${lang}/country/${code}/${year}.html">${year}</a>`);
      const hasYearActive = html.includes(`class="year-active">${year}</span>`) || html.includes(`year-active">${year}<`);

      const pass = yearLinksAsAnchors === otherYears.length && !currentYearLinked && brokenYearLinks.length === 0;
      if (pass) summary.layer4.pass++;

      report.push(`[${pass ? 'PASS' : 'FAIL'}] ${filePath}`);
      report.push(`  | YEAR_LINKS_AS_ANCHORS: ${yearLinksAsAnchors > 0 ? 'yes' : 'no'}`);
      report.push(`  | YEARS_LINKED: ${yearLinksAsAnchors} (expected: ${otherYears.length})`);
      report.push(`  | CURRENT_YEAR_NOT_LINKED: ${!currentYearLinked ? 'yes' : 'no'}`);
      report.push(`  | BROKEN_YEAR_LINKS: ${brokenYearLinks.length > 0 ? brokenYearLinks.join(', ') : 'none'}`);
      report.push('');
    }
  }
}

// ─── LAYER 5: Homepage Cluster Structure ───
report.push('\n=== LAYER 5 — HOMEPAGE CLUSTER STRUCTURE ===\n');

const homepages = [
  { path: '/index.html', lang: 'ar' },
  { path: '/en.html', lang: 'en' }
];

for (const hp of homepages) {
  const html = await readFile(hp.path);
  summary.layer5.total++;

  if (!html) {
    report.push(`[FAIL] ${hp.path} | FILE NOT FOUND`);
    continue;
  }

  // Count cluster headings
  let clustersFound = 0;
  for (const cl of clusters) {
    const heading = hp.lang === 'ar' ? cl.name_ar : cl.name_en;
    if (html.includes(heading)) clustersFound++;
  }

  // Count country links
  let countryLinksCount = 0;
  const brokenHomeLinks = [];
  for (const code of allCodes) {
    const href = `/${hp.lang}/country/${code}/2026.html`;
    if (html.includes(href)) {
      countryLinksCount++;
      if (!(await fileExists(href))) {
        brokenHomeLinks.push(href);
        summary.brokenLinks++;
      }
    }
  }

  // Eid banner
  const hasEidBanner = html.includes(`/${hp.lang}/eid/`) || html.includes(`/${hp.lang}/eid.html`);

  // Last updated
  const hasLastUpdated = hp.lang === 'ar'
    ? html.includes('آخر تحديث')
    : html.includes('Last updated');

  const pass = clustersFound === 4 && countryLinksCount === 20 && hasEidBanner && hasLastUpdated && brokenHomeLinks.length === 0;
  if (pass) summary.layer5.pass++;

  report.push(`[${pass ? 'PASS' : 'FAIL'}] ${hp.path}`);
  report.push(`  | CLUSTERS_FOUND: ${clustersFound} (expected: 4)`);
  report.push(`  | TOTAL_COUNTRY_LINKS: ${countryLinksCount} (expected: 20)`);
  report.push(`  | EID_BANNER: ${hasEidBanner ? 'present' : 'missing'}`);
  report.push(`  | LAST_UPDATED: ${hasLastUpdated ? 'present' : 'missing'}`);
  report.push(`  | BROKEN_LINKS: ${brokenHomeLinks.length > 0 ? brokenHomeLinks.join(', ') : 'none'}`);
  report.push('');
}

// ─── LAYER 6: Sitemap Priority Values ───
report.push('\n=== LAYER 6 — SITEMAP PRIORITY VALUES ===\n');

// Parse sitemap-index.xml or sitemap.xml
const sitemapPath = path.join(DIST, 'sitemap.xml');
let sitemapXml;
try { sitemapXml = await fs.readFile(sitemapPath, 'utf8'); } catch { sitemapXml = ''; }

summary.layer6.total = 1;

if (!sitemapXml) {
  report.push('[FAIL] sitemap.xml | FILE NOT FOUND');
} else {
  // Parse all <url> entries from all sitemap files
  const urls = [];
  
  const parseSitemapUrls = (xml) => {
    const blocks = xml.split('<url>').slice(1);
    for (const block of blocks) {
      const locMatch = block.match(/<loc>(.*?)<\/loc>/);
      const prioMatch = block.match(/<priority>(.*?)<\/priority>/);
      if (locMatch && prioMatch) {
        urls.push({ loc: locMatch[1], priority: parseFloat(prioMatch[1]) });
      }
    }
  };
  
  parseSitemapUrls(sitemapXml);

  // Also parse per-country sitemaps
  const sitemapFiles = await fs.readdir(DIST);
  const subSitemaps = sitemapFiles.filter(f => f.startsWith('sitemap-') && f.endsWith('.xml') && f !== 'sitemap.xml' && f !== 'sitemap-index.xml');
  
  for (const sf of subSitemaps) {
    const subXml = await fs.readFile(path.join(DIST, sf), 'utf8');
    parseSitemapUrls(subXml);
  }

  const totalUrls = urls.length;
  const validPriorities = new Set([1.0, 0.9, 0.85, 0.80, 0.75, 0.70, 0.60]);
  const invalidPriorities = [];

  let homepagePriorityCorrect = true;
  let eidPriorityCorrect = true;
  let gulfPriorityCorrect = true;

  for (const u of urls) {
    if (!validPriorities.has(u.priority)) {
      invalidPriorities.push(`${u.loc} (${u.priority})`);
    }

    // Homepage check
    if (u.loc.endsWith('egazat.com/') || u.loc.endsWith('/en.html')) {
      if (u.priority !== 1.0) homepagePriorityCorrect = false;
    }

    // Eid check
    if (u.loc.includes('/eid')) {
      if (u.priority !== 0.9) eidPriorityCorrect = false;
    }

    // Gulf current year check
    for (const gc of gulfCodes) {
      if (u.loc.includes(`/country/${gc}/2026.html`)) {
        if (u.priority !== 0.85) gulfPriorityCorrect = false;
      }
    }
  }

  const pass = homepagePriorityCorrect && eidPriorityCorrect && gulfPriorityCorrect && invalidPriorities.length === 0;
  if (pass) summary.layer6.pass++;

  report.push(`[${pass ? 'PASS' : 'FAIL'}] sitemap.xml`);
  report.push(`  | TOTAL_URLS: ${totalUrls}`);
  report.push(`  | HOMEPAGE_PRIORITY_CORRECT: ${homepagePriorityCorrect ? 'yes' : 'no'}`);
  report.push(`  | EID_PRIORITY_CORRECT: ${eidPriorityCorrect ? 'yes' : 'no'}`);
  report.push(`  | GULF_PRIORITY_CORRECT: ${gulfPriorityCorrect ? 'yes' : 'no'}`);
  report.push(`  | INVALID_PRIORITY_VALUES: ${invalidPriorities.length > 0 ? invalidPriorities.join(', ') : 'none'}`);
  report.push('');
}

// ─── SUMMARY ───
const totalChecked = summary.layer1.total + summary.layer2.total + summary.layer3.total + summary.layer4.total + summary.layer5.total + summary.layer6.total;

report.push('\n=== LINKING AUDIT SUMMARY ===\n');
report.push(`Total files checked: ${totalChecked}`);
report.push(`Layer 1 (Cluster nav): ${summary.layer1.pass}/${summary.layer1.total} PASS`);
report.push(`Layer 2 (Bridge links): ${summary.layer2.pass}/${summary.layer2.total} PASS`);
report.push(`Layer 3 (Eid bidirectional): ${summary.layer3.pass}/${summary.layer3.total} PASS`);
report.push(`Layer 4 (Year nav as anchors): ${summary.layer4.pass}/${summary.layer4.total} PASS`);
report.push(`Layer 5 (Homepage clusters): ${summary.layer5.pass}/${summary.layer5.total} PASS`);
report.push(`Layer 6 (Sitemap priorities): ${summary.layer6.pass}/${summary.layer6.total} PASS`);
report.push(`Total broken internal links found: ${summary.brokenLinks}`);
report.push('\n=== END SUMMARY ===');

const totalPass = summary.layer1.pass + summary.layer2.pass + summary.layer3.pass + summary.layer4.pass + summary.layer5.pass + summary.layer6.pass;
const totalTests = totalChecked;

// Write report
const reportText = report.join('\n');
await fs.writeFile(path.join(__dirname, '../linking-audit.txt'), reportText, 'utf8');
console.log(reportText);

// Exit with error if any failures
if (totalPass < totalTests) {
  console.error(`\n❌ Linking audit: ${totalPass}/${totalTests} passed. See linking-audit.txt for details.`);
  process.exit(1);
} else {
  console.log(`\n✅ Linking audit: ALL ${totalTests} checks passed!`);
}
