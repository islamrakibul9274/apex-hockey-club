/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Every photograph is served from /public via next/image, which generates
  // WebP/AVIF derivatives and a srcset so phones do not download desktop-sized
  // files. The previous build shipped 2.4 MB of unoptimised PNGs.
  images: {
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/images/**", search: "?v=20261016" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 768, 1024, 1280, 1600, 1920],
    imageSizes: [96, 160, 240, 320, 480],
    minimumCacheTTL: 60 * 60 * 24 * 30, // one month
  },

  // Strip framework-identifying headers and set the basics. CSP is left out
  // deliberately: Stripe and the Groq widget both inject inline styles, and a
  // half-configured CSP breaks checkout harder than it helps.
  poweredByHeader: false,
  compress: true,

  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
