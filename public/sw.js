// public/sw.js

self.addEventListener("install", (event) => {
  // Cache the app shell (your index page and assets)
  event.waitUntil(
    caches.open("json-viz-cache-v1").then((cache) =>
      cache.addAll(["/", "/manifest.json", "/favicon.ico"])
    )
  );
});

self.addEventListener("fetch", (event) => {
  // Serve cached content when offline
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
