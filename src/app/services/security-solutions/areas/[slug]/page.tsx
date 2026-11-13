import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, MapPin } from "lucide-react"
import JsonLd, { serviceJsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd"
import SectionTitle from "@/components/ui/SectionTitle"
import AnimateIn from "@/components/ui/AnimateIn"
import SolutionCard from "@/components/sections/SolutionCard"
import HowItWorks from "@/components/sections/HowItWorks"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { securitySolutions } from "@/data/security-solutions"
import { serviceAreas, getServiceArea } from "@/data/service-areas"
import { SECURITY_BRAND } from "@/data/site"
import { HubLink, RelatedServices } from "@/components/seo/InternalLinks"
import { getSpokeByHref } from "@/data/internal-links"

export function generateStaticParams() {
  return serviceAreas.map((a) => ({ slug: a.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const area = getServiceArea(params.slug)
  if (!area) return {}
  return {
    title: { absolute: `CCTV Installation ${area.headline} | ${SECURITY_BRAND}` },
    description: area.metaDescription,
    alternates: { canonical: `/services/security-solutions/areas/${area.slug}` },
  }
}

export default function ServiceAreaPage({
  params,
}: {
  params: { slug: string }
}) {
  const area = getServiceArea(params.slug)
  if (!area) notFound()

  const path = `/services/security-solutions/areas/${area.slug}`
  const otherAreas = serviceAreas.filter((a) => a.slug !== area.slug)
  const spoke = getSpokeByHref(path)

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: `CCTV & Security Installation ${area.name}`,
          serviceType: "Security system installation",
          description: area.metaDescription,
          path,
          areaServed: area.name,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          ["Home", "/"],
          ["Security Solutions", "/services/security-solutions"],
          [area.name, path],
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: area.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      {/* HERO STRIP */}
      <section className="bg-brand-hero relative overflow-hidden on-dark py-16 lg:py-24">
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-[12px] text-muted">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={12} />
            <Link href="/services/security-solutions" className="hover:text-white">
              Security Solutions
            </Link>
            <ChevronRight size={12} />
            <span className="text-muted">{area.name}</span>
          </nav>
          <h1 className="text-white">
            CCTV &amp; Security Installation{" "}
            <span className="text-accent">{area.headline}</span>
          </h1>
          <div className="mt-5 max-w-[680px] space-y-4">
            {area.intro.map((p, i) => (
              <p key={p} className="text-[15px] text-muted leading-relaxed">
                {p}
                {i === 0 && <HubLink spoke={spoke} />}
              </p>
            ))}
          </div>
          <Link
            href="/services/security-solutions/quote"
            className="mt-8 inline-flex items-center justify-center bg-[#0F6E56] text-white font-semibold rounded-btn h-12 px-8 hover:bg-[#085041] transition-all"
          >
            Get a Free Quote
          </Link>
        </div>
      </section>

      {/* LOCAL FOCUS */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title={`Security for ${area.name}`}
            subtitle="Planned around the properties we see in your area"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {area.focus.map((f, i) => (
              <AnimateIn key={f.title} animation="fade-up" delay={i * 150}>
                <div className="h-full bg-white border border-line rounded-card p-6 on-light">
                  <h3 className="font-bold text-[18px] text-[#1a1a2e]">{f.title}</h3>
                  <p className="text-[14px] text-muted mt-3 leading-relaxed">{f.body}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="What We Install"
            subtitle={`Available across ${area.name}`}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
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
        </div>
      </section>

      <HowItWorks />

      {/* SUBURBS */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-bold text-[24px] text-[#1a1a2e] text-center mb-8">
            Suburbs We Cover in {area.name}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {area.suburbs.map((suburb) => (
              <span
                key={suburb}
                className="inline-flex items-center gap-1.5 bg-white border border-line rounded-full px-4 py-2 text-[13px] text-muted on-light"
              >
                <MapPin size={12} className="text-[#7f85f7]" />
                {suburb}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-[800px] mx-auto px-4">
          <h2 className="font-bold text-[24px] text-[#1a1a2e] text-center mb-8">
            Common Questions
          </h2>
          <div className="space-y-4">
            {area.faqs.map((f) => (
              <details
                key={f.q}
                className="group bg-white border border-line rounded-card p-5 on-light"
              >
                <summary className="cursor-pointer font-semibold text-[15px] text-[#1a1a2e]">
                  {f.q}
                </summary>
                <p className="text-[14px] text-muted mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* OTHER AREAS */}
      <section className="bg-white py-[50px] on-light">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-bold text-[20px] text-[#1a1a2e] mb-6">
            We Also Install In
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {otherAreas.map((a) => (
              <Link
                key={a.slug}
                href={`/services/security-solutions/areas/${a.slug}`}
                className="bg-white border border-line rounded-full px-5 py-2 text-[14px] text-muted hover:border-brand-primary hover:text-accent transition-all on-light"
              >
                CCTV Installation {a.headline}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CCTV, packages and the two nearest areas */}
      <RelatedServices spoke={spoke} className="bg-white py-[60px] on-light" />

      <QuoteCTABanner href="/services/security-solutions/quote" />
    </>
  )
}
