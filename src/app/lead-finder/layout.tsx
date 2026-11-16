import type { Metadata } from "next"
import { withSocial } from "@/lib/seo"

export const metadata: Metadata = withSocial({
  title: "Lead Finder",
  robots: { index: false, follow: false },
})

export default function LeadFinderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
