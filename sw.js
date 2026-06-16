/* ============================================================
   SEREINE — Service Worker (hors-ligne / offline-first)
   ------------------------------------------------------------
   ⚠️ À CHAQUE DÉPLOIEMENT qui modifie un fichier : incrémenter
   CACHE_VERSION (v1 -> v2 -> ...). Sinon les anciens fichiers
   restent servis depuis le cache.
   ============================================================ */
const CACHE_VERSION = "sereine-v1";

/* Ressources mises en cache à l'installation (chemins relatifs : fonctionne
   aussi bien à la racine d'un domaine que sous /Sereine/ sur GitHub Pages). */
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data.js",
  "./manifest.json",
  "./favicon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(noms => Promise.all(noms.filter(n => n !== CACHE_VERSION).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Ne pas intercepter les requêtes d'autres origines (ex. API externes).
  if (url.origin !== self.location.origin) return;

  // Navigations : réseau d'abord (pour récupérer une mise à jour), repli sur le
  // cache si l'on est hors-ligne.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Autres ressources : cache d'abord, puis réseau (et mise en cache à la volée).
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        if (resp && resp.ok && resp.type === "basic") {
          const copie = resp.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copie));
        }
        return resp;
      });
    })
  );
});
