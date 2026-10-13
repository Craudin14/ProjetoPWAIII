/* =====================================================

   Service Worker — Navalha & Brilho (v3)

   - CACHE_STATIC: pré-cache dos arquivos essenciais

   - CACHE_DYNAMIC: conteúdos que podem mudar

   - Navegação (HTML): network-first com fallback offline.html

   - Estáticos (CSS/JS/ícones): cache-first com atualização em segundo plano

   - Aceita apenas requisições GET da mesma origem

   ===================================================== */


const CACHE_STATIC = 'nb-static-v3';

const CACHE_DYNAMIC = 'nb-dynamic-v3';


const PRECACHE = [

  './',

  './index.html',

  './offline.html',

  './style.css',

  './script.js',

  './manifest.json',

  './icon-192.png',

  './icon-512.png'

];


self.addEventListener('install', (evento) => {

  evento.waitUntil(

    (async () => {

      const cache = await caches.open(CACHE_STATIC);

      // Cada arquivo é pré-cacheado de forma independente: um ícone ausente

      // não deve quebrar o install inteiro.

      await Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => null)));

      await self.skipWaiting();

    })()

  );

});


self.addEventListener('activate', (evento) => {

  evento.waitUntil(

    (async () => {

      const chaves = await caches.keys();

      await Promise.all(

        chaves

          .filter((k) => k !== CACHE_STATIC && k !== CACHE_DYNAMIC)

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


  // Navegações: rede primeiro, cache como fallback, offline.html por último

  if (req.mode === 'navigate') {

    evento.respondWith(

      (async () => {

        try {

          const resposta = await fetch(req);

          const cache = await caches.open(CACHE_DYNAMIC);

          cache.put(req, resposta.clone());

          return resposta;

        } catch (e) {

          const doCache = await caches.match(req);

          return doCache || caches.match('./offline.html');

        }

      })()

    );

    return;

  }


  // Estáticos: cache primeiro, atualizando em segundo plano

  evento.respondWith(

    (async () => {

      const doCache = await caches.match(req);

      const rede = fetch(req)

        .then((resposta) => {

          if (resposta && resposta.ok && resposta.type === 'basic') {

            const copia = resposta.clone();

            caches.open(CACHE_DYNAMIC).then((cache) => cache.put(req, copia));

          }

          return resposta;

        })

        .catch(() => doCache);

      return doCache || rede;

    })()

  );

});
