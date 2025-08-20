import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Calendar } from '@/components/Calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CalendarDays } from 'lucide-react';

const arabicCountries = {
  'ae': { name: 'United Arab Emirates', nameAr: 'دولة الإمارات العربية المتحدة', flag: '🇦🇪' },
  'sa': { name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', flag: '🇸🇦' },
  'eg': { name: 'Egypt', nameAr: 'جمهورية مصر العربية', flag: '🇪🇬' },
  'jo': { name: 'Jordan', nameAr: 'المملكة الأردنية الهاشمية', flag: '🇯🇴' },
  'lb': { name: 'Lebanon', nameAr: 'الجمهورية اللبنانية', flag: '🇱🇧' },
  'sy': { name: 'Syria', nameAr: 'الجمهورية العربية السورية', flag: '🇸🇾' },
  'iq': { name: 'Iraq', nameAr: 'جمهورية العراق', flag: '🇮🇶' },
  'kw': { name: 'Kuwait', nameAr: 'دولة الكويت', flag: '🇰🇼' },
  'qa': { name: 'Qatar', nameAr: 'دولة قطر', flag: '🇶🇦' },
  'bh': { name: 'Bahrain', nameAr: 'مملكة البحرين', flag: '🇧🇭' },
  'om': { name: 'Oman', nameAr: 'سلطنة عمان', flag: '🇴🇲' },
  'ye': { name: 'Yemen', nameAr: 'الجمهورية اليمنية', flag: '🇾🇪' },
  'ma': { name: 'Morocco', nameAr: 'المملكة المغربية', flag: '🇲🇦' },
  'tn': { name: 'Tunisia', nameAr: 'الجمهورية التونسية', flag: '🇹🇳' },
  'dz': { name: 'Algeria', nameAr: 'الجمهورية الجزائرية الديمقراطية الشعبية', flag: '🇩🇿' },
  'ly': { name: 'Libya', nameAr: 'دولة ليبيا', flag: '🇱🇾' }
};

// Sample holidays data - will be replaced with real data later
const sampleHolidays = [
  {
    name: 'New Year\'s Day',
    nameAr: 'رأس السنة الميلادية',
    date: '2024-01-01',
    type: 'national',
    isFixed: true
  },
  {
    name: 'Eid al-Fitr',
    nameAr: 'عيد الفطر',
    date: '2024-04-10',
    type: 'religious',
    isFixed: false,
    duration: 3
  },
  {
    name: 'National Day',
    nameAr: 'اليوم الوطني',
    date: '2024-12-02',
    type: 'national',
    isFixed: true
  },
  {
    name: 'Eid al-Adha',
    nameAr: 'عيد الأضحى',
    date: '2024-06-16',
    type: 'religious',
    isFixed: false,
    duration: 4
  }
];

export const CountryPage = () => {
  const { countryCode, year } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [selectedYear, setSelectedYear] = useState(parseInt(year || '2024'));
  const [selectedCountry, setSelectedCountry] = useState(countryCode || 'ae');

  const country = arabicCountries[selectedCountry as keyof typeof arabicCountries];

  useEffect(() => {
    if (year && countryCode) {
      setSelectedYear(parseInt(year));
      setSelectedCountry(countryCode);
    }
  }, [year, countryCode]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    navigate(`/country/${selectedCountry}/${newYear}`);
  };

  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
    navigate(`/country/${newCountry}/${selectedYear}`);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const getHolidayTypeColor = (type: string) => {
    switch (type) {
      case 'religious':
        return 'bg-accent text-accent-foreground';
      case 'national':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (!country) {
    return <div>Country not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        selectedLanguage={language}
        selectedYear={selectedYear}
        selectedCountry={selectedCountry}
        onLanguageChange={handleLanguageChange}
        onYearChange={handleYearChange}
        onCountryChange={handleCountryChange}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToHome}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </div>

        {/* Country Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-6xl">{country.flag}</span>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                {language === 'ar' ? country.nameAr : country.name}
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                {language === 'ar' 
                  ? `العطل الرسمية لعام ${selectedYear}`
                  : `Public Holidays ${selectedYear}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <section className="mb-12">
          <Calendar year={selectedYear} language={language} />
        </section>

        {/* Holidays List */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              {language === 'ar' ? 'قائمة العطل الرسمية' : 'Public Holidays List'}
            </h3>
          </div>

          <div className="grid gap-4 max-w-4xl mx-auto">
            {sampleHolidays.map((holiday, index) => (
              <Card key={index} className="bg-card hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
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
                      {holiday.duration && (
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
                        {holiday.isFixed 
                          ? (language === 'ar' ? 'ثابت' : 'Fixed')
                          : (language === 'ar' ? 'متحرك' : 'Variable')
                        }
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Note about holidays */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'ملاحظة: تواريخ العطل الدينية قد تختلف حسب رؤية الهلال وقد تتغير بيوم واحد. يرجى التحقق من المصادر الرسمية للتأكيد.'
                : 'Note: Religious holiday dates may vary based on moon sighting and could change by one day. Please check official sources for confirmation.'
              }
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};