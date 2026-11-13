import type { Metadata } from "next"
import JsonLd, { serviceJsonLd, breadcrumbJsonLd, autoRentalJsonLd } from "@/components/seo/JsonLd"
import { HubIntro, HubBlogLinks, SpokeCards } from "@/components/seo/InternalLinks"
import { getFleetSummary, getPublicFleet, weeklyRange } from "@/lib/fleet-summary"
import Image from "next/image"
import Link from "next/link"
import { Phone } from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"
import VehicleGrid from "@/components/car-rental/VehicleGrid"
import { SITE_PHONE, SITE_PHONE_LOCAL, RENTAL_BRAND, RENTAL_LOCALITY } from "@/data/site"
import { getFleetCounts } from "@/lib/db"

// The fleet is dashboard-managed, so the hero counts have to be read at request
// time — a car added in the dashboard should change "N cars on the yard" on the
// next load. The Neon driver reads with cache: "no-store" anyway, so this page
// cannot be statically generated; saying so explicitly also keeps `next build`
// working on a machine with no DATABASE_URL.
export const dynamic = "force-dynamic"

// The hub targets the broad "car rental Brisbane"; "long term / weekly" and
// "rideshare / Uber" each have their own page, linked from here.
export const metadata: Metadata = {
  alternates: { canonical: "/services/car-rental" },
  title: { absolute: `Car Rental Brisbane: Weekly & Rideshare | ${RENTAL_BRAND}` },
  description:
    `${RENTAL_BRAND}: car rental in Brisbane by the week. 4-week minimum, ` +
    "rideshare-ready cars, servicing and roadside assistance included.",
}

const tel = `tel:${SITE_PHONE.replace(/\s/g, "")}`

/**
 * onYard: every listed car, coming soon included. available: bookable cars not
 * currently on rent. Null when the database is unreachable, so the page falls
 * back to wording without numbers rather than claiming "0 cars".
 */
async function fleetCounts(): Promise<{ onYard: number; available: number } | null> {
  try {
    return await getFleetCounts()
  } catch {
    return null
  }
}

// Rental terms read as a spec sheet rather than a row of icon tiles — same
// information, less decoration.
const terms = [
  { label: "Payment", value: "Weekly, in advance" },
  { label: "Minimum term", value: "4 weeks" },
  { label: "Security bond", value: "Refunded at the end" },
  { label: "Insurance excess", value: "$1,300 AUD" },
  { label: "Roadside assistance", value: "Included" },
  { label: "Servicing & maintenance", value: "Included" },
]

