
const createNextPwa = require('next-pwa');

const withPWA = createNextPwa({
  dest: 'public',
  // Disable PWA automatic registration because we are manually 
  // registering a unified service worker in src/hooks/use-fcm.ts
  disable: process.env.NODE_ENV === 'development',
  register: false, 
  skipWaiting: true,
  cacheStartUrl: false,
  dynamicStartUrl: false,
  cacheOnFrontEndNav: true,
  sw: 'sw.js',
  // CRITICAL FIX: Exclude problematic manifest files that cause 404s on Netlify
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
  ],
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    // 1. Static Info Pages - CacheFirst (Since they rarely change and don't fetch from Firestore)
    {
      urlPattern: ({ url }) =>
      [
       '/about',
       '/contact',
       '/privacy',
       '/terms',
       '/disclaimer',
       '/faq',
      ].includes(url.pathname),
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-info-pages',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // 2. Data-Driven Learning Pages - StaleWhileRevalidate (Fast UI + background update)
    {
      urlPattern: ({ url }) =>
      [
       '/',
       '/free-notes',
       '/quizzes',
       '/my-profile',
       '/class',
       '/batches',
       '/courses',
       '/bookstore',
       '/my-courses',
       '/share-reward',
       '/teacher',
       '/my-school',
       '/audio-lectures',
      ].some(path => url.pathname === path || url.pathname.startsWith(path)),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'dynamic-learning-pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // 3. Next.js Static Chunks - CacheFirst
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-chunks',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // 4. Next.js Data/RSC - NetworkFirst (Crucial for Client-side Navigation)
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
    // 5. Global Document Fallback - NetworkFirst
    {
      urlPattern: ({ request }) => request.destination === 'document',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // 6. API Requests - NetworkFirst
    {
      urlPattern: ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/api/'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // 7. Media & Assets - CacheFirst
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 180 * 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = withPWA(nextConfig);
