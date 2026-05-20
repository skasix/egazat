import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { generateCountryUrl } from '@/utils/seoRoutes';
import countriesData from '@/data/countries.json';
import holidaysData from '@/data/holidays.json';

const countryOrder = [
  'sa', 'ae', 'eg', 'jo', 'lb', 'sy', 'iq', 'kw', 'qa', 'bh',
  'om', 'ye', 'ma', 'tn', 'dz', 'ly', 'sd', 'so', 'dj', 'km'
];

const countriesMap = new Map(
  countriesData.countries.map((c: any) => [c.code, c])
);

function formatDateEn(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateAr(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getDayOfWeek(dateStr: string, lang: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long' });
}

interface EidEntry {
  countryCode: string;
  countryName: string;
  date: string;
  dateFormatted: string;
  dayOfWeek: string;
  duration: number;
  status: string;
}

function getEidData(eidName: string, year: number, lang: string): EidEntry[] {
  const entries: EidEntry[] = [];
  const hData = holidaysData as Record<string, Record<string, any[]>>;

  for (const code of countryOrder) {
    const country = countriesMap.get(code);
    if (!country) continue;

    const yearStr = String(year);
    const holidays = hData[code]?.[yearStr];
    if (!holidays) continue;

    const eid = holidays.find((h: any) =>
      h.name_en?.toLowerCase().includes(eidName.toLowerCase()) ||
      h.name_ar?.includes(eidName === 'fitr' ? 'الفطر' : 'الأضحى')
    );

    if (eid) {
      entries.push({
        countryCode: code,
        countryName: lang === 'ar' ? country.short_name_ar : country.short_name_en,
        date: eid.date,
        dateFormatted: lang === 'ar' ? formatDateAr(eid.date) : formatDateEn(eid.date),
        dayOfWeek: getDayOfWeek(eid.date, lang),
        duration: eid.duration || 1,
        status: lang === 'ar' ? 'متوقع' : 'Expected'
      });
    }
  }

  return entries;
}

export const EidTracker = () => {
  const { lang, year: yearParam } = useParams();
  const navigate = useNavigate();
  const language = lang === 'en' ? 'en' : 'ar';
  const year = yearParam ? parseInt(yearParam) : 2026;
  const isAr = language === 'ar';

  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedCountry, setSelectedCountry] = useState('ae');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  }, [language, isAr]);

  const fitrData = getEidData('fitr', selectedYear, language);
  const adhaData = getEidData('adha', selectedYear, language);

  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  const renderTable = (data: EidEntry[], title: string) => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className={`text-2xl ${isAr ? 'arabic-text text-right' : ''}`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className={`p-3 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>
                  {isAr ? 'الدولة' : 'Country'}
                </th>
                <th className={`p-3 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>
                  {isAr ? 'التاريخ' : 'Holiday Date'}
                </th>
                <th className={`p-3 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>
                  {isAr ? 'المدة' : 'Duration'}
                </th>
                <th className={`p-3 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>
                  {isAr ? 'اليوم' : 'Day of Week'}
                </th>
                <th className={`p-3 font-semibold ${isAr ? 'text-right' : 'text-left'}`}>
                  {isAr ? 'الحالة' : 'Status'}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry) => (
                <tr key={entry.countryCode} className="border-b border-border/50 hover:bg-muted/50">
                  <td className={`p-3 font-medium ${isAr ? 'text-right' : ''}`}>
                    <a
                      href={`/${language}/country/${entry.countryCode}/${selectedYear}.html`}
                      className="text-primary hover:underline"
                    >
                      {entry.countryName}
                    </a>
                  </td>
                  <td className={`p-3 ${isAr ? 'text-right' : ''}`}>{entry.dateFormatted}</td>
                  <td className={`p-3 ${isAr ? 'text-right' : ''}`}>
                    {entry.duration} {isAr ? 'أيام' : entry.duration === 1 ? 'day' : 'days'}
                  </td>
                  <td className={`p-3 ${isAr ? 'text-right' : ''}`}>{entry.dayOfWeek}</td>
                  <td className={`p-3 ${isAr ? 'text-right' : ''}`}>
                    <Badge variant="outline">{entry.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const seoTitle = isAr
    ? `مواعيد عيد الفطر وعيد الأضحى ${selectedYear} — جميع الدول العربية | إجازات`
    : `Eid Al-Fitr & Eid Al-Adha ${selectedYear} Dates — All Arab Countries | Egazat`;

  const seoDesc = isAr
    ? `مواعيد عيد الفطر وعيد الأضحى ${selectedYear} في السعودية والإمارات ومصر وجميع الدول العربية. تواريخ رسمية ومتوقعة محدّثة.`
    : `Eid Al-Fitr and Eid Al-Adha ${selectedYear} dates for Saudi Arabia, UAE, Egypt and all Arab countries. Official and expected dates updated by moon sighting.`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        language={language}
      />
      <Header
        selectedLanguage={language}
        selectedYear={selectedYear}
        selectedCountry={selectedCountry}
        onLanguageChange={(newLang) => navigate(`/${newLang}/eid/${selectedYear}.html`)}
        onYearChange={(newYear) => {
          setSelectedYear(newYear);
          navigate(`/${language}/eid/${newYear}.html`);
        }}
        onCountryChange={setSelectedCountry}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className={`text-3xl md:text-4xl font-bold text-foreground mb-4 ${isAr ? 'arabic-text' : ''}`}>
            {isAr
              ? `🌙 مواعيد عيد الفطر وعيد الأضحى ${selectedYear} في الدول العربية`
              : `🌙 Eid Al-Fitr & Eid Al-Adha ${selectedYear} Dates in Arab Countries`}
          </h1>
          <p className={`text-muted-foreground max-w-3xl mx-auto leading-relaxed ${isAr ? 'arabic-text' : ''}`}>
            {isAr
              ? 'تُحدد مواعيد عيد الفطر وعيد الأضحى وفقاً للتقويم الهجري القمري. تعتمد التواريخ الدقيقة على رؤية الهلال (الاستطلاع الشرعي)، وقد تختلف بيوم واحد بين الدول. تجمع هذه الصفحة التواريخ المتوقعة والمؤكدة رسمياً لجميع الدول العربية.'
              : 'Eid Al-Fitr and Eid Al-Adha dates are determined by the Islamic lunar calendar. Exact dates depend on moon sighting confirmation (hilal), and may differ by one day between countries. This page consolidates expected and officially confirmed dates for all Arab countries.'}
          </p>
        </div>

        {/* Eid al-Fitr Table */}
        {renderTable(
          fitrData,
          isAr ? `🌙 عيد الفطر ${selectedYear}` : `🌙 Eid Al-Fitr ${selectedYear}`
        )}

        {/* Eid al-Adha Table */}
        {renderTable(
          adhaData,
          isAr ? `🐑 عيد الأضحى ${selectedYear}` : `🐑 Eid Al-Adha ${selectedYear}`
        )}

        {/* Year Navigation */}
        <section className="mb-12 text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isAr ? 'arabic-text' : ''}`}>
            {isAr ? 'سنوات أخرى' : 'Other Years'}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {years.map((y) => (
              <Button
                key={y}
                variant={y === selectedYear ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedYear(y);
                  navigate(`/${language}/eid/${y}.html`);
                }}
              >
                {y}
              </Button>
            ))}
          </div>
        </section>

        {/* Country Links Grid */}
        <section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 text-center ${isAr ? 'arabic-text' : ''}`}>
            {isAr ? 'صفحات الدول' : 'Country Pages'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {countryOrder.map((code) => {
              const country = countriesMap.get(code);
              if (!country) return null;
              return (
                <a
                  key={code}
                  href={generateCountryUrl(language, code, 2026)}
                  className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors text-center"
                >
                  <span className={`text-sm font-medium ${isAr ? 'arabic-text' : ''}`}>
                    {isAr ? country.short_name_ar : country.short_name_en}
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
