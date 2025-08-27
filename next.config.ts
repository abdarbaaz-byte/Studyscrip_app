
import type {NextConfig} from 'next';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  sw: 'firebase-messaging-sw.js', // Use our custom service worker
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
  env: {
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    NEXT_PUBLIC_UPI_ID: process.env.NEXT_PUBLIC_UPI_ID,
  },
  webpack: (config, { isServer }) => {
    // This is to ensure that the pdf.worker.js file is copied to the public directory
    // so that react-pdf can find it.
    config.resolve.alias['pdfjs-dist'] = 'pdfjs-dist/build/pdf';
    return config;
  },
};

export default withPWA(nextConfig);
