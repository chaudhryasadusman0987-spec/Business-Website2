import type { Metadata } from "next"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `Dashboard | ${SITE_FULL}`,
  robots: "noindex, nofollow",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
