"use client"

import { m } from "framer-motion"

interface Props {
  children: React.ReactNode
  /** Kept for existing call sites — every reveal is the same fade-up now. */
  animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale"
  /** Stagger in ms; cards in a grid pass index × 80. */
  delay?: number
  className?: string
  threshold?: number
}

// Scroll reveal: fades up 16px over 0.5s the first time the element enters the
// viewport, once only. Use for below-the-fold content — never for a hero H1 or
// hero image, which must paint immediately.
//
// `data-reveal` lets globals.css force the element visible for visitors who
// prefer reduced motion, and the <noscript> rule in layout.tsx do the same
// when JavaScript is off.
export default function AnimateIn({ children, delay = 0, className = "" }: Props) {
  return (
    <m.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay: delay / 1000 }}
    >
      {children}
    </m.div>
  )
}
