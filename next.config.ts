import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/playground",
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/playground",
        permanent: false,
        basePath: false,
      },
    ]
  },
}

export default nextConfig
