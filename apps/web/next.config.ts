import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Forcer la résolution des styles
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Performance optimizations
  swcMinify: true,
  compress: true,
  
  // Experimental features for better performance
  experimental: {
    // Enable optimistic client-side prefetching
    optimisticClientCache: true,
    // Optimize server components
    serverComponentsExternalPackages: ['lucide-react'],
    // Better bundle analysis
    bundlePagesRouterDependencies: true,
  },
  
  // Compile only necessary packages
  transpilePackages: ['lucide-react'],
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
