import type { Metadata } from "next"
import Link from "next/link"
import { Car, Shield, MapPin, Clock } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import CarRentalHero from "@/components/sections/CarRentalHero"
import VehicleCard from "@/components/sections/VehicleCard"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import TestimonialsStrip from "@/components/sections/TestimonialsStrip"
import { vehicles } from "@/data/car-rental"
import { formatAUD } from "@/lib/formatters"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `Car Rental Brisbane | ${SITE_FULL}`,
  description:
    "Brisbane car rental from $55/day. Economy to luxury vehicles. " +
    "Airport pick-up, CBD and Queensland-wide delivery. Free cancellation.",
}

const benefits = [
  {
    Icon: Car,
    title: "All Vehicle Classes",
    sub: "Economy to luxury, we have the right car",
  },
  {
    Icon: Shield,
    title: "Free Cancellation",
    sub: "Cancel anytime, no questions asked",
  },
  {
    Icon: MapPin,
    title: "Brisbane Specialists",
    sub: "CBD, Airport, Gold & Sunshine Coast",
  },
  {
    Icon: Clock,
    title: "2-Hour Confirmation",
    sub: "Quote confirmed within 2 hours of enquiry",
  },
]

// Bond timeline — arbitrary colour classes kept static so Tailwind JIT emits them.
const bondSteps = [
  {
    dot: "bg-[#1565c0]",
    title: "At Pick-up",
    desc: "We charge the rental amount to your card. A separate security bond hold is placed — funds are reserved but NOT debited.",
  },
  {
    dot: "bg-[#7f85f7]",
    title: "During Your Rental",
    desc: "The bond shows as a pending transaction. Your money is safe — it is a hold, not a charge. You will still have access to your account.",
  },
  {
    dot: "bg-[#5dcaa5]",
    title: "When You Return",
    desc: "Vehicle inspected. If no damage, bond release begins immediately. Final rental charge confirmed.",
  },
  {
    dot: "bg-[#0f6e56]",
    title: "Bond Released",
    desc: "Bank releases the hold within 3–10 business days. Your available balance increases. No action needed from you.",
  },
]

const brisbaneInfo = [
  {
    icon: "🛣️",
    title: "Brisbane Toll Roads",
    text: "Gateway, Logan, Airport Link, Clem7 and Go Between Bridge all require a Linkt pass. We strongly recommend adding the toll pass to your rental.",
  },
  {
    icon: "🚦",
    title: "Peak Hour Traffic",
    text: "Allow extra time travelling to/from the city 7–9am and 4–6pm weekdays. The M1 and Pacific Motorway can be very busy.",
  },
  {
    icon: "🗺️",
    title: "Day Trips from Brisbane",
    text: "Gold Coast 1hr · Sunshine Coast 1.5hrs · Byron Bay 2hrs · Noosa 2hrs · Tamborine Mountain 1hr. Brisbane is the perfect base for Queensland road trips.",
  },
]

export default function CarRentalPage() {
  return (
    <>
      <CarRentalHero />

      {/* SECTION 2 — Why hire with us */}
      <section className="bg-[#fefefd] pt-[100px] pb-[60px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <SectionTitle title="Why Hire With Us" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
            {benefits.map((b) => (
              <div key={b.title} className="text-center">
                <b.Icon size={44} className="text-brand-primary mx-auto mb-4" />
                <h3 className="font-bold text-[#1a1a2e] text-[15px]">
                  {b.title}
                </h3>
                <p className="text-[13px] text-gray-500 mt-1">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — Vehicle preview grid */}
      <section className="bg-[#fefefd] pt-[80px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <SectionTitle
            title="Our Vehicle Fleet"
            subtitle="Transparent pricing · Free cancellation · Brisbane-wide"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
            {vehicles.slice(0, 3).map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/services/car-rental/vehicles"
              className="inline-flex items-center justify-center bg-brand-dark text-brand-text hover:bg-brand-primary hover:text-white rounded-[5px] h-[54px] px-10 text-[15px] font-medium transition-all duration-500"
            >
              See All Vehicles
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4 — Security bond explainer */}
      <section className="bg-[#f0f4ff] pt-[80px] pb-[80px] mt-[80px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <SectionTitle
            title="How The Security Bond Works"
            subtitle="Full transparency — no surprises at pick-up or return"
          />
          <div className="flex flex-col lg:flex-row items-start gap-12 mt-14">
            {/* LEFT — timeline */}
            <div className="flex-1">
              {bondSteps.map((s, i) => (
                <div key={s.title} className="flex gap-4 items-stretch">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-[14px] ${s.dot}`}
                    >
                      {i + 1}
                    </div>
                    {i < bondSteps.length - 1 && (
                      <div className="w-px flex-1 bg-gray-300 my-1" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h4 className="font-bold text-[#1a1a2e]">{s.title}</h4>
                    <p className="text-gray-500 text-[14px] mt-1 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT — bond amounts card */}
            <div className="w-full lg:w-[420px] bg-white shadow-lg rounded-[20px] p-8">
              <h3 className="font-bold text-[16px] text-[#1a1a2e] mb-4">
                Bond amounts by vehicle:
              </h3>
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="flex justify-between items-center py-3 border-b border-gray-100"
                >
                  <span className="text-[14px] font-medium text-[#1a1a2e]">
                    {v.icon} {v.name}
                  </span>
                  <span className="font-bold text-[#1565c0] text-[15px]">
                    {formatAUD(v.bond)}
                  </span>
                </div>
              ))}
              <div className="bg-[#e6f1fb] rounded-[12px] p-4 mt-4 text-[12px] text-[#185fa5] leading-relaxed">
                💡 Credit card recommended — bond is a pre-auth hold (no funds
                leave your account). Debit card holders: bond is debited then
                refunded within 5–10 days.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — Brisbane info strip */}
      <section className="bg-brand-primary py-[60px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <h2 className="text-[45px] font-bold text-white uppercase text-center leading-tight">
            Driving In Brisbane
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {brisbaneInfo.map((c) => (
              <div
                key={c.title}
                className="bg-white/20 rounded-[20px] p-8 text-center"
              >
                <div className="text-[40px] mb-4">{c.icon}</div>
                <h3 className="text-white font-bold text-[16px]">{c.title}</h3>
                <p className="text-white/80 text-[14px] mt-3 leading-relaxed">
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — Quote CTA */}
      <QuoteCTABanner
        href="/services/car-rental/quote"
        title="Get Your Car Rental Quote"
        subtitle="Free quote · 48 hour validity · 2-hour confirmation"
      />

      {/* SECTION 7 — Testimonials */}
      <TestimonialsStrip />
    </>
  )
}
