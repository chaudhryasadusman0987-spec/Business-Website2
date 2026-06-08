"use client"

import { usePromo } from "@/components/providers/PromoProvider"
import { discounted, type PromoCategory } from "@/lib/promo"
import { formatAUD } from "@/lib/formatters"

interface PriceProps {
  amount: number
  category: PromoCategory
  /** Text before the amount, e.g. "From ". */
  prefix?: string
  /** Text after the amount, e.g. "/day". */
  suffix?: string
  /** Tailwind classes for the main (current) price text. */
  className?: string
  /** Discounted number only — no strikethrough or tag. For secondary prices. */
  compact?: boolean
}

/**
 * Renders a price that respects the active promo for its category. When the
 * category is discounted, shows the original struck through, the discounted
 * amount, and a small "−X%" tag. Otherwise just the price.
 */
export default function Price({
  amount,
  category,
  prefix,
  suffix,
  className,
  compact = false,
}: PriceProps) {
  const config = usePromo()
  const promo = config?.[category]
  const active = Boolean(promo?.active && promo.percent > 0)

  if (!active) {
    return (
      <span className={className}>
        {prefix}
        {formatAUD(amount)}
        {suffix}
      </span>
    )
  }

  const percent = promo!.percent
  const newAmount = discounted(amount, percent)

  if (compact) {
    return (
      <span className={className}>
        {prefix}
        {formatAUD(newAmount)}
        {suffix}
      </span>
    )
  }

  return (
    <span className="inline-flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
      <span className="text-[0.7em] font-semibold text-gray-400 line-through decoration-1 group-hover:text-white/60">
        {prefix}
        {formatAUD(amount)}
      </span>
      <span className={className}>
        {prefix}
        {formatAUD(newAmount)}
        {suffix}
      </span>
      <span className="rounded-full bg-[#e1f5ee] px-2 py-0.5 text-[10px] font-bold text-[#0f6e56] group-hover:bg-white group-hover:text-brand-primary">
        −{percent}%
      </span>
    </span>
  )
}
