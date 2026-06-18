// Production service worker for Tomo — offline support + fast repeat loads.
const VERSION = "tomo-v2";
const CACHE = `${VERSION}`;

// App shell + default assets, cached up front so the app opens offline.
const PRECACHE = [
  "/",
  "/blog",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-icon.png",
  "/sounds/muse.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // Don't fail the whole install if one asset 404s.
      Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function staleWhileRevalidate(request) {
  return caches.open(CACHE).then((cache) =>
    cache.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") cache.put(request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin pass through

  // Navigations: network-first, fall back to cache, then the app shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/")))
    );
    return;
  }

  // Static assets (hashed build output, icons, audio, fonts): fast cache, refresh in background.
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/sounds/") ||
    /\.(?:js|css|woff2?|png|svg|jpg|jpeg|webp|ico|mp3)$/.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Everything else: try network, fall back to cache.
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
