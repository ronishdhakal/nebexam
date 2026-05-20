import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    resolveAlias: {
      canvas: './src/canvas-empty.js',
    },
  },
  images: {
    remotePatterns: [
      // Local Django dev server
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      // Any HTTPS host — covers Cloudflare R2 and other CDNs
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
