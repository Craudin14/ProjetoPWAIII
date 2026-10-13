/* Service Worker — Navalha & Brilho (v6)
   Core (HTML/CSS/JS): NETWORK-FIRST — sempre busca a versão nova;
   cache só serve quando offline. Ícones: cache-first. */

const CACHE_ESTATICOS = 'nb-estaticos-v6';
const CACHE_CORE      = 'nb-core-v6';

const ARQUIVOS_ESTATICOS = ['./offline.html', './icon-192.png', './icon-512.png'];
const ARQUIVOS_CORE = ['./index.html', './style.css', './script.js', './manifest.json'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    (async () => {
      const ce = await caches.open(CACHE_ESTATICOS);
      await Promise.all(ARQUIVOS_ESTATICOS.map((u) => ce.add(u).catch(() => null)));
      const cc = await caches.open(CACHE_CORE);
      await Promise.all(ARQUIVOS_CORE.map((u) => cc.add(u).catch(() => null)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      const chaves = await caches.keys();
      await Promise.all(
        chaves.filter((k) => k !== CACHE_ESTATICOS && k !== CACHE_CORE).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (evento) => {
  const req = evento.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const caminho = url.pathname.split('/').pop();
  const ehCore = ['index.html', 'style.css', 'script.js', 'manifest.json'].includes(caminho) || req.mode === 'navigate';

  if (ehCore) {
    evento.respondWith(
      (async () => {
        try {
          const resposta = await fetch(req);
          if (resposta && resposta.ok) {
            const cache = await caches.open(CACHE_CORE);
            cache.put(req, resposta.clone());
          }
          return resposta;
        } catch (e) {
          return (await caches.match(req)) || caches.match('./offline.html');
        }
      })()
    );
    return;
  }

  evento.respondWith(
    (async () => {
      const doCache = await caches.match(req);
      if (doCache) return doCache;
      try {
        const resposta = await fetch(req);
        if (resposta && resposta.ok && resposta.type === 'basic') {
          const cache = await caches.open(CACHE_ESTATICOS);
          cache.put(req, resposta.clone());
        }
        return resposta;
      } catch (e) {
        return doCache;
      }
    })()
  );
});
