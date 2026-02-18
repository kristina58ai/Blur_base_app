/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination: "/api/farcaster-manifest",
      },
    ];
  },
};

module.exports = nextConfig;
