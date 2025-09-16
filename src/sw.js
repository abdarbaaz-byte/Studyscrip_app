// Import OneSignal's Service Worker script
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');

// Import the workbox-sw library
if (typeof importScripts === 'function') {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js'
  );
}

// This is the standard service worker logic for next-pwa
if (workbox) {
  console.log(`Workbox is loaded`);

  // Ensure self.__WB_MANIFEST is defined. next-pwa will inject it.
  self.__WB_MANIFEST = self.__WB_MANIFEST || [];

  // Precache all the assets in the manifest
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

} else {
  console.log(`Workbox didn't load`);
}

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('fetch', (event) => {
  // Custom fetch logic can go here if needed.
});
