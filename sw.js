/**
 * Service Worker for Neck & Shoulder Relief Timer
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'hvila-v5';
const STATIC_CACHE_URLS = [
    './',
    './index.html',
    './css/styles.css',
    './shared/theme.css',
    './js/app.js',
    './manifest.json',
    './icons/logo.svg',
    './wayfinder_logo.svg',
    './bell.wav'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Install event');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                // Force activation of new service worker
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate event');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                // Take control of all pages
                return self.clients.claim();
            })
    );
});

// Fetch event - stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
    // Only handle same-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                // Return cached response immediately and update cache in background
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    // Only cache successful responses
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch((error) => {
                    console.error('[SW] Fetch failed:', error);
                    // Return a fallback response for HTML requests when offline
                    if (event.request.destination === 'document') {
                        return cache.match('./index.html');
                    }
                    throw error;
                });

                // Return cached response if available, otherwise wait for network
                return cachedResponse || fetchPromise;
            });
        })
    );
});

// Push notification handling
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body || 'Time for a break!',
        icon: './icons/logo.svg',
        badge: './icons/logo.svg',
        vibrate: [200, 100, 200],
        tag: 'relief-timer-notification',
        data: data,
        actions: [
            {
                action: 'start',
                title: 'Start Timer'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Relief Timer', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const targetUrl = event.action === 'start' ? './?action=start' : './';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Focus an existing window if one exists
            for (const client of windowClients) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow(targetUrl);
        })
    );
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
            default:
                console.log('[SW] Unknown message type:', event.data.type);
        }
    }
});