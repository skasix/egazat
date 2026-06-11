import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type Gtag = (
  command: string,
  action: string,
  params?: Record<string, unknown>
) => void;

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname + location.search;
    const title = document.title;

    // Google Analytics 4 page view
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (gtag) {
      gtag("event", "page_view", {
        page_path: path,
        page_title: title,
      });
    }

    // Matomo page view
    const _paq = (window as unknown as { _paq?: string[][] })._paq;
    if (_paq) {
      _paq.push(["setCustomUrl", path]);
      _paq.push(["setDocumentTitle", title]);
      _paq.push(["trackPageView"]);
    }
  }, [location]);
}
