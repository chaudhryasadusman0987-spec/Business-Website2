"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import VehicleModal from "@/components/car-rental/VehicleModal"
import { rentalVehicles, type RentalVehicle } from "@/data/car-rental"

// Which vehicle is open, and which step of the modal it opened on: clicking the
// card browses the photos, "Get on Rent" skips straight to the application.
interface OpenState {
  vehicle: RentalVehicle
  view: "details" | "apply"
}

export default function VehicleGrid() {
  const [open, setOpen] = useState<OpenState | null>(null)

  return (
    <section id="vehicles" className="bg-[#f5f5f8] py-[84px] scroll-mt-20">
      <div className="max-w-[1170px] mx-auto px-4">
        <AnimateIn animation="fade-up">
          <div className="text-center max-w-[560px] mx-auto mb-12">
            <h2 className="font-bold text-[28px] lg:text-[36px] text-[#1a1a2e] leading-tight">
              The fleet
            </h2>
            <p className="text-[#666] text-[15px] mt-3">
              Every car below is on the yard right now. Open one for the photos
              and the rego, or go straight to the application.
            </p>
          </div>
        </AnimateIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {rentalVehicles.map((vehicle, i) => (
            // Stagger across each row of four, then restart — the whole grid
            // reveals in waves instead of one long 16-step queue.
            <AnimateIn
              key={vehicle.id}
              animation="fade-up"
              delay={(i % 4) * 100}
              className="flex"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen({ vehicle, view: "details" })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setOpen({ vehicle, view: "details" })
                  }
                }}
                aria-label={`${vehicle.name} — view details`}
                className="group w-full flex flex-col bg-white rounded-[16px] overflow-hidden border border-[#e8e8f0] cursor-pointer hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-[#d6d8f5] transition-all duration-300"
              >
                <div className="h-[160px] relative bg-[#f0f0ff] overflow-hidden">
                  <ImageWithFallback
                    src={vehicle.image}
                    alt={vehicle.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    fallbackIcon="Car"
                    fallbackBg="#f0f0ff"
                    placeholderText="Photo coming soon"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/45 text-white text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                    {vehicle.images.length} photos
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-[14px] text-[#1a1a2e] leading-snug">
                    {vehicle.name}
                  </h3>
                  <p className="text-[11px] text-[#9496a8] mt-1">
                    {vehicle.type} · {vehicle.rego}
                  </p>

                  <div className="mt-4 pt-4 border-t border-[#f0f0f8] flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpen({ vehicle, view: "apply" })
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
