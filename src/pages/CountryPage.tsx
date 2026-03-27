import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Calendar } from '@/components/Calendar';
import { LongWeekends } from '@/components/LongWeekends';
import { CountryQuickSelector } from '@/components/CountryQuickSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { generateCountryUrl, generateHomeUrl, getCountryMetadata } from '@/utils/seoRoutes';
import { SEOHead } from '@/components/SEOHead';

// Import flag images
import saFlag from '@/assets/flags/sa.png';
import aeFlag from '@/assets/flags/ae.png';
import egFlag from '@/assets/flags/eg.png';
import maFlag from '@/assets/flags/ma.png';
import joFlag from '@/assets/flags/jo.png';
import kwFlag from '@/assets/flags/kw.png';
import qaFlag from '@/assets/flags/qa.png';
import lbFlag from '@/assets/flags/lb.png';
import bhFlag from '@/assets/flags/bh.png';
import omFlag from '@/assets/flags/om.png';
import tnFlag from '@/assets/flags/tn.png';
import dzFlag from '@/assets/flags/dz.png';
import syFlag from '@/assets/flags/sy.png';
import iqFlag from '@/assets/flags/iq.png';
import yeFlag from '@/assets/flags/ye.png';
import lyFlag from '@/assets/flags/ly.png';
import sdFlag from '@/assets/flags/sd.png';
import soFlag from '@/assets/flags/so.png';
import djFlag from '@/assets/flags/dj.png';
import kmFlag from '@/assets/flags/km.png';

