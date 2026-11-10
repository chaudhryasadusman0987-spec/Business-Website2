import Link from "next/link"
import { ArrowRight, Check, MapPin, Phone } from "lucide-react"
import JsonLd, { faqJsonLd } from "@/components/seo/JsonLd"
import { Breadcrumbs } from "@/components/seo/InternalLinks"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import { SITE_PHONE } from "@/data/site"
import { RENTAL_SPEC, HOW_TO_START, DRIVER_REQUIREMENTS, type RentalFaq } from "@/data/car-rental-pages"
import { vehicleAlt, type RentalVehicle } from "@/lib/vehicles"

// Server-rendered building blocks for the car rental landing pages
// (rideshare, long-term, suburbs). Same palette, radii and spacing as the hub
// and the security area pages. Nothing here fetches on the client, so all of
// the copy is in the initial HTML for crawlers.

export const FLEET_HREF = "/services/car-rental/vehicles"
const LINK =
  "text-[#7f85f7] font-medium underline decoration-[#7f85f7]/30 underline-offset-2 hover:text-[#5a60d8] transition-colors"
const tel = `tel:${SITE_PHONE.replace(/\s/g, "")}`

/** Dark hero strip with breadcrumb, the page's single H1 and its intro. */
export function RentalHero({
  crumbs,
  eyebrow,
  title,
  children,
  stats,
}: {
  crumbs: [string, string][]
  eyebrow: string
  title: React.ReactNode
  /** The first paragraph(s). Must contain the target keyword. */
  children: React.ReactNode
  stats?: { value: string; label: string }[]
}) {
  return (
    <section className="relative overflow-hidden bg-[#0d0d1a] py-[72px] lg:py-[88px]">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="relative z-10 max-w-[1170px] mx-auto px-4">
        <Breadcrumbs crumbs={crumbs} className="mb-6" />
        <span className="inline-block bg-white/[0.07] border border-white/10 text-[#c5c8fd] text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-full">
          {eyebrow}
        </span>
        <h1 className="mt-6 text-white font-extrabold text-[36px] lg:text-[52px] leading-[1.1] max-w-[820px]">
          {title}
        </h1>
        <div className="mt-5 max-w-[680px] space-y-4 text-[15px] text-[#9496a8] leading-[1.8]">
          {children}
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
          <Link
            href={`${FLEET_HREF}#vehicles`}
            className="flex items-center justify-center bg-[#7f85f7] text-white rounded-[8px] h-[52px] px-8 font-bold text-[15px] uppercase tracking-wider hover:bg-[#6b71f0] transition-colors duration-300"
          >
            Choose a car
          </Link>
          <a
            href={tel}
            className="flex items-center justify-center gap-2 border border-white/20 text-white rounded-[8px] h-[52px] px-8 font-semibold text-[15px] hover:bg-white/[0.06] transition-colors duration-300"
          >
            <Phone size={16} />
            Call {SITE_PHONE}
          </a>
        </div>
        {stats && stats.length > 0 && (
          <div className="mt-10 flex flex-wrap items-start gap-x-8 gap-y-5 sm:gap-x-10">
            {stats.map((s, i) => (
              <div key={s.label} className={i > 0 ? "sm:pl-10 sm:border-l sm:border-white/10" : ""}>
                <p className="text-white font-extrabold text-[26px] leading-none">{s.value}</p>
                <p className="text-[#767892] text-[12px] mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/** Light content section with an eyebrow, H2 and prose. */
export function ProseSection({
  eyebrow,
  heading,
  children,
  tone = "light",
  id,
  wide,
}: {
  eyebrow?: string
  heading: string
  children: React.ReactNode
  tone?: "light" | "grey"
  id?: string
  /** Full-width content after the prose (card grids, maps). */
  wide?: React.ReactNode
}) {
  return (
    <section id={id} className={`${tone === "grey" ? "bg-[#f5f5f8]" : "bg-[#fefefd]"} py-[64px] scroll-mt-20`}>
      <div className="max-w-[1170px] mx-auto px-4">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#7f85f7] mb-3">{eyebrow}</p>
        )}
        <h2 className="text-[26px] lg:text-[32px] font-bold text-[#1a1a2e] leading-tight max-w-[640px]">
          {heading}
        </h2>
        <div className="mt-6 max-w-[760px] space-y-4 text-[15px] text-[#555] leading-[1.8]">{children}</div>
        {wide}
      </div>
    </section>
  )
}

/** The hub's spec sheet: label / value rows. */
export function TermsSheet({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1 ${className}`}>
      {RENTAL_SPEC.map((t) => (
        <div key={t.label} className="flex items-baseline justify-between gap-4 py-[16px] border-b border-[#ececf4]">
          <span className="text-[15px] font-medium text-[#2f3149]">{t.label}</span>
          <span className="text-[15px] font-bold text-[#7f85f7] text-right">{t.value}</span>
        </div>
      ))}
    </div>
  )
}

export function CheckList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[15px] text-[#444] leading-[1.7]">
          <Check size={18} className="mt-1 flex-shrink-0 text-[#0f6e56]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function DriverRequirements() {
  return <CheckList items={DRIVER_REQUIREMENTS} className="mt-2" />
}

/** Four numbered steps from application to pickup. */
export function HowToStart() {
  return (
    <ol className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {HOW_TO_START.map((step, i) => (
        <li key={step.title} className="bg-white border border-[#e8e8f0] rounded-[12px] p-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0f0ff] text-[#7f85f7] font-bold text-[15px]">
            {i + 1}
          </span>
          <h3 className="mt-4 font-bold text-[17px] text-[#1a1a2e]">{step.title}</h3>
          <p className="mt-2 text-[14px] text-[#666] leading-relaxed">{step.body}</p>
        </li>
      ))}
    </ol>
  )
}

/** Visible FAQ plus matching FAQPage JSON-LD, from one list. */
export function FaqSection({ faqs, heading = "Common questions" }: { faqs: RentalFaq[]; heading?: string }) {
  return (
    <section className="bg-white py-[64px]">
      <JsonLd data={faqJsonLd(faqs)} />
      <div className="max-w-[800px] mx-auto px-4">
        <h2 className="font-bold text-[26px] text-[#1a1a2e] text-center mb-8">{heading}</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group bg-[#fefefd] border border-[#e8e8f0] rounded-[12px] p-5">
              <summary className="cursor-pointer font-semibold text-[15px] text-[#1a1a2e]">{f.q}</summary>
              <p className="text-[14px] text-[#666] mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Server-rendered car cards linking into the fleet, where the application opens. */
export function CarCards({ cars }: { cars: RentalVehicle[] }) {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cars.map((v) => (
        <Link
          key={v.id}
          href={`${FLEET_HREF}#vehicles`}
          className="group bg-white rounded-[16px] border border-[#e8e8f0] overflow-hidden hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] hover:border-[#d6d8f5] transition-all"
        >
          <div className="h-[160px] relative bg-[#f0f0ff] overflow-hidden">
            <ImageWithFallback
              src={v.image}
              alt={vehicleAlt(v)}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              fallbackIcon="Car"
              placeholderText="Photo coming soon"
            />
          </div>
          <div className="p-4">
            <h3 className="font-bold text-[15px] text-[#1a1a2e] leading-snug">{v.name}</h3>
            <p className="text-[12px] text-[#9496a8] mt-1">
              {[v.year, v.type, v.fuelType, v.transmission].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-3 text-[#1a1a2e]">
              <span className="font-extrabold text-[18px] text-[#534ab7]">${v.weeklyRate}</span>
              <span className="text-[12px] text-[#666880] ml-1">/ week</span>
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}

/** Lazy-loaded Google map, below the fold so it never affects LCP. */
export function SuburbMap({ query, label }: { query: string; label: string }) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=13&output=embed`
  return (
    <div className="mt-8 overflow-hidden rounded-[16px] border border-[#e8e8f0] bg-[#f0f0ff]">
      <iframe
        src={src}
        title={`Map of ${label}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block w-full h-[320px] lg:h-[380px] border-0"
      />
    </div>
  )
}

export function SuburbChips({ suburbs }: { suburbs: string[] }) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {suburbs.map((s) => (
        <span
          key={s}
          className="inline-flex items-center gap-1.5 bg-white border border-[#e8e8f0] rounded-full px-4 py-2 text-[13px] text-[#444]"
        >
          <MapPin size={12} className="text-[#7f85f7]" />
          {s}
        </span>
      ))}
    </div>
  )
}

/**
 * Closing call to action. Links up to the hub and across to the fleet with
 * keyword anchors, on every landing page.
 */
export function FleetCta({ hubAnchor, fleetAnchor }: { hubAnchor: string; fleetAnchor: string }) {
  return (
    <section className="bg-[#1a1a2e] py-[68px]">
      <div className="max-w-[700px] mx-auto px-4 text-center">
        <h2 className="text-white font-bold text-[28px] leading-tight">Ready to pick a car?</h2>
        <p className="text-[#9496a8] text-[15px] mt-3 mb-8 leading-relaxed">
          Every car on the yard is listed with its photos and weekly rate.{" "}
          <Link href={FLEET_HREF} className="text-[#a5a8ff] underline decoration-[#a5a8ff]/40 underline-offset-2 hover:text-white">
            {fleetAnchor}
          </Link>{" "}
          or read more about our{" "}
          <Link href="/services/car-rental" className="text-[#a5a8ff] underline decoration-[#a5a8ff]/40 underline-offset-2 hover:text-white">
            {hubAnchor}
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`${FLEET_HREF}#vehicles`}
            className="flex items-center justify-center gap-2 bg-[#7f85f7] text-white rounded-[10px] h-[52px] px-8 font-bold text-[15px] hover:bg-[#6b71f0] transition-colors duration-300"
          >
            Choose a car and apply
            <ArrowRight size={16} />
          </Link>
          <a
            href={tel}
            className="flex items-center justify-center gap-2 border-2 border-white/20 text-white rounded-[10px] h-[52px] px-8 font-semibold text-[15px] hover:bg-white/[0.06] transition-colors duration-300"
          >
            <Phone size={16} />
            {SITE_PHONE}
          </a>
        </div>
      </div>
    </section>
  )
}

export { LINK as PROSE_LINK }
