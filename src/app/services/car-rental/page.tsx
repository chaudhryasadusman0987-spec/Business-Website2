import type { Metadata } from "next"
import Link from "next/link"
import VehicleGrid from "@/components/car-rental/VehicleGrid"
import { SITE_PHONE } from "@/data/site"
import { rentalVehicles } from "@/data/car-rental"

export const metadata: Metadata = {
  title: "Long-Term Car Rental Brisbane",
  description:
    "Pak Oz Rentals — long-term car rental in Brisbane. 16 vehicles, weekly " +
    "payment, 4 week minimum. Road assistance and maintenance included.",
}

const tel = `tel:${SITE_PHONE.replace(/\s/g, "")}`

const heroStats = [
  { value: String(rentalVehicles.length), label: "Vehicles" },
  { value: "4 Wks", label: "Minimum" },
  { value: "$1,300", label: "Insurance Excess" },
  { value: "✓", label: "Maintenance" },
]

const terms = [
  { icon: "💰", label: "Payment", value: "Weekly in Advance" },
  { icon: "📅", label: "Minimum", value: "4 Weeks" },
  { icon: "🔒", label: "Bond", value: "Refundable" },
  { icon: "🛡️", label: "Insurance Excess", value: "$1,300 AUD" },
  { icon: "🚗", label: "Road Assistance", value: "Included" },
  { icon: "🔧", label: "Maintenance", value: "Included" },
]

export default function CarRentalPage() {
  return (
    <>
      {/* SECTION 1 — Hero */}
      <section className="bg-[#0d0d1a] relative overflow-hidden min-h-[65vh] flex items-center">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #7f85f7 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Purple glow */}
        <div
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(127,133,247,0.35) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-[1170px] mx-auto px-4 py-[80px] w-full flex flex-col lg:flex-row items-center gap-14">
          {/* LEFT — copy */}
          <div className="flex-1">
            <span className="inline-block bg-white/10 border border-white/15 text-[#c5c8fd] text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-full">
              Pak Oz Rentals · Brisbane QLD
            </span>

            <h1 className="text-white font-extrabold text-[40px] lg:text-[56px] leading-[1.1] mt-6">
              Long-Term Car Rental
              <br />
              <span className="text-[#7f85f7]">Brisbane.</span>
            </h1>

            <p className="text-[15px] text-[#9496a8] leading-[1.8] mt-4 max-w-[440px]">
              {rentalVehicles.length} vehicles available. Weekly rental. Minimum
              4 weeks. Road assistance and maintenance included.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="#vehicles"
                className="flex items-center justify-center bg-[#7f85f7] text-white rounded-[8px] h-[52px] px-8 font-bold text-[15px] hover:bg-[#6b71f0] transition-all duration-300"
              >
                View Fleet
              </a>
              <a
                href={tel}
                className="flex items-center justify-center border border-white/20 text-white rounded-[8px] h-[52px] px-8 font-semibold text-[15px] hover:bg-white/5 transition-all duration-300"
              >
                Call Us
              </a>
            </div>
          </div>

          {/* RIGHT — stats card */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-white/[0.06] border border-white/10 rounded-[20px] p-6 grid grid-cols-2 gap-5 backdrop-blur-sm">
              {heroStats.map((s) => (
                <div key={s.label} className="text-center py-3">
                  <p className="text-[#7f85f7] font-extrabold text-[32px] leading-none">
                    {s.value}
                  </p>
                  <p className="text-[#9496a8] text-[12px] mt-2 uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Rental terms */}
      <section className="bg-[#fefefd] py-[80px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {terms.map((t) => (
              <div
                key={t.label}
                className="bg-white border border-[#e8e8f0] rounded-[14px] p-5 text-center hover:border-[#7f85f7] transition-colors"
              >
                <div className="text-[26px] leading-none">{t.icon}</div>
                <p className="text-[10px] font-semibold text-[#9496a8] uppercase tracking-wider mt-3">
                  {t.label}
                </p>
                <p className="text-[13px] font-bold text-[#1a1a2e] mt-1 leading-snug">
                  {t.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — Vehicle grid + detail modal */}
      <VehicleGrid />

      {/* SECTION 4 — Contact CTA */}
      <section className="bg-[#1a1a2e] py-[60px]">
        <div className="max-w-[700px] mx-auto px-4 text-center">
          <h2 className="text-white font-bold text-[28px] leading-tight">
            Have a question?
          </h2>
          <p className="text-[#9496a8] text-[15px] mt-3 mb-8 leading-relaxed">
            Call us directly or send a message — we respond within 2 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={tel}
              className="flex items-center justify-center gap-2 bg-[#7f85f7] text-white rounded-[10px] h-[52px] px-8 font-bold text-[15px] hover:bg-[#6b71f0] transition-all duration-300"
            >
              📞 Call {SITE_PHONE}
            </a>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 border-2 border-white/20 text-white rounded-[10px] h-[52px] px-8 font-semibold text-[15px] hover:bg-white/5 transition-all duration-300"
            >
              Send a Message
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
