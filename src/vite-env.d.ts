/// <reference types="vite/client" />

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    _paq: unknown[][];
    dataLayer: unknown[];
  }
}

export {};
