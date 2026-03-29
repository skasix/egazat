import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar } from 'lucide-react';
import { LazyImage } from '@/components/LazyImage';
import countriesJsonData from '@/data/countries.json';

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

interface CountryCardsProps {
  language: string;
  year: number;
}

const flagImages: Record<string, string> = {
  ae: aeFlag, sa: saFlag, eg: egFlag, ma: maFlag, jo: joFlag,
  kw: kwFlag, qa: qaFlag, lb: lbFlag, bh: bhFlag, om: omFlag,
  tn: tnFlag, dz: dzFlag, sy: syFlag, iq: iqFlag, ye: yeFlag,
  ly: lyFlag, sd: sdFlag, so: soFlag, dj: djFlag, km: kmFlag,
};

export const CountryCards = ({ language, year }: CountryCardsProps) => {
  const clusters = (countriesJsonData as any).clusters || [];

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
        <p className="text-sm text-muted-foreground mt-2">
          {language === 'ar' 
            ? `آخر تحديث: ${new Date().getFullYear()}`
            : `Last updated: ${new Date().getFullYear()}`
          }
        </p>
      </div>

      {clusters.map((cluster: any) => {
        const clusterCountries = cluster.countries
          .map((code: string) => countriesJsonData.countries.find((c: any) => c.code === code))
          .filter(Boolean);

        return (
          <div key={cluster.slug} className="mb-12">
            <h4 className={`text-2xl font-semibold text-primary mb-6 text-center ${language === 'ar' ? 'arabic-text' : ''}`}>
              {language === 'ar' ? cluster.name_ar : cluster.name_en}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {clusterCountries.map((country: any) => {
                const flagImg = flagImages[country.code];
                const countryName = language === 'ar' ? country.name_ar : country.name_en;
                const shortName = language === 'ar' ? country.short_name_ar : country.short_name_en;
                const url = `/${language}/country/${country.code}/${year}.html`;

                return (
                  <a key={country.code} href={url} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Card 
                      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/30 bg-gradient-to-br from-card to-card/80 h-full"
                      data-country-code={country.code}
                    >
                      <CardHeader className="text-center pb-3">
                        <div className="mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                          {flagImg ? (
                            <LazyImage 
                              src={flagImg} 
                              alt={`${countryName} flag`}
                              className="w-20 h-14 object-cover rounded-md shadow-lg border-2 border-border"
                              width={80}
                              height={56}
                            />
                          ) : (
                            <div className="text-5xl">🏳️</div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-xl font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                            {country.code.toUpperCase()}
                          </span>
                        </div>
                        
                        <CardTitle className={`text-lg font-semibold text-foreground group-hover:text-primary transition-colors ${language === 'ar' ? 'arabic-text' : ''}`}>
                          {shortName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center pt-0">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">
                            {language === 'ar' ? cluster.name_ar : cluster.name_en}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          tabIndex={-1}
                        >
                          <Calendar className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                          <span className={language === 'ar' ? 'arabic-text' : ''}>
                            {language === 'ar' ? 'عرض العطل' : 'View Holidays'}
                          </span>
                        </Button>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
