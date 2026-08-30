const createNextPwa = require('next-pwa');

const withPWA = createNextPwa({
  dest: 'public',

  // Disable PWA in development
  disable: process.env.NODE_ENV === 'development',

  // We register the unified service worker manually
  register: false,

  skipWaiting: true,

  // Your unified service worker
  sw: 'sw.js',

  // Prevent problematic Next.js manifest files from being precached
  buildExcludes: [
    /app-build-manifest\.json$/,
    /middleware-manifest\.json$/,
  ],

  runtimeCaching: [
    // ============================================================
    // 1. HTML / PAGE NAVIGATION
    // ============================================================
    {
      urlPattern: ({ request }) => request.destination === 'document',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pages',

        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },

        // If network fails, cached page can still be used
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // ============================================================
    // 2. API REQUESTS
    // ============================================================
    {
      urlPattern: ({ url, request }) =>
        request.method === 'GET' &&
        url.pathname.startsWith('/api/'),

      handler: 'NetworkFirst',

      options: {
        cacheName: 'api-cache',

        networkTimeoutSeconds: 5,

        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },

        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // ============================================================
    // 3. GOOGLE FONTS
    // ============================================================
    {
      urlPattern:
        /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,

      handler: 'CacheFirst',

      options: {
        cacheName: 'google-fonts',

        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
        },

        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // ============================================================
    // 4. STATIC FONT FILES
    // ============================================================
    {
      urlPattern:
        /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,

      handler: 'CacheFirst',

      options: {
        cacheName: 'static-font-assets',

        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },

        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // ============================================================
    // 5. IMAGES
    // ============================================================
    {
      urlPattern:
        /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,

      handler: 'CacheFirst',

      options: {
        cacheName: 'static-image-assets',

        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 180 * 24 * 60 * 60, // 180 days
        },

        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // ============================================================
    // 6. JAVASCRIPT
    // ============================================================
    {
      urlPattern: /\.js$/i,

      handler: 'StaleWhileRevalidate',

      options: {
        cacheName: 'static-js-assets',

        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },

        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // ============================================================
    // 7. CSS
    // ============================================================
    {
      urlPattern: /\.css$/i,

      handler: 'StaleWhileRevalidate',

      options: {
        cacheName: 'static-css-assets',

        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },

        cacheableResponse: {
          statuses: [0, 200],
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