"use client"

import { useScrollAnimation } from "@/hooks/useScrollAnimation"

interface Props {
  children: React.ReactNode
  animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "scale"
  delay?: number // in ms: 0, 100, 150, 200, 300 …
  className?: string
  threshold?: number
}

export default function AnimateIn({
  children,
  animation = "fade-up",
  delay = 0,
  className = "",
  threshold = 0.15,
}: Props) {
  const { ref, visible } = useScrollAnimation(threshold)

  const classes = [
    `anim-${animation}`,
    visible ? "visible" : "",
    delay ? `delay-${delay}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  )
}
