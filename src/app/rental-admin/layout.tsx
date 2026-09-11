import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Rental Management",
  robots: { index: false, follow: false },
}

export default function RentalAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
