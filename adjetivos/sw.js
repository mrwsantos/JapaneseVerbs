// Verbos e adjetivos agora são um app só, servido pelo service worker da raiz
// (../sw.js). Este arquivo existe só para desinstalar o SW antigo de quem já
// tinha o app de adjetivos instalado separadamente.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n.startsWith("jpadj-")).map((n) => caches.delete(n))))
      .then(() => self.registration.unregister())
  );
});
