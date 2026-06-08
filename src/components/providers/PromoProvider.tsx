"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { PromoConfig } from "@/lib/promo"

const PromoContext = createContext<PromoConfig | null>(null)

/** Public-site provider: fetches the current promo config once on mount. */
export default function PromoProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [config, setConfig] = useState<PromoConfig | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/promo")
      .then((r) => r.json())
      .then((data: PromoConfig) => {
        if (!cancelled) setConfig(data)
      })
      .catch(() => {
        /* leave null — prices/ticker simply show no promo */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return <PromoContext.Provider value={config}>{children}</PromoContext.Provider>
}

/** Returns the current promo config, or null while loading / on error. */
export function usePromo(): PromoConfig | null {
  return useContext(PromoContext)
}
