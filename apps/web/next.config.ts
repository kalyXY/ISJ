import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration originale
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Optimisations simples et sûres
  compress: true,
  
  // Headers de sécurité (seulement ceux-ci pour commencer)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
