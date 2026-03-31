#!/usr/bin/env node

/**
 * Static HTML Generation Script for SEO
 * Generates static HTML files with REAL holiday content embedded in the HTML
 * so that search engine bots can crawl and index all holiday data without JS execution.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://egazat.com';

// Load countries.json for clusters and editorial data
const countriesJsonPath = path.join(__dirname, '../src/data/countries.json');
let countriesJsonData = { countries: [], clusters: [] };
try {
  const raw = await fs.readFile(countriesJsonPath, 'utf8');
  countriesJsonData = JSON.parse(raw);
} catch (e) { console.warn('⚠️ Could not load countries.json:', e.message); }

const clusters = countriesJsonData.clusters || [];
const countriesJsonMap = {};
for (const c of countriesJsonData.countries) {
  countriesJsonMap[c.code] = c;
}

// Bridge links
const bridgeLinks = {
  eg: ['sa', 'jo', 'ma', 'tn'],
  sa: ['ae', 'eg', 'jo', 'ma']
};

// Load holidays.json for descriptions
const holidaysJsonPath = path.join(__dirname, '../src/data/holidays.json');
let holidaysJsonData = {};
try {
  const raw = await fs.readFile(holidaysJsonPath, 'utf8');
  holidaysJsonData = JSON.parse(raw);
} catch (e) { console.warn('⚠️ Could not load holidays.json:', e.message); }

// ──────────────────────────────────────────────
// Complete holiday database (mirrored from CountryPage.tsx)
// ──────────────────────────────────────────────

const countryNames = {
  'ae': { name: 'United Arab Emirates', nameAr: 'دولة الإمارات العربية المتحدة' },
  'sa': { name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية' },
  'eg': { name: 'Egypt', nameAr: 'جمهورية مصر العربية' },
  'jo': { name: 'Jordan', nameAr: 'المملكة الأردنية الهاشمية' },
  'lb': { name: 'Lebanon', nameAr: 'الجمهورية اللبنانية' },
  'sy': { name: 'Syria', nameAr: 'الجمهورية العربية السورية' },
  'iq': { name: 'Iraq', nameAr: 'جمهورية العراق' },
  'kw': { name: 'Kuwait', nameAr: 'دولة الكويت' },
  'qa': { name: 'Qatar', nameAr: 'دولة قطر' },
  'bh': { name: 'Bahrain', nameAr: 'مملكة البحرين' },
  'om': { name: 'Oman', nameAr: 'سلطنة عمان' },
  'ye': { name: 'Yemen', nameAr: 'الجمهورية اليمنية' },
  'ma': { name: 'Morocco', nameAr: 'المملكة المغربية' },
  'tn': { name: 'Tunisia', nameAr: 'الجمهورية التونسية' },
  'dz': { name: 'Algeria', nameAr: 'الجمهورية الجزائرية الديمقراطية الشعبية' },
  'ly': { name: 'Libya', nameAr: 'دولة ليبيا' },
  'sd': { name: 'Sudan', nameAr: 'جمهورية السودان' },
  'so': { name: 'Somalia', nameAr: 'جمهورية الصومال' },
  'dj': { name: 'Djibouti', nameAr: 'جمهورية جيبوتي' },
  'km': { name: 'Comoros', nameAr: 'جزر القمر' }
};

const weekendDays = {
  'ae': ['Saturday', 'Sunday'],
  'sa': ['Friday', 'Saturday'],
  'eg': ['Friday', 'Saturday'],
  'jo': ['Friday', 'Saturday'],
  'lb': ['Saturday', 'Sunday'],
  'sy': ['Friday', 'Saturday'],
  'iq': ['Friday', 'Saturday'],
  'kw': ['Friday', 'Saturday'],
  'qa': ['Friday', 'Saturday'],
  'bh': ['Friday', 'Saturday'],
  'om': ['Friday', 'Saturday'],
  'ye': ['Friday', 'Saturday'],
  'ma': ['Saturday', 'Sunday'],
  'tn': ['Saturday', 'Sunday'],
  'dz': ['Friday', 'Saturday'],
  'ly': ['Friday', 'Saturday'],
  'sd': ['Friday', 'Saturday'],
  'so': ['Friday', 'Saturday'],
  'dj': ['Friday', 'Saturday'],
  'km': ['Saturday', 'Sunday']
};

// Import holidays from the built app module at build time
// Since we can't import TSX directly, we duplicate the holiday data here
// This is the same data from CountryPage.tsx
const holidaysDB = {
  'sa': {
    2026: [
      { name: 'Saudi Founding Day', nameAr: 'يوم التأسيس السعودي', date: '2026-02-22', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 4 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
      { name: 'Saudi National Day', nameAr: 'اليوم الوطني السعودي', date: '2026-09-23', type: 'national' }
    ],
    2027: [
      { name: 'Saudi Founding Day', nameAr: 'يوم التأسيس السعودي', date: '2027-02-22', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 4 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
      { name: 'Saudi National Day', nameAr: 'اليوم الوطني السعودي', date: '2027-09-23', type: 'national' }
    ],
    2028: [
      { name: 'Saudi Founding Day', nameAr: 'يوم التأسيس السعودي', date: '2028-02-22', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 4 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' },
      { name: 'Saudi National Day', nameAr: 'اليوم الوطني السعودي', date: '2028-09-23', type: 'national' }
    ]
  },
  'ae': {
    2026: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 3 },
      { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
      { name: 'UAE National Day', nameAr: 'اليوم الوطني الإماراتي', date: '2026-12-02', type: 'national', duration: 2 }
    ],
    2027: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 3 },
      { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
      { name: 'UAE National Day', nameAr: 'اليوم الوطني الإماراتي', date: '2027-12-02', type: 'national', duration: 2 }
    ],
    2028: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 3 },
      { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' },
      { name: 'UAE National Day', nameAr: 'اليوم الوطني الإماراتي', date: '2028-12-02', type: 'national', duration: 2 }
    ]
  },
  'eg': {
    2026: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
      { name: 'Coptic Christmas', nameAr: 'عيد الميلاد المجيد', date: '2026-01-07', type: 'cultural' },
      { name: '25 January Revolution Day', nameAr: 'ثورة 25 يناير', date: '2026-01-25', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
      { name: 'Sinai Liberation Day', nameAr: 'عيد تحرير سيناء', date: '2026-04-25', type: 'national' },
      { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
      { name: '23 July Revolution Day', nameAr: 'ثورة 23 يوليو', date: '2026-07-23', type: 'national' },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }
    ],
    2027: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
      { name: 'Coptic Christmas', nameAr: 'عيد الميلاد المجيد', date: '2027-01-07', type: 'cultural' },
      { name: '25 January Revolution Day', nameAr: 'ثورة 25 يناير', date: '2027-01-25', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 3 },
      { name: 'Sinai Liberation Day', nameAr: 'عيد تحرير سيناء', date: '2027-04-25', type: 'national' },
      { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
      { name: '23 July Revolution Day', nameAr: 'ثورة 23 يوليو', date: '2027-07-23', type: 'national' },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }
    ],
    2028: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
      { name: 'Coptic Christmas', nameAr: 'عيد الميلاد المجيد', date: '2028-01-07', type: 'cultural' },
      { name: '25 January Revolution Day', nameAr: 'ثورة 25 يناير', date: '2028-01-25', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 3 },
      { name: 'Sinai Liberation Day', nameAr: 'عيد تحرير سيناء', date: '2028-04-25', type: 'national' },
      { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 4 },
      { name: '23 July Revolution Day', nameAr: 'ثورة 23 يوليو', date: '2028-07-23', type: 'national' },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }
    ]
  },
  'jo': {
    2026: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
      { name: "King's Birthday", nameAr: 'عيد ميلاد الملك', date: '2026-01-30', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
      { name: 'Arab League Day', nameAr: 'يوم الجامعة العربية', date: '2026-03-22', type: 'cultural' },
      { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
      { name: 'Independence Day', nameAr: 'يوم الاستقلال', date: '2026-05-25', type: 'national' },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }
    ],
    2027: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
      { name: "King's Birthday", nameAr: 'عيد ميلاد الملك', date: '2027-01-30', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 3 },
      { name: 'Arab League Day', nameAr: 'يوم الجامعة العربية', date: '2027-03-22', type: 'cultural' },
      { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
      { name: 'Independence Day', nameAr: 'يوم الاستقلال', date: '2027-05-25', type: 'national' },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }
    ],
    2028: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
      { name: "King's Birthday", nameAr: 'عيد ميلاد الملك', date: '2028-01-30', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 3 },
      { name: 'Arab League Day', nameAr: 'يوم الجامعة العربية', date: '2028-03-22', type: 'cultural' },
      { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 4 },
      { name: 'Independence Day', nameAr: 'يوم الاستقلال', date: '2028-05-25', type: 'national' },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }
    ]
  },
  'kw': {
    2026: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
      { name: 'National Day', nameAr: 'اليوم الوطني', date: '2026-02-25', type: 'national' },
      { name: 'Liberation Day', nameAr: 'يوم التحرير', date: '2026-02-26', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }
    ],
    2027: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
      { name: 'National Day', nameAr: 'اليوم الوطني', date: '2027-02-25', type: 'national' },
      { name: 'Liberation Day', nameAr: 'يوم التحرير', date: '2027-02-26', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }
    ],
    2028: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
      { name: 'National Day', nameAr: 'اليوم الوطني', date: '2028-02-25', type: 'national' },
      { name: 'Liberation Day', nameAr: 'يوم التحرير', date: '2028-02-26', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }
    ]
  },
  'qa': {
    2026: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
      { name: 'Qatar National Day', nameAr: 'اليوم الوطني القطري', date: '2026-12-18', type: 'national' }
    ],
    2027: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
      { name: 'Qatar National Day', nameAr: 'اليوم الوطني القطري', date: '2027-12-18', type: 'national' }
    ],
    2028: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' },
      { name: 'Qatar National Day', nameAr: 'اليوم الوطني القطري', date: '2028-12-18', type: 'national' }
    ]
  },
  'bh': {
    2026: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 3 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
      { name: 'Bahrain National Day', nameAr: 'اليوم الوطني البحريني', date: '2026-12-16', type: 'national', duration: 2 }
    ],
    2027: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 3 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
      { name: 'Bahrain National Day', nameAr: 'اليوم الوطني البحريني', date: '2027-12-16', type: 'national', duration: 2 }
    ],
    2028: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 3 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' },
      { name: 'Bahrain National Day', nameAr: 'اليوم الوطني البحريني', date: '2028-12-16', type: 'national', duration: 2 }
    ]
  },
  'om': {
    2026: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
      { name: "Sultan's Birthday", nameAr: 'عيد ميلاد السلطان', date: '2026-11-18', type: 'national' },
      { name: 'Oman National Day', nameAr: 'اليوم الوطني العماني', date: '2026-11-19', type: 'national' }
    ],
    2027: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
      { name: "Sultan's Birthday", nameAr: 'عيد ميلاد السلطان', date: '2027-11-18', type: 'national' },
      { name: 'Oman National Day', nameAr: 'اليوم الوطني العماني', date: '2027-11-19', type: 'national' }
    ],
    2028: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 3 },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 4 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' },
      { name: "Sultan's Birthday", nameAr: 'عيد ميلاد السلطان', date: '2028-11-18', type: 'national' },
      { name: 'Oman National Day', nameAr: 'اليوم الوطني العماني', date: '2028-11-19', type: 'national' }
    ]
  },
  'lb': {
    2026: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 2 },
      { name: 'Easter Monday', nameAr: 'اثنين الفصح', date: '2026-04-06', type: 'cultural' },
      { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
      { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-11-22', type: 'national' }
    ],
    2027: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 2 },
      { name: 'Easter Monday', nameAr: 'اثنين الفصح', date: '2027-03-29', type: 'cultural' },
      { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
      { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-11-22', type: 'national' }
    ],
    2028: [
      { name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
      { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 2 },
      { name: 'Easter Monday', nameAr: 'اثنين الفصح', date: '2028-04-17', type: 'cultural' },
      { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
      { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 2 },
      { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' },
      { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-11-22', type: 'national' }
    ]
  },
  'sy': {
    2026: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' }, { name: 'Revolution Day', nameAr: 'يوم الثورة', date: '2026-03-08', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-04-17', type: 'national' }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }],
    2027: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' }, { name: 'Revolution Day', nameAr: 'يوم الثورة', date: '2027-03-08', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 3 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-04-17', type: 'national' }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }],
    2028: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' }, { name: 'Revolution Day', nameAr: 'يوم الثورة', date: '2028-03-08', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 3 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-04-17', type: 'national' }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 4 }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }]
  },
  'iq': {
    2026: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' }, { name: 'Army Day', nameAr: 'يوم الجيش', date: '2026-01-06', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 }, { name: 'Republic Day', nameAr: 'يوم الجمهورية', date: '2026-07-14', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }],
    2027: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' }, { name: 'Army Day', nameAr: 'يوم الجيش', date: '2027-01-06', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 3 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 }, { name: 'Republic Day', nameAr: 'يوم الجمهورية', date: '2027-07-14', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }],
    2028: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' }, { name: 'Army Day', nameAr: 'يوم الجيش', date: '2028-01-06', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 3 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 4 }, { name: 'Republic Day', nameAr: 'يوم الجمهورية', date: '2028-07-14', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }]
  },
  'ye': {
    2026: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' }, { name: 'Unification Day', nameAr: 'عيد الوحدة', date: '2026-05-22', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }, { name: 'Revolution Day', nameAr: 'يوم الثورة', date: '2026-09-26', type: 'national' }, { name: 'Revolution Day (Oct)', nameAr: 'ثورة أكتوبر', date: '2026-10-14', type: 'national' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-11-30', type: 'national' }],
    2027: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 3 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 }, { name: 'Unification Day', nameAr: 'عيد الوحدة', date: '2027-05-22', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }, { name: 'Revolution Day', nameAr: 'يوم الثورة', date: '2027-09-26', type: 'national' }, { name: 'Revolution Day (Oct)', nameAr: 'ثورة أكتوبر', date: '2027-10-14', type: 'national' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-11-30', type: 'national' }],
    2028: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 3 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 4 }, { name: 'Unification Day', nameAr: 'عيد الوحدة', date: '2028-05-22', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }, { name: 'Revolution Day', nameAr: 'يوم الثورة', date: '2028-09-26', type: 'national' }, { name: 'Revolution Day (Oct)', nameAr: 'ثورة أكتوبر', date: '2028-10-14', type: 'national' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-11-30', type: 'national' }]
  },
  'ma': {
    2026: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' }, { name: 'Independence Manifesto Day', nameAr: 'ذكرى تقديم وثيقة الاستقلال', date: '2026-01-11', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 }, { name: 'Throne Day', nameAr: 'عيد العرش', date: '2026-07-30', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-11-18', type: 'national' }],
    2027: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' }, { name: 'Independence Manifesto Day', nameAr: 'ذكرى تقديم وثيقة الاستقلال', date: '2027-01-11', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 }, { name: 'Throne Day', nameAr: 'عيد العرش', date: '2027-07-30', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-11-18', type: 'national' }],
    2028: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' }, { name: 'Independence Manifesto Day', nameAr: 'ذكرى تقديم وثيقة الاستقلال', date: '2028-01-11', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 2 }, { name: 'Throne Day', nameAr: 'عيد العرش', date: '2028-07-30', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-11-18', type: 'national' }]
  },
  'tn': {
    2026: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' }, { name: 'Revolution Day', nameAr: 'عيد الثورة', date: '2026-01-14', type: 'national' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-03-20', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 }, { name: 'Republic Day', nameAr: 'عيد الجمهورية', date: '2026-07-25', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }],
    2027: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' }, { name: 'Revolution Day', nameAr: 'عيد الثورة', date: '2027-01-14', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-03-20', type: 'national' }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 }, { name: 'Republic Day', nameAr: 'عيد الجمهورية', date: '2027-07-25', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }],
    2028: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' }, { name: 'Revolution Day', nameAr: 'عيد الثورة', date: '2028-01-14', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-03-20', type: 'national' }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 2 }, { name: 'Republic Day', nameAr: 'عيد الجمهورية', date: '2028-07-25', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }]
  },
  'dz': {
    2026: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-07-05', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }, { name: 'Revolution Day', nameAr: 'ذكرى اندلاع الثورة', date: '2026-11-01', type: 'national' }],
    2027: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-07-05', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }, { name: 'Revolution Day', nameAr: 'ذكرى اندلاع الثورة', date: '2027-11-01', type: 'national' }],
    2028: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-07-05', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }, { name: 'Revolution Day', nameAr: 'ذكرى اندلاع الثورة', date: '2028-11-01', type: 'national' }]
  },
  'ly': {
    2026: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' }, { name: 'Revolution Day', nameAr: 'ذكرى ثورة فبراير', date: '2026-02-17', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 3 }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-12-24', type: 'national' }],
    2027: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' }, { name: 'Revolution Day', nameAr: 'ذكرى ثورة فبراير', date: '2027-02-17', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 3 }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 3 }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-12-24', type: 'national' }],
    2028: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' }, { name: 'Revolution Day', nameAr: 'ذكرى ثورة فبراير', date: '2028-02-17', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 3 }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 3 }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-12-24', type: 'national' }]
  },
  'sd': {
    2026: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 3 }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }],
    2027: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 3 }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 3 }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }],
    2028: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 3 }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 3 }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }]
  },
  'so': {
    2026: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-07-01', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }],
    2027: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-07-01', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }],
    2028: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-07-01', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }]
  },
  'dj': {
    2026: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-06-27', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }],
    2027: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-06-27', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }],
    2028: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-06-27', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }]
  },
  'km': {
    2026: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-07-06', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }],
    2027: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-09', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-07-06', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }],
    2028: [{ name: "New Year's Day", nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' }, { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-26', type: 'religious', duration: 2 }, { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' }, { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-03', type: 'religious', duration: 2 }, { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-07-06', type: 'national' }, { name: "Prophet's Birthday", nameAr: 'المولد النبوي', date: '2028-08-02', type: 'religious' }]
  }
};

// ──────────────────────────────────────────────
// Schema builders (same as schemaBuilder.ts)
// ──────────────────────────────────────────────

function buildEventSchema(holiday, countryCode, countryName, lang) {
  const endDate = holiday.duration && holiday.duration > 1
    ? new Date(new Date(holiday.date).getTime() + (holiday.duration - 1) * 86400000).toISOString().split('T')[0]
    : holiday.date;

  // Get description from holidays.json, fall back to generic
  const hjData = holidaysJsonData[countryCode]?.[String(new Date(holiday.date).getFullYear())] || [];
  const hjMatch = hjData.find(hj => hj.date === holiday.date);
  let desc = '';
  if (hjMatch) {
    const raw = lang === 'ar' ? hjMatch.description_ar : hjMatch.description_en;
    if (raw && !raw.startsWith('PLACEHOLDER_')) desc = raw;
  }
  if (!desc) {
    desc = lang === 'ar'
      ? `${holiday.nameAr} — عطلة رسمية في ${countryName}`
      : `${holiday.name} — Public Holiday in ${countryName}`;
  }

  // Get government/organizer info from countries.json
  const cJson = countriesJsonMap[countryCode];
  const organizerName = cJson
    ? (lang === 'ar' ? cJson.government_name_ar : `Government of ${cJson.short_name_en || countryName}`)
    : (lang === 'ar' ? `حكومة ${countryName}` : `Government of ${countryName}`);

  return {
    '@context': 'https://schema.org', '@type': 'Event',
    name: lang === 'ar' ? holiday.nameAr : holiday.name,
    startDate: holiday.date, endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    description: desc,
    inLanguage: lang,
    isAccessibleForFree: true,
    location: { '@type': 'Country', name: countryName, address: { '@type': 'PostalAddress', addressCountry: countryCode.toUpperCase() } },
    organizer: {
      '@type': 'GovernmentOrganization',
      name: organizerName,
      url: cJson?.government_url || `${BASE_URL}/${lang}/country/${countryCode}/`
    }
  };
}

function buildItemListSchema(holidays, countryCode, year, countryName, lang) {
  return {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: lang === 'ar' ? `العطل الرسمية في ${countryName} ${year}` : `Public Holidays in ${countryName} ${year}`,
    url: `${BASE_URL}/${lang}/country/${countryCode}/${year}.html`,
    numberOfItems: holidays.length, inLanguage: lang,
    itemListElement: holidays.map((h, i) => ({
      '@type': 'ListItem', position: i + 1,
      name: lang === 'ar' ? h.nameAr : h.name,
      item: { '@type': 'Event', name: lang === 'ar' ? h.nameAr : h.name, startDate: h.date, url: `${BASE_URL}/${lang}/country/${countryCode}/${year}.html` }
    }))
  };
}

function buildBreadcrumbSchema(countryCode, year, countryName, lang) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Egazat', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: countryName, item: `${BASE_URL}/${lang}/country/${countryCode}/` },
      { '@type': 'ListItem', position: 3, name: String(year), item: `${BASE_URL}/${lang}/country/${countryCode}/${year}.html` }
    ]
  };
}

// ──────────────────────────────────────────────
// HTML Content Generators
// ──────────────────────────────────────────────

function generateHolidayTableHTML(holidays, lang, countryName, year, countryCode) {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  
  const typeLabel = (type) => {
    if (isAr) return type === 'religious' ? 'ديني' : type === 'national' ? 'وطني' : 'ثقافي';
    return type === 'religious' ? 'Religious' : type === 'national' ? 'National' : 'Cultural';
  };

  const rows = holidays.map(h => {
    const d = new Date(h.date);
    const dateStr = d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const durationStr = h.duration && h.duration > 1
      ? (isAr ? ` (${h.duration} أيام)` : ` (${h.duration} days)`)
      : '';
    return `        <tr>
          <td>${h.date}</td>
          <td>${dateStr}</td>
          <td>${isAr ? h.nameAr : h.name}${durationStr}</td>
          <td>${typeLabel(h.type)}</td>
        </tr>`;
  }).join('\n');

  const wkd = weekendDays[countryCode] || ['Friday', 'Saturday'];

  // --- SECTION A: Holiday Summary ---
  const total = holidays.length;
  const nationalCount = holidays.filter(h => h.type === 'national').length;
  const religiousCount = holidays.filter(h => h.type === 'religious').length;
  const summaryBlock = `
      <section style="margin-top:2rem">
        <h3>${isAr ? `ملخص العطل الرسمية ${year}` : `${year} Holiday Summary`}</h3>
        <div style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:1.25rem">
          <p><strong>${isAr ? 'إجمالي العطل الرسمية:' : 'Total public holidays:'}</strong> ${total}</p>
          <p>${isAr ? 'عطل وطنية:' : 'National holidays:'} ${nationalCount}</p>
          <p>${isAr ? 'عطل دينية:' : 'Religious holidays:'} ${religiousCount}</p>
          <p>${isAr ? 'أيام العطلة الأسبوعية:' : 'Weekend days:'} ${wkd.join(' & ')}</p>
        </div>
      </section>`;

  // --- SECTION B: Editorial About ---
  const cJson = countriesJsonMap[countryCode];
  let editorialBlock = '';
  if (cJson?.editorial) {
    const text = isAr ? cJson.editorial.about_ar : cJson.editorial.about_en;
    const shortName = isAr ? cJson.short_name_ar : cJson.short_name_en;
    editorialBlock = `
      <section style="margin-top:2rem">
        <h3>${isAr ? `عن العطل الرسمية في ${shortName}` : `About Public Holidays in ${shortName}`}</h3>
        <p>${text}</p>
      </section>`;
  }

  // --- SECTION C: Practical Information ---
  let practicalBlock = '';
  if (cJson?.practical) {
    const items = isAr ? cJson.practical.items_ar : cJson.practical.items_en;
    const listItems = items.map(item => `<li>${item}</li>`).join('\n');
    practicalBlock = `
      <section style="margin-top:2rem">
        <h3>${isAr ? 'معلومات عملية للمقيمين والزوار' : 'Practical Information for Residents and Visitors'}</h3>
        <ul>${listItems}</ul>
      </section>`;
  }

  // --- SECTION D: Holiday Details with Eid contextual links ---
  const hjData = holidaysJsonData[countryCode]?.[String(year)] || [];
  const detailCards = holidays.map(h => {
    const d = new Date(h.date);
    const dateStr = d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const dayStr = d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'long' });
    const duration = h.duration || 1;
    const durationText = isAr ? `${duration} ${duration === 1 ? 'يوم' : 'أيام'}` : `${duration} ${duration === 1 ? 'day' : 'days'}`;
    
    const hjMatch = hjData.find(hj => hj.date === h.date);
    const rawDesc = hjMatch ? (isAr ? hjMatch.description_ar : hjMatch.description_en) || '' : '';
    let desc = rawDesc.startsWith('PLACEHOLDER_') ? '' : rawDesc;
    
    const nameEn = (h.name || '').toLowerCase();
    if (nameEn.includes('eid') && h.type === 'religious') {
      desc += isAr
        ? ` راجع <a href="/${lang}/eid/${year}.html">صفحة مواعيد العيد لجميع الدول العربية</a> للاطلاع على تواريخ العيد في سائر الدول.`
        : ` See our <a href="/${lang}/eid/${year}.html">Eid dates for all Arab countries</a> for dates across the region.`;
    }

    return `<div style="margin-top:1rem;padding:0.75rem;background:#fafafa;border-radius:4px">
        <strong>${isAr ? h.nameAr : h.name}</strong> <span style="font-size:0.75rem;padding:0.1rem 0.5rem;border-radius:4px;background:${h.type === 'religious' ? '#fff3e0' : '#e6f4ea'};color:${h.type === 'religious' ? '#b45309' : '#2d6a4f'}">${typeLabel(h.type)}</span>
        <div style="font-size:0.875rem;color:#555">${dateStr} • ${dayStr} • ${durationText}</div>
        ${desc ? `<p>${desc}</p>` : ''}
      </div>`;
  }).join('\n');

  const detailsBlock = `
      <section style="margin-top:2rem">
        <details style="border:1px solid #e0e0e0;border-radius:6px;padding:0.75rem">
          <summary style="font-weight:600;cursor:pointer">${isAr ? `تفاصيل العطل الرسمية ${year}` : `Public Holiday Details ${year}`}</summary>
          ${detailCards}
        </details>
      </section>`;

  // --- CLUSTER NAVIGATION ---
  const cluster = clusters.find(cl => cl.countries.includes(countryCode));
  let clusterNav = '';
  if (cluster) {
    const links = cluster.countries.map(code => {
      const c = countriesJsonMap[code];
      if (!c) return '';
      const name = isAr ? c.short_name_ar : c.short_name_en;
      if (code === countryCode) {
        return `<span style="display:inline-block;background:#2c5282;color:#fff;border-radius:20px;padding:0.4rem 1rem;font-weight:700;text-decoration:underline;margin:0.25rem">${name}</span>`;
      }
      return `<a href="/${lang}/country/${code}/${year}.html" style="display:inline-block;background:#f0f4ff;border-radius:20px;padding:0.4rem 1rem;text-decoration:none;color:#2c5282;margin:0.25rem">${name}</a>`;
    }).join('\n');

    clusterNav = `
      <section style="margin-top:2rem">
        <h3>${isAr ? cluster.name_ar : cluster.name_en}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.25rem">${links}</div>
      </section>`;
  }

  // --- BRIDGE LINKS (SA and EG only) ---
  let bridgeBlock = '';
  const bLinks = bridgeLinks[countryCode];
  if (bLinks && cluster) {
    const bCountries = bLinks.filter(code => !cluster.countries.includes(code));
    if (bCountries.length > 0) {
      const bPills = bCountries.map(code => {
        const c = countriesJsonMap[code];
        if (!c) return '';
        const name = isAr ? c.short_name_ar : c.short_name_en;
        return `<a href="/${lang}/country/${code}/${year}.html" style="display:inline-block;background:#f0f4ff;border-radius:20px;padding:0.3rem 0.9rem;text-decoration:none;color:#2c5282;margin:0.25rem">${name} ${year}</a>`;
      }).join('\n');
      bridgeBlock = `
      <section style="margin-top:1rem">
        <h4>${isAr ? 'دول عربية أخرى' : 'Other Arab Countries'}</h4>
        <div style="display:flex;flex-wrap:wrap;gap:0.25rem">${bPills}</div>
      </section>`;
    }
  }

  return `
    <article dir="${dir}" lang="${lang}" itemscope itemtype="https://schema.org/WebPage">
      <header>
        <h1 itemprop="name">${isAr ? `العطل الرسمية في ${countryName} ${year}` : `${countryName} Public Holidays ${year}`}</h1>
        <p itemprop="description">${isAr
          ? `دليل العطل الرسمية في ${countryName} ${year} — مواعيد عيد الفطر والأضحى والأعياد الوطنية.`
          : `${countryName} ${year} public holidays — Eid al-Fitr, Eid al-Adha dates & national days.`}</p>
        <p>${isAr ? 'أيام العطل الأسبوعية:' : 'Weekend Days:'} ${wkd.join(' & ')}</p>
      </header>
      <table aria-label="${isAr ? `العطل الرسمية في ${countryName} ${year}` : `Public Holidays in ${countryName} ${year}`}">
        <thead>
          <tr>
            <th scope="col">${isAr ? 'التاريخ' : 'Date'}</th>
            <th scope="col">${isAr ? 'اليوم' : 'Day'}</th>
            <th scope="col">${isAr ? 'العطلة' : 'Holiday'}</th>
            <th scope="col">${isAr ? 'النوع' : 'Type'}</th>
          </tr>
        </thead>
        <tbody>
${rows}
        </tbody>
      </table>
      ${summaryBlock}
      ${editorialBlock}
      ${practicalBlock}
      ${detailsBlock}
      ${clusterNav}
      ${bridgeBlock}
      <footer>
        <p>${isAr
          ? 'ملاحظة: تواريخ العطل الدينية قد تختلف حسب رؤية الهلال وقد تتغير بيوم واحد.'
          : 'Note: Religious holiday dates may vary based on moon sighting and could change by one day.'}</p>
        <nav aria-label="${isAr ? 'روابط سنوات أخرى' : 'Other years'}">
          ${[2026, 2027, 2028].map(y =>
            y === year
              ? `<span class="year-active">${y}</span>`
              : `<a href="/${lang}/country/${countryCode}/${y}.html">${y}</a>`
          ).join(' | ')}
        </nav>
      </footer>
    </article>`;
}

function generateHomepageHTML(lang) {
  const isAr = lang === 'ar';
  const currentYear = new Date().getFullYear();

  // Eid banner
  const eidBanner = `<a href="/${lang}/eid/2026.html" style="display:block;text-align:center;padding:1rem;background:#f0f4ff;border-radius:8px;margin-bottom:2rem;text-decoration:none;color:#2c5282;font-weight:600">${isAr ? '🌙 مواعيد عيد الفطر وعيد الأضحى 2026 — جميع الدول العربية' : '🌙 Eid Al-Fitr & Eid Al-Adha 2026 Dates — All Arab Countries'}</a>`;

  // Build clustered sections
  const clusterSections = clusters.map(cluster => {
    const heading = isAr ? cluster.name_ar : cluster.name_en;
    const links = cluster.countries.map(code => {
      const c = countriesJsonMap[code];
      if (!c) return '';
      const name = isAr ? c.short_name_ar : c.short_name_en;
      return `<li><a href="/${lang}/country/${code}/2026.html">${name}</a></li>`;
    }).join('\n');
    return `<section><h3>${heading}</h3><ul>${links}</ul></section>`;
  }).join('\n');

  return `
    <article dir="${isAr ? 'rtl' : 'ltr'}" lang="${lang}">
      <h1>${isAr ? 'العطل الرسمية العربية' : 'Arabic Public Holidays'}</h1>
      <p>${isAr
        ? 'دليل شامل للعطل والمناسبات الرسمية في جميع الدول العربية. تقويم كامل للعطل الرسمية والإجازات الوطنية.'
        : 'Complete guide to public holidays and official celebrations in all Arab countries.'}</p>
      <p>${isAr ? `آخر تحديث: ${currentYear}` : `Last updated: ${currentYear}`}</p>
      ${eidBanner}
      <h2>${isAr ? 'اختر دولة' : 'Select a Country'}</h2>
      ${clusterSections}
    </article>`;
}

// ──────────────────────────────────────────────
// Sitemap Page HTML Generation
// ──────────────────────────────────────────────

function generateSitemapPageHTML() {
  const countries = Object.entries(countryNames);
  const years = [2026, 2027, 2028];

  let countryBlocks = countries.map(([code, cn]) => {
    const arLinks = years.map(y => `<li><a href="/ar/country/${code}/${y}.html">العطل الرسمية ${y}</a></li>`).join('');
    const enLinks = years.map(y => `<li><a href="/en/country/${code}/${y}.html">Public Holidays ${y}</a></li>`).join('');
    return `<div>
      <h3>${cn.nameAr}</h3>
      <h4>الصفحات العربية</h4><ul>${arLinks}</ul>
      <h4>English Pages</h4><ul>${enLinks}</ul>
    </div>`;
  }).join('\n');

  return `<main>
    <h1>خريطة الموقع</h1>
    <section>
      <h2>الصفحة الرئيسية</h2>
      <ul>
        <li><a href="/">الصفحة الرئيسية (عربي)</a></li>
        <li><a href="/en.html">Homepage (English)</a></li>
      </ul>
    </section>
    <section>
      <h2>صفحات الدول</h2>
      ${countryBlocks}
    </section>
    <section>
      <p>📍 ${countries.length} دولة عربية</p>
      <p>📅 ${years.length} سنوات (${years.join(', ')})</p>
      <p>🌐 لغتين (العربية والإنجليزية)</p>
      <p>📄 إجمالي الصفحات: ${countries.length * years.length * 2 + 2}</p>
    </section>
  </main>`;
}

// ──────────────────────────────────────────────
// Route Generation
// ──────────────────────────────────────────────

const generateEidPageHTML = (year, lang) => {
  const isAr = lang === 'ar';
  const countries = Object.entries(countryNames);

  const findEid = (countryCode, eidType) => {
    const holidays = holidaysDB[countryCode]?.[year] || [];
    return holidays.find(h => h.name.toLowerCase().includes(eidType));
  };

  const buildTable = (eidType, title) => {
    const rows = countries.map(([code, cn]) => {
      const h = findEid(code, eidType);
      if (!h) return '';
      const d = new Date(h.date);
      const dateStr = d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const dayStr = d.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'long' });
      const name = isAr ? cn.nameAr : cn.name;
      const duration = h.duration || 1;
      return `<tr><td>${name}</td><td>${dateStr}</td><td>${duration} ${isAr ? 'أيام' : duration === 1 ? 'day' : 'days'}</td><td>${dayStr}</td><td>${isAr ? 'متوقع' : 'Expected'}</td></tr>`;
    }).filter(Boolean).join('\n');

    return `<section><h2>${title}</h2><table><thead><tr><th>${isAr ? 'الدولة' : 'Country'}</th><th>${isAr ? 'التاريخ' : 'Holiday Date'}</th><th>${isAr ? 'المدة' : 'Duration'}</th><th>${isAr ? 'اليوم' : 'Day of Week'}</th><th>${isAr ? 'الحالة' : 'Status'}</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  };

  const fitrTable = buildTable('fitr', isAr ? `عيد الفطر ${year}` : `Eid Al-Fitr ${year}`);
  const adhaTable = buildTable('adha', isAr ? `عيد الأضحى ${year}` : `Eid Al-Adha ${year}`);

  const yearLinks = [2025, 2026, 2027, 2028].map(y =>
    `<a href="${BASE_URL}/${lang}/eid/${y}.html">${y}</a>`
  ).join(' | ');

  const countryLinks = countries.map(([code, cn]) =>
    `<li><a href="${BASE_URL}/${lang}/country/${code}/2026.html">${isAr ? cn.nameAr : cn.name}</a></li>`
  ).join('\n');

  return `
    <article dir="${isAr ? 'rtl' : 'ltr'}" lang="${lang}">
      <h1>${isAr ? `مواعيد عيد الفطر وعيد الأضحى ${year} في الدول العربية` : `Eid Al-Fitr & Eid Al-Adha ${year} Dates in Arab Countries`}</h1>
      <p>${isAr
        ? 'تُحدد مواعيد عيد الفطر وعيد الأضحى وفقاً للتقويم الهجري القمري. تعتمد التواريخ الدقيقة على رؤية الهلال، وقد تختلف بيوم واحد بين الدول.'
        : 'Eid Al-Fitr and Eid Al-Adha dates are determined by the Islamic lunar calendar. Exact dates depend on moon sighting confirmation (hilal), and may differ by one day between countries.'}</p>
      ${fitrTable}
      ${adhaTable}
      <nav>${yearLinks}</nav>
      <section><h2>${isAr ? 'صفحات الدول' : 'Country Pages'}</h2><ul>${countryLinks}</ul></section>
    </article>`;
};

// ──────────────────────────────────────────────
// FAQPage Schema Builder
// ──────────────────────────────────────────────

function buildFAQSchema(countryCode, year, countryName, lang, holidays) {
  const isAr = lang === 'ar';
  const wkd = weekendDays[countryCode] || ['Friday', 'Saturday'];
  const total = holidays.length;
  const nationalCount = holidays.filter(h => h.type === 'national').length;
  const religiousCount = holidays.filter(h => h.type === 'religious').length;

  const eidFitr = holidays.find(h => h.name.toLowerCase().includes('fitr'));
  const eidAdha = holidays.find(h => h.name.toLowerCase().includes('adha'));

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isAr) return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const faqs = [];

  faqs.push({
    '@type': 'Question',
    name: isAr ? `كم عدد العطل الرسمية في ${countryName} ${year}؟` : `How many public holidays does ${countryName} have in ${year}?`,
    acceptedAnswer: {
      '@type': 'Answer',
      text: isAr
        ? `${countryName} لديها ${total} عطلة رسمية في ${year}، منها ${nationalCount} عطلة وطنية و${religiousCount} عطلة دينية.`
        : `${countryName} has ${total} public holidays in ${year}, including ${nationalCount} national holidays and ${religiousCount} religious holidays.`
    }
  });

  if (eidFitr) {
    faqs.push({
      '@type': 'Question',
      name: isAr ? `متى عيد الفطر ${year} في ${countryName}؟` : `When is Eid Al-Fitr ${year} in ${countryName}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isAr
          ? `عيد الفطر ${year} في ${countryName} متوقع في ${formatDate(eidFitr.date)}. قد يتغير التاريخ بيوم واحد حسب رؤية الهلال.`
          : `Eid Al-Fitr ${year} in ${countryName} is expected on ${formatDate(eidFitr.date)}. The date may shift by one day subject to moon sighting confirmation.`
      }
    });
  }

  if (eidAdha) {
    faqs.push({
      '@type': 'Question',
      name: isAr ? `متى عيد الأضحى ${year} في ${countryName}؟` : `When is Eid Al-Adha ${year} in ${countryName}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isAr
          ? `عيد الأضحى ${year} في ${countryName} متوقع في ${formatDate(eidAdha.date)}. قد يتغير التاريخ بيوم واحد حسب رؤية الهلال.`
          : `Eid Al-Adha ${year} in ${countryName} is expected on ${formatDate(eidAdha.date)}. The date may shift by one day subject to moon sighting confirmation.`
      }
    });
  }

  faqs.push({
    '@type': 'Question',
    name: isAr ? `ما هي أيام عطلة نهاية الأسبوع في ${countryName}؟` : `What are the weekend days in ${countryName}?`,
    acceptedAnswer: {
      '@type': 'Answer',
      text: isAr
        ? `أيام العطلة الأسبوعية الرسمية في ${countryName} هي ${wkd.join(' و ')}.`
        : `The official weekend days in ${countryName} are ${wkd.join(' and ')}.`
    }
  });

  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs };
}

// ──────────────────────────────────────────────
// Route Generation
// ──────────────────────────────────────────────

const generateRoutes = () => {
  const routes = [];
  const countries = Object.keys(countryNames);
  const years = [2026, 2027, 2028];
  const languages = ['en', 'ar'];
  
  routes.push({ path: '/index.html', route: '/', lang: 'ar', title: 'العطل الرسمية العربية', description: 'دليل شامل للعطل والمناسبات الرسمية في الدول العربية' });
  routes.push({ path: '/en.html', route: '/en', lang: 'en', title: 'Arabic Public Holidays', description: 'Complete Guide to Public Holidays in Arab Countries' });
  routes.push({ path: '/sitemap.html', route: '/sitemap', lang: 'ar', isSitemap: true, title: 'خريطة الموقع - العطل الرسمية العربية', description: 'خريطة الموقع الكاملة لجميع صفحات العطل الرسمية في الدول العربية' });
  
  // Eid tracker pages
  languages.forEach(lang => {
    const isAr = lang === 'ar';
    // Main eid page (multi-year overview, distinct from year-specific pages)
    routes.push({
      path: `/${lang}/eid.html`,
      route: `/${lang}/eid`,
      lang, isEid: true, isEidMain: true, eidYear: 2026,
      title: isAr ? 'مواعيد عيد الفطر وعيد الأضحى — 2026 و2027 و2028 | إجازات' : 'Eid Al-Fitr & Eid Al-Adha Dates — 2026, 2027 & 2028 | Egazat',
      description: isAr
        ? 'مواعيد عيد الفطر وعيد الأضحى من 2026 إلى 2028 في جميع الدول العربية. تواريخ رسمية ومتوقعة لثلاث سنوات.'
        : 'Eid Al-Fitr and Eid Al-Adha dates from 2026 to 2028 across all Arab countries. Official and expected dates for three years.'
    });
    // Per-year eid pages
    years.forEach(year => {
      routes.push({
        path: `/${lang}/eid/${year}.html`,
        route: `/${lang}/eid/${year}`,
        lang, isEid: true, eidYear: year,
        title: isAr ? `مواعيد عيد الفطر وعيد الأضحى ${year} | إجازات` : `Eid Al-Fitr & Eid Al-Adha ${year} Dates | Egazat`,
        description: isAr
          ? `مواعيد عيد الفطر وعيد الأضحى ${year} في السعودية والإمارات ومصر وجميع الدول العربية.`
          : `Eid Al-Fitr and Eid Al-Adha ${year} dates for Saudi Arabia, UAE, Egypt and all Arab countries. Official and expected dates updated by moon sighting.`
      });
    });
  });

  languages.forEach(lang => {
    countries.forEach(country => {
      years.forEach(year => {
        const cn = countryNames[country];
        const countryName = lang === 'ar' ? cn.nameAr : cn.name;
        routes.push({
          path: `/${lang}/country/${country}/${year}.html`,
          route: `/${lang}/country/${country}/${year}`,
          lang, country, year,
          title: lang === 'ar' ? `${countryName} العطل الرسمية ${year}` : `${countryName} Public Holidays ${year}`,
          description: lang === 'ar'
            ? `دليل العطل الرسمية في ${countryName} ${year} — مواعيد عيد الفطر والأضحى والأعياد الوطنية.`
            : `${countryName} ${year} public holidays — Eid al-Fitr, Eid al-Adha dates & national days.`
        });
      });
    });
  });
  
  return routes;
};

const createDirectories = async (routes) => {
  const distDir = path.join(__dirname, '../dist');
  for (const route of routes) {
    // Use forward-slash concatenation to avoid OS-dependent path.join backslashes
    const filePath = distDir + route.path;
    await fs.mkdir(path.dirname(filePath), { recursive: true });
  }
};

// Cached base template — loaded once before any route generation
let cachedBaseHtml = null;

const loadBaseTemplate = async () => {
  if (cachedBaseHtml) return cachedBaseHtml;
  const distDir = path.join(__dirname, '../dist');
  const indexPath = path.join(distDir, 'index.html');
  
  let html;
  try { html = await fs.readFile(indexPath, 'utf8'); }
  catch { html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Egazat</title></head><body><div id="root"></div></body></html>`; }
  
  // Strip any pre-existing content inside #root to get a clean template
  html = html.replace(/<div id="root">[\s\S]*?<\/div>/, '<div id="root"></div>');
  cachedBaseHtml = html;
  return html;
};

const generateHTML = async (route) => {
  const { title, description, lang, country, year } = route;
  
  const baseHtml = await loadBaseTemplate();
  
  // Generate real HTML content for bots
  let seoContent = '';
  let structuredDataScripts = '';
  
  if (route.isSitemap) {
    seoContent = generateSitemapPageHTML();
  } else if (route.isEid) {
    seoContent = generateEidPageHTML(route.eidYear, lang);
    const isAr = lang === 'ar';
    const webPageSchema = {
      '@context': 'https://schema.org', '@type': 'WebPage',
      name: route.title,
      url: `${BASE_URL}${route.path}`,
      inLanguage: lang
    };
    const breadcrumbSchema = {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Egazat', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: isAr ? 'مواعيد الأعياد' : 'Eid Dates', item: `${BASE_URL}/${lang}/eid.html` },
        ...(route.isEidMain ? [] : [{ '@type': 'ListItem', position: 3, name: String(route.eidYear), item: `${BASE_URL}${route.path}` }])
      ]
    };
    const eidItemList = {
      '@context': 'https://schema.org', '@type': 'ItemList',
      name: route.title,
      numberOfItems: 20,
      description: route.description,
      url: `${BASE_URL}${route.path}`,
      inLanguage: lang
    };
    const eidSchemas = [webPageSchema, breadcrumbSchema, eidItemList];
    structuredDataScripts = eidSchemas.map(s => `    <script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');
  } else if (country && year) {
    const cn = countryNames[country];
    const countryName = lang === 'ar' ? cn.nameAr : cn.name;
    const holidays = holidaysDB[country]?.[year] || [];
    
    seoContent = generateHolidayTableHTML(holidays, lang, countryName, year, country);
    
    // Build JSON-LD structured data including FAQPage
    const schemas = [
      buildItemListSchema(holidays, country, year, countryName, lang),
      buildBreadcrumbSchema(country, year, countryName, lang),
      buildFAQSchema(country, year, countryName, lang, holidays),
      ...holidays.map(h => buildEventSchema(h, country, countryName, lang))
    ];
    structuredDataScripts = schemas.map(s => `    <script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');
  } else {
    seoContent = generateHomepageHTML(lang);
    const websiteSchema = {
      '@context': 'https://schema.org', '@type': 'WebSite',
      name: lang === 'ar' ? 'Egazat — العطل الرسمية العربية' : 'Egazat — Arabic Public Holidays',
      url: BASE_URL, inLanguage: lang,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${BASE_URL}/${lang}/country/{country_code}/2026.html`
        },
        'query-input': 'required name=country_code'
      }
    };
    structuredDataScripts = `    <script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>`;
  }

  const canonicalUrl = route.path === '/index.html' ? `${BASE_URL}/` : `${BASE_URL}${route.path}`;
  
  // Compute hreflang alternate URLs
  let altArUrl, altEnUrl;
  if (route.isEid) {
    const eidPath = route.isEidMain ? '/eid.html' : `/eid/${route.eidYear}.html`;
    altArUrl = `${BASE_URL}/ar${eidPath}`;
    altEnUrl = `${BASE_URL}/en${eidPath}`;
  } else if (country && year) {
    altArUrl = `${BASE_URL}/ar/country/${country}/${year}.html`;
    altEnUrl = `${BASE_URL}/en/country/${country}/${year}.html`;
  } else {
    altArUrl = `${BASE_URL}/`;
    altEnUrl = `${BASE_URL}/en.html`;
  }

  let updatedHtml = baseHtml
    .replace(/<html[^>]*>/, `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">`)
    .replace(/<title>.*?<\/title>/, `<title>${title} | Egazat</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta name="keywords"[^>]*>/, `<meta name="keywords" content="arabic holidays, public holidays, arab countries, middle east holidays, islamic holidays, national holidays, ${country || ''}" />`)
    .replace(/<meta name="robots"[^>]*>/, `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonicalUrl}" />`)
    .replace(/<meta property="og:locale"[^>]*>/, `<meta property="og:locale" content="${lang === 'ar' ? 'ar_AR' : 'en_US'}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${description}" />`);

  // CRITICAL: Strip any existing canonical and hreflang tags to prevent duplicates
  updatedHtml = updatedHtml.replace(/<link[^>]*rel="canonical"[^>]*>/gi, '');
  updatedHtml = updatedHtml.replace(/<link[^>]*rel="alternate"[^>]*hreflang[^>]*>/gi, '');

  // Inject canonical + hreflang into <head>
  const headClose = updatedHtml.indexOf('</head>');
  const seoHeadTags = `
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" hreflang="ar" href="${altArUrl}" />
    <link rel="alternate" hreflang="en" href="${altEnUrl}" />
    <link rel="alternate" hreflang="x-default" href="${altEnUrl}" />
${structuredDataScripts}
  `;
  updatedHtml = updatedHtml.slice(0, headClose) + seoHeadTags + updatedHtml.slice(headClose);

  // CRITICAL: Inject real HTML content into <div id="root"> for bot crawlability
  // The React app will hydrate over this, but bots get real content immediately
  updatedHtml = updatedHtml.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${seoContent}</div>`
  );
  
  // Ensure tracking codes
  if (!updatedHtml.includes('G-14SVM3B0VD')) {
    const trackingCodes = `    
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-14SVM3B0VD"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-14SVM3B0VD');</script>
    <script>var _paq=window._paq=window._paq||[];_paq.push(['trackPageView']);_paq.push(['enableLinkTracking']);(function(){var u="//www.waterfallsbg.info/piwik/matomo/";_paq.push(['setTrackerUrl',u+'matomo.php']);_paq.push(['setSiteId','99']);var d=document,g=d.createElement('script'),s=d.getElementsByTagName('script')[0];g.async=true;g.src=u+'matomo.js';s.parentNode.insertBefore(g,s);})();</script>
  </body>`;
    updatedHtml = updatedHtml.replace('  </body>', trackingCodes);
  }
  
  return updatedHtml;
};

const generateStaticFiles = async () => {
  console.log('🚀 Generating static HTML files with REAL holiday content for SEO...');
  
  const distDir = path.join(__dirname, '../dist');
  const indexPath = path.join(distDir, 'index.html');
  const backupPath = path.join(distDir, 'index.original.html');
  
  try { await fs.copyFile(indexPath, backupPath); console.log('📋 Backed up original index.html'); }
  catch (e) { console.error('⚠️  Could not backup index.html:', e.message); }
  
  const routes = generateRoutes();
  console.log(`📄 Found ${routes.length} routes to generate`);
  
  await createDirectories(routes);
  
  let generated = 0;
  for (const route of routes) {
    const html = await generateHTML(route);
    const fileName = route.path === '/index.html' ? 'index.html' : route.path;
    // Use forward-slash concatenation to avoid OS-dependent path.join backslashes
    const filePath = distDir + '/' + fileName.replace(/^\//, '');
    
    try {
      await fs.writeFile(filePath, html, 'utf8');
      generated++;
    } catch (error) {
      console.error(`❌ Error generating ${fileName}:`, error.message);
    }
  }
  
  console.log(`✅ Generated ${generated}/${routes.length} static HTML files with embedded holiday data`);
  console.log('🎉 Static HTML generation complete! Bots will now see real holiday content.');
};

generateStaticFiles().catch(console.error);
