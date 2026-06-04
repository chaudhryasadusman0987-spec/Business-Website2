import type { Metadata } from "next"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `Contact Us | ${SITE_FULL}`,
  description:
    `Contact ${SITE_FULL}. Free quotes on security, car rental and IT ` +
    "services. Based in Brisbane, servicing Australia-wide.",
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
