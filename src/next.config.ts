
import type {NextConfig} from 'next';
const runtimeCaching = require("next-pwa/cache");

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching,
  disable: process.env.NODE_ENV === 'development',
  importScripts: ['https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js'],
});

const nextConfig: NextConfig = {
  /* config options here */
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
        hostname: '**', // Allows all hostnames
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // This is to ensure that the pdf.worker.js file is copied to the public directory
    // so that react-pdf can find it.
    config.resolve.alias['pdfjs-dist'] = 'pdfjs-dist/build/pdf';
    return config;
  },
};


export default withPWA(nextConfig);
