import type { Metadata } from "next"
import { SECURITY_BRAND } from "@/data/site"

// Metadata lives here because quote/page.tsx is a client component and cannot
// export it. `absolute` keeps the root template from appending "Pak Oz Solutions".
export const metadata: Metadata = {
  title: { absolute: `Get a CCTV Quote | ${SECURITY_BRAND}` },
  description:
    `Get an instant, itemised security quote from ${SECURITY_BRAND} — ` +
    "surveillance, alarms, access control, intercoms and more. Emailed to " +
    "you within minutes.",
}

export default function QuoteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
