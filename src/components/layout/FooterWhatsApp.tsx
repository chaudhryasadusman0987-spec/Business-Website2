"use client"

import { usePathname } from "next/navigation"
import { IT_WHATSAPP_LINK, IT_WHATSAPP_LOCAL, SITE_WHATSAPP_LINK } from "@/data/site"

// The footer's WhatsApp link. The pre-filled message names Pak Oz
// Technologies on IT pages and Pak Oz Solutions everywhere else.
export default function FooterWhatsApp({ className = "" }: { className?: string }) {
  const pathname = usePathname()
  const onIT = pathname.startsWith("/services/it-services")
  return (
    <a
      href={onIT ? IT_WHATSAPP_LINK : SITE_WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      IT &amp; AI: WhatsApp {IT_WHATSAPP_LOCAL}
    </a>
  )
}
