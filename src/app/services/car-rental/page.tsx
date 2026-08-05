import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Phone } from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"
import VehicleGrid from "@/components/car-rental/VehicleGrid"
import { SITE_PHONE } from "@/data/site"
import { getVehicles } from "@/lib/db"

// The fleet is dashboard-managed, so the hero counts have to be read at request
// time — a car added in the dashboard should change "N cars on the yard" on the
// next load. The Neon driver reads with cache: "no-store" anyway, so this page
// cannot be statically generated; saying so explicitly also keeps `next build`
// working on a machine with no DATABASE_URL.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Long-Term Car Rental Brisbane",
  description:
    "Pak Oz Rentals — long-term car rental in Brisbane. Weekly payment, " +
    "4 week minimum. Road assistance and maintenance included.",
}

const tel = `tel:${SITE_PHONE.replace(/\s/g, "")}`

/** Cars visible to customers. 0 when the database is unreachable. */
async function availableCount(): Promise<number> {
  try {
    return (await getVehicles()).filter((v) => v.available).length
  } catch {
    return 0
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
  const count = await availableCount()

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
      {/* SECTION 1 — Hero */}
      <section className="bg-[#0d0d1a] relative overflow-hidden">
        {/* Single soft glow behind the copy — no pattern fill, the photo carries
            the visual weight. */}
        <div
          className="absolute -top-40 -left-24 w-[620px] h-[620px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(127,133,247,0.22) 0%, transparent 68%)",
          }}
        />

        <div className="relative max-w-[1170px] mx-auto px-4 py-[72px] lg:py-[96px] flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* LEFT — copy */}
          <AnimateIn animation="slide-left" className="flex-1 w-full">
            <span className="inline-block bg-white/[0.07] border border-white/10 text-[#c5c8fd] text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-full">
              Pak Oz Rentals · Brisbane QLD
            </span>

            <h1 className="text-white font-extrabold text-[40px] lg:text-[56px] leading-[1.08] mt-6">
              Long-term car rental,
              <br />
              <span className="text-[#7f85f7]">Brisbane.</span>
            </h1>

            <p className="text-[15px] text-[#9496a8] leading-[1.8] mt-5 max-w-[440px]">
              Cars on the yard in Brisbane, rented by the week with a four-week
              minimum. Roadside assistance and servicing are on us — you put fuel
              in it and drive.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
              {/* Scrolls to the fleet — you pick a car before you can apply, so
                  this can't open a form for a vehicle nobody has chosen yet. */}
              <a
                href="#vehicles"
                className="flex items-center justify-center bg-[#7f85f7] text-white rounded-[8px] h-[52px] px-8 font-bold text-[15px] uppercase tracking-wider hover:bg-[#6b71f0] transition-colors duration-300"
              >
                Get on Rent
              </a>
              <a
                href={tel}
                className="flex items-center justify-center gap-2 border border-white/20 text-white rounded-[8px] h-[52px] px-8 font-semibold text-[15px] hover:bg-white/[0.06] transition-colors duration-300"
              >
                <Phone size={16} />
                Call us
              </a>
            </div>

            {/* Stats as a typographic row, divided — not a glass card grid. */}
            <div className="mt-10 flex flex-wrap items-start gap-x-8 gap-y-5 sm:gap-x-10">
              {heroStats.map((s, i) => (
                <div
                  key={s.label}
                  className={
                    i > 0 ? "sm:pl-10 sm:border-l sm:border-white/10" : ""
                  }
                >
                  <p className="text-white font-extrabold text-[26px] leading-none">
                    {s.value}
                  </p>
                  <p className="text-[#767892] text-[12px] mt-2">{s.label}</p>
                </div>
              ))}
            </div>
          </AnimateIn>

          {/* RIGHT — hero photo with an overlapping availability card */}
          <AnimateIn
            animation="slide-right"
            delay={150}
            className="w-full lg:w-[46%] flex-shrink-0"
          >
            <div className="relative">
              <div className="relative h-[300px] sm:h-[380px] lg:h-[440px] rounded-[20px] overflow-hidden ring-1 ring-white/10">
                <Image
                  src="/images/vehicles/car-rental-keys.jpg"
                  alt="Driver behind the wheel of a Pak Oz Rentals car in Brisbane"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 540px"
                  className="object-cover"
                />
                {/* Grounds the photo against the dark section. */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-transparent to-transparent opacity-70" />
              </div>

              <div className="absolute -bottom-5 left-5 right-5 sm:right-auto sm:w-[290px] bg-white rounded-[14px] p-4 shadow-xl flex items-center gap-3.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0f6e56] flex-shrink-0" />
                <div>
                  <p className="font-bold text-[14px] text-[#1a1a2e] leading-tight">
                    {count > 0 ? `All ${count} available now` : "Available now"}
                  </p>
                  <p className="text-[12px] text-[#9496a8] mt-0.5">
                    Pick up in Brisbane — usually same week
                  </p>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* SECTION 2 — Rental terms, as a spec sheet */}
      <section className="bg-[#fefefd] pt-[92px] pb-[80px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <AnimateIn animation="fade-up">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#7f85f7] mb-3">
              How it works
            </p>
            <h2 className="text-[28px] lg:text-[34px] font-bold text-[#1a1a2e] leading-tight max-w-[520px]">
              Same terms on every car. No fine print.
            </h2>
          </AnimateIn>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1">
            {terms.map((t, i) => (
              <AnimateIn key={t.label} animation="fade-up" delay={(i % 3) * 100}>
                <div className="flex items-baseline justify-between gap-4 py-[18px] border-b border-[#ececf4]">
                  <span className="text-[15px] font-medium text-[#2f3149]">
                    {t.label}
                  </span>
                  <span className="text-[15px] font-bold text-[#7f85f7] text-right">
                    {t.value}
                  </span>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — Vehicle grid + detail modal */}
      <VehicleGrid />

      {/* SECTION 4 — Contact CTA */}
      <section className="bg-[#1a1a2e] py-[68px]">
        <AnimateIn animation="fade-up">
          <div className="max-w-[700px] mx-auto px-4 text-center">
            <h2 className="text-white font-bold text-[28px] leading-tight">
              Not sure which one suits you?
            </h2>
            <p className="text-[#9496a8] text-[15px] mt-3 mb-8 leading-relaxed">
              Give us a call and tell us what you need it for — we will point you
              at the right car. We answer within two hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={tel}
                className="flex items-center justify-center gap-2 bg-[#7f85f7] text-white rounded-[10px] h-[52px] px-8 font-bold text-[15px] hover:bg-[#6b71f0] transition-colors duration-300"
              >
                <Phone size={16} />
                {SITE_PHONE}
              </a>
              <Link
                href="/contact"
                className="flex items-center justify-center border-2 border-white/20 text-white rounded-[10px] h-[52px] px-8 font-semibold text-[15px] hover:bg-white/[0.06] transition-colors duration-300"
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
