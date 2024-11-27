import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/playground",
  images: {
    unoptimized: true,
  },
}

export default nextConfig
