/** @type {import('next').NextConfig} */
const nextConfig = {
  // Farcaster Hosted Manifest: редирект по официальной инструкции
  // https://miniapps.farcaster.xyz/docs/guides/publishing
  async redirects() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination:
          "https://api.farcaster.xyz/miniapps/hosted-manifest/019c927a-1870-d983-fd06-de262e501d83",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
