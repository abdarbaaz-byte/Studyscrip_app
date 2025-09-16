
// This is the custom service worker file.

// Import the OneSignal service worker script first. This is crucial.
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// The following is needed for next-pwa to inject its precache manifest.
// DO NOT REMOVE or RENAME self.__WB_MANIFEST or the build will fail.
self.__WB_MANIFEST;
