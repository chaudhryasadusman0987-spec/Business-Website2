import type { Metadata } from "next"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `Get a Car Rental Quote | ${SITE_FULL}`,
  description:
    "Build your Brisbane car rental quote in minutes — pick-up location, " +
    "vehicle, extras and a transparent security bond breakdown. Valid 48 hours.",
}

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
