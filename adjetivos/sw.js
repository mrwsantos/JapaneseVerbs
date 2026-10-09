const CACHE_NAME = "jpadj-cache-v5";
const APP_SHELL = [
  "./adjetivos.html",
  "./manifest.json",
  "./data.js",
  "../icons/japan.png",
  "../icons/adjetivos-192.png",
  "../fonts/GoogleSans-Regular.ttf",
  "../fonts/GoogleSans-Bold.ttf"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n.startsWith("jpadj-") && n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Network-first: sempre busca a versão mais nova quando online; só usa o
  // cache como fallback quando offline.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
