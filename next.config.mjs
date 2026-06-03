/** @type {import('next').NextConfig} */
const nextConfig = {
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
