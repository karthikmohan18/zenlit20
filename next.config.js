/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'i.pravatar.cc',
      'picsum.photos',
      'randomuser.me',
      'media.istockphoto.com'
    ],
  },
  experimental: {
    appDir: true,
  },
}

export default nextConfig