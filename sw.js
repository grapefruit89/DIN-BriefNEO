// sw.js — Minimaler Service Worker für PWA Readiness
const CACHE_NAME = 'neo-v1';
const ASSETS = [
  'index.html',
  'css/din5008-paper.css',
  'css/sidebar.css',
  'js/core/app.js',
  'js/core/state.js',
  'js/core/constants.js',
  'js/core/temporal-utils.js',
  'js/logic/logic.js',
  'js/ui/ui.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
