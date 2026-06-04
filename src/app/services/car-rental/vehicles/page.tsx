import type { Metadata } from "next"
import Link from "next/link"
import VehicleCard from "@/components/sections/VehicleCard"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { vehicles } from "@/data/car-rental"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `Vehicle Fleet | Car Rental Brisbane | ${SITE_FULL}`,
  description:
    "Our full Brisbane rental fleet — economy, SUV, sedan, 7-seat, van and " +
    "luxury vehicles. Transparent daily and weekly rates. Free cancellation.",
}

export default function VehiclesPage() {
  return (
    <>
      {/* HERO STRIP — dark */}
      <section className="relative overflow-hidden bg-[#0d0d1a] py-20 text-center">
        {/* dot grid */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="relative z-10 max-w-[1170px] mx-auto px-4">
          <nav className="text-[13px] text-[#9496a8] mb-5">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/services/car-rental"
              className="hover:text-white transition-colors"
            >
              Car Rental
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Vehicles</span>
          </nav>

          <h1 className="text-white font-extrabold text-[40px] lg:text-[56px] leading-[1.1]">
            Our Vehicle Fleet
          </h1>
          <p className="text-[15px] text-[#9496a8] mt-4 max-w-[480px] mx-auto leading-relaxed">
            All prices include free cancellation. Bond holds explained at
            booking.
          </p>
        </div>
      </section>

      {/* VEHICLES GRID */}
      <section className="bg-[#fefefd] pt-[80px] pb-[120px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} detailed />
            ))}
          </div>

          {/* BOND INFO BOX */}
          <div className="bg-[#e6f1fb] border border-[#90caf9] rounded-[16px] p-6 max-w-[700px] mx-auto mt-14 text-center text-[14px] text-[#185fa5] leading-relaxed">
            💳 Security bonds are pre-authorisation holds — not charges. Released
            within 3–10 business days of return. Credit card strongly
            recommended.
          </div>
        </div>
      </section>

      <QuoteCTABanner
        href="/services/car-rental/quote"
        title="Get Your Car Rental Quote"
        subtitle="Free quote · 48 hour validity · 2-hour confirmation"
      />
    </>
  )
}
