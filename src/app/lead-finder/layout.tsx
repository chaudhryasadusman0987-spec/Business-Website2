import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Lead Finder",
  robots: { index: false, follow: false },
}

export default function LeadFinderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
