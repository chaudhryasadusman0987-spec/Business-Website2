"use client"

import { useEffect, useState } from "react"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

interface Props {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  /** Where the count starts — e.g. a year counts from a nearby year, not 0. */
  start?: number
}

// Counts up to `end` the first time it scrolls into view. The server render
// and visitors who prefer reduced motion get the final number straight away.
export default function CountUp({
  end,
  suffix = "",
  prefix = "",
  duration = 1200,
  start = 0,
}: Props) {
  const { ref, visible } = useScrollAnimation<HTMLSpanElement>()
  const [count, setCount] = useState(end)

  useEffect(() => {
    if (!visible) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(end)
      return
    }
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      // ease-out, so the last digits settle rather than snap
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(start + (end - start) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    setCount(start)
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible, end, start, duration])

  return (
    // tabular-nums: digits keep one width, so the number doesn't jitter.
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count}
      {suffix}
    </span>
  )
}
