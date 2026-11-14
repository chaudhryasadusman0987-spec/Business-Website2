"use client"

import Link from "next/link"
import { usePromo } from "@/components/providers/PromoProvider"
import { buildTickerMessages, mobilePromoLine } from "@/lib/promo"

// Promo bar under the navbar. The offers come from the dashboard discounts.
// Desktop keeps the scrolling ticker; on mobile it is one static line that
// links to the service on offer.
export default function NewsTicker() {
  const config = usePromo()
  if (!config) return null

  const messages = buildTickerMessages(config)
  if (messages.length === 0) return null
  const mobile = mobilePromoLine(config)

  // One scrolling unit = all messages separated by a diamond. We render it twice
  // back-to-back and translate the track -50% so the loop is seamless.
  const items = messages.map((m, i) => (
    <span key={i} className="flex items-center">
      <span className="px-6">{m}</span>
      <span className="text-accent">◆</span>
    </span>
  ))

  // Longer copy → slower scroll, so speed feels consistent regardless of length.
  const duration = Math.max(18, messages.join("").length * 0.35)

  return (
    <div className="on-dark relative overflow-hidden border-b border-white/10 bg-brand-hero text-[13px] font-medium text-white">
      {/* Mobile: one static line */}
      <div className="md:hidden">
        {mobile.href ? (
          <Link
            href={mobile.href}
            className="flex min-h-[44px] items-center justify-center px-4 text-center underline-offset-4 hover:underline"
          >
            {mobile.text}
          </Link>
        ) : (
          <p className="flex min-h-[44px] items-center justify-center px-4 text-center">{mobile.text}</p>
        )}
      </div>

      {/* Desktop: scrolling ticker */}
      <div
        className="hidden w-max animate-[marquee_linear_infinite] whitespace-nowrap py-2 hover:[animation-play-state:paused] motion-reduce:animate-none md:flex"
        style={{ animationDuration: `${duration}s` }}
      >
        <div className="flex items-center">{items}</div>
        <div className="flex items-center" aria-hidden>
          {items}
        </div>
      </div>
    </div>
  )
}
