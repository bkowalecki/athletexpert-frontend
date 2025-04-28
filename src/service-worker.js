/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { precacheAndRoute } from 'workbox-precaching';

// ✅ Precache all assets injected by workbox at build time
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', (event) => {
  console.log('🛠️ Service Worker installing...');
  self.skipWaiting(); // optional: immediately activate
});

self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  self.clients.claim(); // optional: immediately take control
});
