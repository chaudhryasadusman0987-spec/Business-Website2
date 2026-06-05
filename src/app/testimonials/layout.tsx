import type { ReactNode } from "react"
import { SITE_FULL } from "@/data/site"

export const metadata = {
  title: `Customer Reviews | ${SITE_FULL}`,
  description: `See what 2,400+ customers say about ${SITE_FULL}. Verified reviews for security, car rental and IT services across Australia.`,
}

export default function TestimonialsLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
