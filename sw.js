/**
 * sw.js — DIN-BriefNEO Service Worker (Pure Edition)
 * [ADR-017] Flat & Pure Architecture | Offline Capability
 */

const CACHE_NAME = 'din-briefneo-v4.8.0';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/js/app.js',
  '/js/ui.js',
  '/js/engine.js',
  '/js/logic.js',
  '/js/salutation.js',
  '/js/address.js',
  '/js/archive.js',
  '/js/pages.js',
  '/js/qrcode.js',
  '/js/qr-engine.js',
  '/js/toast.js',
  '/js/metadata.js',
  '/css/base.css',
  '/css/theme.css',
  '/css/structure.css',
  '/css/floating.css',
  '/css/components.css',
  '/css/immutable.css',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
});
