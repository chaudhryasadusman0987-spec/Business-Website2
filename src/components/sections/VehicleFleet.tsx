"use client"

import { useEffect, useState } from "react"
import VehicleCard from "./VehicleCard"
import { vehicles as baseVehicles } from "@/data/car-rental"
import { mergeVehicles, normaliseOverrides, type Vehicle } from "@/lib/catalog"

// Client grid for the rental fleet. Renders the static vehicles immediately,
// then merges admin overrides from /api/catalog so added / edited / removed
// vehicles appear live. `limit` shows only the first N (landing preview);
// `detailed` shows passenger count + feature tags (full fleet page).
export default function VehicleFleet({
  limit,
  detailed = false,
}: {
  limit?: number
  detailed?: boolean
}) {
  const [list, setList] = useState<Vehicle[]>(baseVehicles)

  useEffect(() => {
    let cancelled = false
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setList(mergeVehicles(baseVehicles, normaliseOverrides(data)))
      })
      .catch(() => {
        /* keep static vehicles on error */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const shown = limit ? list.slice(0, limit) : list

  if (shown.length === 0) {
    return (
      <p className="text-center text-[15px] text-[#9496a8]">
        No vehicles available right now. Please check back soon.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {shown.map((v) => (
        <VehicleCard key={v.id} vehicle={v} detailed={detailed} />
      ))}
    </div>
  )
}
