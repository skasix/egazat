import { SEOHead } from "@/components/SEOHead";
import { Header } from "@/components/Header";

interface SitemapProps {
  language?: string;
}

const countries = [
  { code: 'ae', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates' },
  { code: 'sa', nameAr: 'السعودية', nameEn: 'Saudi Arabia' },
  { code: 'eg', nameAr: 'مصر', nameEn: 'Egypt' },
  { code: 'jo', nameAr: 'الأردن', nameEn: 'Jordan' },
  { code: 'lb', nameAr: 'لبنان', nameEn: 'Lebanon' },
  { code: 'sy', nameAr: 'سوريا', nameEn: 'Syria' },
  { code: 'iq', nameAr: 'العراق', nameEn: 'Iraq' },
  { code: 'kw', nameAr: 'الكويت', nameEn: 'Kuwait' },
  { code: 'qa', nameAr: 'قطر', nameEn: 'Qatar' },
  { code: 'bh', nameAr: 'البحرين', nameEn: 'Bahrain' },
  { code: 'om', nameAr: 'عمان', nameEn: 'Oman' },
  { code: 'ye', nameAr: 'اليمن', nameEn: 'Yemen' },
  { code: 'ma', nameAr: 'المغرب', nameEn: 'Morocco' },
  { code: 'tn', nameAr: 'تونس', nameEn: 'Tunisia' },
  { code: 'dz', nameAr: 'الجزائر', nameEn: 'Algeria' },
  { code: 'ly', nameAr: 'ليبيا', nameEn: 'Libya' },
  { code: 'sd', nameAr: 'السودان', nameEn: 'Sudan' },
  { code: 'so', nameAr: 'الصومال', nameEn: 'Somalia' },
  { code: 'dj', nameAr: 'جيبوتي', nameEn: 'Djibouti' },
  { code: 'km', nameAr: 'جزر القمر', nameEn: 'Comoros' },
];

const years = [2025, 2026, 2027, 2028];

export const Sitemap = ({ language = 'ar' }: SitemapProps) => {
  const isArabic = language === 'ar';

  const title = isArabic ? 'خريطة الموقع - العطل الرسمية العربية' : 'Sitemap - Arab Public Holidays';
  const description = isArabic 
    ? 'خريطة الموقع الكاملة لجميع صفحات العطل الرسمية في الدول العربية'
    : 'Complete sitemap of all Arab public holidays pages';

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        language={language}
      />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
          {isArabic ? 'خريطة الموقع' : 'Sitemap'}
        </h1>

        {/* Home Pages Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-foreground border-b border-border pb-2">
            {isArabic ? 'الصفحة الرئيسية' : 'Home Pages'}
          </h2>
          <ul className="space-y-2">
            <li>
              <a href="/" className="text-primary hover:underline">
                {isArabic ? 'الصفحة الرئيسية (عربي)' : 'Homepage (Arabic)'}
              </a>
            </li>
            <li>
              <a href="/en.html" className="text-primary hover:underline">
                {isArabic ? 'الصفحة الرئيسية (English)' : 'Homepage (English)'}
              </a>
            </li>
          </ul>
        </section>

        {/* Country Pages Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-foreground border-b border-border pb-2">
            {isArabic ? 'صفحات الدول' : 'Country Pages'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {countries.map((country) => (
              <div key={country.code} className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  {isArabic ? country.nameAr : country.nameEn}
                </h3>
                
                {/* Arabic Pages */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    {isArabic ? 'الصفحات العربية' : 'Arabic Pages'}
                  </h4>
                  <ul className="space-y-1">
                    {years.map((year) => (
                      <li key={`ar-${year}`}>
                        <a
                          href={`/ar/country/${country.code}/${year}.html`}
                          className="text-primary hover:underline text-sm"
                        >
                          {isArabic ? `العطل الرسمية ${year}` : `Public Holidays ${year}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* English Pages */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    {isArabic ? 'الصفحات الإنجليزية' : 'English Pages'}
                  </h4>
                  <ul className="space-y-1">
                    {years.map((year) => (
                      <li key={`en-${year}`}>
                        <a
                          href={`/en/country/${country.code}/${year}.html`}
                          className="text-primary hover:underline text-sm"
                        >
                          {isArabic ? `العطل الرسمية ${year}` : `Public Holidays ${year}`}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Summary Section */}
        <section className="mt-12 bg-muted/50 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-3 text-foreground">
            {isArabic ? 'ملخص' : 'Summary'}
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              {isArabic 
                ? `📍 ${countries.length} دولة عربية`
                : `📍 ${countries.length} Arab countries`}
            </li>
            <li>
              {isArabic 
                ? `📅 ${years.length} سنوات (${years.join(', ')})`
                : `📅 ${years.length} years (${years.join(', ')})`}
            </li>
            <li>
              {isArabic 
                ? `🌐 لغتين (العربية والإنجليزية)`
                : `🌐 2 languages (Arabic & English)`}
            </li>
            <li>
              {isArabic 
                ? `📄 إجمالي الصفحات: ${countries.length * years.length * 2 + 2}`
                : `📄 Total pages: ${countries.length * years.length * 2 + 2}`}
            </li>
          </ul>
        </section>
      </main>
    </>
  );
};