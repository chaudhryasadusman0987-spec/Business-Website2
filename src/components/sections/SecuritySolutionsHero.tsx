import Link from "next/link"
import { ShieldCheck } from "lucide-react"

// Dark hero for the Security Solutions landing page.
// Mirrors the home hero's #0d0d1a dot-grid + glow treatment.
export default function SecuritySolutionsHero() {
  return (
    <section className="relative overflow-hidden bg-[#0d0d1a]">
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

      <div className="relative z-10 max-w-[1170px] mx-auto px-4 w-full py-20 lg:py-28">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* LEFT */}
          <div className="flex-1">
            <span className="inline-block text-[12px] font-medium text-[#9496a8] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] rounded-full px-4 py-1.5">
              Security Solutions · Australia-wide
            </span>

            <h1 className="font-extrabold text-[40px] lg:text-[60px] leading-[1.1] mt-6">
              <span className="block text-white">Complete Security</span>
              <span className="block text-[#7f85f7]">Solutions.</span>
            </h1>

            <p className="text-[15px] text-[#9496a8] max-w-[420px] mt-4">
              Surveillance, deterrence, access control, intercoms and more —
              professionally installed across Australia.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/services/security-solutions/quote"
                className="inline-flex items-center justify-center bg-[#7f85f7] text-white rounded-[5px] text-[15px] font-medium h-[52px] px-8 hover:opacity-90 transition-all duration-300"
              >
                Get Free Quote
              </Link>
              <a
                href="#solutions"
                className="inline-flex items-center justify-center border border-[rgba(255,255,255,0.2)] text-white rounded-[5px] text-[15px] font-medium h-[52px] px-8 hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300"
              >
                View Solutions
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-full lg:w-[45%] flex-shrink-0">
            <div className="bg-[#8187fa] rounded-[24px] min-h-[380px] flex items-center justify-center">
              <ShieldCheck size={140} className="text-white opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
