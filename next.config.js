// next.config.mjs
import withPWA from "next-pwa";

// Base config for Next.js
const nextConfig = {
  reactStrictMode: true,

  // ✅ Use new field instead of deprecated one
  turbopack: {},
    eslint: {
   
    ignoreDuringBuilds: true,
  },
};

// ✅ Export Next.js config wrapped with PWA
export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
