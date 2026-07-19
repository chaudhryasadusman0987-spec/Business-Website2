import type { ReactNode } from "react"
import { SITE_FULL } from "@/data/site"

export const metadata = {
  title: `Customer Reviews | ${SITE_FULL}`,
  description: `Read reviews for ${SITE_FULL}. Feedback on our security, car rental and IT services across Australia.`,
}

export default function TestimonialsLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
