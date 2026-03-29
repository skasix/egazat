import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import countriesData from '@/data/countries.json';

interface Holiday {
  name: string;
  nameAr: string;
  date: string;
  type: 'religious' | 'national' | 'cultural';
  duration?: number;
  description_ar?: string;
  description_en?: string;
}

interface CountryData {
  code: string;
  name_ar: string;
  short_name_ar: string;
  name_en: string;
  short_name_en: string;
  weekend_days: string[];
  editorial?: {
    about_ar: string;
    about_en: string;
  };
  practical?: {
    items_ar: string[];
    items_en: string[];
  };
  related_countries?: string[];
}

interface CountryEditorialContentProps {
  country: CountryData;
  year: number;
  holidays: Holiday[];
  language: string;
}

const styles = {
  section: { marginTop: '2rem' } as React.CSSProperties,
  summaryCard: {
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    padding: '1.25rem',
  } as React.CSSProperties,
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.4rem 0',
    borderBottom: '1px solid #f0f0f0',
  } as React.CSSProperties,
  summaryItemLast: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.4rem 0',
  } as React.CSSProperties,
  practicalItem: {
    padding: '0.4rem 0',
    borderBottom: '1px solid #f0f0f0',
  } as React.CSSProperties,
  practicalItemLast: {
    padding: '0.4rem 0',
  } as React.CSSProperties,
  details: {
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '0.75rem',
  } as React.CSSProperties,
  summary: {
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  holidayCard: {
    marginTop: '1rem',
    padding: '0.75rem',
    background: '#fafafa',
    borderRadius: '4px',
  } as React.CSSProperties,
  pill: {
    display: 'inline-block',
    background: '#f0f4ff',
    borderRadius: '20px',
    padding: '0.3rem 0.9rem',
    margin: '0.25rem',
    textDecoration: 'none',
    color: '#2c5282',
  } as React.CSSProperties,
  badgeNational: {
    display: 'inline-block',
    background: '#e6f4ea',
    color: '#2d6a4f',
    borderRadius: '4px',
    padding: '0.1rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  } as React.CSSProperties,
  badgeReligious: {
    display: 'inline-block',
    background: '#fff3e0',
    color: '#b45309',
    borderRadius: '4px',
    padding: '0.1rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  } as React.CSSProperties,
  badgeCultural: {
    display: 'inline-block',
    background: '#f3e8ff',
    color: '#6b21a8',
    borderRadius: '4px',
    padding: '0.1rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  } as React.CSSProperties,
  placeholder: {
    background: '#fffde7',
    borderLeft: '3px solid #f59e0b',
    padding: '0.5rem',
  } as React.CSSProperties,
  paragraphAr: {
    fontSize: '17px',
    lineHeight: 1.8,
  } as React.CSSProperties,
  paragraphEn: {
    fontSize: '16px',
    lineHeight: 1.7,
  } as React.CSSProperties,
};

const isPlaceholder = (text: string): boolean => text.startsWith('PLACEHOLDER_');

const getTypeBadge = (type: string, language: string) => {
  const labels: Record<string, Record<string, string>> = {
    national: { ar: 'وطني', en: 'National' },
    religious: { ar: 'ديني', en: 'Religious' },
    cultural: { ar: 'ثقافي', en: 'Cultural' },
  };
  const badgeStyles: Record<string, React.CSSProperties> = {
    national: styles.badgeNational,
    religious: styles.badgeReligious,
    cultural: styles.badgeCultural,
  };
  return (
    <span style={badgeStyles[type] || styles.badgeNational}>
      {labels[type]?.[language] || type}
    </span>
  );
};

const formatDateEn = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatDateAr = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getDayOfWeek = (dateStr: string, language: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', { weekday: 'long' });
};

export const CountryEditorialContent = ({ country, year, holidays, language }: CountryEditorialContentProps) => {
  const isAr = language === 'ar';

  const stats = useMemo(() => {
    const total = holidays.length;
    const national = holidays.filter(h => h.type === 'national').length;
    const religious = holidays.filter(h => h.type === 'religious').length;
    const cultural = total - national - religious;
    const today = new Date();
    const upcoming = holidays
      .filter(h => new Date(h.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const next = upcoming[0] || null;
    return { total, national, religious, cultural, next };
  }, [holidays]);

  const relatedCountries = useMemo(() => {
    if (!country.related_countries) return [];
    return country.related_countries
      .map(code => {
        const c = countriesData.countries.find((cd: any) => cd.code === code);
        return c ? { code: c.code, name_ar: c.short_name_ar, name_en: c.short_name_en } : null;
      })
      .filter(Boolean) as Array<{ code: string; name_ar: string; name_en: string }>;
  }, [country.related_countries]);

  const weekendText = isAr
    ? country.weekend_days.map(d => {
        const map: Record<string, string> = { Friday: 'الجمعة', Saturday: 'السبت', Sunday: 'الأحد', Thursday: 'الخميس' };
        return map[d] || d;
      }).join(' و ')
    : country.weekend_days.join(' & ');

  return (
    <div>
      {/* SECTION A — Holiday Summary Block */}
      <section style={styles.section}>
        <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.75rem' }}>
          {isAr ? `ملخص العطل الرسمية ${year}` : `${year} Holiday Summary`}
        </h3>
        <div style={styles.summaryCard}>
          <div style={styles.summaryItem}>
            <span style={{ fontWeight: 600 }}>{isAr ? 'إجمالي العطل الرسمية:' : 'Total public holidays:'}</span>
            <span style={{ fontWeight: 700 }}>{stats.total}</span>
          </div>
          <div style={styles.summaryItem}>
            <span>{isAr ? 'عطل وطنية:' : 'National holidays:'}</span>
            <span>{stats.national}</span>
          </div>
          <div style={styles.summaryItem}>
            <span>{isAr ? 'عطل دينية:' : 'Religious holidays:'}</span>
            <span>{stats.religious}</span>
          </div>
          {stats.cultural > 0 && (
            <div style={styles.summaryItem}>
              <span>{isAr ? 'عطل ثقافية:' : 'Cultural holidays:'}</span>
              <span>{stats.cultural}</span>
            </div>
          )}
          {stats.next && (
            <div style={styles.summaryItem}>
              <span style={{ fontWeight: 600 }}>{isAr ? 'العطلة القادمة:' : 'Next holiday:'}</span>
              <span>
                {isAr ? stats.next.nameAr : stats.next.name}{' — '}
                {isAr ? formatDateAr(stats.next.date) : formatDateEn(stats.next.date)}
              </span>
            </div>
          )}
          <div style={styles.summaryItemLast}>
            <span>{isAr ? 'أيام العطلة الأسبوعية:' : 'Weekend days:'}</span>
            <span>{weekendText}</span>
          </div>
        </div>
      </section>

      {/* SECTION B — About the Holidays */}
      {country.editorial && (
        <section style={styles.section}>
          <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.75rem' }}>
            {isAr ? `عن العطل الرسمية في ${country.short_name_ar}` : `About Public Holidays in ${country.short_name_en}`}
          </h3>
          {(() => {
            const text = isAr ? country.editorial.about_ar : country.editorial.about_en;
            const isP = isPlaceholder(text);
            return (
              <div style={isP ? styles.placeholder : undefined} className={isP ? 'placeholder-content' : undefined}>
                <p style={isAr ? styles.paragraphAr : styles.paragraphEn}>
                  {text}
                </p>
              </div>
            );
          })()}
        </section>
      )}

      {/* SECTION C — Practical Information */}
      {country.practical && (
        <section style={styles.section}>
          <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.75rem' }}>
            {isAr ? 'معلومات عملية للمقيمين والزوار' : 'Practical Information for Residents and Visitors'}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {(isAr ? country.practical.items_ar : country.practical.items_en).map((item, i, arr) => {
              const isP = isPlaceholder(item);
              return (
                <li
                  key={i}
                  style={i < arr.length - 1 ? styles.practicalItem : styles.practicalItemLast}
                >
                  <span
                    style={{
                      ...(isAr ? styles.paragraphAr : styles.paragraphEn),
                      ...(isP ? styles.placeholder : {}),
                    }}
                    className={isP ? 'placeholder-content' : undefined}
                  >
                    • {item}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* SECTION D — Individual Holiday Descriptions */}
      <section style={styles.section}>
        <details style={styles.details}>
          <summary style={styles.summary}>
            {isAr ? `تفاصيل العطل الرسمية ${year}` : `Public Holiday Details ${year}`}
          </summary>
          {holidays.map((holiday, i) => {
            const desc = isAr
              ? (holiday as any).description_ar || ''
              : (holiday as any).description_en || '';
            const isP = isPlaceholder(desc);
            const duration = holiday.duration || 1;
            const durationText = isAr
              ? `${duration} ${duration === 1 ? 'يوم' : 'أيام'}`
              : `${duration} ${duration === 1 ? 'day' : 'days'}`;

            return (
              <div key={i} style={styles.holidayCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '1rem' }}>
                    {isAr ? holiday.nameAr : holiday.name}
                  </strong>
                  {getTypeBadge(holiday.type, language)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.3rem' }}>
                  <span>{isAr ? formatDateAr(holiday.date) : formatDateEn(holiday.date)}</span>
                  <span style={{ margin: '0 0.5rem' }}>•</span>
                  <span>{getDayOfWeek(holiday.date, language)}</span>
                  <span style={{ margin: '0 0.5rem' }}>•</span>
                  <span>{durationText}</span>
                </div>
                {desc && (
                  <p
                    style={{
                      ...(isAr ? styles.paragraphAr : styles.paragraphEn),
                      ...(isP ? styles.placeholder : {}),
                      marginTop: '0.4rem',
                    }}
                    className={isP ? 'placeholder-content' : undefined}
                  >
                    {desc}
                  </p>
                )}
              </div>
            );
          })}
        </details>
      </section>

      {/* SECTION E — Related Countries */}
      {relatedCountries.length > 0 && (
        <section style={styles.section}>
          <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.75rem' }}>
            {isAr ? 'عطل الدول المجاورة' : 'Holidays in Neighboring Countries'}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {relatedCountries.map(rc => (
              <Link
                key={rc.code}
                to={`/${language}/country/${rc.code}/${year}.html`}
                style={styles.pill}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = '#dbeafe'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = '#f0f4ff'; }}
              >
                {isAr ? `عطل ${rc.name_ar} ${year}` : `${rc.name_en} Holidays ${year}`}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
