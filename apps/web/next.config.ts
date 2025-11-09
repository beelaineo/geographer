import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**"
      }
    ]
  }
};

export default nextConfig;
