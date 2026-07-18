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
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-AU" className={poppins.className}>
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
