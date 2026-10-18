import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Classic caching model: pages use `export const dynamic = "force-dynamic"`
  // so content is always fetched fresh from the backend at request time.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
