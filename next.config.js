/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // Removed all external image domains - using local images only
    ],
  },
}

export default nextConfig