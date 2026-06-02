import { Fragment } from "react"
import Link from "next/link"
import { ArrowRight, Phone } from "lucide-react"
import { SITE_TAGLINE, SITE_PHONE } from "@/data/site"
import { cctvProducts } from "@/data/cctv-products"
import { vehicles } from "@/data/car-rental"

function TagCheck() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

const cards = [
  {
    iconBg: "bg-[rgba(245,124,0,0.18)]",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f57c00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        <circle cx="6" cy="12" r="1.5" fill="#f57c00" stroke="none" />
      </svg>
    ),
    title: "CCTV Installation",
    sub: "Licensed · Same-week · Free assessment",
    tag: { bg: "bg-[rgba(93,202,165,0.15)]", text: "text-[#5dcaa5]", label: "Australia-wide", check: true },
    price: `$${cctvProducts[0]?.price ?? 299}`,
    priceLabel: "from / unit",
  },
  {
    iconBg: "bg-[rgba(76,175,80,0.18)]",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: "Car Rental",
    sub: "Economy to Luxury · Daily & weekly rates",
    tag: { bg: "bg-[rgba(76,175,80,0.15)]", text: "text-[#4caf50]", label: "Free cancellation", check: false },
    price: `$${vehicles[0]?.dailyRate ?? 65}`,
    priceLabel: "from / day",
  },
  {
    iconBg: "bg-[rgba(127,133,247,0.18)]",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7f85f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <path d="M9 9l2 2 4-4" strokeWidth="2.5" />
      </svg>
    ),
    title: "IT & AI Services",
    sub: "Web · App · AI Automation",
    tag: { bg: "bg-[rgba(127,133,247,0.15)]", text: "text-[#a5a8ff]", label: "Free consultation", check: false },
    price: null as string | null,
    priceLabel: "tailored pricing",
  },
]

export default function HeroSection() {
  const taglineWords = SITE_TAGLINE.split(" ")

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
          {/* LEFT — text */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 mb-6 rounded-full px-4 py-1.5 w-fit bg-[rgba(127,133,247,0.15)] border border-[rgba(127,133,247,0.35)]">
              <span className="w-2 h-2 rounded-full bg-[#7f85f7] animate-pulse" />
              <span className="text-[11px] font-medium text-[#a5a8ff]">
                Australia-wide services · Free quotes
              </span>
            </div>

            <h1 className="text-[38px] lg:text-[64px] font-extrabold leading-[1.1] mb-6">
              {taglineWords.map((word, i) => (
                <Fragment key={word}>
                  <span className={i === taglineWords.length - 1 ? "text-[#7f85f7]" : "text-white"}>
                    {word}
                  </span>
                  {i < taglineWords.length - 1 && <br />}
                </Fragment>
              ))}
            </h1>

            <p className="text-[15px] lg:text-[17px] text-[#9496a8] leading-[1.8] max-w-[460px] mb-8">
              Professional CCTV installation, flexible car rental, and
              cutting-edge IT solutions — all from one trusted Australian
              business. Fast. Licensed. Guaranteed.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-[54px] px-8 rounded-[8px] text-[15px] font-semibold bg-[#7f85f7] text-white hover:bg-[#6b71f0] transition-all duration-300"
              >
                Get Free Quote
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/#services"
                className="inline-flex items-center justify-center w-full sm:w-auto h-[54px] px-8 rounded-[8px] text-[15px] font-medium bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300"
              >
                Our Services
              </Link>
            </div>

            {/* Trust row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[#f5a623] text-lg leading-none">★★★★★</span>
                <span className="text-[13px] text-[#9496a8]">
                  <span className="text-white font-semibold">4.9/5</span> from 500+ reviews
                </span>
              </div>
              <span className="hidden sm:block w-px h-5 bg-white/20" />
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#7f85f7]" />
                <span className="text-[13px] text-[#9496a8]">
                  Call us: <span className="text-white font-semibold">{SITE_PHONE}</span>
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT — floating service cards */}
          <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-3">
            {cards.map((c) => (
              <div
                key={c.title}
                className="flex items-center gap-4 rounded-[16px] p-4 bg-white/[0.05] border border-white/10 cursor-default transition-all duration-300 hover:bg-[rgba(127,133,247,0.1)] hover:border-[rgba(127,133,247,0.35)] hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(127,133,247,0.15)]"
              >
                <div className={`w-[48px] h-[48px] flex-shrink-0 rounded-[12px] flex items-center justify-center ${c.iconBg}`}>
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-white leading-snug">{c.title}</p>
                  <p className="text-[11px] text-[#666880] mt-1">{c.sub}</p>
                  <span className={`inline-flex items-center gap-1 mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${c.tag.bg} ${c.tag.text}`}>
                    {c.tag.check && <TagCheck />}
                    {c.tag.label}
                  </span>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  {c.price ? (
                    <span className="text-[15px] font-bold text-[#7f85f7]">{c.price}</span>
                  ) : (
                    <span className="text-[12px] leading-tight text-center font-bold text-[#7f85f7]">
                      Custom
                      <br />
                      quote
                    </span>
                  )}
                  <span className="text-[10px] text-[#555770] mt-0.5">{c.priceLabel}</span>
                </div>
              </div>
            ))}

            {/* Bottom CTA strip */}
            <div className="flex items-center justify-center gap-2 rounded-[12px] p-3 bg-[rgba(127,133,247,0.1)] border border-[rgba(127,133,247,0.25)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7f85f7" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-[12px] text-[#a5a8ff] font-medium">
                Free quotes on all 3 services — no obligation
              </span>
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
