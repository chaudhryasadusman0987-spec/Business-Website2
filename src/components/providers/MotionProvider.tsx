"use client"

import { LazyMotion } from "framer-motion"

const loadFeatures = () => import("./motion-features").then((m) => m.default)

// One LazyMotion boundary for the whole site. Components use the lightweight
// `m.*` elements; the animation features are fetched after first paint.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  )
}
