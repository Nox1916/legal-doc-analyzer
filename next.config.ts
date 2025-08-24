import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("pdf-parse");
    }
    return config;
  },
  serverExternalPackages: ["pdf-parse"],

};

export default nextConfig;



