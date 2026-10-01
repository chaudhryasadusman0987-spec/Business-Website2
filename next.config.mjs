/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Stops other sites framing ours (clickjacking the booking/sign pages).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      // Allow images served from the deployed Vercel domain
      {
        protocol: "https",
        hostname: "**.vercel.app",
      },
      // Unsplash hotlinked imagery (e.g. service hero photos)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // randomuser.me placeholder portraits (testimonial customer photos)
      {
        protocol: "https",
        hostname: "randomuser.me",
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
