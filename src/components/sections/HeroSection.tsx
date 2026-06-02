import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { SITE_FULL } from "@/data/site"

/* Custom service SVGs — same shapes/colors as the hero cards */
function CctvIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f57c00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      <circle cx="6" cy="12" r="1.5" fill="#f57c00" stroke="none" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7f85f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M9 9l2 2 4-4" strokeWidth="2.5" />
    </svg>
  )
}

const servicePills = [
  {
    href: "/services/cctv-installation",
    iconBg: "bg-[rgba(245,124,0,0.15)]",
    icon: <CctvIcon />,
    name: "CCTV Installation",
    sub: "Security cameras & systems",
  },
  {
    href: "/services/car-rental",
    iconBg: "bg-[rgba(76,175,80,0.15)]",
    icon: <CarIcon />,
    name: "Car Rental",
    sub: "Daily & weekly vehicle hire",
  },
  {
    href: "/services/it-services",
    iconBg: "bg-[rgba(127,133,247,0.15)]",
    icon: <MonitorIcon />,
    name: "IT & AI Services",
    sub: "Web, App & AI automation",
  },
]

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

            <p className="text-[13px] text-[#9496a8] font-medium mb-3 mt-6 uppercase tracking-wide">
              Our Services
            </p>

            <div className="flex flex-col gap-2">
              {servicePills.map((pill) => (
                <Link
                  key={pill.href}
                  href={pill.href}
                  className="group flex items-center gap-3 px-5 py-3 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] cursor-pointer transition-all duration-300 w-full max-w-[320px] hover:bg-[rgba(127,133,247,0.15)] hover:border-[rgba(127,133,247,0.4)] hover:translate-x-2"
                >
                  <span className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${pill.iconBg}`}>
                    {pill.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-white">{pill.name}</span>
                    <span className="block text-[11px] text-[#666880] mt-0.5">{pill.sub}</span>
                  </span>
                  <ArrowRight
                    size={14}
                    className="ml-auto text-[#666880] group-hover:text-[#7f85f7] transition-colors duration-300"
                  />
                </Link>
              ))}
            </div>
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
