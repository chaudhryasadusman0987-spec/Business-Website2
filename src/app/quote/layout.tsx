import { SITE_FULL } from "@/data/site"

export const metadata = {
  title: `Free Quote | ${SITE_FULL}`,
  description:
    "Get a free quote for security installation, car rental or IT services. Instant estimate. No obligation.",
  robots: "noindex",
}

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
