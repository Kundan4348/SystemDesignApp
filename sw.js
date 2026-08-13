const CACHE_NAME = 'sysbreach-v9';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/interactive.css',
    '/revision.css',
    '/visuals.js',
    '/content.js',
    '/content-extended.js',
    '/content-extended2.js',
    '/content-lld1.js',
    '/content-lld2.js',
    '/content-approach.js',
    '/quizzes.js',
    '/quizzes-extended.js',
    '/quizzes-lld.js',
    '/interactive.js',
    '/interactive-data.js',
    '/revision.js',
    '/lesson-experience.js',
    '/tutor.js',
    '/notes.js',
    '/designcanvas.js',
    '/tutor.css',
    '/app.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});
