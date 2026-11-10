import {
  SITE_DOMAIN,
  SITE_EMAIL,
  SITE_PHONE,
  SITE_OPENING_HOURS,
  RENTAL_BRAND,
  RENTAL_LOCALITY,
  RENTAL_REGION,
  RENTAL_POSTCODE,
} from "@/data/site"

// Renders a schema.org JSON-LD block. Server component — the markup ships in
// the initial HTML so crawlers see it without running JS.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/** Service offered by the LocalBusiness declared in the root layout. */
export function serviceJsonLd(opts: {
  name: string
  description: string
  path: string
  serviceType?: string
  areaServed?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    serviceType: opts.serviceType ?? opts.name,
    description: opts.description,
    url: `${SITE_DOMAIN}${opts.path}`,
    provider: { "@id": `${SITE_DOMAIN}/#business` },
    areaServed: opts.areaServed ?? "Brisbane & South East Queensland",
  }
}

/** Breadcrumb trail; pass crumbs from the home page down, e.g. [["Home","/"],…]. */
export function breadcrumbJsonLd(crumbs: [name: string, path: string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE_DOMAIN}${path}`,
    })),
  }
}

/** schema.org OpeningHoursSpecification list from SITE_OPENING_HOURS. */
export function openingHoursJsonLd() {
  return SITE_OPENING_HOURS.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days,
    opens: h.opens,
    closes: h.closes,
  }))
}

/** FAQPage block. Pass the same list the page renders, so the two match. */
export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
}

/**
 * AutoRental (a LocalBusiness subtype) for the car rental hub. Business details
 * all come from src/data/site.ts; priceRange is the live weekly range from the
 * fleet, e.g. "$180–$300 per week".
 */
export function autoRentalJsonLd(opts: { priceRange: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": `${SITE_DOMAIN}${opts.path}#autorental`,
    name: RENTAL_BRAND,
    url: `${SITE_DOMAIN}${opts.path}`,
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    image: `${SITE_DOMAIN}/images/vehicles/car-rental-keys.jpg`,
    priceRange: opts.priceRange,
    currenciesAccepted: "AUD",
    address: {
      "@type": "PostalAddress",
      addressLocality: RENTAL_LOCALITY,
      addressRegion: RENTAL_REGION,
      postalCode: RENTAL_POSTCODE,
      addressCountry: "AU",
    },
    areaServed: [
      { "@type": "City", name: "Brisbane" },
      { "@type": "City", name: "Logan" },
    ],
    openingHoursSpecification: openingHoursJsonLd(),
    parentOrganization: { "@id": `${SITE_DOMAIN}/#business` },
  }
}
