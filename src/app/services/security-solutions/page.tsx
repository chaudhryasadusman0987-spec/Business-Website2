import type { Metadata } from "next"
import JsonLd, { serviceJsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd"
import SectionTitle from "@/components/ui/SectionTitle"
import AnimateIn from "@/components/ui/AnimateIn"
import SecuritySolutionsHero from "@/components/sections/SecuritySolutionsHero"
import SolutionCard from "@/components/sections/SolutionCard"
import HowItWorks from "@/components/sections/HowItWorks"
import TestimonialsStrip from "@/components/sections/TestimonialsStrip"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { securitySolutions } from "@/data/security-solutions"
import { serviceAreas } from "@/data/service-areas"
import { SECURITY_BRAND, SECURITY_WARRANTY, SITE_GOOGLE_REVIEW_URL } from "@/data/site"
import SecurityTrustBar from "@/components/sections/SecurityTrustBar"
import FaqSection from "@/components/sections/FaqSection"
import { securityHubFaqs } from "@/data/security-faqs"
import Link from "next/link"
import { HubIntro, HubBlogLinks, SpokeCards } from "@/components/seo/InternalLinks"
import { withSocial } from "@/lib/seo"

// Suburbs shown as a plain list under the linked region pages. Taken from the
// region data so the hub and the region pages never disagree. No separate
// suburb pages: thin near-duplicate pages hurt rankings.
const suburbGroups: { name: string; suburbs: string[] }[] = [
  { name: "Brisbane Southside", area: "brisbane-southside" },
  { name: "Logan", area: "logan" },
  { name: "Bayside", area: "redlands" },
].map(({ name, area }) => ({
  name,
  suburbs: serviceAreas.find((a) => a.slug === area)?.suburbs ?? [],
}))

// `absolute` bypasses the root layout's `%s | Pak Oz Solutions` template so the
// security section carries the CCTV sub-brand in the tab title instead.
export const metadata: Metadata = withSocial({
  alternates: { canonical: "/services/security-solutions" },
  title: { absolute: `Security Solutions | ${SECURITY_BRAND}` },
  description:
    "CCTV, alarm, access control and intercom installation in Brisbane & " +
    `Southeast QLD. Phone viewing, ${SECURITY_WARRANTY}, free site assessment.`,
})

export default function SecuritySolutionsPage() {
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "CCTV & Security Installation",
          serviceType: "Security system installation",
          description:
            "CCTV, alarm, access control, smoke alarm and intercom installation for homes and businesses.",
          path: "/services/security-solutions",
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          ["Home", "/"],
          ["Security Solutions", "/services/security-solutions"],
        ])}
      />
      <SecuritySolutionsHero />
      <SecurityTrustBar />

      {/* Solutions grid */}
      <section id="solutions" className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Our Solutions"
            subtitle="Choose a solution to see products and starting prices"
            eyebrow="What we install"
          />
          <HubIntro
            hub="security"
            className="text-[15px] text-muted leading-[1.8] text-center max-w-[820px] mx-auto mt-6"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {securitySolutions.map((solution, index) => (
              <AnimateIn
                key={solution.id}
                animation="fade-up"
                delay={(index % 3) * 150}
                className="flex"
              >
                <SolutionCard solution={solution} />
              </AnimateIn>
            ))}
          </div>

          {/* Spokes without a solution card of their own */}
          <SpokeCards ids={["packages", "products"]} className="mt-6 max-w-[780px] mx-auto" />
          <HubBlogLinks hub="security" className="mt-8 text-center" />
        </div>
      </section>

      <HowItWorks />

      {/* Areas We Service — suburb coverage for local SEO */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-ink text-center mb-4">Areas We Service</h2>
          <p className="text-[15px] text-muted text-center max-w-[640px] mx-auto mb-8">
            We install across Brisbane and Southeast QLD. Each region page below
            covers what properties there typically need.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {serviceAreas.map((a) => (
              <Link
                key={a.slug}
                href={`/services/security-solutions/areas/${a.slug}`}
                className="inline-flex min-h-[44px] items-center bg-brand-primary text-white font-semibold rounded-full px-5 text-[14px] hover:bg-brand-hover transition-all"
              >
                CCTV Installation {a.headline}
              </Link>
            ))}
          </div>
          <div className="mx-auto mt-10 grid max-w-[960px] grid-cols-1 gap-8 text-left sm:grid-cols-3">
            {suburbGroups.map((g) => (
              <div key={g.name}>
                <h3 className="text-[16px] font-semibold text-ink">{g.name}</h3>
                <p className="mt-2 text-[14px] leading-[1.8] text-muted">{g.suburbs.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leave us a Google review CTA */}
      <section className="bg-surface on-light text-center py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-ink">
            Happy with our service?
          </h2>
          <p className="text-muted mt-4 mb-8 max-w-[560px] mx-auto">
            Leave us a Google review and help other Brisbane families find
            quality security installation. Or{" "}
            <Link href="/testimonials" className="text-accent font-medium underline underline-offset-2">
              read what our customers say
            </Link>
            .
          </p>
          {/* Points at a Google search until the Business Profile is verified;
              swap to the direct review link once it is. */}
          <a
            href={SITE_GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center border border-line bg-white text-ink font-semibold rounded-btn h-12 px-6 hover:border-ink transition-colors on-light"
          >
            ⭐ Find Us on Google
          </a>
          <p className="text-[13px] text-muted text-center mt-3">
            Search for us on Google and click &quot;Write a review&quot;
          </p>
        </div>
      </section>

      <FaqSection
        faqs={securityHubFaqs()}
        subtitle="Costs, cameras, recording, warranty and payment — answered."
      />

      <QuoteCTABanner href="/services/security-solutions/quote" />
      <TestimonialsStrip />
    </>
  )
}
