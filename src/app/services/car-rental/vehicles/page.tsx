import type { Metadata } from "next"
import Link from "next/link"
import VehicleGrid from "@/components/car-rental/VehicleGrid"

// Same database-backed fleet as /services/car-rental, on its own page with the
// full-fleet framing. There is one source of truth for vehicles now — the
// dashboard's Car Rental tab — so this page never drifts from the main one.

export const metadata: Metadata = {
  title: "Vehicle Fleet | Long-Term Car Rental Brisbane",
  description:
    "The full Pak Oz Rentals fleet in Brisbane — weekly hire with a four-week " +
    "minimum. Roadside assistance, servicing and maintenance included.",
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
            Weekly hire, four-week minimum. Roadside assistance and servicing
            are included on every car.
          </p>
        </div>
      </section>

      {/* FLEET GRID — the same DB-backed list the main page shows */}
      <VehicleGrid
        title="Every car on the yard"
        intro="Open a car for its photos, rego and weekly rate, or go straight to the application."
      />

      {/* BOND INFO BOX — continues the grid's background so the strip reads as
          part of the same section */}
      <section className="bg-[#f5f5f8] pb-[100px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <div className="bg-[#e6f1fb] border border-[#90caf9] rounded-[16px] p-6 max-w-[700px] mx-auto text-center text-[14px] text-[#185fa5] leading-relaxed">
            💳 The security bond is refunded at the end of the rental. Weekly
            rent is paid in advance and we confirm everything with you by phone
            before the first payment.
          </div>
        </div>
      </section>
    </>
  )
}
