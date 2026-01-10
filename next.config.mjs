/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    preloadEntriesOnStart: false,
  },
  images: {
    unoptimized: true,
    localPatterns: [
      {
        pathname: '/images/**',
        search: '?height=300&width=300',
      },
      {
        pathname: '/images/**', 
        search: '?height=600&width=600',
      },
      {
        pathname: '/images/**',
        search: '?height=1200&width=1200',
      },
    ],
  },
}

export default nextConfig
