import { useEffect } from 'react';

interface PrefetchOptions {
  href: string;
  as?: 'document' | 'image' | 'script' | 'style' | 'font';
  crossorigin?: 'anonymous' | 'use-credentials';
  priority?: 'high' | 'low';
}

export const usePrefetch = (resources: PrefetchOptions[]) => {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];

    resources.forEach(({ href, as = 'document', crossorigin, priority }) => {
      // Check if already prefetched
      const existing = document.querySelector(`link[href="${href}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      link.as = as;
      
      if (crossorigin) {
        link.crossOrigin = crossorigin;
      }
      
      if (priority === 'high') {
        link.rel = 'preload';
      }
      
      document.head.appendChild(link);
      links.push(link);
    });

    // Cleanup on unmount
    return () => {
      links.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [resources]);
};

export const useSmartPrefetch = (currentPath: string) => {
  const resources: PrefetchOptions[] = [];
  
  // Prefetch likely next pages based on current path
  if (currentPath === '/' || currentPath.includes('/ar') || currentPath.includes('/en')) {
    // On homepage, prefetch most popular countries
    const popularCountries = ['sa', 'ae', 'eg', 'jo', 'ma'];
    const currentYear = new Date().getFullYear();
    const language = currentPath.includes('/en') ? 'en' : 'ar';
    
    popularCountries.forEach(country => {
      resources.push({
        href: `/${language}/country/${country}/${currentYear}.html`,
        as: 'document'
      });
    });
  }
  
  usePrefetch(resources);
};