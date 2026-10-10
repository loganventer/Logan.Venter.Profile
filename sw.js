// Service Worker for Logan Venter Portfolio
// Site version and the date the content was last updated. Keep both in step
// with the version line shown in the menu in index.html.
const SITE_VERSION = '1.8.1';
const SITE_UPDATED = '2026-10-10';
const CACHE_NAME = `logan-venter-portfolio-v${SITE_VERSION}-${SITE_UPDATED}`;
const urlsToCache = [
    '/',
    '/index.html',
    '/css/variables.css',
    '/css/base.css',
    '/css/neural.css',
    '/css/nav.css',
    '/css/sections.css',
    '/css/projects.css',
    '/css/chatbot.css',
    '/js/app.js',
    '/assets/images/image.jpg',
    '/assets/images/tawk-main.png',
    '/assets/images/matrix-clock.png',
    '/assets/documents/Logan Venter Curriculum Vitae 10-10-2026.pdf'
];

// Install event - cache resources, and take over without waiting for old tabs to close
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .catch(error => {
                console.log('Cache failed:', error);
            })
    );
});

// Fetch event - this site's own files come from the network first, so visitors
// always see the latest version, and from the cache only when offline.
// Files from other hosts (fonts, libraries) come from the cache first.
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    // Never cache API calls (Netlify Functions, external backends)
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/.netlify/functions/') || url.pathname === '/cb-admin.html') {
        event.respondWith(fetch(event.request));
        return;
    }

    if (url.origin === self.location.origin) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request).then(cached => {
                    if (cached) return cached;
                    if (event.request.mode === 'navigate') return caches.match('/index.html');
                    return Response.error();
                }))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        self.clients.claim().then(() => caches.keys()).then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Handle any background sync tasks
    console.log('Background sync triggered');
    return Promise.resolve();
} 