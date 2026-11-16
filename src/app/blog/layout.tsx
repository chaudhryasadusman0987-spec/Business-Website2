import type { ReactNode } from "react"
import { SITE_FULL } from "@/data/site"
import { withSocial } from "@/lib/seo"

export const metadata = withSocial({
  alternates: { canonical: "/blog" },
  title: "Blog & Insights",
  description: `News, guides and tips from ${SITE_FULL} on security, car rental, IT and AI automation across Australia.`,
})

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children
}
