import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';
import { generateCountryUrl } from '@/utils/seoRoutes';

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
    flagImage: aeFlag,
    region: 'Gulf'
  },
  { 
    code: 'sa', 
    name: 'Saudi Arabia', 
    nameAr: 'المملكة العربية السعودية',
    flag: '🇸🇦',
    flagImage: saFlag,
    region: 'Gulf'
  },
  { 
    code: 'eg', 
    name: 'Egypt', 
    nameAr: 'جمهورية مصر العربية',
    flag: '🇪🇬',
    flagImage: egFlag,
    region: 'North Africa'
  },
  { 
    code: 'jo', 
    name: 'Jordan', 
    nameAr: 'المملكة الأردنية الهاشمية',
    flag: '🇯🇴',
    flagImage: joFlag,
    region: 'Levant'
  },
  { 
    code: 'lb', 
    name: 'Lebanon', 
    nameAr: 'الجمهورية اللبنانية',
    flag: '🇱🇧',
    flagImage: lbFlag,
    region: 'Levant'
  },
  { 
    code: 'sy', 
    name: 'Syria', 
    nameAr: 'الجمهورية العربية السورية',
    flag: '🇸🇾',
    flagImage: syFlag,
    region: 'Levant'
  },
  { 
    code: 'iq', 
    name: 'Iraq', 
    nameAr: 'جمهورية العراق',
    flag: '🇮🇶',
    flagImage: iqFlag,
    region: 'Levant'
  },
  { 
    code: 'kw', 
    name: 'Kuwait', 
    nameAr: 'دولة الكويت',
    flag: '🇰🇼',
    flagImage: kwFlag,
    region: 'Gulf'
  },
  { 
    code: 'qa', 
    name: 'Qatar', 
    nameAr: 'دولة قطر',
    flag: '🇶🇦',
    flagImage: qaFlag,
    region: 'Gulf'
  },
  { 
    code: 'bh', 
    name: 'Bahrain', 
    nameAr: 'مملكة البحرين',
    flag: '🇧🇭',
    flagImage: bhFlag,
    region: 'Gulf'
  },
  { 
    code: 'om', 
    name: 'Oman', 
    nameAr: 'سلطنة عمان',
    flag: '🇴🇲',
    flagImage: omFlag,
    region: 'Gulf'
  },
  { 
    code: 'ye', 
    name: 'Yemen', 
    nameAr: 'الجمهورية اليمنية',
    flag: '🇾🇪',
    flagImage: yeFlag,
    region: 'Gulf'
  },
  { 
    code: 'ma', 
    name: 'Morocco', 
    nameAr: 'المملكة المغربية',
    flag: '🇲🇦',
    flagImage: maFlag,
    region: 'North Africa'
  },
  { 
    code: 'tn', 
    name: 'Tunisia', 
    nameAr: 'الجمهورية التونسية',
    flag: '🇹🇳',
    flagImage: tnFlag,
    region: 'North Africa'
  },
  { 
    code: 'dz', 
    name: 'Algeria', 
    nameAr: 'الجمهورية الجزائرية الديمقراطية الشعبية',
    flag: '🇩🇿',
    flagImage: dzFlag,
    region: 'North Africa'
  },
  { 
    code: 'ly', 
    name: 'Libya', 
    nameAr: 'دولة ليبيا',
    flag: '🇱🇾',
    flagImage: lyFlag,
    region: 'North Africa'
  }
];

export const CountryCards = ({ language, year }: CountryCardsProps) => {
  const navigate = useNavigate();

  const handleCountryClick = (countryCode: string) => {
    navigate(generateCountryUrl(language, countryCode, year));
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
        <h3 className={`text-3xl font-bold text-foreground mb-4 ${language === 'ar' ? 'arabic-text' : ''}`}>
          {language === 'ar' ? 'اختر الدولة العربية' : 'Select an Arab Country'}
        </h3>
        <p className={`text-muted-foreground text-lg ${language === 'ar' ? 'arabic-text' : ''}`}>
          {language === 'ar' 
            ? 'استكشف العطل الرسمية والمناسبات الوطنية لكل دولة عربية'
            : 'Explore public holidays and national occasions for each Arab country'
          }
        </p>
      </div>

      {Object.entries(groupedCountries).map(([region, countries]) => (
        <div key={region} className="mb-12">
          <h4 className={`text-2xl font-semibold text-primary mb-6 text-center ${language === 'ar' ? 'arabic-text' : ''}`}>
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
                  {/* Large flag image at top */}
                  <div className="mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                    {country.flagImage ? (
                      <img 
                        src={country.flagImage} 
                        alt={`${country.name} flag`}
                        className="w-20 h-14 object-cover rounded-md shadow-lg border-2 border-border"
                      />
                    ) : (
                      <div className="text-5xl">
                        {country.flag}
                      </div>
                    )}
                  </div>
                  
                  {/* Flag image + Country Code */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {country.flagImage ? (
                      <img 
                        src={country.flagImage} 
                        alt={`${country.name} flag`}
                        className="w-8 h-6 object-cover rounded-sm border border-border"
                      />
                    ) : (
                      <span className="text-2xl">{country.flag}</span>
                    )}
                    <span className="text-xl font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                      {country.code.toUpperCase()}
                    </span>
                  </div>
                  
                   <CardTitle className={`text-lg font-semibold text-foreground group-hover:text-primary transition-colors ${language === 'ar' ? 'arabic-text' : ''}`}>
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
                    <Calendar className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    <span className={language === 'ar' ? 'arabic-text' : ''}>
                      {language === 'ar' ? 'عرض العطل' : 'View Holidays'}
                    </span>
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