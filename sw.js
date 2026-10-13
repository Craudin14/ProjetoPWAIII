/* =====================================================
   Service Worker — Navalha & Brilho (v6)
   CORREÇÃO: HTML, CSS e JS agora usam NETWORK-FIRST
   (sempre tenta a versão nova; cache só se offline).
   Cache-first fica apenas para ícones e offline.html.
   ===================================================== */

const CACHE_ESTATICOS = 'nb-estaticos-v6';   // ícones e offline
const CACHE_CORE      = 'nb-core-v6';        // html, css, js, manifest

const ARQUIVOS_ESTATICOS = [
  './offline.html',
  './icon-192.png',
  './icon-512.png'
];

const ARQUIVOS_CORE = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    (async () => {
      const cacheEstatico = await caches.open(CACHE_ESTATICOS);
      await Promise.all(ARQUIVOS_ESTATICOS.map((u) => cacheEstatico.add(u).catch(() => null)));

      const cacheCore = await caches.open(CACHE_CORE);
      await Promise.all(ARQUIVOS_CORE.map((u) => cacheCore.add(u).catch(() => null)));

      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      const chaves = await caches.keys();
      // Apaga QUALQUER cache que não seja da versão atual
      await Promise.all(
        chaves
          .filter((k) => k !== CACHE_ESTATICOS && k !== CACHE_CORE)
          .map((k) => caches.delete(k))
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

  // Navegações e arquivos que mudam: REDE PRIMEIRO
  const ehNavegacao = req.mode === 'navigate';
  const ehCore = ['index.html', 'style.css', 'script.js', 'manifest.json'].includes(caminho);

  if (ehNavegacao || ehCore) {
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
          const doCache = await caches.match(req);
          return doCache || caches.match('./offline.html');
        }
      })()
    );
    return;
  }

  // Ícones e demais estáticos: CACHE PRIMEIRO (não mudam com frequência)
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
