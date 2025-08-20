import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';

interface CountryCardsProps {
  language: string;
  year: number;
}

const arabicCountries = [
  { 
    code: 'ae', 
    name: 'United Arab Emirates', 
    nameAr: 'دولة الإمارات العربية المتحدة',
    flag: '🇦🇪',
    region: 'Gulf'
  },
  { 
    code: 'sa', 
    name: 'Saudi Arabia', 
    nameAr: 'المملكة العربية السعودية',
    flag: '🇸🇦',
    region: 'Gulf'
  },
  { 
    code: 'eg', 
    name: 'Egypt', 
    nameAr: 'جمهورية مصر العربية',
    flag: '🇪🇬',
    region: 'North Africa'
  },
  { 
    code: 'jo', 
    name: 'Jordan', 
    nameAr: 'المملكة الأردنية الهاشمية',
    flag: '🇯🇴',
    region: 'Levant'
  },
  { 
    code: 'lb', 
    name: 'Lebanon', 
    nameAr: 'الجمهورية اللبنانية',
    flag: '🇱🇧',
    region: 'Levant'
  },
  { 
    code: 'sy', 
    name: 'Syria', 
    nameAr: 'الجمهورية العربية السورية',
    flag: '🇸🇾',
    region: 'Levant'
  },
  { 
    code: 'iq', 
    name: 'Iraq', 
    nameAr: 'جمهورية العراق',
    flag: '🇮🇶',
    region: 'Levant'
  },
  { 
    code: 'kw', 
    name: 'Kuwait', 
    nameAr: 'دولة الكويت',
    flag: '🇰🇼',
    region: 'Gulf'
  },
  { 
    code: 'qa', 
    name: 'Qatar', 
    nameAr: 'دولة قطر',
    flag: '🇶🇦',
    region: 'Gulf'
  },
  { 
    code: 'bh', 
    name: 'Bahrain', 
    nameAr: 'مملكة البحرين',
    flag: '🇧🇭',
    region: 'Gulf'
  },
  { 
    code: 'om', 
    name: 'Oman', 
    nameAr: 'سلطنة عمان',
    flag: '🇴🇲',
    region: 'Gulf'
  },
  { 
    code: 'ye', 
    name: 'Yemen', 
    nameAr: 'الجمهورية اليمنية',
    flag: '🇾🇪',
    region: 'Gulf'
  },
  { 
    code: 'ma', 
    name: 'Morocco', 
    nameAr: 'المملكة المغربية',
    flag: '🇲🇦',
    region: 'North Africa'
  },
  { 
    code: 'tn', 
    name: 'Tunisia', 
    nameAr: 'الجمهورية التونسية',
    flag: '🇹🇳',
    region: 'North Africa'
  },
  { 
    code: 'dz', 
    name: 'Algeria', 
    nameAr: 'الجمهورية الجزائرية الديمقراطية الشعبية',
    flag: '🇩🇿',
    region: 'North Africa'
  },
  { 
    code: 'ly', 
    name: 'Libya', 
    nameAr: 'دولة ليبيا',
    flag: '🇱🇾',
    region: 'North Africa'
  }
];

export const CountryCards = ({ language, year }: CountryCardsProps) => {
  const navigate = useNavigate();

  const handleCountryClick = (countryCode: string) => {
    navigate(`/country/${countryCode}/${year}`);
  };

  // Group countries by region
  const groupedCountries = arabicCountries.reduce((acc, country) => {
    const region = country.region;
    if (!acc[region]) {
      acc[region] = [];
    }
    acc[region].push(country);
    return acc;
  }, {} as Record<string, typeof arabicCountries>);

  const regionNames = {
    'Gulf': language === 'ar' ? 'دول الخليج العربي' : 'Gulf Countries',
    'Levant': language === 'ar' ? 'بلاد الشام' : 'Levant Countries', 
    'North Africa': language === 'ar' ? 'شمال أفريقيا' : 'North African Countries'
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      <div className="text-center mb-12">
        <h3 className="text-3xl font-bold text-foreground mb-4">
          {language === 'ar' ? 'اختر دولة عربية' : 'Select an Arab Country'}
        </h3>
        <p className="text-muted-foreground text-lg">
          {language === 'ar' 
            ? 'اطلع على العطل الرسمية والمناسبات الوطنية لكل دولة عربية'
            : 'Explore public holidays and national occasions for each Arab country'
          }
        </p>
      </div>

      {Object.entries(groupedCountries).map(([region, countries]) => (
        <div key={region} className="mb-12">
          <h4 className="text-2xl font-semibold text-primary mb-6 text-center">
            {regionNames[region as keyof typeof regionNames]}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {countries.map(country => (
              <Card 
                key={country.code} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/30 bg-gradient-to-br from-card to-card/80"
                onClick={() => handleCountryClick(country.code)}
              >
                <CardHeader className="text-center pb-3">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {country.flag}
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {language === 'ar' ? country.nameAr : country.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      {regionNames[country.region as keyof typeof regionNames]}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {language === 'ar' ? 'عرض العطل' : 'View Holidays'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};