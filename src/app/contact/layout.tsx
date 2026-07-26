import type { Metadata } from "next"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: "Contact",
  description:
    `Contact ${SITE_FULL}. Free quotes on security, car rental and IT ` +
    "services. Based in Brisbane, servicing Brisbane & Southeast QLD.",
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
