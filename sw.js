// Service Worker for Logan Venter Portfolio
// Site version and the date the content was last updated. Keep both in step
// with the version line shown in the menu in index.html.
const SITE_VERSION = '1.7.6';
const SITE_UPDATED = '2026-10-09';
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
    '/assets/documents/Logan Venter Curriculum Vitae 09-10-2026.pdf'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.log('Cache failed:', error);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
    // Never cache API calls (Netlify Functions, external backends)
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/.netlify/functions/') || url.pathname === '/cb-admin.html') {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                
                // Clone the request because it's a stream
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response because it's a stream
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // Return offline page for navigation requests
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
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