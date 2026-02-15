import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance Optimizations */
  experimental: {
    optimizePackageImports: ['@supabase/ssr', '@supabase/supabase-js'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Enable React strict mode for better performance in development
  reactStrictMode: true,
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Reduce bundle size by tree-shaking unused code
  swcMinify: true,
};

export default nextConfig;
