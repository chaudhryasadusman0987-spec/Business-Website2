"use client"

import { useEffect, useState } from "react"

export interface FleetCounts {
  onYard: number
  available: number
}

// One request per page load, shared by every component that shows the live
// fleet numbers (hero status line, stats strip, car rental card).
let pending: Promise<FleetCounts | null> | null = null

function load(): Promise<FleetCounts | null> {
  pending ??= fetch("/api/vehicles/counts", { cache: "no-store" })
    .then((r) => r.json())
    .then((d) =>
      typeof d?.onYard === "number" && d.onYard > 0
        ? { onYard: d.onYard, available: Number(d.available) || 0 }
        : null,
    )
    .catch(() => null)
  return pending
}

/** Live fleet counts from the database, or null while loading / unavailable —
 *  callers show wording without a number rather than a made-up one. */
export function useFleetCounts(): FleetCounts | null {
  const [counts, setCounts] = useState<FleetCounts | null>(null)
  useEffect(() => {
    let cancelled = false
    load().then((c) => {
      if (!cancelled) setCounts(c)
    })
    return () => {
      cancelled = true
    }
  }, [])
  return counts
}
