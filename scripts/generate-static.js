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
  return {
    '@context': 'https://schema.org', '@type': 'Event',
    name: lang === 'ar' ? holiday.nameAr : holiday.name,
    startDate: holiday.date, endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    description: lang === 'ar' ? `${holiday.nameAr} — عطلة رسمية في ${countryName}` : `${holiday.name} — Public Holiday in ${countryName}`,
    inLanguage: lang,
    location: { '@type': 'Country', name: countryName, address: { '@type': 'PostalAddress', addressCountry: countryCode.toUpperCase() } }
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
      <footer>
        <p>${isAr
          ? 'ملاحظة: تواريخ العطل الدينية قد تختلف حسب رؤية الهلال وقد تتغير بيوم واحد.'
          : 'Note: Religious holiday dates may vary based on moon sighting and could change by one day.'}</p>
        <nav aria-label="${isAr ? 'روابط سنوات أخرى' : 'Other years'}">
          ${[2026, 2027, 2028].map(y =>
            `<a href="${BASE_URL}/${lang}/country/${countryCode}/${y}.html">${y}</a>`
          ).join(' | ')}
        </nav>
      </footer>
    </article>`;
}

function generateHomepageHTML(lang) {
  const isAr = lang === 'ar';
  const countries = Object.entries(countryNames);
  const links = countries.map(([code, cn]) => {
    const name = isAr ? cn.nameAr : cn.name;
    return `      <li><a href="${BASE_URL}/${lang}/country/${code}/2026.html">${name}</a></li>`;
  }).join('\n');
  
  return `
    <article dir="${isAr ? 'rtl' : 'ltr'}" lang="${lang}">
      <h1>${isAr ? 'العطل الرسمية العربية' : 'Arabic Public Holidays'}</h1>
      <p>${isAr
        ? 'دليل شامل للعطل والمناسبات الرسمية في جميع الدول العربية. تقويم كامل للعطل الرسمية والإجازات الوطنية.'
        : 'Complete guide to public holidays and official celebrations in all Arab countries.'}</p>
      <h2>${isAr ? 'اختر دولة' : 'Select a Country'}</h2>
      <ul>
${links}
      </ul>
    </article>`;
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
    const filePath = path.join(distDir, route.path);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
  }
};

const generateHTML = async (route) => {
  const { title, description, lang, country, year } = route;
  const distDir = path.join(__dirname, '../dist');
  
  let baseHtml;
  try {
    const backupPath = path.join(distDir, 'index.original.html');
    const indexPath = path.join(distDir, 'index.html');
    try { baseHtml = await fs.readFile(backupPath, 'utf8'); }
    catch { baseHtml = await fs.readFile(indexPath, 'utf8'); }
  } catch {
    baseHtml = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Egazat</title></head><body><div id="root"></div></body></html>`;
  }
  
  // Generate real HTML content for bots
  let seoContent = '';
  let structuredDataScripts = '';
  
  if (country && year) {
    const cn = countryNames[country];
    const countryName = lang === 'ar' ? cn.nameAr : cn.name;
    const holidays = holidaysDB[country]?.[year] || [];
    
    seoContent = generateHolidayTableHTML(holidays, lang, countryName, year, country);
    
    // Build JSON-LD structured data
    const schemas = [
      buildItemListSchema(holidays, country, year, countryName, lang),
      buildBreadcrumbSchema(country, year, countryName, lang),
      ...holidays.map(h => buildEventSchema(h, country, countryName, lang))
    ];
    structuredDataScripts = schemas.map(s => `    <script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');
  } else {
    seoContent = generateHomepageHTML(lang);
    const websiteSchema = {
      '@context': 'https://schema.org', '@type': 'WebSite',
      name: lang === 'ar' ? 'Egazat — العطل الرسمية العربية' : 'Egazat — Arabic Public Holidays',
      url: BASE_URL, inLanguage: lang
    };
    structuredDataScripts = `    <script type="application/ld+json">${JSON.stringify(websiteSchema)}</script>`;
  }

  const canonicalUrl = route.path === '/index.html' ? `${BASE_URL}/` : `${BASE_URL}${route.path}`;
  const altArUrl = country && year ? `${BASE_URL}/ar/country/${country}/${year}.html` : `${BASE_URL}/`;
  const altEnUrl = country && year ? `${BASE_URL}/en/country/${country}/${year}.html` : `${BASE_URL}/en.html`;

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

  // Inject canonical + hreflang into <head>
  const headClose = updatedHtml.indexOf('</head>');
  const seoHeadTags = `
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" hreflang="ar" href="${altArUrl}" />
    <link rel="alternate" hreflang="en" href="${altEnUrl}" />
    <link rel="alternate" hreflang="x-default" href="${altArUrl}" />
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
    const filePath = path.join(distDir, fileName);
    
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
