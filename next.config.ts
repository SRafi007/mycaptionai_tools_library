import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/browse",
        destination: "/ai-tools",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
