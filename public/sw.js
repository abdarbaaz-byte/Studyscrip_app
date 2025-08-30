
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// This file will be picked up by next-pwa and injected with the precache manifest.
// You can add your own custom logic here.

// For example, listen to push events if you have them.
workbox.routing.registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Import the Firebase messaging service worker script.
importScripts('/firebase-messaging-sw.js');
