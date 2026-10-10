const CACHE_NAME = "jp-srs-cache-v4";
// Caches deste app (inclui os nomes antigos de quando verbos e adjetivos eram
// apps separados), para limpar versões velhas sem tocar em caches de terceiros.
const OWN_CACHE_PREFIXES = ["jp-srs-", "jpverbs-", "jpadj-"];
const APP_SHELL = [
  "./index.html",
  "./manifest.json",
  "./verbos/verbos.html",
  "./verbos/data.js",
  "./adjetivos/adjetivos.html",
  "./adjetivos/data.js",
  "./jogo/jogo.html",
  "./sons.js",
  "./icons/japan.png",
  "./icons/app-192.png",
  "./icons/verbos-192.png",
  "./icons/adjetivos-192.png",
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
      Promise.all(
        names
          .filter((n) => n !== CACHE_NAME && OWN_CACHE_PREFIXES.some((p) => n.startsWith(p)))
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Network-first: sempre busca a versão mais nova quando online (evita mostrar
  // uma versão desatualizada do app depois de um deploy); só usa o cache como
  // fallback quando offline. ignoreSearch para "index.html?home" achar o cache.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
