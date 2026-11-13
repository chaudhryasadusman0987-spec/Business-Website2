import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import JsonLd, { serviceJsonLd } from "@/components/seo/JsonLd"
import { HubLink, RelatedServices } from "@/components/seo/InternalLinks"
import {
  RentalHero,
  ProseSection,
  TermsSheet,
  HowToStart,
  FaqSection,
  SuburbMap,
  SuburbChips,
  FleetCta,
  FLEET_HREF,
  PROSE_LINK,
} from "@/components/car-rental/LandingParts"
import { rentalSuburbs, getRentalSuburb } from "@/data/car-rental-pages"
import { getSpoke, serviceCrumbs } from "@/data/internal-links"
import { RENTAL_BRAND, RENTAL_LOCALITY } from "@/data/site"

// Static suburb landing pages: no database read, so they are prerendered and
// fast. Static siblings (vehicles, rideshare, long-term) take precedence over
// this dynamic segment, and any other slug 404s.
export const dynamicParams = false

export function generateStaticParams() {
  return rentalSuburbs.map((s) => ({ suburb: s.slug }))
}

export function generateMetadata({ params }: { params: { suburb: string } }): Metadata {
  const s = getRentalSuburb(params.suburb)
  if (!s) return {}
  return {
    title: { absolute: s.title },
    description: s.metaDescription,
    alternates: { canonical: `/services/car-rental/${s.slug}` },
  }
}

export default function SuburbRentalPage({ params }: { params: { suburb: string } }) {
  const s = getRentalSuburb(params.suburb)
  if (!s) notFound()

  const path = `/services/car-rental/${s.slug}`
  const spoke = getSpoke(`car-rental-${s.slug}`)
  const neighbours = s.nearbyPages
    .map(getRentalSuburb)
    .filter((n): n is NonNullable<typeof n> => Boolean(n))

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: `Car Rental ${s.name}`,
          serviceType: "Car rental",
          description: s.metaDescription,
          path,
          areaServed: s.name,
        })}
      />

      <RentalHero
        crumbs={serviceCrumbs("car-rental", { name: s.name, href: path })}
        eyebrow={`${RENTAL_BRAND} · ${s.name}`}
        title={
          <>
            Car rental <span className="text-accent">{s.name}</span>
          </>
        }
      >
        <p>
          {s.intro}
          <HubLink spoke={spoke} />
        </p>
      </RentalHero>

      {s.sections.map((sec, i) => (
        <ProseSection key={sec.heading} heading={sec.heading} tone={i % 2 ? "grey" : "light"}>
          {sec.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {i === s.sections.length - 1 && (
            <p>
              See the cars, apps and requirements on our{" "}
              <Link href="/services/car-rental/rideshare" className={PROSE_LINK}>
                rideshare car rental
              </Link>{" "}
              page.
            </p>
          )}
        </ProseSection>
      ))}

      <ProseSection
        tone={s.sections.length % 2 ? "grey" : "light"}
        eyebrow="The terms"
        heading="The same terms on every car"
        wide={<TermsSheet className="mt-6" />}
      >
        <p>
          Every car in the{" "}
          <Link href={FLEET_HREF} className={PROSE_LINK}>
            rental fleet
          </Link>{" "}
          is listed with its photos, weekly rate and bond. Pick one, apply online, and collect it from the yard in{" "}
          {RENTAL_LOCALITY}.
        </p>
      </ProseSection>

      <ProseSection
        tone={s.sections.length % 2 ? "light" : "grey"}
        eyebrow="Where we are"
        heading={`${s.name} and the suburbs around it`}
        wide={
          <>
            <SuburbChips suburbs={s.nearby} />
            <SuburbMap query={s.mapQuery} label={s.name} />
          </>
        }
      >
        <p>
          We rent to drivers right across {s.name} and the surrounding suburbs, with pickup from our yard in{" "}
          {RENTAL_LOCALITY}. Also nearby:{" "}
          {neighbours.map((n, i) => (
            <span key={n.slug}>
              {i > 0 && (i === neighbours.length - 1 ? " and " : ", ")}
              <Link href={`/services/car-rental/${n.slug}`} className={PROSE_LINK}>
                car rental {n.name}
              </Link>
            </span>
          ))}
          .
        </p>
      </ProseSection>

      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-3">How to start</p>
          <h2 className="text-[#1a1a2e]">
            On the road in {s.name} this week
          </h2>
          <HowToStart />
        </div>
      </section>

      <FaqSection faqs={s.faqs} heading={`Car rental in ${s.name}: questions`} />

      <RelatedServices spoke={spoke} />

      <FleetCta hubAnchor="car rental in Brisbane" fleetAnchor="View our rental fleet" />
    </>
  )
}
