import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ❗ Вимикає перевірку типів на білд
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
