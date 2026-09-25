import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

// Dev bundles use eval() for source maps and a websocket for HMR; production stays strict.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://checkout.razorpay.com https://*.posthog.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  `connect-src 'self'${dev ? " ws: wss:" : ""} https://*.posthog.com https://api.razorpay.com https://lumberjack.razorpay.com https://lumberjack-cx.razorpay.com`,
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // Self-contained server bundle for Docker (.next/standalone).
  // Standalone bundle for Docker/VPS; Vercel uses its own output, so skip it there.
  output: process.env.VERCEL ? undefined : "standalone",
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  poweredByHeader: false,
  // Native/WASM database drivers must not be bundled by webpack.
  serverExternalPackages: ["@electric-sql/pglite", "postgres", "razorpay"],
  // The Drizzle migrator reads ./drizzle at runtime; make sure it ships in the serverless bundle.
  outputFileTracingIncludes: { "/**/*": ["./drizzle/**/*"] },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
