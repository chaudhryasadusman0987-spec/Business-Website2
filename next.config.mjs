/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Allow images served from the deployed Vercel domain
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
      // TODO(dashboard): add Cloudinary or S3 domain when the owner moves to
      // cloud image storage, e.g.
      // { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async redirects() {
    return [
      // CCTV Installation was restructured into the Security Solutions hub.
      {
        source: "/services/cctv-installation",
        destination: "/services/security-solutions",
        permanent: true,
      },
      {
        source: "/services/cctv-installation/:path*",
        destination: "/services/security-solutions/:path*",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
