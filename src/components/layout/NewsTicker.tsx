"use client"

import { usePromo } from "@/components/providers/PromoProvider"
import { buildTickerMessages } from "@/lib/promo"

export default function NewsTicker() {
  const config = usePromo()
  if (!config) return null

  const messages = buildTickerMessages(config)
  if (messages.length === 0) return null

  // One scrolling unit = all messages separated by a diamond. We render it twice
  // back-to-back and translate the track -50% so the loop is seamless.
  const items = messages.map((m, i) => (
    <span key={i} className="flex items-center">
      <span className="px-6">{m}</span>
      <span className="text-[#7f85f7]">◆</span>
    </span>
  ))

  // Longer copy → slower scroll, so speed feels consistent regardless of length.
  const duration = Math.max(18, messages.join("").length * 0.35)

  return (
    <div className="relative overflow-hidden bg-[#0d0d1a] text-white text-[13px] font-medium py-2 border-b border-white/10">
      <div
        className="flex w-max whitespace-nowrap animate-[marquee_linear_infinite] hover:[animation-play-state:paused]"
        style={{ animationDuration: `${duration}s` }}
      >
        <div className="flex items-center" aria-hidden={false}>
          {items}
        </div>
        <div className="flex items-center" aria-hidden>
          {items}
        </div>
      </div>
    </div>
  )
}
