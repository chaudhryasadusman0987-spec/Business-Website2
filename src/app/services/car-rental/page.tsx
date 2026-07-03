import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Users, Check } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import CarRentalHero from "@/components/sections/CarRentalHero"
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

const whyChecks = [
  "No hidden fees — price you see is price you pay",
  "Same-day bookings available most days",
  "Free cancellation on all vehicles",
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

const dayTrips = [
  "Gold Coast — 1 hour south on the M1",
  "Sunshine Coast — 1.5 hours north",
  "Tamborine Mountain — 1 hour, great weekend drive",
  "Byron Bay NSW — 2 hours south",
  "Noosa — 2 hours north via Bruce Hwy",
]

export default function CarRentalPage() {
  return (
    <>
      {/* SECTION 1 — Hero (unchanged) */}
      <CarRentalHero />

      {/* SECTION 2 — Why hire with us */}
      <section className="bg-[#fefefd] pt-[100px] pb-[80px]">
        <div className="max-w-[1170px] mx-auto px-4 flex flex-col lg:flex-row gap-16 items-center">
          {/* LEFT — copy */}
          <div className="flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#7f85f7] mb-4">
              Brisbane&apos;s trusted car rental
            </p>
            <h2 className="text-[36px] lg:text-[44px] font-bold text-[#1a1a2e] leading-tight">
              We know Brisbane roads better than anyone.
            </h2>
            <p className="text-[16px] text-[#555] leading-[1.8] mt-5">
              From the Gateway Motorway to the M1, we have been putting Brisbane
              locals and visitors behind the wheel since day one. Our vehicles
              are serviced regularly, our team picks up the phone, and we will
              not hit you with hidden fees at the counter.
            </p>
            <p className="text-[16px] text-[#555] leading-[1.8] mt-4">
              Pick up from Brisbane CBD or the Airport. Delivery to the Gold
              Coast or Sunshine Coast. We sort the Linkt toll pass, insurance and
              child seat — whatever you need.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {whyChecks.map((fact) => (
                <div key={fact} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#e1f5ee] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-[#0f6e56]" />
                  </div>
                  <span className="text-[15px] text-[#333] font-medium">
                    {fact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — offset photo pair */}
          <div className="w-full lg:w-[45%]">
            <div className="relative h-[420px]">
              <div className="absolute top-0 left-0 w-[75%] h-[300px] rounded-[16px] overflow-hidden shadow-xl">
                <Image
                  src="/images/vehicles/car-rental-team.jpg"
                  alt="Car rental Brisbane team"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-[55%] h-[220px] rounded-[16px] overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src="/images/vehicles/car-rental-keys.jpg"
                  alt="Car keys Brisbane rental"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — Vehicle fleet */}
      <section className="bg-[#fefefd] pt-[80px] pb-[60px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#7f85f7] mb-3">
                Our fleet
              </p>
              <h2 className="text-[36px] font-bold text-[#1a1a2e] leading-tight">
                Find the right vehicle for your trip.
              </h2>
            </div>
            <Link
              href="/services/car-rental/vehicles"
              className="text-[#7f85f7] font-semibold text-[14px] flex items-center gap-1.5 hover:underline"
            >
              See all 6 vehicles
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.slice(0, 3).map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white border border-[#e8e8f0] rounded-[16px] overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="h-[200px] relative">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.imageAlt}
                    fill
                    className="object-cover object-center"
                  />
                  {vehicle.badge && (
                    <div className="absolute top-3 left-3 bg-[#7f85f7] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                      {vehicle.badge}
                    </div>
                  )}
                </div>

                <div className="px-5 py-5 flex flex-col flex-1">
                  <h3 className="font-bold text-[18px] text-[#1a1a2e]">
                    {vehicle.name}
                  </h3>
                  <p className="text-[13px] text-[#9496a8] mt-0.5">
                    {vehicle.example}
                  </p>

                  <div className="w-full h-px bg-[#f0f0f8] my-4" />

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[28px] font-bold text-[#7f85f7]">
                        {formatAUD(vehicle.dailyRate)}
                      </span>
                      <span className="text-[#9496a8] text-[13px] ml-1">
                        /day
                      </span>
                      <p className="text-[13px] text-[#9496a8] mt-0.5">
                        {formatAUD(vehicle.weeklyRate)}/week
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#b0b0b8] uppercase tracking-wider">
                        Bond
                      </p>
                      <p className="font-semibold text-[15px] text-[#1a1a2e]">
                        {formatAUD(vehicle.bond)}
                      </p>
                      <p className="text-[10px] text-[#b0b0b8]">held on card</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {vehicle.features.slice(0, 3).map((f) => (
                      <span
                        key={f}
                        className="bg-[#f7f7f7] text-[#555] text-[11px] rounded-full px-3 py-1"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 text-[13px] text-[#9496a8]">
                    <Users size={14} />
                    {vehicle.passengers} seats
                  </div>

                  <div className="mt-auto pt-5">
                    <Link
                      href={`/services/car-rental/quote?vehicle=${vehicle.id}`}
                      className="block w-full bg-[#1a1a2e] text-white rounded-[10px] h-[46px] font-semibold text-[14px] text-center leading-[46px] hover:bg-[#7f85f7] transition-all duration-300"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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

      {/* SECTION 5 — Driving in Brisbane */}
      <section className="bg-[#fefefd] pt-[100px] pb-[100px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#7f85f7] mb-4">
            Driving in Brisbane
          </p>
          <h2 className="text-[36px] lg:text-[44px] font-bold text-[#1a1a2e] leading-tight max-w-[500px] mb-16">
            A few things worth knowing before you drive.
          </h2>

          {/* ROW 1 — Toll Roads */}
          <div className="flex flex-col lg:flex-row items-center gap-10 mb-20">
            <div className="w-full lg:w-[45%] h-[280px] rounded-[16px] overflow-hidden relative flex-shrink-0 shadow-md">
              <Image
                src="/images/brisbane/toll-road.jpg"
                alt="Brisbane motorway toll road"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-[#7f85f7] font-semibold text-[14px] mb-3">
                🛣️ Toll Roads
              </p>
              <h3 className="font-bold text-[24px] text-[#1a1a2e] leading-tight">
                Brisbane has more toll roads than most Aussie cities.
              </h3>
              <p className="text-[15px] text-[#555] leading-[1.8] mt-4">
                The Gateway Motorway, Logan Motorway, Airport Link, Clem7 Tunnel
                and Go Between Bridge all require a Linkt pass to avoid per-trip
                processing fees of $3.50 on top of the toll itself.
              </p>
              <p className="text-[15px] text-[#555] leading-[1.8] mt-3">
                We strongly recommend adding the Linkt Toll Pass to your booking
                — it is $5.50 a day and pays for itself on the first trip from
                the airport.
              </p>
            </div>
          </div>

          {/* ROW 2 — Peak Hour */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-10 mb-20">
            <div className="w-full lg:w-[45%] h-[280px] rounded-[16px] overflow-hidden relative flex-shrink-0 shadow-md">
              <Image
                src="/images/brisbane/peak-hour.jpg"
                alt="Brisbane peak hour traffic"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-[#7f85f7] font-semibold text-[14px] mb-3">
                🚦 Peak Hour
              </p>
              <h3 className="font-bold text-[24px] text-[#1a1a2e] leading-tight">
                7–9am and 4–6pm. Add extra time.
              </h3>
              <p className="text-[15px] text-[#555] leading-[1.8] mt-4">
                The M1 Pacific Motorway and Ipswich Motorway can bank up badly
                during peak hours on weekdays. If you are heading to the Gold
                Coast or Sunshine Coast, leaving after 9am or before 3pm makes a
                real difference.
              </p>
              <p className="text-[15px] text-[#555] leading-[1.8] mt-3">
                Google Maps live traffic is your friend. Every vehicle has phone
                mount included — no extra charge.
              </p>
            </div>
          </div>

          {/* ROW 3 — Day Trips */}
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="w-full lg:w-[45%] h-[280px] rounded-[16px] overflow-hidden relative flex-shrink-0 shadow-md">
              <Image
                src="/images/brisbane/day-trip.jpg"
                alt="Queensland scenic road trip"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-[#7f85f7] font-semibold text-[14px] mb-3">
                🗺️ Day Trips
              </p>
              <h3 className="font-bold text-[24px] text-[#1a1a2e] leading-tight">
                Brisbane is the perfect road trip base.
              </h3>
              <div className="flex flex-col gap-3 mt-5">
                {dayTrips.map((d) => (
                  <div key={d} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#7f85f7] flex-shrink-0" />
                    <span className="text-[15px] text-[#444]">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — Featured testimonial */}
      <section className="bg-[#7f85f7] py-[80px]">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <div className="text-[80px] text-white/20 font-serif leading-none mb-4 select-none">
            &ldquo;
          </div>
          <p className="text-[22px] text-white font-medium leading-[1.6] italic">
            Rented a 7-seat SUV for a family road trip to the Gold Coast. The car
            was spotless, pick-up was smooth and they explained the bond clearly
            upfront. No surprises whatsoever. Will rent again.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0">
              <ImageWithFallback
                src="/images/testimonials/james-obrien.jpg"
                alt="James O'Brien"
                fill
                className="object-cover"
                fallbackBg="#6b71f0"
              />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-[15px]">
                James O&apos;Brien
              </p>
              <p className="text-white/70 text-[13px]">New Farm, QLD</p>
            </div>
          </div>
          <Link
            href="/testimonials"
            className="inline-block mt-6 text-white/70 text-[14px] hover:text-white transition-colors"
          >
            See all reviews →
          </Link>
        </div>
      </section>

      {/* SECTION 7 — Quote CTA + testimonials (unchanged) */}
      <QuoteCTABanner
        href="/services/car-rental/quote"
        title="Get Your Car Rental Quote"
        subtitle="Free quote · 48 hour validity · 2-hour confirmation"
      />

      <TestimonialsStrip />
    </>
  )
}
