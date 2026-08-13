import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import NewsTicker from "@/components/layout/NewsTicker"
import PromoProvider from "@/components/providers/PromoProvider"
import AIChatBubble from "@/components/ui/AIChatBubble"
import { SITE_FULL, SITE_DOMAIN } from "@/data/site"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: `${SITE_FULL} — Security, Car Rental & IT Services Brisbane`,
    template: `%s | ${SITE_FULL}`,
  },
  description: `${SITE_FULL} — Professional security installation, car rental and IT services across Brisbane and Australia. Free quotes. Licensed and insured.`,
  keywords: [
    SITE_FULL,
    "security Brisbane",
    "CCTV installation Brisbane",
    "car rental Brisbane",
    "IT services Brisbane",
    "AI automation Australia",
  ],
  metadataBase: new URL(SITE_DOMAIN),
  openGraph: {
    siteName: SITE_FULL,
    locale: "en_AU",
    images: [
      {
        // Square logo — social cards will letterbox it rather than crop.
        url: "/images/pak-oz-logo.png",
        width: 500,
        height: 500,
        alt: SITE_FULL,
      },
    ],
  },
  icons: {
    // /icon.svg is the Markhor mark generated from app/icon.svg. It is listed
    // ahead of the legacy raster icons so browsers that support SVG favicons
    // (all current ones) pick up the new branding.
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "mask-icon", url: "/icon.svg", color: "#7f85f7" }],
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-AU" className={poppins.className}>
      <head>
        {/* Scroll-reveal elements start hidden and are shown by an
            IntersectionObserver. Without JS that observer never runs, so
            reveal them unconditionally instead of leaving the page blank. */}
        <noscript>
          <style>{`.anim-fade-up,.anim-fade-in,.anim-slide-left,.anim-slide-right,.anim-scale{opacity:1!important;transform:none!important}.animate-expand-line{width:100%!important}`}</style>
        </noscript>
      </head>
      <body>
        <PromoProvider>
          <Header />
          <NewsTicker />
          <main>{children}</main>
          <Footer />
          <AIChatBubble />
        </PromoProvider>
      </body>
    </html>
  )
}
