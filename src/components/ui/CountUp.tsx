"use client"

import { useEffect, useState } from "react"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"

interface Props {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
}

export default function CountUp({
  end,
  suffix = "",
  prefix = "",
  duration = 2000,
}: Props) {
  const { ref, visible } = useScrollAnimation<HTMLSpanElement>()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!visible) return
    let current = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      current += step
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [visible, end, duration])

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}
