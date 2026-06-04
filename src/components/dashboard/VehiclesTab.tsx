"use client"

import { Info } from "lucide-react"
import { vehicles } from "@/data/car-rental"
import VehicleRow from "./VehicleRow"

export default function VehiclesTab() {
  return (
    <div>
      {/* How-to note */}
      <div className="bg-[#e6f1fb] rounded-[10px] p-3 mb-4 flex items-start gap-3">
        <Info size={16} className="text-brand-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-medium text-[#1a1a2e]">
            How to update vehicle images
          </p>
          <p className="text-[12px] text-gray-500 mt-1">
            1. Add your image to{" "}
            <code className="bg-gray-100 px-1 rounded">
              public/images/vehicles/
            </code>{" "}
            2. Enter the path below (e.g. /images/vehicles/economy.jpg). 3. Click
            Save — updates instantly on the live site.
          </p>
        </div>
      </div>

      {/* Vehicles table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[12px] text-gray-400 uppercase tracking-wide border-b border-gray-200">
              <th className="px-4 py-2 font-medium">Image</th>
              <th className="px-4 py-2 font-medium">Vehicle Name</th>
              <th className="px-4 py-2 font-medium">Daily Rate</th>
              <th className="px-4 py-2 font-medium">Weekly Rate</th>
              <th className="px-4 py-2 font-medium">Bond ($)</th>
              <th className="px-4 py-2 font-medium">Badge</th>
              <th className="px-4 py-2 font-medium">In Stock</th>
              <th className="px-4 py-2 font-medium">Save</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <VehicleRow key={v.id} vehicle={v} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
