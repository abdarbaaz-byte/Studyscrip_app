
// Import OneSignal's Service Worker script
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');

// This file is required to be in the public folder.
// This is the standard service worker logic for next-pwa
if (typeof importScripts === 'function') {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js'
  );
}

if (workbox) {
  console.log(`Workbox is loaded`);

  // Ensure self.__WB_MANIFEST is defined. next-pwa will inject it.
  self.__WB_MANIFEST = self.__WB_MANIFEST || [];
  
  // Precache all the assets in the manifest.
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

  // Example of a runtime caching route
  workbox.routing.registerRoute(
    new RegExp('^https://fonts.(?:googleapis|gstatic).com/(.*)'),
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 30,
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

   workbox.routing.registerRoute(
    /^https:\/\/firestore\.googleapis\.com\/.*/,
    new workbox.strategies.NetworkFirst({
      cacheName: 'firestore-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
      ],
    })
  );


} else {
  console.log(`Workbox didn't load`);
}

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('fetch', (event) => {
  // Custom fetch logic can go here if needed.
});
