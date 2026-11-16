import { withSocial } from "@/lib/seo"
export const metadata = withSocial({
  title: "Free Quote",
  description:
    "Get a free quote for security installation, car rental or IT services. Instant estimate. No obligation.",
  alternates: { canonical: "/quote" },
})

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
