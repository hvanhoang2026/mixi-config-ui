/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    W_API_PROXY_TARGET:
      process.env.W_API_PROXY_TARGET || "https://w-gateway-phi.vercel.app",
  },
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["@mui/material", "@mui/icons-material"],
  },
  async rewrites() {
    if (process.env.PLAYWRIGHT_BASE_URL) {
      return [
        {
          source: "/config/:path*",
          destination: `${process.env.PLAYWRIGHT_BASE_URL}/config/:path*`,
        },
      ];
    }
    return [];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
