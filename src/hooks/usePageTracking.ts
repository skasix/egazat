import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      const path = location.pathname + location.search;
      const title = document.title;

      console.log(
        "[Analytics] route change fired:",
        path,
        "gtag:",
        typeof window.gtag,
        "_paq:",
        !!window._paq
      );

      // Google Analytics 4 page view
      if (typeof window.gtag === "function") {
        window.gtag("event", "page_view", {
          page_path: path,
          page_title: title,
        });
      }

      // Matomo page view
      if (window._paq) {
        window._paq.push(["setCustomUrl", path]);
        window._paq.push(["setDocumentTitle", title]);
        window._paq.push(["trackPageView"]);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [location]);
}
