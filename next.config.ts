import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push('pdf-parse');
    return config;
  },
};

export default nextConfig;

