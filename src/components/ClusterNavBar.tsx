import countriesData from '@/data/countries.json';

interface ClusterNavBarProps {
  currentCode: string;
  year: number;
  language: string;
}

const styles = {
  container: {
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto' as const,
    padding: '0.5rem 0',
    marginTop: '2rem',
  },
  link: {
    display: 'inline-block',
    background: '#f0f4ff',
    borderRadius: '20px',
    padding: '0.4rem 1rem',
    textDecoration: 'none',
    color: '#2c5282',
    whiteSpace: 'nowrap' as const,
    fontSize: '0.9rem',
  },
  active: {
    display: 'inline-block',
    background: '#2c5282',
    color: '#ffffff',
    borderRadius: '20px',
    padding: '0.4rem 1rem',
    fontWeight: 700,
    textDecoration: 'underline',
    whiteSpace: 'nowrap' as const,
    fontSize: '0.9rem',
  },
  bridgePill: {
    display: 'inline-block',
    background: '#f0f4ff',
    borderRadius: '20px',
    padding: '0.3rem 0.9rem',
    margin: '0.25rem',
    textDecoration: 'none',
    color: '#2c5282',
  },
};

export const ClusterNavBar = ({ currentCode, year, language }: ClusterNavBarProps) => {
  const isAr = language === 'ar';

  // Find which cluster the current country belongs to
  const cluster = (countriesData as any).clusters?.find((cl: any) =>
    cl.countries.includes(currentCode)
  );

  if (!cluster) return null;

  const clusterCountries = cluster.countries
    .map((code: string) => {
      const c = countriesData.countries.find((cd: any) => cd.code === code);
      return c ? { code: c.code, name_ar: c.short_name_ar, name_en: c.short_name_en } : null;
    })
    .filter(Boolean) as Array<{ code: string; name_ar: string; name_en: string }>;

  // Bridge links
  const currentCountry = countriesData.countries.find((c: any) => c.code === currentCode) as any;
  const bridgeLinks = currentCountry?.bridge_links || [];
  const bridgeCountries = bridgeLinks
    .map((code: string) => {
      const c = countriesData.countries.find((cd: any) => cd.code === code);
      return c ? { code: c.code, name_ar: c.short_name_ar, name_en: c.short_name_en } : null;
    })
    .filter(Boolean)
    .filter((c: any) => !cluster.countries.includes(c.code)) as Array<{ code: string; name_ar: string; name_en: string }>;

  return (
    <div>
      {/* Cluster heading */}
      <section style={{ marginTop: '2rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          {isAr ? cluster.name_ar : cluster.name_en}
        </h3>
        <div style={styles.container}>
          {clusterCountries.map(cc =>
            cc.code === currentCode ? (
              <span key={cc.code} style={styles.active}>
                {isAr ? cc.name_ar : cc.name_en}
              </span>
            ) : (
              <a
                key={cc.code}
                href={`/${language}/country/${cc.code}/${year}.html`}
                style={styles.link}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = '#dbeafe'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = '#f0f4ff'; }}
              >
                {isAr ? cc.name_ar : cc.name_en}
              </a>
            )
          )}
        </div>
      </section>

      {/* Bridge links for eg and sa */}
      {bridgeCountries.length > 0 && (
        <section style={{ marginTop: '1rem' }}>
          <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>
            {isAr ? 'دول عربية أخرى' : 'Other Arab Countries'}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {bridgeCountries.map(bc => (
              <a
                key={bc.code}
                href={`/${language}/country/${bc.code}/${year}.html`}
                style={styles.bridgePill}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = '#dbeafe'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = '#f0f4ff'; }}
              >
                {isAr ? `${bc.name_ar} ${year}` : `${bc.name_en} ${year}`}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
