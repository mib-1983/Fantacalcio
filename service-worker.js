const CACHE_NAME = "fantacalcio-v1";
const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json"
];

// Install: pre-cache files
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Activate: cleanup old caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache-first for cached resources, network fallback otherwise.
// Also updates the cache with fresh network responses for cached requests.
self.addEventListener("fetch", event => {
    const req = event.request;

    // Only handle GET requests
    if (req.method !== "GET") {
        return;
    }

    event.respondWith(
        caches.match(req).then(cachedResponse => {
            if (cachedResponse) {
                // Kick off an update in the background
                fetch(req).then(response => {
                    if (response && response.status === 200) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(req, response.clone());
                        });
                    }
                }).catch(() => {/* ignore network errors */});

                return cachedResponse;
            }

            // Not in cache: go to network and cache the response if valid
            return fetch(req).then(networkResponse => {
                // Only cache successful responses
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
                    return networkResponse;
                }

                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(req, responseClone);
                });

                return networkResponse;
            }).catch(() => {
                // Optional: provide a fallback for navigation requests
                if (req.mode === "navigate") {
                    return caches.match("./index.html");
                }
                return new Response(null, { status: 504, statusText: "Network error" });
            });
        })
    );
});