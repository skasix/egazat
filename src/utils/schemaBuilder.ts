// JSON-LD Schema builders for SEO structured data

const BASE_URL = 'https://egazat.com';

interface HolidayForSchema {
  name: string;
  nameAr: string;
  date: string;
  type: string;
  duration?: number;
}

/**
 * Event schema for a single public holiday
 */
export function buildEventSchema(holiday: HolidayForSchema, countryCode: string, countryName: string, lang: string) {
  const endDate = holiday.duration && holiday.duration > 1
    ? new Date(new Date(holiday.date).getTime() + (holiday.duration - 1) * 86400000).toISOString().split('T')[0]
    : holiday.date;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: lang === 'ar' ? holiday.nameAr : holiday.name,
    startDate: holiday.date,
    endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    description: lang === 'ar'
      ? `${holiday.nameAr} — عطلة رسمية في ${countryName}`
      : `${holiday.name} — Public Holiday in ${countryName}`,
    inLanguage: lang,
    location: {
      '@type': 'Country',
      name: countryName,
      address: {
        '@type': 'PostalAddress',
        addressCountry: countryCode.toUpperCase()
      }
    },
    organizer: {
      '@type': 'GovernmentOrganization',
      name: lang === 'ar' ? `حكومة ${countryName}` : `Government of ${countryName}`,
      url: `${BASE_URL}/${lang}/country/${countryCode}/`
    }
  };
}

/**
 * ItemList schema for a country/year page listing all holidays
 */
export function buildItemListSchema(holidays: HolidayForSchema[], countryCode: string, year: number, countryName: string, lang: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: lang === 'ar'
      ? `العطل الرسمية في ${countryName} ${year}`
      : `Public Holidays in ${countryName} ${year}`,
    description: lang === 'ar'
      ? `قائمة كاملة بالعطل الرسمية والمناسبات الوطنية في ${countryName} لعام ${year}`
      : `Complete list of public holidays and national events in ${countryName} for ${year}`,
    url: `${BASE_URL}/${lang}/country/${countryCode}/${year}.html`,
    numberOfItems: holidays.length,
    inLanguage: lang,
    itemListElement: holidays.map((holiday, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: lang === 'ar' ? holiday.nameAr : holiday.name,
      item: {
        '@type': 'Event',
        name: lang === 'ar' ? holiday.nameAr : holiday.name,
        startDate: holiday.date,
        url: `${BASE_URL}/${lang}/country/${countryCode}/${year}.html`
      }
    }))
  };
}

/**
 * BreadcrumbList schema — shows navigation path in Google SERPs
 */
export function buildBreadcrumbSchema(countryCode: string, year: number, countryName: string, lang: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Egazat',
        item: BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: countryName,
        item: `${BASE_URL}/${lang}/country/${countryCode}/`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: String(year),
        item: `${BASE_URL}/${lang}/country/${countryCode}/${year}.html`
      }
    ]
  };
}

/**
 * WebSite schema — homepage only
 */
export function buildWebsiteSchema(lang: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: lang === 'ar' ? 'Egazat — العطل الرسمية العربية' : 'Egazat — Arabic Public Holidays',
    url: BASE_URL,
    description: lang === 'ar'
      ? 'دليل شامل للعطل والمناسبات الرسمية في الدول العربية'
      : 'Complete guide to public holidays in Arab countries',
    inLanguage: lang,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/{lang}/country/{country}/{year}.html`
      },
      'query-input': 'required name=country'
    }
  };
}
