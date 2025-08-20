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

const dayNames = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ar: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
};

export const Calendar = ({ year, language, countryCode, holidays }: CalendarProps) => {
  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIndex) => {
      const firstDay = new Date(year, monthIndex, 1);
      const lastDay = new Date(year, monthIndex + 1, 0);
      const startingDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();
      
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
  }, [year, language, holidays]);

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
            <CardHeader className="pb-3 bg-accent text-accent-foreground rounded-t-lg">
              <CardTitle className="text-center text-lg font-semibold">
                {month.name} {year}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames[language as keyof typeof dayNames].map((day, dayIndex) => (
                  <div key={dayIndex} className="text-center text-xs font-medium text-muted-foreground p-1 bg-accent/20">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {month.days.map((day, dayIndex) => {
                  const isHolidayDay = day ? isHoliday(month.monthIndex, day) : false;
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
                        ${day && new Date(year, month.monthIndex, day).getDay() === 5 && !isHolidayDay
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