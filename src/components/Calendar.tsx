import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CalendarProps {
  year: number;
  language: string;
  countryCode: string;
  holidays: Array<{
    name: string;
    nameAr: string;
    date: string;
    type: string;
  }>;
}

// Weekend days mapping function
const getWeekendDaysForCountry = (countryCode: string): number[] => {
  // Map country codes to weekend day numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
  const weekendMapping: Record<string, number[]> = {
    // Saturday-Sunday weekend countries
    'ae': [6, 0], // UAE: Saturday & Sunday (changed in 2022)
    'lb': [6, 0], // Lebanon: Saturday & Sunday
    'ma': [6, 0], // Morocco: Saturday & Sunday
    'tn': [6, 0], // Tunisia: Saturday & Sunday
    
    // Friday-Saturday weekend countries (most Arab countries)
    'sa': [5, 6], // Saudi Arabia: Friday & Saturday
    'eg': [5, 6], // Egypt: Friday & Saturday
    'jo': [5, 6], // Jordan: Friday & Saturday
    'kw': [5, 6], // Kuwait: Friday & Saturday
    'qa': [5, 6], // Qatar: Friday & Saturday
    'bh': [5, 6], // Bahrain: Friday & Saturday
    'om': [5, 6], // Oman: Friday & Saturday
    'sy': [5, 6], // Syria: Friday & Saturday
    'iq': [5, 6], // Iraq: Friday & Saturday
    'ye': [5, 6], // Yemen: Friday & Saturday
    'dz': [5, 6], // Algeria: Friday & Saturday
    'ly': [5, 6], // Libya: Friday & Saturday
    'sd': [5, 6], // Sudan: Friday & Saturday
    'so': [5, 6], // Somalia: Friday & Saturday
    'dj': [5, 6], // Djibouti: Friday & Saturday
    'km': [5, 6], // Comoros: Friday & Saturday
  };
  
  return weekendMapping[countryCode] || [5, 6]; // Default to Friday-Saturday
};

const monthNames = {
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  ar: [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ]
};

// Check if country uses Monday as first day of week (countries with Saturday-Sunday weekends)
const usesMondayFirst = (countryCode: string): boolean => {
  const mondayFirstCountries = ['ae', 'lb', 'ma', 'tn']; // Saturday-Sunday weekend countries
  return mondayFirstCountries.includes(countryCode);
};

const getDayNames = (language: string, countryCode: string) => {
  const dayNamesOriginal = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ar: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
  };
  
  const names = dayNamesOriginal[language as keyof typeof dayNamesOriginal];
  
  // If country uses Monday first, rearrange the array
  if (usesMondayFirst(countryCode)) {
    return [...names.slice(1), names[0]]; // Move Sunday to the end
  }
  
  return names;
};

export const Calendar = ({ year, language, countryCode, holidays }: CalendarProps) => {
  const weekendDays = getWeekendDaysForCountry(countryCode);
  const dayNames = getDayNames(language, countryCode);
  const mondayFirst = usesMondayFirst(countryCode);
  
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const firstDay = new Date(year, monthIndex, 1);
      const lastDay = new Date(year, monthIndex + 1, 0);
      let startingDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();
      
      // Adjust starting day if using Monday first
      if (mondayFirst) {
        startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
      }
      
      // Create array of days with leading empty cells
      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }
      
      // Get holidays for this month
      const monthHolidays = holidays.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate.getMonth() === monthIndex && holidayDate.getFullYear() === year;
      });
      
      return {
        name: monthNames[language as keyof typeof monthNames][monthIndex],
        days,
        monthIndex,
        holidays: monthHolidays
      };
    });
  }, [year, language, holidays, countryCode]);

  const isWeekendDay = (monthIndex: number, day: number) => {
    const dayOfWeek = new Date(year, monthIndex, day).getDay();
    return weekendDays.includes(dayOfWeek);
  };

  const isHoliday = (monthIndex: number, day: number) => {
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === monthIndex && 
             holidayDate.getDate() === day && 
             holidayDate.getFullYear() === year;
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {months.map((month, index) => (
          <Card key={index} className="bg-card shadow-sm border border-border">
            <CardHeader className="p-4 bg-accent text-accent-foreground rounded-t-lg flex items-center justify-center">
              <CardTitle className="text-lg font-semibold">
                {month.name} {year}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day, dayIndex) => (
                  <div key={dayIndex} className="text-center text-xs font-medium text-muted-foreground p-1 bg-accent/20">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {month.days.map((day, dayIndex) => {
                  const isHolidayDay = day ? isHoliday(month.monthIndex, day) : false;
                  const isWeekend = day ? isWeekendDay(month.monthIndex, day) : false;
                  return (
                    <div
                      key={dayIndex}
                      className={`
                        text-center p-2 text-sm transition-colors border rounded-md
                        ${day 
                          ? 'text-foreground cursor-pointer hover:bg-muted' 
                          : 'text-transparent border-transparent'
                        }
                        ${isHolidayDay 
                          ? 'bg-destructive text-white font-bold border-destructive' 
                          : 'border-border'
                        }
                        ${day && isWeekend && !isHolidayDay
                          ? 'bg-accent/30' 
                          : ''
                        }
                      `}
                    >
                      {day || ''}
                    </div>
                  );
                })}
              </div>

              {/* Holidays list for this month */}
              {month.holidays.length > 0 && (
                <div className="border-t border-border pt-3">
                  <h5 className="font-semibold text-sm text-foreground mb-2">
                    {language === 'ar' 
                      ? `العطل الرسمية في ${month.name}:`
                      : `Public Holidays in ${month.name}:`
                    }
                  </h5>
                  <div className="space-y-1">
                    {month.holidays.map((holiday, holidayIndex) => {
                      const holidayDate = new Date(holiday.date);
                      const dayOfMonth = holidayDate.getDate();
                      return (
                        <div key={holidayIndex} className="text-xs text-muted-foreground">
                          <span className="text-destructive font-medium">{month.name} {dayOfMonth}</span>
                          <span className="mx-1">-</span>
                          <span>{language === 'ar' ? holiday.nameAr : holiday.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};