import type { Metadata } from "next"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `Get an IT & AI Quote | ${SITE_FULL}`,
  description:
    "Get a free quote for web development, app development, AI automation or " +
    "IT consulting. Estimate in 2 minutes.",
  robots: "noindex", // quote pages don't need SEO
}

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