const arabicCountries = {
  'ae': { name: 'United Arab Emirates', nameAr: 'دولة الإمارات العربية المتحدة', flag: '🇦🇪', flagImage: aeFlag },
  'sa': { name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', flag: '🇸🇦', flagImage: saFlag },
  'eg': { name: 'Egypt', nameAr: 'جمهورية مصر العربية', flag: '🇪🇬', flagImage: egFlag },
  'jo': { name: 'Jordan', nameAr: 'المملكة الأردنية الهاشمية', flag: '🇯🇴', flagImage: joFlag },
  'lb': { name: 'Lebanon', nameAr: 'الجمهورية اللبنانية', flag: '🇱🇧', flagImage: lbFlag },
  'sy': { name: 'Syria', nameAr: 'الجمهورية العربية السورية', flag: '🇸🇾', flagImage: syFlag },
  'iq': { name: 'Iraq', nameAr: 'جمهورية العراق', flag: '🇮🇶', flagImage: iqFlag },
  'kw': { name: 'Kuwait', nameAr: 'دولة الكويت', flag: '🇰🇼', flagImage: kwFlag },
  'qa': { name: 'Qatar', nameAr: 'دولة قطر', flag: '🇶🇦', flagImage: qaFlag },
  'bh': { name: 'Bahrain', nameAr: 'مملكة البحرين', flag: '🇧🇭', flagImage: bhFlag },
  'om': { name: 'Oman', nameAr: 'سلطنة عمان', flag: '🇴🇲', flagImage: omFlag },
  'ye': { name: 'Yemen', nameAr: 'الجمهورية اليمنية', flag: '🇾🇪', flagImage: yeFlag },
  'ma': { name: 'Morocco', nameAr: 'المملكة المغربية', flag: '🇲🇦', flagImage: maFlag },
  'tn': { name: 'Tunisia', nameAr: 'الجمهورية التونسية', flag: '🇹🇳', flagImage: tnFlag },
  'dz': { name: 'Algeria', nameAr: 'الجمهورية الجزائرية الديمقراطية الشعبية', flag: '🇩🇿', flagImage: dzFlag },
  'ly': { name: 'Libya', nameAr: 'دولة ليبيا', flag: '🇱🇾', flagImage: lyFlag },
  'sd': { name: 'Sudan', nameAr: 'جمهورية السودان', flag: '🇸🇩', flagImage: sdFlag },
  'so': { name: 'Somalia', nameAr: 'جمهورية الصومال', flag: '🇸🇴', flagImage: soFlag },
  'dj': { name: 'Djibouti', nameAr: 'جمهورية جيبوتي', flag: '🇩🇯', flagImage: djFlag },
  'km': { name: 'Comoros', nameAr: 'جزر القمر', flag: '🇰🇲', flagImage: kmFlag }
};

// Comprehensive Arabic Countries Holiday Database (2025-2028)
// Based on official government sources and Islamic calendar calculations

interface Holiday {
  name: string;
  nameAr: string;
  date: string;
  type: 'religious' | 'national' | 'cultural';
  duration?: number;
}

interface CountryInfo {
  weekendDays: string[];
  holidays: Record<number, Holiday[]>;
}

const countriesHolidays: Record<string, CountryInfo> = {
  // Saudi Arabia - Weekend: Friday & Saturday
  'sa': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'Saudi Founding Day', nameAr: 'يوم التأسيس السعودي', date: '2026-02-22', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 4 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Saudi National Day', nameAr: 'اليوم الوطني السعودي', date: '2026-09-23', type: 'national' }
      ],
      2027: [
        { name: 'Saudi Founding Day', nameAr: 'يوم التأسيس السعودي', date: '2027-02-22', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 4 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Saudi National Day', nameAr: 'اليوم الوطني السعودي', date: '2027-09-23', type: 'national' }
      ],
      2028: [
        { name: 'Saudi Founding Day', nameAr: 'يوم التأسيس السعودي', date: '2028-02-22', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 4 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Saudi National Day', nameAr: 'اليوم الوطني السعودي', date: '2028-09-23', type: 'national' }
      ]
    }
  },

  // UAE - Weekend: Saturday & Sunday (changed in January 2022)
  'ae': {
    weekendDays: ['Saturday', 'Sunday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Arafat Day', nameAr: 'يوم عرفة', date: '2026-05-25', type: 'religious' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 3 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Commemoration Day', nameAr: 'يوم الشهيد', date: '2026-11-30', type: 'national' },
        { name: 'UAE National Day', nameAr: 'اليوم الوطني الإماراتي', date: '2026-12-02', type: 'national', duration: 2 }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Arafat Day', nameAr: 'يوم عرفة', date: '2027-05-15', type: 'religious' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 3 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Commemoration Day', nameAr: 'يوم الشهيد', date: '2027-11-30', type: 'national' },
        { name: 'UAE National Day', nameAr: 'اليوم الوطني الإماراتي', date: '2027-12-02', type: 'national', duration: 2 }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 3 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Commemoration Day', nameAr: 'يوم الشهيد', date: '2028-11-30', type: 'national' },
        { name: 'UAE National Day', nameAr: 'اليوم الوطني الإماراتي', date: '2028-12-02', type: 'national', duration: 2 }
      ]
    }
  },

  // Egypt - Weekend: Friday & Saturday
  'eg': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Coptic Christmas', nameAr: 'عيد الميلاد المجيد', date: '2026-01-07', type: 'religious' },
        { name: '25 January Revolution Day', nameAr: 'ثورة 25 يناير', date: '2026-01-25', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Sham el-Nessim', nameAr: 'شم النسيم', date: '2026-04-13', type: 'national' },
        { name: 'Sinai Liberation Day', nameAr: 'عيد تحرير سيناء', date: '2026-04-25', type: 'national' },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: '30 June Revolution Day', nameAr: 'ثورة 30 يونيو', date: '2026-06-30', type: 'national' },
        { name: '23 July Revolution Day', nameAr: 'ثورة 23 يوليو', date: '2026-07-23', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Armed Forces Day', nameAr: 'عيد القوات المسلحة', date: '2026-10-06', type: 'national' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Coptic Christmas', nameAr: 'عيد الميلاد المجيد', date: '2027-01-07', type: 'religious' },
        { name: '25 January Revolution Day', nameAr: 'ثورة 25 يناير', date: '2027-01-25', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Sham el-Nessim', nameAr: 'شم النسيم', date: '2027-03-29', type: 'national' },
        { name: 'Sinai Liberation Day', nameAr: 'عيد تحرير سيناء', date: '2027-04-25', type: 'national' },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: '30 June Revolution Day', nameAr: 'ثورة 30 يونيو', date: '2027-06-30', type: 'national' },
        { name: '23 July Revolution Day', nameAr: 'ثورة 23 يوليو', date: '2027-07-23', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Armed Forces Day', nameAr: 'عيد القوات المسلحة', date: '2027-10-06', type: 'national' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Coptic Christmas', nameAr: 'عيد الميلاد المجيد', date: '2028-01-07', type: 'religious' },
        { name: '25 January Revolution Day', nameAr: 'ثورة 25 يناير', date: '2028-01-25', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Sham el-Nessim', nameAr: 'شم النسيم', date: '2028-04-17', type: 'national' },
        { name: 'Sinai Liberation Day', nameAr: 'عيد تحرير سيناء', date: '2028-04-25', type: 'national' },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: '30 June Revolution Day', nameAr: 'ثورة 30 يونيو', date: '2028-06-30', type: 'national' },
        { name: '23 July Revolution Day', nameAr: 'ثورة 23 يوليو', date: '2028-07-23', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Armed Forces Day', nameAr: 'عيد القوات المسلحة', date: '2028-10-06', type: 'national' }
      ]
    }
  },

  // Jordan - Weekend: Friday & Saturday
  'jo': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'King\'s Birthday', nameAr: 'عيد ميلاد الملك', date: '2026-01-30', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Independence Day', nameAr: 'يوم الاستقلال', date: '2026-05-25', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Christmas Day', nameAr: 'عيد الميلاد المجيد', date: '2026-12-25', type: 'religious' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'King\'s Birthday', nameAr: 'عيد ميلاد الملك', date: '2027-01-30', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
        { name: 'Independence Day', nameAr: 'يوم الاستقلال', date: '2027-05-25', type: 'national' },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Christmas Day', nameAr: 'عيد الميلاد المجيد', date: '2027-12-25', type: 'religious' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'King\'s Birthday', nameAr: 'عيد ميلاد الملك', date: '2028-01-30', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 4 },
        { name: 'Independence Day', nameAr: 'يوم الاستقلال', date: '2028-05-25', type: 'national' },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Christmas Day', nameAr: 'عيد الميلاد المجيد', date: '2028-12-25', type: 'religious' }
      ]
    }
  },

  // Kuwait - Weekend: Friday & Saturday  
  'kw': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'National Day', nameAr: 'اليوم الوطني', date: '2026-02-25', type: 'national' },
        { name: 'Liberation Day', nameAr: 'يوم التحرير', date: '2026-02-26', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 3 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'National Day', nameAr: 'اليوم الوطني', date: '2027-02-25', type: 'national' },
        { name: 'Liberation Day', nameAr: 'يوم التحرير', date: '2027-02-26', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 3 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'National Day', nameAr: 'اليوم الوطني', date: '2028-02-25', type: 'national' },
        { name: 'Liberation Day', nameAr: 'يوم التحرير', date: '2028-02-26', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 3 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' }
      ]
    }
  },

  // Qatar - Weekend: Friday & Saturday
  'qa': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'Sports Day', nameAr: 'اليوم الرياضي', date: '2026-02-10', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 3 },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Qatar National Day', nameAr: 'اليوم الوطني القطري', date: '2026-12-18', type: 'national' }
      ],
      2027: [
        { name: 'Sports Day', nameAr: 'اليوم الرياضي', date: '2027-02-09', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 3 },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Qatar National Day', nameAr: 'اليوم الوطني القطري', date: '2027-12-18', type: 'national' }
      ],
      2028: [
        { name: 'Sports Day', nameAr: 'اليوم الرياضي', date: '2028-02-08', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 3 },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Qatar National Day', nameAr: 'اليوم الوطني القطري', date: '2028-12-18', type: 'national' }
      ]
    }
  },

  // Bahrain - Weekend: Friday & Saturday
  'bh': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 3 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Ashura', nameAr: 'عاشوراء', date: '2026-06-25', type: 'religious', duration: 2 },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Bahrain National Day', nameAr: 'اليوم الوطني البحريني', date: '2026-12-16', type: 'national', duration: 2 }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 3 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Ashura', nameAr: 'عاشوراء', date: '2027-06-15', type: 'religious', duration: 2 },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Bahrain National Day', nameAr: 'اليوم الوطني البحريني', date: '2027-12-16', type: 'national', duration: 2 }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 3 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Ashura', nameAr: 'عاشوراء', date: '2028-06-03', type: 'religious', duration: 2 },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Bahrain National Day', nameAr: 'اليوم الوطني البحريني', date: '2028-12-16', type: 'national', duration: 2 }
      ]
    }
  },

  // Oman - Weekend: Friday & Saturday
  'om': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 4 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Oman National Day', nameAr: 'اليوم الوطني العماني', date: '2026-11-18', type: 'national', duration: 2 }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 4 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Oman National Day', nameAr: 'اليوم الوطني العماني', date: '2027-11-18', type: 'national', duration: 2 }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 4 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Oman National Day', nameAr: 'اليوم الوطني العماني', date: '2028-11-18', type: 'national', duration: 2 }
      ]
    }
  },

  // Lebanon - Weekend: Saturday & Sunday
  'lb': {
    weekendDays: ['Saturday', 'Sunday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Armenian Christmas', nameAr: 'عيد الميلاد الأرمني', date: '2026-01-06', type: 'religious' },
        { name: 'Saint Maron\'s Day', nameAr: 'عيد مار مارون', date: '2026-02-09', type: 'religious' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 2 },
        { name: 'Good Friday', nameAr: 'الجمعة العظيمة', date: '2026-04-03', type: 'religious' },
        { name: 'Easter Monday', nameAr: 'اثنين الفصح', date: '2026-04-06', type: 'religious' },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Resistance & Liberation Day', nameAr: 'عيد المقاومة والتحرير', date: '2026-05-25', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 },
        { name: 'Assumption of Mary', nameAr: 'عيد انتقال العذراء', date: '2026-08-15', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-11-22', type: 'national' },
        { name: 'Christmas Day', nameAr: 'عيد الميلاد المجيد', date: '2026-12-25', type: 'religious' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Armenian Christmas', nameAr: 'عيد الميلاد الأرمني', date: '2027-01-06', type: 'religious' },
        { name: 'Saint Maron\'s Day', nameAr: 'عيد مار مارون', date: '2027-02-09', type: 'religious' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 2 },
        { name: 'Good Friday', nameAr: 'الجمعة العظيمة', date: '2027-03-26', type: 'religious' },
        { name: 'Easter Monday', nameAr: 'اثنين الفصح', date: '2027-03-29', type: 'religious' },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 },
        { name: 'Resistance & Liberation Day', nameAr: 'عيد المقاومة والتحرير', date: '2027-05-25', type: 'national' },
        { name: 'Assumption of Mary', nameAr: 'عيد انتقال العذراء', date: '2027-08-15', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-11-22', type: 'national' },
        { name: 'Christmas Day', nameAr: 'عيد الميلاد المجيد', date: '2027-12-25', type: 'religious' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Armenian Christmas', nameAr: 'عيد الميلاد الأرمني', date: '2028-01-06', type: 'religious' },
        { name: 'Saint Maron\'s Day', nameAr: 'عيد مار مارون', date: '2028-02-09', type: 'religious' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 2 },
        { name: 'Good Friday', nameAr: 'الجمعة العظيمة', date: '2028-04-14', type: 'religious' },
        { name: 'Easter Monday', nameAr: 'اثنين الفصح', date: '2028-04-17', type: 'religious' },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 2 },
        { name: 'Resistance & Liberation Day', nameAr: 'عيد المقاومة والتحرير', date: '2028-05-25', type: 'national' },
        { name: 'Assumption of Mary', nameAr: 'عيد انتقال العذراء', date: '2028-08-15', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-11-22', type: 'national' },
        { name: 'Christmas Day', nameAr: 'عيد الميلاد المجيد', date: '2028-12-25', type: 'religious' }
      ]
    }
  },

  // Syria - Weekend: Friday & Saturday
  'sy': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Revolution Day', nameAr: 'يوم الثورة', date: '2026-03-08', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-04-17', type: 'national' },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Christmas Day', nameAr: 'عيد الميلاد المجيد', date: '2026-12-25', type: 'religious' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Revolution Day', nameAr: 'يوم الثورة', date: '2027-03-08', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-04-17', type: 'national' },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Christmas Day', nameAr: 'عيد الميلاد المجيد', date: '2027-12-25', type: 'religious' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Revolution Day', nameAr: 'يوم الثورة', date: '2028-03-08', type: 'national' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-04-17', type: 'national' },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 4 },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Christmas Day', nameAr: 'عيد الميلاد المجيد', date: '2028-12-25', type: 'religious' }
      ]
    }
  },

  // Iraq - Weekend: Friday & Saturday
  'iq': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Army Day', nameAr: 'يوم الجيش', date: '2026-01-06', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Ashura', nameAr: 'عاشوراء', date: '2026-06-25', type: 'religious', duration: 2 },
        { name: 'Revolution Day', nameAr: 'يوم الثورة', date: '2026-07-14', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-10-03', type: 'national' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Army Day', nameAr: 'يوم الجيش', date: '2027-01-06', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Ashura', nameAr: 'عاشوراء', date: '2027-06-15', type: 'religious', duration: 2 },
        { name: 'Revolution Day', nameAr: 'يوم الثورة', date: '2027-07-14', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-10-03', type: 'national' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Army Day', nameAr: 'يوم الجيش', date: '2028-01-06', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Ashura', nameAr: 'عاشوراء', date: '2028-06-03', type: 'religious', duration: 2 },
        { name: 'Revolution Day', nameAr: 'يوم الثورة', date: '2028-07-14', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-10-03', type: 'national' }
      ]
    }
  },

  // Yemen - Weekend: Friday & Saturday
  'ye': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Unity Day', nameAr: 'يوم الوحدة', date: '2026-05-22', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Revolution Day (26 September)', nameAr: 'ثورة 26 سبتمبر', date: '2026-09-26', type: 'national' },
        { name: 'Revolution Day (14 October)', nameAr: 'ثورة 14 أكتوبر', date: '2026-10-14', type: 'national' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-11-30', type: 'national' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
        { name: 'Unity Day', nameAr: 'يوم الوحدة', date: '2027-05-22', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Revolution Day (26 September)', nameAr: 'ثورة 26 سبتمبر', date: '2027-09-26', type: 'national' },
        { name: 'Revolution Day (14 October)', nameAr: 'ثورة 14 أكتوبر', date: '2027-10-14', type: 'national' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-11-30', type: 'national' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 4 },
        { name: 'Unity Day', nameAr: 'يوم الوحدة', date: '2028-05-22', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Revolution Day (26 September)', nameAr: 'ثورة 26 سبتمبر', date: '2028-09-26', type: 'national' },
        { name: 'Revolution Day (14 October)', nameAr: 'ثورة 14 أكتوبر', date: '2028-10-14', type: 'national' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-11-30', type: 'national' }
      ]
    }
  },

  // Morocco - Weekend: Saturday & Sunday
  'ma': {
    weekendDays: ['Saturday', 'Sunday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Independence Manifesto Day', nameAr: 'ذكرى تقديم وثيقة الاستقلال', date: '2026-01-11', type: 'national' },
        { name: 'Amazigh New Year', nameAr: 'رأس السنة الأمازيغية', date: '2026-01-14', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 2 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Throne Day', nameAr: 'عيد العرش', date: '2026-07-30', type: 'national' },
        { name: 'Oued Ed-Dahab Day', nameAr: 'ذكرى استرداد وادي الذهب', date: '2026-08-14', type: 'national' },
        { name: 'Revolution of King & People', nameAr: 'ذكرى ثورة الملك والشعب', date: '2026-08-20', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Green March Day', nameAr: 'ذكرى المسيرة الخضراء', date: '2026-11-06', type: 'national' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-11-18', type: 'national' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Independence Manifesto Day', nameAr: 'ذكرى تقديم وثيقة الاستقلال', date: '2027-01-11', type: 'national' },
        { name: 'Amazigh New Year', nameAr: 'رأس السنة الأمازيغية', date: '2027-01-14', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 2 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Throne Day', nameAr: 'عيد العرش', date: '2027-07-30', type: 'national' },
        { name: 'Oued Ed-Dahab Day', nameAr: 'ذكرى استرداد وادي الذهب', date: '2027-08-14', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Revolution of King & People', nameAr: 'ذكرى ثورة الملك والشعب', date: '2027-08-20', type: 'national' },
        { name: 'Green March Day', nameAr: 'ذكرى المسيرة الخضراء', date: '2027-11-06', type: 'national' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-11-18', type: 'national' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Independence Manifesto Day', nameAr: 'ذكرى تقديم وثيقة الاستقلال', date: '2028-01-11', type: 'national' },
        { name: 'Amazigh New Year', nameAr: 'رأس السنة الأمازيغية', date: '2028-01-14', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 2 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 2 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Throne Day', nameAr: 'عيد العرش', date: '2028-07-30', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Oued Ed-Dahab Day', nameAr: 'ذكرى استرداد وادي الذهب', date: '2028-08-14', type: 'national' },
        { name: 'Revolution of King & People', nameAr: 'ذكرى ثورة الملك والشعب', date: '2028-08-20', type: 'national' },
        { name: 'Green March Day', nameAr: 'ذكرى المسيرة الخضراء', date: '2028-11-06', type: 'national' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-11-18', type: 'national' }
      ]
    }
  },

  // Tunisia - Weekend: Saturday & Sunday
  'tn': {
    weekendDays: ['Saturday', 'Sunday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Revolution Day', nameAr: 'عيد الثورة', date: '2026-01-14', type: 'national' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-03-20', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Martyrs\' Day', nameAr: 'عيد الشهداء', date: '2026-04-09', type: 'national' },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Republic Day', nameAr: 'عيد الجمهورية', date: '2026-07-25', type: 'national' },
        { name: 'Women\'s Day', nameAr: 'عيد المرأة', date: '2026-08-13', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Evacuation Day', nameAr: 'عيد الجلاء', date: '2026-10-15', type: 'national' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Revolution Day', nameAr: 'عيد الثورة', date: '2027-01-14', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-03-20', type: 'national' },
        { name: 'Martyrs\' Day', nameAr: 'عيد الشهداء', date: '2027-04-09', type: 'national' },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Republic Day', nameAr: 'عيد الجمهورية', date: '2027-07-25', type: 'national' },
        { name: 'Women\'s Day', nameAr: 'عيد المرأة', date: '2027-08-13', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Evacuation Day', nameAr: 'عيد الجلاء', date: '2027-10-15', type: 'national' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Revolution Day', nameAr: 'عيد الثورة', date: '2028-01-14', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-03-20', type: 'national' },
        { name: 'Martyrs\' Day', nameAr: 'عيد الشهداء', date: '2028-04-09', type: 'national' },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 2 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Republic Day', nameAr: 'عيد الجمهورية', date: '2028-07-25', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Women\'s Day', nameAr: 'عيد المرأة', date: '2028-08-13', type: 'national' },
        { name: 'Evacuation Day', nameAr: 'عيد الجلاء', date: '2028-10-15', type: 'national' }
      ]
    }
  },

  // Algeria - Weekend: Friday & Saturday  
  'dz': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Amazigh New Year', nameAr: 'رأس السنة الأمازيغية', date: '2026-01-12', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 2 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-07-05', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Revolution Day', nameAr: 'عيد الثورة', date: '2026-11-01', type: 'national' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Amazigh New Year', nameAr: 'رأس السنة الأمازيغية', date: '2027-01-12', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 2 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-07-05', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Revolution Day', nameAr: 'عيد الثورة', date: '2027-11-01', type: 'national' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Amazigh New Year', nameAr: 'رأس السنة الأمازيغية', date: '2028-01-12', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 2 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 2 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-07-05', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Revolution Day', nameAr: 'عيد الثورة', date: '2028-11-01', type: 'national' }
      ]
    }
  },

  // Libya - Weekend: Friday & Saturday
  'ly': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'Revolution Day (17 February)', nameAr: 'ثورة 17 فبراير', date: '2026-02-17', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' },
        { name: 'Liberation Day', nameAr: 'يوم التحرير', date: '2026-10-23', type: 'national' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-12-24', type: 'national' }
      ],
      2027: [
        { name: 'Revolution Day (17 February)', nameAr: 'ثورة 17 فبراير', date: '2027-02-17', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' },
        { name: 'Liberation Day', nameAr: 'يوم التحرير', date: '2027-10-23', type: 'national' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-12-24', type: 'national' }
      ],
      2028: [
        { name: 'Revolution Day (17 February)', nameAr: 'ثورة 17 فبراير', date: '2028-02-17', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 4 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' },
        { name: 'Liberation Day', nameAr: 'يوم التحرير', date: '2028-10-23', type: 'national' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-12-24', type: 'national' }
      ]
    }
  },

  // Sudan - Weekend: Friday & Saturday
  'sd': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 3 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }
      ],
      2027: [
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 3 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }
      ],
      2028: [
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 3 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' }
      ]
    }
  },

  // Somalia - Weekend: Friday & Saturday
  'so': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 3 },
        { name: 'Independence Day (26 June)', nameAr: 'عيد الاستقلال', date: '2026-06-26', type: 'national' },
        { name: 'Republic Day (1 July)', nameAr: 'يوم الجمهورية', date: '2026-07-01', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 3 },
        { name: 'Independence Day (26 June)', nameAr: 'عيد الاستقلال', date: '2027-06-26', type: 'national' },
        { name: 'Republic Day (1 July)', nameAr: 'يوم الجمهورية', date: '2027-07-01', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 3 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 3 },
        { name: 'Independence Day (26 June)', nameAr: 'عيد الاستقلال', date: '2028-06-26', type: 'national' },
        { name: 'Republic Day (1 July)', nameAr: 'يوم الجمهورية', date: '2028-07-01', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' }
      ]
    }
  },

  // Djibouti - Weekend: Friday & Saturday
  'dj': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 2 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2026-06-16', type: 'religious' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-06-27', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 2 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2027-06-06', type: 'religious' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-06-27', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 2 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 2 },
        { name: 'Islamic New Year', nameAr: 'رأس السنة الهجرية', date: '2028-05-25', type: 'religious' },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-06-27', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' }
      ]
    }
  },

  // Comoros - Weekend: Friday & Saturday
  'km': {
    weekendDays: ['Friday', 'Saturday'],
    holidays: {
      2026: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2026-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2026-03-20', type: 'religious', duration: 2 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2026-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2026-05-26', type: 'religious', duration: 2 },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2026-07-06', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2026-08-25', type: 'religious' }
      ],
      2027: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2027-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2027-03-10', type: 'religious', duration: 2 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2027-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2027-05-16', type: 'religious', duration: 2 },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2027-07-06', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2027-08-14', type: 'religious' }
      ],
      2028: [
        { name: 'New Year\'s Day', nameAr: 'رأس السنة الميلادية', date: '2028-01-01', type: 'national' },
        { name: 'Eid al-Fitr', nameAr: 'عيد الفطر', date: '2028-02-27', type: 'religious', duration: 2 },
        { name: 'Labour Day', nameAr: 'عيد العمال', date: '2028-05-01', type: 'national' },
        { name: 'Eid al-Adha', nameAr: 'عيد الأضحى', date: '2028-05-04', type: 'religious', duration: 2 },
        { name: 'Independence Day', nameAr: 'عيد الاستقلال', date: '2028-07-06', type: 'national' },
        { name: 'Prophet\'s Birthday', nameAr: 'المولد النبوي', date: '2028-08-03', type: 'religious' }
      ]
    }
  }
};
export const getHolidaysForCountryYear = (countryCode: string, year: number): Holiday[] => {
  const countryData = countriesHolidays[countryCode];
  if (!countryData || !countryData.holidays[year]) {
    return [];
  }
  return countryData.holidays[year];
};

