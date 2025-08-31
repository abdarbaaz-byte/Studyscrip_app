
// Check for the Workbox library
if (typeof importScripts === 'function') {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

  // Global workbox
  if (workbox) {
    console.log('Workbox is loaded');

    // Disable logging in production
    workbox.setConfig({
      debug: false,
    });

    //========================================================================================//
    //                                                                                        //
    //                                    PRECACHING                                          //
    //                                                                                        //
    //========================================================================================//

    // This is the magic placeholder where next-pwa injects the list of files to cache.
    // Do not remove this line.
    workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);


    //========================================================================================//
    //                                                                                        //
    //                                    RUNTIME CACHING                                     //
    //                                                                                        //
    //========================================================================================//

    // Google Fonts
    workbox.routing.registerRoute(
      new RegExp('^https://fonts.(?:googleapis|gstatic).com/(.*)'),
      new workbox.strategies.CacheFirst({
        cacheName: 'google-fonts',
        plugins: [
          new workbox.cacheableResponse.CacheableResponsePlugin({
            statuses: [0, 200],
          }),
        ],
      })
    );

    // Images
    workbox.routing.registerRoute(
      /\.(?:png|gif|jpg|jpeg|svg|ico)$/,
      new workbox.strategies.CacheFirst({
        cacheName: 'images',
        plugins: [
          new workbox.expiration.ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          }),
        ],
      })
    );
    
    // Other assets
     workbox.routing.registerRoute(
      /\.(?:js|css)$/,
      new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'static-resources',
      })
    );


    //========================================================================================//
    //                                                                                        //
    //                                    PUSH NOTIFICATIONS                                  //
    //                                                                                        //
    //========================================================================================//

    self.addEventListener('push', (event) => {
      if (!event.data) {
        console.log('Push event has no data.');
        return;
      }

      const data = event.data.json();
      const options = {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
      };
      event.waitUntil(self.registration.showNotification(data.title, options));
    });

  } else {
    console.error('Workbox could not be loaded. Offline functionality will be limited.');
  }
}
