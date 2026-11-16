import type { Metadata } from "next"
import { withSocial } from "@/lib/seo"

export const metadata: Metadata = withSocial({
  title: "Rental Management",
  robots: { index: false, follow: false },
})

export default function RentalAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
