/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow this app to be embedded in an iframe on the GHL site (and the
  // Render preview domain itself). Deliberately does NOT set X-Frame-Options,
  // which would block framing outright.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://possible-woman.com https://www.possible-woman.com https://*.gohighlevel.com https://*.leadconnectorhq.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
