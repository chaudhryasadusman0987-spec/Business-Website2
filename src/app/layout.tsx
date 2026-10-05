import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import NewsTicker from "@/components/layout/NewsTicker"
import PromoProvider from "@/components/providers/PromoProvider"
import AIChatBubble from "@/components/ui/AIChatBubble"
import {
  SITE_FULL,
  SITE_DOMAIN,
  SITE_EMAIL,
  SITE_PHONE,
  SITE_TAGLINE,
  SITE_COMPANY,
} from "@/data/site"

const poppins = Poppins({
  subsets: ["latin"],
  // 800 backs `font-extrabold`, used by the navbar wordmark and every hero H1.
  // Without it the browser synthesises a faux-bold from 700, which smears the
  // letterforms at large sizes.
  weight: ["300", "400", "500", "600", "700", "800"],
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
    // The share image comes from app/opengraph-image.tsx (1200x630).
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
  twitter: {
    card: "summary_large_image",
  },
  manifest: "/site.webmanifest",
}

// LocalBusiness structured data — lets Google show the business name, phone,
// hours and service area in search results and the knowledge panel.
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_DOMAIN}/#business`,
  name: SITE_FULL,
  legalName: SITE_COMPANY,
  slogan: SITE_TAGLINE,
  url: SITE_DOMAIN,
  logo: `${SITE_DOMAIN}/images/pak-oz-mark.png`,
  image: `${SITE_DOMAIN}/images/pak-oz-mark.png`,
  telephone: SITE_PHONE,
  email: SITE_EMAIL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Brisbane",
    addressRegion: "QLD",
    addressCountry: "AU",
  },
  areaServed: [
    { "@type": "City", name: "Brisbane" },
    { "@type": "AdministrativeArea", name: "South East Queensland" },
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "15:00",
    },
  ],
  knowsAbout: [
    "CCTV installation",
    "Security systems",
    "Access control",
    "Long-term car rental",
    "Web development",
    "AI automation",
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
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
