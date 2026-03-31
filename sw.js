/**
 * sw.js — DIN-BriefNEO Service Worker (Pure Edition)
 * [ADR-017] Flat & Pure Architecture | Offline Capability
 */

const CACHE_NAME = 'din-briefneo-v4.1.2';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/logic.js',
  '/engine.js',
  '/ui.js',
  '/app.js',
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
