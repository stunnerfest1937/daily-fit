/* Daily Fit service worker.
   - Lets the app open offline by caching its own files (the app shell).
   - Only same-origin GET requests are handled. Weather, geocoding and font requests go straight to the
     network and are never stored here, so no third-party response ends up in this cache.
   - Works under a sub-path such as /daily-fit/ because every URL is relative to this file.
   Bump VERSION whenever any cached file changes. */
const VERSION = '10';
const CACHE_PREFIX = 'dailyfit-';
const CACHE = CACHE_PREFIX + 'v' + VERSION;
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      // Only remove this app's own old caches. Other caches on the same origin are left alone.
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never touch third-party requests

  // Serve from cache right away and refresh the cache in the background.
  const reply = caches.open(CACHE).then(async (cache) => {
    const hit = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
    const network = fetch(req)
      .then((res) => {
        if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
        return res;
      })
      .catch(() => null);
    if (hit) { network.catch(() => null); return hit; }
    const res = await network;
    if (res) return res;
    if (req.mode === 'navigate') {
      const shell = await cache.match('index.html');
      if (shell) return shell;
    }
    return Response.error();
  });
  event.respondWith(reply);
  event.waitUntil(reply.catch(() => null));
});
