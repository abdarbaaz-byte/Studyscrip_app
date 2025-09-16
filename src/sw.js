// Import OneSignal's Service Worker script
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');

// This is the standard service worker logic for next-pwa
self.addEventListener('install', (event) => {
  // Add custom install logic here if needed
});

self.addEventListener('fetch', (event) => {
  // Add custom fetch logic here if needed
});

// The rest of the PWA service worker logic will be injected by next-pwa.
