"use client"

import { useFleetCounts } from "@/hooks/useFleetCounts"

// Live "N cars on the yard · X available now" line for the homepage's Car
// Rental card. Fetched client-side so the homepage itself stays static; the
// numbers come from the same getFleetCounts() the car rental hero uses.
export default function FleetCountBadge() {
  const counts = useFleetCounts()

  // No badge until the live count arrives — never show a made-up number.
  if (!counts) return null
  return (
    <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent transition-colors duration-200 group-hover:text-white">
      <span
        className={`w-1.5 h-1.5 rounded-full ${counts.available > 0 ? "bg-[#0f6e56]" : "bg-[#f0ad4e]"}`}
      />
      {counts.onYard} cars on the yard ·{" "}
      {counts.available > 0 ? `${counts.available} available now` : "all booked"}
    </p>
  )
}
