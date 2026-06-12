import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  
  // Allow Vercel preview deployments from any origin
  allowedDevOrigins: [
    ".space.chatglm.site",
    ".space-z.ai",
    ".vercel.app",
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Image optimization - allow external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
  },
};

export default nextConfig;
