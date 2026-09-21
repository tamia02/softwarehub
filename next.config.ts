import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
