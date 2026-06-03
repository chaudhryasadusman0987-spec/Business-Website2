import type { Metadata } from "next"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `Security Solutions Quote | ${SITE_FULL}`,
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
