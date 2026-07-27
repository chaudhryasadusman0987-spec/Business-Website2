"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Reveals an element the first time it scrolls into view.
 * The observer disconnects after the first hit, so each element
 * animates once per page visit.
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15
) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}
