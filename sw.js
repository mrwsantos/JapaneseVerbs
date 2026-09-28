const CACHE_NAME = "jpverbs-cache-v5";
const APP_SHELL = [
  "./verbos-jp-atualizado.html",
  "./manifest.json",
  "./verbs-data.js",
  "./icons/japan.png",
  "./fonts/GoogleSans-Regular.ttf",
  "./fonts/GoogleSans-Bold.ttf"
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
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Network-first: sempre busca a versão mais nova quando online (evita mostrar
  // uma versão desatualizada do app depois de um deploy); só usa o cache como
  // fallback quando offline.
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
