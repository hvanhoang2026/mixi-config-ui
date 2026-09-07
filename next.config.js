/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@w-iris/react", "@w-iris/antd-react", "@w-iris/tokens", "@w-iris/themes"],
  env: {
    W_API_PROXY_TARGET:
      process.env.W_API_PROXY_TARGET || "https://w-gateway-phi.vercel.app",
  },
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
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
