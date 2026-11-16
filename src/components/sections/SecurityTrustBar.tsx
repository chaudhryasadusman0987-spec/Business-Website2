import { ShieldCheck } from "lucide-react"
import { licenceLabel } from "@/data/security-offer"
import { SECURITY_WARRANTY } from "@/data/site"

/** The trust items, licence first. The licence item drops out in production
 *  until a number is set in site.ts. */
export function securityTrustItems(): string[] {
  return [
    licenceLabel(),
    SECURITY_WARRANTY.charAt(0).toUpperCase() + SECURITY_WARRANTY.slice(1),
    "Free site assessment",
    "Local Brisbane team",
  ].filter((s): s is string => Boolean(s))
}

// Thin band directly under the security hub hero.
export default function SecurityTrustBar() {
  const items = securityTrustItems()
  return (
    <section aria-label="Why customers choose us" className="border-b border-line bg-white on-light">
      <ul className="container-page flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-4 text-[14px] font-medium text-ink">
        {items.map((item, i) => (
          <li key={item} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="hidden text-muted sm:inline">·</span>}
            <ShieldCheck size={16} aria-hidden="true" className="flex-shrink-0 text-[#0F6E56]" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
