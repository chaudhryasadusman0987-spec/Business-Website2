"use client"

import { useState } from "react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import type { Vehicle } from "@/data/car-rental"

export default function VehicleRow({ vehicle }: { vehicle: Vehicle }) {
  const [inStock, setInStock] = useState(vehicle.inStock)

  return (
    <tr className="border-b border-gray-100">
      {/* Image column */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          <div className="relative w-[70px] h-[50px] rounded-[8px] overflow-hidden bg-gray-100 flex-shrink-0">
            <ImageWithFallback
              src={vehicle.image}
              alt={vehicle.imageAlt}
              fill
              className="object-cover"
              fallbackBg="#f0f4ff"
              fallbackIcon="Car"
              placeholderText="Photo coming soon"
            />
          </div>
          <input
            type="text"
            defaultValue={vehicle.image}
            placeholder="/images/vehicles/name.jpg"
            className="w-[130px] text-[11px] border border-gray-200 rounded px-2 py-1 text-gray-600 focus:border-brand-primary outline-none"
          />
        </div>
      </td>

      {/* Vehicle name column */}
      <td className="px-4 py-3">
        <p className="font-medium text-[14px] text-[#1a1a2e]">{vehicle.name}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{vehicle.example}</p>
      </td>

      {/* Daily rate column */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-[13px]">$</span>
          <input
            type="number"
            defaultValue={vehicle.dailyRate}
            className="w-[70px] border border-gray-200 rounded-[6px] px-2 h-[36px] text-[14px] font-semibold text-[#1565c0] focus:border-[#1565c0] outline-none"
          />
        </div>
      </td>

      {/* Weekly rate column */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-[13px]">$</span>
          <input
            type="number"
            defaultValue={vehicle.weeklyRate}
            className="w-[70px] border border-gray-200 rounded-[6px] px-2 h-[36px] text-[14px] font-semibold text-[#1565c0] focus:border-[#1565c0] outline-none"
          />
        </div>
      </td>

      {/* Bond column */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="text-gray-400 text-[13px]">$</span>
          <input
            type="number"
            defaultValue={vehicle.bond}
            className="w-[70px] border border-gray-200 rounded-[6px] px-2 h-[36px] text-[14px] font-semibold text-[#1565c0] focus:border-[#1565c0] outline-none"
          />
        </div>
      </td>

      {/* Badge column */}
      <td className="px-4 py-3">
        <input
          type="text"
          defaultValue={vehicle.badge ?? ""}
          placeholder="e.g. Most Popular"
          className="w-[100px] border border-gray-200 rounded-[6px] px-2 h-[36px] text-[12px] focus:border-[#1565c0] outline-none"
        />
      </td>

      {/* In Stock toggle */}
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={() => setInStock((v) => !v)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div
            className={`w-10 h-5 rounded-full transition-colors ${
              inStock ? "bg-[#1565c0]" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${
                inStock ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-[12px] text-gray-500">
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </button>
      </td>

      {/* Save button */}
      <td className="px-4 py-3">
        {/* TODO(dashboard): wire to API route that writes updated vehicle to car-rental.ts */}
        <button className="bg-[#1565c0] text-white rounded-[6px] px-4 h-[32px] text-[12px] font-medium hover:bg-[#185fa5] transition-colors">
          Save
        </button>
      </td>
    </tr>
  )
}
