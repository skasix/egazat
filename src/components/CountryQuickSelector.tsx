import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { generateCountryUrl } from '@/utils/seoRoutes';

interface CountryQuickSelectorProps {
  language: string;
  year: number;
}

const countries = [
  { code: 'ae', name: 'UAE', nameAr: 'الإمارات' },
  { code: 'sa', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: 'eg', name: 'Egypt', nameAr: 'مصر' },
  { code: 'jo', name: 'Jordan', nameAr: 'الأردن' },
  { code: 'lb', name: 'Lebanon', nameAr: 'لبنان' },
  { code: 'sy', name: 'Syria', nameAr: 'سوريا' },
  { code: 'iq', name: 'Iraq', nameAr: 'العراق' },
  { code: 'kw', name: 'Kuwait', nameAr: 'الكويت' },
  { code: 'qa', name: 'Qatar', nameAr: 'قطر' },
  { code: 'bh', name: 'Bahrain', nameAr: 'البحرين' },
  { code: 'om', name: 'Oman', nameAr: 'عُمان' },
  { code: 'ye', name: 'Yemen', nameAr: 'اليمن' },
  { code: 'ma', name: 'Morocco', nameAr: 'المغرب' },
  { code: 'tn', name: 'Tunisia', nameAr: 'تونس' },
  { code: 'dz', name: 'Algeria', nameAr: 'الجزائر' },
  { code: 'ly', name: 'Libya', nameAr: 'ليبيا' }
];

export const CountryQuickSelector = ({ language, year }: CountryQuickSelectorProps) => {
  const navigate = useNavigate();

  const handleCountryClick = (countryCode: string) => {
    navigate(generateCountryUrl(language, countryCode, year));
  };

  return (
    <div className="w-full bg-card/50 border-b border-border/50 py-4">
      <div className="container mx-auto px-4">
        <h3 className={`text-sm font-medium text-muted-foreground mb-3 text-center ${language === 'ar' ? 'arabic-text' : ''}`}>
          {language === 'ar' ? 'الاختيار السريع للدولة' : 'Quick Country Selection'}
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {countries.map(country => (
            <Button
              key={country.code}
              variant="outline"
              size="sm"
              onClick={() => handleCountryClick(country.code)}
              className="min-w-[50px] h-8 text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
              title={language === 'ar' ? country.nameAr : country.name}
            >
              {country.code.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};