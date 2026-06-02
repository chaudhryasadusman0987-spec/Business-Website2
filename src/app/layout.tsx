import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import AIChatBubble from "@/components/ui/AIChatBubble"
import { SITE_FULL, SITE_TAGLINE } from "@/data/site"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: { template: `%s | ${SITE_FULL}`, default: SITE_FULL },
  description: SITE_TAGLINE,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-AU" className={poppins.className}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <AIChatBubble />

      </body>
    </html>
  )
}
