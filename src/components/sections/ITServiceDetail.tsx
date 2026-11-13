import type { ReactNode } from "react"
import Link from "next/link"
import { ChevronRight, Check } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import DynamicIcon from "@/components/ui/DynamicIcon"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import Price from "@/components/ui/Price"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import WhatsAppButton from "@/components/ui/WhatsAppButton"
import type { ITServiceItem } from "@/data/it-services"
import Button from "@/components/ui/Button"
import { IT_BRAND, SITE_PHONE_HREF, SITE_PHONE_LOCAL } from "@/data/site"
import JsonLd, { breadcrumbJsonLd } from "@/components/seo/JsonLd"
import { HubLink, RelatedServices } from "@/components/seo/InternalLinks"
import { getSpokeByHref, hubs, serviceCrumbs } from "@/data/internal-links"

interface Props {
  service: ITServiceItem
  headlineWhite: string
  headlinePurple: string
  packagesTitle: string
  floatingBadge?: { title: string; sub: string }
  /** Optional section rendered after packages, before the process steps. */
  extra?: ReactNode
}

export default function ITServiceDetail({
  service,
  headlineWhite,
  headlinePurple,
  packagesTitle,
  floatingBadge,
  extra,
}: Props) {
  const href = `/services/it-services/${service.slug}`
  const spoke = getSpokeByHref(href)
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(serviceCrumbs("it", { name: service.name, href }))} />
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-brand-hero on-dark">

        <div className="container-page relative grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16 lg:py-24">
          {/* LEFT */}
          <div>
            <nav className="flex items-center gap-2 text-[12px] text-muted mb-4">
              <Link href="/" className="inline-block py-1 hover:text-accent transition-colors">
                Home
              </Link>
              <ChevronRight size={12} />
              <Link
                href="/services/it-services"
                className="inline-block py-1 hover:text-accent transition-colors"
              >
                IT &amp; AI Services
              </Link>
              <ChevronRight size={12} />
              <span className="text-muted">{service.name}</span>
            </nav>

            {/* Sub-brand first, service second — same pill as the IT landing
                page hero. The breadcrumb above stays "IT & AI Services"
                because that's navigation, not branding. */}
            <p className="eyebrow">
              {IT_BRAND} · {service.name}
            </p>

            <h1 className="mt-4">
              <span className="block text-white">{headlineWhite}</span>
              <span className="block text-brand-primary">{headlinePurple}</span>
            </h1>

            <p className="lead mt-5 max-w-[560px]">
              {service.longDescription}
              <HubLink spoke={spoke} />
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/services/it-services/quote" variant="primary" tone="dark">
                Get a Free Quote
              </Button>
              <Button href={SITE_PHONE_HREF} variant="secondary" tone="dark">
                Call {SITE_PHONE_LOCAL}
              </Button>
              <WhatsAppButton className="h-12 text-[15px]" />
            </div>
            {floatingBadge && (
              <p className="mt-5 flex items-center gap-2.5 text-[14px] text-muted">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#5dcaa5]" />
                <span>
                  <span className="font-semibold text-white">{floatingBadge.title}</span>
                  {" · "}
                  {floatingBadge.sub}
                </span>
              </p>
            )}
          </div>

          {/* RIGHT — image */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-img lg:aspect-[4/5]">
            <ImageWithFallback
              src={service.image}
              alt={service.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 440px"
              className="object-cover object-center"
              fallbackBg={service.iconBg}
              priority
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {service.features.map((f) => (
              <div key={f.title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint text-brand-primary">
                  <DynamicIcon name={f.icon} size={22} />
                </span>
                <h3 className="mt-4 text-ink">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-muted">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES GRID ── */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title={packagesTitle}
            subtitle="Fixed prices · No hidden costs"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
            {service.packages.map((pkg) => (
              <div
                key={pkg.id}
                className="card card-hover relative p-6 on-light"
              >
                {pkg.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold px-4 py-1 rounded-full">
                    {pkg.badge}
                  </span>
                )}

                <h3 className="text-ink">{pkg.name}</h3>
                <p className="text-muted text-[14px] mt-1">
                  {pkg.description}
                </p>

                <div className="text-[32px] font-bold text-accent mt-6">
                  {pkg.startingFromValue > 0 ? (
                    <Price
                      amount={pkg.startingFromValue}
                      category="it"
                      prefix="From "
                      className="text-[32px] font-bold text-accent"
                    />
                  ) : (
                    pkg.startingFrom
                  )}
                </div>

                <div className="w-full h-px bg-line my-6" />

                <ul className="flex flex-col gap-3">
                  {pkg.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#e1f5ee] flex-shrink-0 mt-0.5 flex items-center justify-center">
                        <Check size={12} className="text-[#0f6e56]" />
                      </span>
                      <span className="text-[13px] text-[#1a1a2e] leading-snug">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/services/it-services/quote"
                  className="flex items-center justify-center w-full mt-8 bg-brand-primary text-white rounded-btn h-12 font-semibold hover:bg-brand-hover transition-all"
                >
                  Get a Quote
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── optional extra section ── */}
      {extra}

      {/* ── PROCESS ── */}
      <section className="bg-white py-14 lg:py-20 on-light">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="The process" title="How We Work" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {service.process.map((p) => (
              <div key={p.step}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint font-heading text-[16px] font-bold text-accent">
                  {p.step}
                </span>
                <h3 className="mt-4 text-ink">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-muted">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGIES ── */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Technologies We Use" />
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {service.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-line bg-white px-4 py-2 text-[14px] font-medium text-ink on-light"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <RelatedServices spoke={spoke} />

      <QuoteCTABanner href={hubs.it.quoteHref} showWhatsApp />
    </>
  )
}
