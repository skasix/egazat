import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CalendarProps {
  year: number;
  language: string;
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

export const Calendar = ({ year, language }: CalendarProps) => {
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
      
      return {
        name: monthNames[language as keyof typeof monthNames][monthIndex],
        days,
        monthIndex
      };
    });
  }, [year, language]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-foreground mb-2">
          {language === 'ar' ? `تقويم ${year}` : `${year} Calendar`}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map((month, index) => (
          <Card key={index} className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-center text-lg font-semibold text-primary">
                {month.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames[language as keyof typeof dayNames].map((day, dayIndex) => (
                  <div key={dayIndex} className="text-center text-xs font-medium text-muted-foreground p-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {month.days.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`
                      text-center p-2 text-sm rounded-md transition-colors
                      ${day 
                        ? 'hover:bg-primary/10 cursor-pointer text-foreground' 
                        : 'text-transparent'
                      }
                      ${day && new Date(year, month.monthIndex, day).getDay() === 5 
                        ? 'bg-accent/20 font-semibold' 
                        : ''
                      }
                    `}
                  >
                    {day || ''}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};