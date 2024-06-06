/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  cacheStartUrl: "/",
  workboxOptions: {
    disableDevLogs: true,
  },
});

module.exports = withPWA({
  // Your Next.js config
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "media.tenor.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
    ]
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  compiler: {
    // removeConsole:true
    removeConsole: process.env.NODE_ENV === "production"
  }
});
// const nextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "firebasestorage.googleapis.com",
//       },
//     ],
//   },
// };

// module.exports = nextConfig;
