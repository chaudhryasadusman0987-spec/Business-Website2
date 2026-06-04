import Link from "next/link"
import { SITE_PHONE } from "@/data/site"
import { vehicles } from "@/data/car-rental"

// Dark hero for the Car Rental landing page.
// Mirrors the security solutions dark-hero treatment: #0d0d1a dot grid +
// purple glow + teal glow. Right block uses a large car emoji + floating
// stat pills (swap in next/image once /images/vehicles/hero-car.jpg exists).
export default function CarRentalHero() {
  return (
    <section className="relative overflow-hidden bg-[#0d0d1a] min-h-[70vh]">
      {/* Layer 1 — dot grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      {/* Layer 2 — purple glow top-right */}
      <div
        className="absolute z-0 w-[250px] h-[250px] lg:w-[500px] lg:h-[500px] rounded-full top-[-120px] right-[-60px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(127,133,247,0.2) 0%, transparent 65%)",
        }}
      />
      {/* Layer 3 — teal glow bottom-left */}
      <div
        className="absolute z-0 w-[300px] h-[300px] rounded-full bottom-[-60px] left-[-40px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(93,202,165,0.12) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-[1170px] mx-auto px-4 w-full py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* LEFT */}
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 bg-[rgba(127,133,247,0.15)] border border-[rgba(127,133,247,0.3)] rounded-full px-4 py-1.5 text-[#a5a8ff] text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5dcaa5] animate-pulse" />
              Car Rental · Brisbane &amp; Queensland
            </span>

            <h1 className="font-extrabold text-[40px] lg:text-[60px] leading-[1.1] mt-6">
              <span className="block text-white">Brisbane Car Rental</span>
              <span className="block text-[#7f85f7]">Made Simple.</span>
            </h1>

            <p className="text-[15px] text-[#9496a8] max-w-[420px] mt-4 leading-relaxed">
              Economy to luxury vehicles. Daily, weekly and monthly rates. Free
              cancellation. Brisbane CBD, Airport and Queensland-wide delivery.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/services/car-rental/quote"
                className="inline-flex items-center justify-center bg-[#7f85f7] text-white rounded-[8px] h-[52px] px-8 font-semibold hover:bg-[#6b71f0] transition-all duration-300"
              >
                Get a Quote
              </Link>
              <Link
                href="/services/car-rental/vehicles"
                className="inline-flex items-center justify-center border border-white/20 text-white rounded-[8px] h-[52px] px-8 hover:bg-white/5 transition-all duration-300"
              >
                View Vehicles
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <span className="text-[#9496a8] text-[14px]">
                ⭐ 4.9/5 from 500+ reviews
              </span>
              <span className="w-px h-5 bg-white/20" />
              <span className="text-[#9496a8] text-[14px]">
                📞 <span className="text-white font-semibold">{SITE_PHONE}</span>
              </span>
            </div>
          </div>

          {/* RIGHT — colored block with emoji + floating stat pills */}
          <div className="w-full lg:w-[45%]">
            <div className="relative bg-brand-light rounded-[24px] min-h-[420px] lg:min-h-[500px] overflow-hidden flex items-center justify-center">
              <span className="text-[180px] opacity-40 select-none leading-none">
                🚗
              </span>

              {/* Top-right pill */}
              <div className="absolute top-5 right-5 bg-black/50 backdrop-blur border border-white/15 rounded-[12px] px-4 py-3">
                <p className="text-white font-semibold text-[13px]">
                  {vehicles.length} Vehicle Classes
                </p>
              </div>

              {/* Bottom-left pill */}
              <div className="absolute bottom-5 left-5 bg-black/50 backdrop-blur border border-white/15 rounded-[12px] px-4 py-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5dcaa5] animate-pulse" />
                <p className="text-white font-semibold text-[13px]">
                  Free Cancellation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
