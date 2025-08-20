// Service Worker for caching and performance optimization
const CACHE_NAME = 'egazat-v1';
const STATIC_CACHE = 'egazat-static-v1';
const DYNAMIC_CACHE = 'egazat-dynamic-v1';

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/ar.html',
  '/en.html',
  '/lovable-uploads/5e13b9cd-d239-4913-9435-94616b25ed57.png',
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: ['js', 'css', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'woff', 'woff2'],
  // Network first for dynamic content
  NETWORK_FIRST: ['html', 'json'],
  // Stale while revalidate for API calls
  STALE_WHILE_REVALIDATE: ['/api/'],
};

// Install event
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return;

  const fileExtension = url.pathname.split('.').pop()?.toLowerCase();
  
  // Cache first strategy for static assets
  if (CACHE_STRATEGIES.CACHE_FIRST.includes(fileExtension || '')) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Network first for HTML and JSON
  if (CACHE_STRATEGIES.NETWORK_FIRST.includes(fileExtension || '') || 
      url.pathname.endsWith('.html') || 
      url.pathname === '/' ||
      url.pathname.startsWith('/ar') ||
      url.pathname.startsWith('/en')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Default: stale while revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Cache first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request.clone(), networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('SW: Cache first failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request.clone(), networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('SW: Network first failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Content not available offline', { status: 503 });
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request.clone(), networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}