export const getWeekendDays = (countryCode: string): string[] => {
  const countryData = countriesHolidays[countryCode];
  return countryData?.weekendDays || ['Friday', 'Saturday'];
};

export const CountryPage = () => {
  const { countryCode, year, lang } = useParams();
  const navigate = useNavigate();
  
  // Handle legacy routes without language prefix
  const detectedLanguage = lang || 'ar'; // Default to Arabic for legacy routes  
  const [language, setLanguage] = useState(detectedLanguage);
  const [selectedYear, setSelectedYear] = useState(parseInt(year || '2026'));
  const [selectedCountry, setSelectedCountry] = useState(countryCode || 'ae');

  // Redirect legacy routes to proper language-prefixed routes
  useEffect(() => {
    if (!lang && countryCode && year) {
      // This is a legacy route, redirect to Arabic version
      navigate(generateCountryUrl('ar', countryCode, parseInt(year)), { replace: true });
      return;
    }
  }, [lang, countryCode, year, navigate]);

  // Sync local language state with URL param
  useEffect(() => {
    setLanguage(lang === 'en' ? 'en' : 'ar');
  }, [lang]);

  const country = arabicCountries[selectedCountry as keyof typeof arabicCountries];
  const holidays = getHolidaysForCountryYear(selectedCountry, selectedYear);

  useEffect(() => {
    if (year && countryCode) {
      setSelectedYear(parseInt(year));
      setSelectedCountry(countryCode);
    }
  }, [year, countryCode]);

  // Update document language and direction
  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'ar';
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  }, [language]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    navigate(generateCountryUrl(newLanguage, selectedCountry, selectedYear));
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    navigate(generateCountryUrl(language, selectedCountry, newYear));
  };

  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
    navigate(generateCountryUrl(language, newCountry, selectedYear));
  };

  const handleBackToHome = () => {
    navigate(generateHomeUrl(language));
  };

  const getHolidayTypeColor = (type: string) => {
    switch (type) {
      case 'religious':
        return 'bg-red-500 text-white';
      case 'national':
        return 'bg-red-500 text-white';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (!country) {
    return <div>Country not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={language === 'ar' 
          ? `${country.nameAr} العطل الرسمية ${selectedYear} - التقويم | Egazat.com`
          : `${country.name} Public Holidays ${selectedYear} - Calendar | Egazat.com`
        }
        description={language === 'ar'
          ? `التقويم الكامل للعطل الرسمية في ${country.nameAr}. اكتشف عطلات نهاية الأسبوع الطويلة وخطط للإجازات الآن.`
          : `Complete calendar of the official holidays in ${country.name}. Discover long weekends and plan vacations now.`
        }
        language={language}
        countryCode={selectedCountry}
        year={selectedYear}
        keywords={language === 'ar'
          ? `${country.nameAr} العطل, العطل الرسمية ${selectedYear}, التقويم ${country.nameAr}, الإجازات الوطنية`
          : `${country.name} holidays, public holidays ${selectedYear}, ${country.name} calendar, national vacations`
        }
       />
      <Header
        selectedLanguage={language}
        selectedYear={selectedYear}
        selectedCountry={selectedCountry}
        onLanguageChange={handleLanguageChange}
        onYearChange={handleYearChange}
        onCountryChange={handleCountryChange}
      />

      <CountryQuickSelector language={language} year={selectedYear} />

      <main className="container mx-auto px-4 py-8 bg-muted/20 rounded-lg">

        {/* Country Header */}
        <div className="text-center mb-12">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            {/* Country Flag */}
            <div className="mb-4 flex justify-center">
              {country.flagImage ? (
                <img 
                  src={country.flagImage} 
                  alt={`${country.name} flag`}
                  className="w-20 h-14 object-cover rounded-md shadow-lg border-2 border-border"
                />
              ) : (
                <div className="text-6xl">{country.flag}</div>
              )}
            </div>
            
            {/* Headlines */}
            <h1 className={`text-3xl font-bold text-foreground mb-2 ${language === 'ar' ? 'arabic-text' : ''}`}>
              {language === 'ar' 
                ? `${country.nameAr} العطل الرسمية ${selectedYear}`
                : `${country.name} Public Holidays ${selectedYear}`
              }
            </h1>
            
            <h2 className={`text-xl font-semibold text-muted-foreground mb-4 ${language === 'ar' ? 'arabic-text' : ''}`}>
              {language === 'ar' ? 'التقويم الرسمي' : 'Official Calendar'}
            </h2>
            
            <p className={`text-sm text-muted-foreground ${language === 'ar' ? 'arabic-text' : ''}`}>
              {language === 'ar' 
                ? `دليل شامل للعطل الإسلامية والأيام الوطنية وجدول العمل في ${country.nameAr}`
                : `Complete Guide to Islamic Holidays, National Days & Work Schedule in ${country.name}`
              }
            </p>
          </div>
        </div>

        {/* Calendar Section */}
        <section className="mb-12">
          <Calendar 
            year={selectedYear} 
            language={language} 
            countryCode={selectedCountry}
            holidays={holidays}
          />
        </section>

        {/* Long Weekends Section */}
        <LongWeekends
          holidays={holidays}
          countryCode={selectedCountry}
          year={selectedYear}
          language={language}
          weekendDays={getWeekendDays(selectedCountry)}
        />

        {/* Holidays List */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              {language === 'ar' ? 'قائمة العطل الرسمية' : 'Public Holidays List'}
            </h3>
            <div className="bg-muted/50 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>{language === 'ar' ? 'أيام العطل الأسبوعية:' : 'Weekend Days:'}</strong>{' '}
                {getWeekendDays(selectedCountry).join(' & ')}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' 
                  ? 'ملاحظة: تواريخ العطل الدينية قد تختلف حسب رؤية الهلال وقد تتغير بيوم واحد. يرجى التحقق من المصادر الرسمية للتأكيد.'
                  : 'Note: Religious holiday dates may vary based on moon sighting and could change by one day. Please check official sources for confirmation.'
                }
              </p>
            </div>
          </div>

          <div className="grid gap-4 max-w-4xl mx-auto">
            {holidays.map((holiday, index) => (
              <Card key={index} className="bg-card hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CalendarDays className="h-5 w-5 text-red-500" />
                        <h4 className="text-xl font-semibold text-foreground">
                          {language === 'ar' ? holiday.nameAr : holiday.name}
                        </h4>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {new Date(holiday.date).toLocaleDateString(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }
                        )}
                      </p>
                      {holiday.duration && holiday.duration > 1 && (
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' 
                            ? `مدة العطلة: ${holiday.duration} أيام`
                            : `Duration: ${holiday.duration} days`
                          }
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getHolidayTypeColor(holiday.type)}>
                        {language === 'ar' 
                          ? (holiday.type === 'religious' ? 'ديني' : 'وطني')
                          : (holiday.type === 'religious' ? 'Religious' : 'National')
                        }
                      </Badge>
                      <Badge variant="outline">
                        {language === 'ar' ? 'عطلة رسمية' : 'Official Holiday'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Note about holidays */}
          <div className="text-center mt-8">
            <div className="bg-card border border-border rounded-lg p-6 max-w-4xl mx-auto">
              <h4 className="font-semibold text-foreground mb-3">
                {language === 'ar' ? 'معلومات مهمة عن العطل' : 'Important Holiday Information'}
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p className="mb-2">
                    <strong>{language === 'ar' ? 'العطل الدينية:' : 'Religious Holidays:'}</strong>
                  </p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>{language === 'ar' ? 'تحدد وفقاً للتقويم الهجري' : 'Based on Islamic (Hijri) calendar'}</li>
                    <li>{language === 'ar' ? 'قد تتغير حسب رؤية الهلال' : 'May vary based on moon sighting'}</li>
                    <li>{language === 'ar' ? 'عادة ما تكون متعددة الأيام' : 'Usually span multiple days'}</li>
                  </ul>
                </div>
                <div>
                  <p className="mb-2">
                    <strong>{language === 'ar' ? 'العطل الوطنية:' : 'National Holidays:'}</strong>
                  </p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>{language === 'ar' ? 'تواريخ ثابتة كل عام' : 'Fixed dates every year'}</li>
                    <li>{language === 'ar' ? 'تحتفل بالمناسبات التاريخية' : 'Celebrate historical events'}</li>
                    <li>{language === 'ar' ? 'عادة ما تكون يوم واحد' : 'Usually single-day observances'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};