const CACHE_NAME = "app-cache-v1";
const ASSETS_TO_CACHE = [
    "/", // index.html
    "/manifest.json",
    "/assets/index.css",
    "/assets/index.js",
    // Add more static assets
];

// Install event
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key))
                )
            )
    );
    self.clients.claim();
});

// Fetch event -> serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cacheRes) => {
            return (
                cacheRes ||
                fetch(event.request).catch(
                    () => caches.match("/") // fallback to app shell
                )
            );
        })
    );
});
