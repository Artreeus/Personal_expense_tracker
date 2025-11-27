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
    domains: ['img.clerk.com'],
  },
};

module.exports = nextConfig;
