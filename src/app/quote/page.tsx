"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { SITE_FULL } from "@/data/site"
import SecurityQuoteForm from "@/components/quotes/SecurityQuoteForm"
import CarRentalQuoteForm from "@/components/quotes/CarRentalQuoteForm"
import ITQuoteForm from "@/components/quotes/ITQuoteForm"

const SERVICE_KEYS = ["security", "car-rental", "it-services"]

/* Custom service SVGs — same shapes/colors as the navbar + hero cards */
function CameraIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f57c00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
      <circle cx="6" cy="12" r="1.5" fill="#f57c00" stroke="none" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7f85f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M9 9l2 2 4-4" strokeWidth="2.5" />
    </svg>
  )
}

const cards = [
  {
    key: "security",
    iconBg: "bg-[rgba(245,124,0,0.15)]",
    icon: <CameraIcon />,
    title: "Security Solutions",
    sub: "CCTV, alarms, access control & more",
    price: "From $149",
    priceColor: "text-[#f57c00]",
    tag: "5-step quote · Email sent instantly",
  },
  {
    key: "car-rental",
    iconBg: "bg-[rgba(76,175,80,0.15)]",
    icon: <CarIcon />,
    title: "Car Rental",
    sub: "Brisbane · Economy to luxury",
    price: "From $55/day",
    priceColor: "text-[#4caf50]",
    tag: "6-step quote · Bond explained clearly",
  },
  {
    key: "it-services",
    iconBg: "bg-[rgba(127,133,247,0.15)]",
    icon: <MonitorIcon />,
    title: "IT & AI Services",
    sub: "Web, app, AI automation & consulting",
    price: "From $1,500",
    priceColor: "text-[#7f85f7]",
    tag: "5-step quote · Estimate in 2 minutes",
  },
]

function QuotePicker() {
  const searchParams = useSearchParams()
  const [selectedService, setSelectedService] = useState<string | null>(null)

  useEffect(() => {
    const svc = searchParams.get("service")
    if (svc && SERVICE_KEYS.includes(svc)) {
      setSelectedService(svc)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── STATE B — selected quote ───
  if (selectedService !== null) {
    return (
      <div>
        <div className="bg-[#0d0d1a] px-6 py-3 flex items-center gap-2">
          <button
            onClick={() => setSelectedService(null)}
            className="flex items-center gap-2 text-[#9496a8] text-[13px] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} className="text-[#9496a8]" />
            Change service
          </button>
        </div>
        {selectedService === "security" && <SecurityQuoteForm />}
        {selectedService === "car-rental" && <CarRentalQuoteForm />}
        {selectedService === "it-services" && <ITQuoteForm />}
      </div>
    )
  }

  // ─── STATE A — service selector ───
  return (
    <div className="bg-[#0d0d1a] min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* dot grid */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(127,133,247,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* purple glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[rgba(127,133,247,0.15)] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-[900px] flex flex-col items-center">
        <h1 className="text-white font-bold text-[20px] mb-2">{SITE_FULL}</h1>
        <p className="text-[#9496a8] text-[14px]">
          Select a service to get your free quote
        </p>

        <div className="flex flex-col lg:flex-row gap-5 mt-10 w-full">
          {cards.map((c) => (
            <div
              key={c.key}
              onClick={() => setSelectedService(c.key)}
              className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-[24px] p-8 cursor-pointer flex-1 text-center hover:bg-[rgba(127,133,247,0.12)] hover:border-[rgba(127,133,247,0.4)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(127,133,247,0.2)] transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-[16px] mx-auto mb-5 flex items-center justify-center ${c.iconBg}`}>
                {c.icon}
              </div>
              <div className="text-white font-bold text-[20px]">{c.title}</div>
              <div className="text-[#9496a8] text-[13px] mt-2">{c.sub}</div>
              <div className={`font-bold text-[15px] mt-3 ${c.priceColor}`}>{c.price}</div>
              <div className="text-[11px] text-[#666880] mt-2">{c.tag}</div>
              <ArrowRight size={20} className="text-[#7f85f7] mt-5 mx-auto" />
            </div>
          ))}
        </div>

        <p className="text-[#555770] text-[12px] mt-8 text-center">
          Free quotes · No obligation · Response within 1 business day
        </p>
      </div>
    </div>
  )
}

export default function QuotePage() {
  return (
    <Suspense fallback={null}>
      <QuotePicker />
    </Suspense>
  )
}
