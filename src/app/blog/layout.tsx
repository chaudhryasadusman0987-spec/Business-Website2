import type { ReactNode } from "react"
import { SITE_FULL } from "@/data/site"

export const metadata = {
  title: `Blog & Insights | ${SITE_FULL}`,
  description: `News, guides and tips from ${SITE_FULL} on security, car rental, IT and AI automation across Australia.`,
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children
}
