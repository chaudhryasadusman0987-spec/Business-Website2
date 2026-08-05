"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import VehicleModal from "@/components/car-rental/VehicleModal"
import { vehicleAlt, type RentalVehicle } from "@/lib/vehicles"

// The fleet lives in the database and is managed from the dashboard's Car
// Rental tab, so this fetches rather than importing a static list — a car added
// in the dashboard appears here on the next page load, with no redeploy.
//
// The listing asks for ?light=1 (no photo galleries): dashboard uploads are
// stored inline as data URLs, and pulling every car's full gallery just to
// render thumbnails would grow the payload with every vehicle added. The one
// car the visitor opens is then fetched in full by the modal.

// Which vehicle is open, and which step of the modal it opened on: clicking the
// card browses the photos, "Get on Rent" skips straight to the application.
interface OpenState {
  vehicle: RentalVehicle
  view: "details" | "apply"
}

export default function VehicleGrid({
  title = "The fleet",
  intro = "Every car below is on the yard right now. Open one for the photos and the rego, or go straight to the application.",
}: {
  title?: string
  intro?: string
}) {
  const [vehicles, setVehicles] = useState<RentalVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<OpenState | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/vehicles?light=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setVehicles(Array.isArray(data.vehicles) ? data.vehicles : [])
      })
      .catch(() => {
        /* leave the list empty — the empty state explains it */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Open immediately with the light record so the modal paints at once, then
  // swap in the full one (galleries included) when it lands.
  const openVehicle = useCallback(
    (vehicle: RentalVehicle, view: "details" | "apply") => {
      setOpen({ vehicle, view })
      fetch(`/api/vehicles?id=${encodeURIComponent(vehicle.id)}`, {
        cache: "no-store",
      })
        .then((r) => r.json())
        .then((data) => {
          const full = data.vehicle as RentalVehicle | null
          if (!full) return
          setOpen((cur) =>
            cur && cur.vehicle.id === full.id ? { ...cur, vehicle: full } : cur,
          )
        })
        .catch(() => {
          /* keep the light record — the main photo still shows */
        })
    },
    [],
  )

  return (
    <section id="vehicles" className="bg-[#f5f5f8] py-[84px] scroll-mt-20">
      <div className="max-w-[1170px] mx-auto px-4">
        <AnimateIn animation="fade-up">
          <div className="text-center max-w-[560px] mx-auto mb-12">
            <h2 className="font-bold text-[28px] lg:text-[36px] text-[#1a1a2e] leading-tight">
              {title}
            </h2>
            <p className="text-[#666] text-[15px] mt-3">{intro}</p>
          </div>
        </AnimateIn>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden animate-pulse"
              >
                <div className="h-[160px] bg-[#eeeef6]" />
                <div className="p-4">
                  <div className="h-3 w-3/4 bg-[#eeeef6] rounded" />
                  <div className="h-2.5 w-1/2 bg-[#f2f2f8] rounded mt-2.5" />
                  <div className="h-[40px] bg-[#f2f2f8] rounded-[8px] mt-6" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <p className="text-center text-[#666] text-[15px] py-10">
            Our fleet listing is being updated right now — give us a call and
            we&apos;ll tell you exactly what&apos;s available.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {vehicles.map((vehicle, i) => (
              // Stagger across each row of four, then restart — the whole grid
              // reveals in waves instead of one long queue.
              <AnimateIn
                key={vehicle.id}
                animation="fade-up"
                delay={(i % 4) * 100}
                className="flex"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openVehicle(vehicle, "details")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      openVehicle(vehicle, "details")
                    }
                  }}
                  aria-label={`${vehicle.name} — view details`}
                  className="group w-full flex flex-col bg-white rounded-[16px] overflow-hidden border border-[#e8e8f0] cursor-pointer hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-[#d6d8f5] transition-all duration-300"
                >
                  <div className="h-[160px] relative bg-[#f0f0ff] overflow-hidden">
                    <ImageWithFallback
                      src={vehicle.image}
                      alt={vehicleAlt(vehicle)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      fallbackIcon="Car"
                      fallbackBg="#f0f0ff"
                      placeholderText="Photo coming soon"
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[14px] text-[#1a1a2e] leading-snug">
                      {vehicle.name}
                    </h3>
                    <p className="text-[11px] text-[#9496a8] mt-1">
                      {vehicle.type}
                      {vehicle.rego ? ` · ${vehicle.rego}` : ""}
                    </p>

                    {/* Weekly rate is the headline number — it is what the
                        owner sets in the dashboard. 0 means "not published". */}
                    <div className="mt-3">
                      {vehicle.weeklyRate > 0 ? (
                        <p className="text-[#1a1a2e]">
                          <span className="font-extrabold text-[20px] text-[#7f85f7]">
                            ${vehicle.weeklyRate.toLocaleString("en-AU")}
                          </span>
                          <span className="text-[12px] text-[#9496a8] ml-1">
                            per week
                          </span>
                        </p>
                      ) : (
                        <p className="text-[13px] font-semibold text-[#666880]">
                          Ask us for the weekly rate
                        </p>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-[#f0f0f8] flex flex-col gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openVehicle(vehicle, "apply")
                        }}
                        className="w-full bg-[#7f85f7] text-white rounded-[8px] h-[40px] font-bold text-[12px] uppercase tracking-wider hover:bg-[#6b71f0] transition-colors"
                      >
                        Get on Rent
                      </button>
                      <span className="text-[12px] text-[#7f85f7] font-semibold flex items-center justify-center gap-1.5">
                        View details
                        <ArrowRight
                          size={13}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        )}
      </div>

      {open && (
        <VehicleModal
          vehicle={open.vehicle}
          initialView={open.view}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  )
}
