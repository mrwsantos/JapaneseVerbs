const CACHE_NAME = "jp-srs-cache-v41";
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
  "./desenho/desenho.html",
  "./estatisticas/estatisticas.html",
  "./sons.js",
  "./frases.js",
  "./escrita.js",
  "./historico.js",
  "./backup.js",
  "./config.js",
  "./estudadas.js",
  "./desenho.js",
  "./lib/kanjicanvas/kanji-canvas.js",
  "./lib/kanjicanvas/padroes.js",
  "./icons/japan.png",
  "./icons/app-192.png",
  "./icons/verbos-192.png",
  "./icons/adjetivos-192.png",
  "./fonts/RobotoMono-Regular.ttf",
  "./fonts/RobotoMono-Bold.ttf"
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
  // Scripts/dados com cache:"no-cache": revalida no servidor em vez de usar o
  // cache HTTP do navegador (GitHub Pages guarda 10 min). Sem isso o HTML novo
  // podia vir com um data.js velho e quebrar a tela. Navegação fica como está
  // (mexer no pedido de navegação quebra redirecionamentos).
  const revalidate = event.request.mode !== "navigate" && new URL(event.request.url).origin === self.location.origin;
  event.respondWith(
    (revalidate ? fetch(event.request, { cache: "no-cache" }) : fetch(event.request))
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
