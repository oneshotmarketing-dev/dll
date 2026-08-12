/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the client-side Router Cache warm so switching back to a page you were
  // just on (or one whose link was prefetched) is instant instead of a fresh
  // server round-trip. Without this, dynamic (cookie-reading) portal pages
  // default to a 0s reuse window — so after sitting idle a few minutes, every
  // page switch re-hits the server. 120s reuse covers normal browsing; any
  // mutation still calls router.refresh() to bust the cache, so edits show
  // immediately regardless.
  experimental: {
    staleTimes: {
      dynamic: 120,
      static: 300,
    },
  },
  images: {
    // Stitch-hosted images are downloaded into /public before launch (see README).
    // Remote patterns kept only for local dev preview of not-yet-downloaded assets.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async redirects() {
    return [
      {
        // /courses/french and /french are the SAME page; /french-canada is canonical.
        source: "/courses/french",
        destination: "/french-canada",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
