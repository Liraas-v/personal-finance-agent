// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['tesseract.js'],
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig
