// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,          // Enables additional React checks and warnings in development
  swcMinify: true,                // Uses the faster SWC compiler to minify code
  pageExtensions: ['ts', 'tsx'],  // Ensures that only .ts and .tsx files are treated as pages
  images: {
    domains: [],                  // Add any external domains you expect to serve images from
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig
