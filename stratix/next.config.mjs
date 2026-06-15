/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export — Cloudflare Pages serves the generated `out/` directory
  // with no server runtime. AI runs client-side in Demo mode (see lib/ai/client).
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
