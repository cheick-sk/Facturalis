/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This is needed for Docker hot-reloading
  experimental: {
    outputStandalone: true,
  },
  // Webpack 5 is required for Next.js 12+
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

module.exports = nextConfig;
