import type { Metadata } from "next"
import { withSocial } from "@/lib/seo"

export const metadata: Metadata = withSocial({
  title: "Dashboard",
  robots: "noindex, nofollow",
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
