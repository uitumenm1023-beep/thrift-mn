import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // WebP only: AVIF is far slower to encode, which made first views slow.
    formats: ["image/webp"],
    // Fewer sizes = more cache hits and fewer on-demand resizes.
    deviceSizes: [640, 828, 1080, 1600, 2048],
    imageSizes: [48, 64, 96, 128, 256, 384],
    // Uploaded photos get unique file names and never change, so cache resized
    // copies for 31 days instead of re-generating them every few hours.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      // Shop logos, covers and product photos uploaded to Supabase Storage
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      // Placeholder photos used by the demo data
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        // Bundled demo pictures: let browsers and the CDN keep them for a week.
        source: "/demo/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
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
