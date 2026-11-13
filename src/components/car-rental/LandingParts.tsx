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
  "text-accent font-medium underline decoration-current/30 underline-offset-2 hover:text-accent transition-colors"
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
    <section className="relative overflow-hidden bg-brand-hero on-dark py-16 lg:py-24">
      <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs crumbs={crumbs} className="mb-6" />
        <span className="inline-block bg-white/[0.07] border border-white/10 text-[#c5c8fd] text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-full">
          {eyebrow}
        </span>
        <h1 className="mt-6 text-white max-w-[820px]">
          {title}
        </h1>
        <div className="mt-5 max-w-[680px] space-y-4 text-[15px] text-muted leading-[1.8]">
          {children}
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
          <Link
            href={`${FLEET_HREF}#vehicles`}
            className="flex items-center justify-center bg-brand-primary text-white rounded-btn h-12 px-8 font-semibold text-[15px] uppercase tracking-wider hover:bg-brand-hover transition-colors duration-200"
          >
            Choose a car
          </Link>
          <a
            href={tel}
            className="flex items-center justify-center gap-2 border border-white/20 text-white rounded-btn h-12 px-8 font-semibold text-[15px] hover:bg-white/[0.06] transition-colors duration-200"
          >
            <Phone size={16} />
            Call {SITE_PHONE}
          </a>
        </div>
        {stats && stats.length > 0 && (
          <div className="mt-10 flex flex-wrap items-start gap-x-8 gap-y-5 sm:gap-x-10">
            {stats.map((s, i) => (
              <div key={s.label} className={i > 0 ? "sm:pl-10 sm:border-l sm:border-white/10" : ""}>
                <p className="text-white font-bold text-[26px] leading-none">{s.value}</p>
                <p className="text-muted text-[12px] mt-2">{s.label}</p>
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
    <section id={id} className={`${tone === "grey" ? "bg-[#f5f5f8]" : "bg-white on-light"} py-[64px] scroll-mt-20`}>
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-3">{eyebrow}</p>
        )}
        <h2 className="text-[#1a1a2e] max-w-[640px]">
          {heading}
        </h2>
        <div className="mt-6 max-w-[760px] space-y-4 text-[15px] text-muted leading-[1.8]">{children}</div>
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
        <div key={t.label} className="flex items-baseline justify-between gap-4 py-[16px] border-b border-line">
          <span className="text-[15px] font-medium text-[#2f3149]">{t.label}</span>
          <span className="text-[15px] font-bold text-accent text-right">{t.value}</span>
        </div>
      ))}
    </div>
  )
}

export function CheckList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[15px] text-muted leading-[1.7]">
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
        <li key={step.title} className="bg-white border border-line rounded-card p-6 on-light">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-accent font-bold text-[15px] on-light">
            {i + 1}
          </span>
          <h3 className="mt-4 font-bold text-[17px] text-[#1a1a2e]">{step.title}</h3>
          <p className="mt-2 text-[14px] text-muted leading-relaxed">{step.body}</p>
        </li>
      ))}
    </ol>
  )
}

/** Visible FAQ plus matching FAQPage JSON-LD, from one list. */
export function FaqSection({ faqs, heading = "Common questions" }: { faqs: RentalFaq[]; heading?: string }) {
  return (
    <section className="bg-white on-light py-14 lg:py-20">
      <JsonLd data={faqJsonLd(faqs)} />
      <div className="max-w-[800px] mx-auto px-4">
        <h2 className="font-bold text-[26px] text-[#1a1a2e] text-center mb-8">{heading}</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group bg-white border border-line rounded-card p-5 on-light">
              <summary className="cursor-pointer font-semibold text-[15px] text-[#1a1a2e]">{f.q}</summary>
              <p className="text-[14px] text-muted mt-3 leading-relaxed">{f.a}</p>
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
          className="group bg-white rounded-card border border-line overflow-hidden hover:shadow-card-hover hover:border-[#d6d8f5] transition-all on-light"
        >
          <div className="h-[160px] relative bg-surface overflow-hidden on-light">
            <ImageWithFallback
              src={v.image}
              alt={vehicleAlt(v)}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
              className="object-cover transition-transform duration-200"
              fallbackIcon="Car"
              placeholderText="Photo coming soon"
            />
          </div>
          <div className="p-4">
            <h3 className="font-bold text-[15px] text-[#1a1a2e] leading-snug">{v.name}</h3>
            <p className="text-[12px] text-muted mt-1">
              {[v.year, v.type, v.fuelType, v.transmission].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-3 text-[#1a1a2e]">
              <span className="font-bold text-[18px] text-accent">${v.weeklyRate}</span>
              <span className="text-[12px] text-muted ml-1">/ week</span>
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
    <div className="mt-8 overflow-hidden rounded-card border border-line bg-surface on-light">
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
          className="inline-flex items-center gap-1.5 bg-white border border-line rounded-full px-4 py-2 text-[13px] text-muted on-light"
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
    <section className="bg-brand-navy on-dark py-14 lg:py-20">
      <div className="max-w-[700px] mx-auto px-4 text-center">
        <h2 className="text-white">Ready to pick a car?</h2>
        <p className="text-muted text-[15px] mt-3 mb-8 leading-relaxed">
          Every car on the yard is listed with its photos and weekly rate.{" "}
          <Link href={FLEET_HREF} className="text-accent underline decoration-[#a5a8ff]/40 underline-offset-2 hover:text-white">
            {fleetAnchor}
          </Link>{" "}
          or read more about our{" "}
          <Link href="/services/car-rental" className="text-accent underline decoration-[#a5a8ff]/40 underline-offset-2 hover:text-white">
            {hubAnchor}
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`${FLEET_HREF}#vehicles`}
            className="flex items-center justify-center gap-2 bg-brand-primary text-white rounded-btn h-12 px-8 font-semibold text-[15px] hover:bg-brand-hover transition-colors duration-200"
          >
            Choose a car and apply
            <ArrowRight size={16} />
          </Link>
          <a
            href={tel}
            className="flex items-center justify-center gap-2 border-2 border-white/20 text-white rounded-btn h-12 px-8 font-semibold text-[15px] hover:bg-white/[0.06] transition-colors duration-200"
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
