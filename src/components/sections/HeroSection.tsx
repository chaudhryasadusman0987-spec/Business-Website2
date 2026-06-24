import Image from "next/image"
import { SITE_FULL } from "@/data/site"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden flex items-center bg-[#0d0d1a] lg:min-h-screen">
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
        style={{ background: "radial-gradient(circle, rgba(127,133,247,0.2) 0%, transparent 65%)" }}
      />
      {/* Layer 3 — teal glow bottom-left */}
      <div
        className="absolute z-0 w-[150px] h-[150px] lg:w-[300px] lg:h-[300px] rounded-full bottom-[-60px] left-[-40px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(93,202,165,0.12) 0%, transparent 65%)" }}
      />
      {/* Layer 4 — vignette */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)" }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-[1170px] mx-auto px-4 w-full py-20 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* LEFT — headline + service pills */}
          <div className="flex-1">
            <h1 className="text-[38px] lg:text-[64px] font-extrabold leading-[1.1] mb-6 text-white">
              {SITE_FULL}
            </h1>

          </div>

          {/* RIGHT — hero image */}
          <div className="w-full lg:w-[45%] flex-shrink-0 relative">
            <div className="relative w-full h-[420px] lg:h-[520px] rounded-[24px] overflow-hidden">
              <Image
                src="/images/hero.jpg"
                alt="Brisbane Australia skyline — professional services"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-2">
        <span className="text-[11px] text-white/40 uppercase tracking-widest">
          Scroll to explore
        </span>
        <span className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent animate-[scrollDown_2s_ease-in-out_infinite]" />
      </div>
    </section>
  )
}
