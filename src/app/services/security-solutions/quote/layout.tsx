import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Security Solutions Quote",
  description:
    "Get an instant, itemised security quote — surveillance, alarms, access " +
    "control, intercoms and more. Emailed to you within minutes.",
}

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
