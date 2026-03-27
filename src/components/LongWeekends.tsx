import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

interface Holiday {
  name: string;
  nameAr: string;
  date: string;
  type: string;
  duration?: number;
}

interface LongWeekend {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  holidays: Holiday[];
  description: string;
  descriptionAr: string;
}

interface LongWeekendsProps {
  holidays: Holiday[];
  countryCode: string;
  year: number;
  language: string;
  weekendDays: string[];
}

// Map weekend day names to JS day numbers (0=Sun..6=Sat)
const dayNameToNumber: Record<string, number> = {
  'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
  'Thursday': 4, 'Friday': 5, 'Saturday': 6
};

export const LongWeekends = ({ holidays, countryCode, year, language, weekendDays }: LongWeekendsProps) => {
  const weekendNums = weekendDays.map(d => dayNameToNumber[d]);

  const longWeekends = useMemo(() => {
    // Build a set of all holiday dates (expanding multi-day holidays)
    const holidayDateSet = new Set<string>();
    const holidayMap = new Map<string, Holiday[]>();

    holidays.forEach(h => {
      const days = h.duration || 1;
      for (let i = 0; i < days; i++) {
        const d = new Date(h.date);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        holidayDateSet.add(key);
        if (!holidayMap.has(key)) holidayMap.set(key, []);
        holidayMap.get(key)!.push(h);
      }
    });

    const isOff = (date: Date): boolean => {
      const dow = date.getDay();
      if (weekendNums.includes(dow)) return true;
      return holidayDateSet.has(date.toISOString().slice(0, 10));
    };

    const formatKey = (d: Date) => d.toISOString().slice(0, 10);

    // For each holiday date, expand outward to find consecutive off-day blocks
    const visited = new Set<string>();
    const results: LongWeekend[] = [];

    holidayDateSet.forEach(dateStr => {
      if (visited.has(dateStr)) return;

      const start = new Date(dateStr);
      // Expand backward
      const blockStart = new Date(start);
      while (true) {
        const prev = new Date(blockStart);
        prev.setDate(prev.getDate() - 1);
        if (isOff(prev)) {
          blockStart.setDate(blockStart.getDate() - 1);
        } else break;
      }

      // Expand forward
      const blockEnd = new Date(start);
      while (true) {
        const next = new Date(blockEnd);
        next.setDate(next.getDate() + 1);
        if (isOff(next)) {
          blockEnd.setDate(blockEnd.getDate() + 1);
        } else break;
      }

      // Mark all dates in block as visited
      const cur = new Date(blockStart);
      while (cur <= blockEnd) {
        visited.add(formatKey(cur));
        cur.setDate(cur.getDate() + 1);
      }

      const totalDays = Math.round((blockEnd.getTime() - blockStart.getTime()) / 86400000) + 1;

      // Only count as long weekend if 3+ days AND includes at least one holiday AND at least one weekend day
      const hasWeekend = (() => {
        const c = new Date(blockStart);
        while (c <= blockEnd) {
          if (weekendNums.includes(c.getDay())) return true;
          c.setDate(c.getDate() + 1);
        }
        return false;
      })();

      if (totalDays >= 3 && hasWeekend) {
        // Collect unique holidays in this block
        const blockHolidays: Holiday[] = [];
        const seen = new Set<string>();
        const c2 = new Date(blockStart);
        while (c2 <= blockEnd) {
          const hols = holidayMap.get(formatKey(c2));
          if (hols) {
            hols.forEach(h => {
              const key = h.name + h.date;
              if (!seen.has(key)) {
                seen.add(key);
                blockHolidays.push(h);
              }
            });
          }
          c2.setDate(c2.getDate() + 1);
        }

        results.push({
          startDate: new Date(blockStart),
          endDate: new Date(blockEnd),
          totalDays,
          holidays: blockHolidays,
          description: blockHolidays.map(h => h.name).join(' + '),
          descriptionAr: blockHolidays.map(h => h.nameAr).join(' + ')
        });
      }
    });

    // Sort by date
    results.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    return results;
  }, [holidays, weekendNums, year]);

  if (longWeekends.length === 0) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      { month: 'long', day: 'numeric' }
    );
  };

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          {language === 'ar' 
            ? `عطلات نهاية الأسبوع الطويلة ${year}`
            : `Long Weekends ${year}`
          }
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {language === 'ar'
            ? `خطط لإجازاتك! هناك ${longWeekends.length} عطلة نهاية أسبوع طويلة هذا العام حيث تتصل العطل الرسمية بأيام العطلة الأسبوعية.`
            : `Plan your vacations! There are ${longWeekends.length} long weekends this year where public holidays connect with regular weekend days.`
          }
        </p>
      </div>

      <div className="grid gap-4 max-w-4xl mx-auto">
        {longWeekends.map((lw, index) => (
          <Card key={index} className="bg-card hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3 shrink-0">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-lg font-bold text-foreground">
                      {lw.totalDays} {language === 'ar' ? 'أيام إجازة' : 'days off'}
                    </span>
                    <span className="text-sm bg-accent text-accent-foreground px-3 py-1 rounded-full">
                      {formatDate(lw.startDate)} – {formatDate(lw.endDate)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {language === 'ar' ? lw.descriptionAr : lw.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
