"use client"

import { useFleetCounts } from "@/hooks/useFleetCounts"

// "Available now" line under the hero buttons. The car count is live from the
// database; until it arrives (or if it can't be read) the line carries no
// number. Fixed height, so the count appearing never shifts the layout.
export default function HeroStatus() {
  const counts = useFleetCounts()

  return (
    <p className="mt-6 flex h-6 items-center gap-2.5 text-[14px] text-muted">
      <span className="pulse-dot" aria-hidden="true" />
      <span>
        {counts ? `${counts.onYard} cars on the yard` : "Weekly car rental"}
        {" · "}CCTV installs this week
      </span>
    </p>
  )
}
