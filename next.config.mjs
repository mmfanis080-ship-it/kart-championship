/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
