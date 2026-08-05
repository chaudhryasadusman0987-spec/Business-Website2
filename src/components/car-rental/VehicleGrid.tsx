"use client"

import { useState } from "react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import VehicleModal from "@/components/car-rental/VehicleModal"
import { rentalVehicles, type RentalVehicle } from "@/data/car-rental"

export default function VehicleGrid() {
  const [modalVehicle, setModalVehicle] = useState<RentalVehicle | null>(null)

  return (
    <section id="vehicles" className="bg-[#f5f5f8] py-[80px] scroll-mt-20">
      <div className="max-w-[1170px] mx-auto px-4">
        <h2 className="text-center font-bold text-[28px] lg:text-[36px] text-[#1a1a2e] mb-3">
          {rentalVehicles.length} Vehicles Available
        </h2>
        <p className="text-center text-[#666] text-[15px] mb-12">
          Click any vehicle to view details and apply for rental
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {rentalVehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              type="button"
              onClick={() => setModalVehicle(vehicle)}
              className="text-left bg-white rounded-[16px] overflow-hidden border border-[#e8e8f0] cursor-pointer hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-[160px] relative bg-[#f0f0ff]">
                <ImageWithFallback
                  src={vehicle.image}
                  alt={vehicle.imageAlt}
                  fill
                  className="object-cover"
                  fallbackIcon="Car"
                  fallbackBg="#f0f0ff"
                  placeholderText="Photo coming soon"
                />
                <div className="absolute top-3 left-3 bg-[#7f85f7] text-white w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm">
                  {vehicle.number}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                  📷 {vehicle.images.length} photos
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-[14px] text-[#1a1a2e] leading-snug">
                  {vehicle.name}
                </h3>
                <p className="text-[11px] text-[#9496a8] mt-0.5">
                  Rego: {vehicle.rego}
                </p>
                <span className="inline-block bg-[#eeedfe] text-[#7f85f7] text-[11px] font-semibold px-3 py-1 rounded-full mt-2">
                  {vehicle.type}
                </span>
                <p className="text-[12px] text-[#7f85f7] font-semibold mt-3 flex items-center gap-1">
                  View Details →
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {modalVehicle && (
        <VehicleModal
          vehicle={modalVehicle}
          onClose={() => setModalVehicle(null)}
        />
      )}
    </section>
  )
}
