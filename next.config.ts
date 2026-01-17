import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
      "lucide-react",
    ],
  },
};

export default nextConfig;
