"use client"

import { useEffect, useState } from "react"

// Live "N cars on the yard · X available now" line for the homepage's Car
// Rental card. Fetched client-side so the homepage itself stays static; the
// numbers come from the same getFleetCounts() the car rental hero uses.
export default function FleetCountBadge() {
  const [counts, setCounts] = useState<{ onYard: number; available: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/vehicles/counts", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && typeof data.onYard === "number" && data.onYard > 0) {
          setCounts({ onYard: data.onYard, available: Number(data.available) || 0 })
        }
      })
      .catch(() => {
        /* no badge — never show a made-up number */
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!counts) return null
  return (
    <p className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-semibold text-brand-primary group-hover:text-white transition-all duration-500">
      <span
        className={`w-1.5 h-1.5 rounded-full ${counts.available > 0 ? "bg-[#0f6e56]" : "bg-[#f0ad4e]"}`}
      />
      {counts.onYard} cars on the yard ·{" "}
      {counts.available > 0 ? `${counts.available} available now` : "all booked"}
    </p>
  )
}
