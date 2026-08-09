// Minimal service worker: exists mainly to satisfy PWA installability (a valid
// manifest alone isn't enough for most browsers/OSes to offer "Add to Home
// Screen" as a real app install). Network-first for navigations, so users
// always get fresh data when online -- this app is data-driven (live
// catalogue/loan state), so aggressively caching pages would show stale
// content. Falls back to the cached shell only when genuinely offline.
//
// Deliberately only handles same-origin GET requests. The API lives on a
// different origin (Render) and carries authenticated, per-user data (loans,
// charges, etc.) -- caching those would risk serving stale or cross-session
// data, so cross-origin requests are left untouched to go straight to network.
const CACHE_NAME = "libman-shell-v1";
const SHELL_URLS = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match("/")))
  );
});
