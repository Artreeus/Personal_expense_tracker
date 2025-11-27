/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize for Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  // Ensure proper handling of environment variables
  env: {
    MEGALLM_API_KEY: process.env.MEGALLM_API_KEY,
  },
};

module.exports = nextConfig;
