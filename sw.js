// sw.js — DIN-BriefNEO v4 Core Service Worker
const CACHE_NAME = 'neo-v4-core-v1';
const ASSETS = [
  '/',
  'index.html',
  'manifest.json',
  'css/core-immutable.css',
  'css/din5008-paper.css',
  'css/lockdown.css',
  'css/app-ui.css',
  'css/print.css',
  'js/address-service.js',
  'js/app.js',
  'js/cma-sensor.js',
  'js/constants.js',
  'js/devmode.js',
  'js/edit-context-controller.js',
  'js/flight-recorder.js',
  'js/ghost-mirror.js',
  'js/greetings.js',
  'js/io-coordinator.js',
  'js/logic.js',
  'js/model-blacklist.js',
  'js/opfs-worker.js',
  'js/state.js',
  'js/temporal-utils.js',
  'js/toast-manager.js',
  'js/toast-registry.js',
  'js/ui.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => {
      console.log('[SW] Initializing Cache...');
      return c.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

/**
 * [High-Integrity] Cache-First Strategy with Network Fallback
 */
self.addEventListener('fetch', e => {
  // Nur GET-Requests cachen
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      
      return fetch(e.request).then(networkResponse => {
        // Valide Response cachen
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline Fallback für Navigation
        if (e.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
