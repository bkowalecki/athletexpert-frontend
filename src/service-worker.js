/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});