export default async function CarRentalPage() {
  const [fleet, summary, publicFleet] = await Promise.all([
    fleetCounts(),
    getFleetSummary(),
    getPublicFleet(),
  ])
  const count = fleet?.onYard ?? 0
  const allBooked = !!fleet && fleet.onYard > 0 && fleet.available === 0
  const badge = !fleet || fleet.onYard === 0
    ? "Available now"
    : allBooked
      ? "All booked – join the waitlist"
      : `${fleet.available} available now`

  const heroStats = [
    // Falls back to the terms when the count is unknown, so the row never
    // reads "0 cars on the yard".
    count > 0
      ? { value: String(count), label: "Cars on the yard" }
      : { value: "Weekly", label: "Payment cycle" },
    { value: "4", label: "Week minimum" },
    { value: "$1,300", label: "Insurance excess" },
  ]

  return (
    <>
      <JsonLd
        data={autoRentalJsonLd({
          path: "/services/car-rental",
          // Live weekly range from the fleet; "$$" only if the DB is down.
          priceRange: summary ? `${weeklyRange(summary)} AUD per week` : "$$",
        })}
      />
      <JsonLd
        data={serviceJsonLd({
          name: "Car Rental Brisbane",
          serviceType: "Car rental",
          description:
            "Car rental in Brisbane by the week, with a 4 week minimum, rideshare-ready cars, and road assistance and maintenance included.",
          path: "/services/car-rental",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          ["Home", "/"],
          ["Car Rental", "/services/car-rental"],
        ])}
      />
      {/* SECTION 1 — Hero */}
      <section className="bg-brand-hero relative overflow-hidden on-dark">

        <div className="container-page relative grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16 lg:py-24">
          {/* LEFT — copy. Not wrapped in AnimateIn: that holds content at
              opacity 0 until hydration, which pushed mobile LCP past 2.5s. */}
          <div>
            <p className="eyebrow">Pak Oz Rentals · Brisbane QLD</p>

            <h1 className="text-white mt-4">
              Car rental in Brisbane,
              <br />
              <span className="text-brand-primary">by the week.</span>
            </h1>

            <p className="lead mt-5 max-w-[560px]">
              Car rental in Brisbane from our yard in {RENTAL_LOCALITY}, by the
              week with a four-week minimum. Roadside assistance and servicing
              are on us — you put fuel in it and drive.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {/* Scrolls to the fleet — you pick a car before you can apply, so
                  this can't open a form for a vehicle nobody has chosen yet. */}
              <a
                href="#vehicles"
                className="flex items-center justify-center bg-brand-primary text-white rounded-btn h-12 px-6 font-semibold text-[15px] hover:bg-brand-hover transition-colors duration-200"
              >
                Get on Rent
              </a>
              <a
                href={tel}
                className="flex items-center justify-center gap-2 border border-white/40 text-white rounded-btn h-12 px-6 font-semibold text-[15px] hover:border-white hover:bg-white/10 transition-colors duration-200"
              >
                <Phone size={16} aria-hidden="true" />
                Call {SITE_PHONE_LOCAL}
              </a>
            </div>

            {/* Live availability — a plain status line, not a card floating
                over the photo. */}
            <p className="mt-5 flex items-start gap-2.5 text-[14px] text-muted">
              <span
                className={`mt-[7px] h-2.5 w-2.5 flex-shrink-0 rounded-full ${allBooked ? "bg-[#f0ad4e]" : "bg-[#5dcaa5]"}`}
              />
              <span>
                <span className="font-semibold text-white">{badge}</span>
                {" · "}
                {allBooked ? (
                  <a href={tel} className="underline underline-offset-2 hover:text-white">
                    Call {SITE_PHONE} to be next in line
                  </a>
                ) : (
                  "Pick up in Brisbane — usually same week"
                )}
              </span>
            </p>

            {/* Stats as a typographic row, divided — not a glass card grid. */}
            <div className="mt-10 flex flex-wrap items-start gap-x-8 gap-y-5 sm:gap-x-10">
              {heroStats.map((s, i) => (
                <div
                  key={s.label}
                  className={
                    i > 0 ? "sm:pl-10 sm:border-l sm:border-white/10" : ""
                  }
                >
                  <p className="text-white font-bold text-[26px] leading-none">
                    {s.value}
                  </p>
                  <p className="text-muted text-[13px] mt-2">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — hero photo: 16/10 on mobile, 4/5 on desktop */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-img lg:aspect-[4/5]">
            <Image
              src="/images/vehicles/car-rental-keys.jpg"
              alt="Driver behind the wheel of a Pak Oz Rentals car in Brisbane"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 440px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2 — Rental terms, as a spec sheet */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn animation="fade-up">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-3">
              How it works
            </p>
            <h2 className="text-[#1a1a2e] max-w-[520px]">
              Same terms on every car. No fine print.
            </h2>
          </AnimateIn>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1">
            {terms.map((t, i) => (
              <AnimateIn key={t.label} animation="fade-up" delay={(i % 3) * 100}>
                <div className="flex items-baseline justify-between gap-4 py-[18px] border-b border-line">
                  <span className="text-[15px] font-medium text-[#2f3149]">
                    {t.label}
                  </span>
                  <span className="text-[15px] font-bold text-accent text-right">
                    {t.value}
                  </span>
                </div>
              </AnimateIn>
            ))}
          </div>

          <HubIntro
            hub="car-rental"
            className="mt-10 text-[15px] text-muted leading-[1.8] max-w-[640px]"
          />
          <SpokeCards
            ids={["rideshare", "long-term", "fleet", "rental-terms"]}
            className="mt-6 max-w-[780px]"
          />
          <HubBlogLinks hub="car-rental" className="mt-6 max-w-[640px]" />
        </div>
      </section>

      {/* SECTION 3 — Vehicle grid + detail modal */}
      <VehicleGrid initialVehicles={publicFleet} />

      {/* SECTION 4 — Contact CTA */}
      <section className="bg-brand-navy on-dark py-14 lg:py-20">
        <AnimateIn animation="fade-up">
          <div className="max-w-[700px] mx-auto px-4 text-center">
            <h2 className="text-white">
              Not sure which one suits you?
            </h2>
            <p className="text-muted text-[15px] mt-3 mb-8 leading-relaxed">
              Give us a call and tell us what you need it for — we will point you
              at the right car. We answer within two hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={tel}
                className="flex items-center justify-center gap-2 bg-brand-primary text-white rounded-btn h-12 px-8 font-semibold text-[15px] hover:bg-brand-hover transition-colors duration-200"
              >
                <Phone size={16} />
                {SITE_PHONE}
              </a>
              <Link
                href="/contact"
                className="flex items-center justify-center border-2 border-white/20 text-white rounded-btn h-12 px-8 font-semibold text-[15px] hover:bg-white/[0.06] transition-colors duration-200"
              >
                Send a message
              </Link>
            </div>
          </div>
        </AnimateIn>
      </section>
    </>
  )
}
