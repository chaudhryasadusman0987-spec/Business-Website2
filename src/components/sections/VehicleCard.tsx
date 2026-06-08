import Link from "next/link"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import Price from "@/components/ui/Price"
import { formatAUD } from "@/lib/formatters"
import type { Vehicle } from "@/data/car-rental"

// Zlymo-style vehicle card. `detailed` adds passenger count + feature tags
// (used on the full vehicles page); the compact version is used on the landing.
export default function VehicleCard({
  vehicle,
  detailed = false,
}: {
  vehicle: Vehicle
  detailed?: boolean
}) {
  return (
    <div className="group relative bg-brand-card rounded-[80px] py-[70px] px-8 text-center cursor-pointer transition-all duration-500 hover:bg-brand-primary hover:-translate-y-2">
      {vehicle.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold px-4 py-1 rounded-full group-hover:bg-white group-hover:text-brand-primary transition-all duration-500">
          {vehicle.badge}
        </span>
      )}

      {/* Vehicle image with "Image Coming Soon" fallback */}
      <div className="relative w-full h-[160px] rounded-t-[80px] overflow-hidden mb-6">
        <ImageWithFallback
          src={vehicle.image}
          alt={vehicle.imageAlt}
          fill
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
          fallbackBg="#f0f0ff"
          fallbackIcon="Car"
          placeholderText="Photo coming soon"
          priority={false}
        />
        {/* Purple overlay on card hover */}
        <div className="absolute inset-0 bg-transparent group-hover:bg-brand-primary/30 transition-all duration-500" />
      </div>

      <p className="text-brand-primary group-hover:text-white font-medium text-[13px] transition-colors duration-500">
        From
      </p>
      <div className="text-[30px] font-bold text-[#363636] group-hover:text-white transition-colors duration-500">
        <Price
          amount={vehicle.dailyRate}
          category="carRental"
          suffix="/day"
          className="text-[30px] font-bold text-[#363636] group-hover:text-white transition-colors duration-500"
        />
      </div>
      <p className="text-[13px] text-gray-400 group-hover:text-white/70 mt-1 transition-colors duration-500">
        <Price
          amount={vehicle.weeklyRate}
          category="carRental"
          suffix="/week"
          compact
          className="text-[13px] text-gray-400 group-hover:text-white/70 transition-colors duration-500"
        />
      </p>

      <h3 className="font-bold text-[18px] text-[#363636] group-hover:text-white mt-3 transition-colors duration-500">
        {vehicle.name}
      </h3>
      <p className="text-[12px] text-gray-400 group-hover:text-white/70 mt-1 transition-colors duration-500">
        {vehicle.example}
      </p>

      {detailed && (
        <>
          <p className="text-[12px] text-gray-400 group-hover:text-white/70 mt-2 transition-colors duration-500">
            Seats up to {vehicle.passengers}
          </p>
          <div className="flex flex-wrap gap-1 justify-center mt-3">
            {vehicle.features.map((f) => (
              <span
                key={f}
                className="bg-white/60 group-hover:bg-white/20 rounded-full px-2 py-0.5 text-[10px] text-gray-500 group-hover:text-white transition-all duration-500"
              >
                {f}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="mt-3">
        <span className="inline-flex items-center gap-1 bg-blue-50 group-hover:bg-white/20 rounded-full px-3 py-1 text-[11px] text-blue-600 group-hover:text-white transition-all duration-500">
          Bond: {formatAUD(vehicle.bond)}
        </span>
      </div>

      <Link
        href={`/services/car-rental/quote?vehicle=${vehicle.id}`}
        className="inline-block mt-6 bg-brand-dark text-brand-text px-8 h-[40px] leading-[40px] rounded-[5px] text-[14px] group-hover:bg-white group-hover:text-brand-dark transition-all duration-500"
      >
        Book Now
      </Link>
    </div>
  )
}
