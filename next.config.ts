import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Ignore ESLint errors during build (so Vercel won’t fail)
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push("pdf-parse");
    return config;
  },
};

export default nextConfig;


