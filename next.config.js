/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['primereact', 'primeicons'],
  },
};

module.exports = nextConfig;
