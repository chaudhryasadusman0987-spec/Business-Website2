import { SITE_DOMAIN } from "@/data/site"

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
