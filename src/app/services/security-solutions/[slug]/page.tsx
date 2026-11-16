import type { Metadata } from "next"
import JsonLd, { serviceJsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import DbProductsGrid from "@/components/sections/DbProductsGrid"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import PackagesGrid from "@/components/sections/PackagesGrid"
import { securitySolutions, installFee } from "@/data/security-solutions"
import { SECURITY_BRAND } from "@/data/site"
import { formatAUD } from "@/lib/formatters"
import { HubLink, RelatedServices } from "@/components/seo/InternalLinks"
import { getSpokeByHref } from "@/data/internal-links"
import { getProducts } from "@/lib/db"
import type { Product } from "@/lib/products"
import { withSocial } from "@/lib/seo"
import { AccessControlIntro, AccessControlMore } from "@/components/sections/AccessControlDetail"

// Rendered per request: the product grid is read from Postgres on the server so
// it is in the HTML (no client "Loading products…"), and dashboard edits show
// on the next page load. Explicit, because the try/catch in loadProducts would
// otherwise swallow the dynamic-usage signal during the build and freeze an
// empty list into a static page.
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

async function loadProducts(slug: string): Promise<Product[]> {
  try {
    return await getProducts(slug)
  } catch (err) {
    console.error("Solution page products read failed:", slug, err)
    return []
  }
}

// Title / H1 overrides per solution, keyed by slug. Unlisted slugs use the
// solution name.
const pageTitles: Record<string, string> = {
  "access-control": `Access Control Systems Brisbane — Prices & Installation | ${SECURITY_BRAND}`,
}
const pageH1s: Record<string, string> = {
  "access-control": "Access Control Systems in Brisbane & Southeast QLD",
}

// Brisbane-specific meta descriptions per solution, keyed by slug. Overrides the
// generic solution.description for SEO; unlisted slugs fall back to the data.
const metaDescriptions: Record<string, string> = {
  "surveillance-evidence":
    "CCTV and surveillance camera installation Brisbane. HD recording, remote " +
    "smartphone access, motion detection. Free quote. Licensed installers.",
  deterrence:
    "Alarm systems and security deterrence installed in Brisbane & Southeast " +
    "QLD. Sirens, motion sensors, floodlights. Free site assessment. Licensed " +
    "team.",
  "commercial-security":
    "Commercial security systems Brisbane. CCTV, NVR, thermal cameras for " +
    "offices, retail and warehouses. Free assessment. Enterprise-grade " +
    "installation.",
  "access-control":
    "Access control installation in Brisbane: keypads, key fobs and phone " +
    "access for homes and businesses. Free quote and site assessment.",
  "smoke-alarms":
    "Smoke alarm installation Brisbane. AS3786 compliant photoelectric alarms. " +
    "Hardwired and wireless systems. Licensed installers. Free quote.",
  intercoms:
    "Video intercom installation Brisbane. Homes, apartments, commercial " +
    "buildings. Smartphone integration. Free quote. Professional installation.",
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const solution = securitySolutions.find((s) => s.slug === params.slug)
  if (!solution) return {}
  return withSocial({
    // `absolute` so the root `%s | Pak Oz Solutions` template doesn't override
    // the security sub-brand.
    title: { absolute: pageTitles[params.slug] ?? `${solution.name} | ${SECURITY_BRAND}` },
    description:
      metaDescriptions[params.slug] ??
      `${solution.description} — ${SECURITY_BRAND}, Brisbane.`,
    alternates: { canonical: `/services/security-solutions/${solution.slug}` },
  })
}

export default async function SolutionDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const solution = securitySolutions.find((s) => s.slug === params.slug)
  if (!solution) notFound()

  const contain = solution.heroImageFit !== "cover"
  const spoke = getSpokeByHref(`/services/security-solutions/${solution.slug}`)
  const products = await loadProducts(solution.slug)
  const isAccess = solution.slug === "access-control"

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: solution.name,
          serviceType: "Security system installation",
          description: solution.description,
          path: `/services/security-solutions/${solution.slug}`,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          ["Home", "/"],
          ["Security Solutions", "/services/security-solutions"],
          [solution.name, `/services/security-solutions/${solution.slug}`],
        ])}
      />
      {/* HERO STRIP */}
      <section className="bg-brand-hero relative overflow-hidden on-dark">
        <div className="container-page relative grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16 lg:py-24">
          {/* Left col — text */}
          <div>
            <nav className="text-[12px] text-muted mb-4 flex items-center gap-2">
              <Link href="/" className="inline-flex min-h-[44px] items-center hover:text-accent transition-colors">
                Home
              </Link>
              <ChevronRight size={12} />
              <Link
                href="/services/security-solutions"
                className="inline-flex min-h-[44px] items-center hover:text-accent transition-colors"
              >
                Security Solutions
              </Link>
              <ChevronRight size={12} />
              <span className="text-muted">{solution.name}</span>
            </nav>

            <h1 className="text-white">
              {pageH1s[solution.slug] ?? solution.name}
            </h1>
            <p className="mt-3 font-heading text-[1.25rem] font-semibold text-brand-primary">
              {solution.tagline}
            </p>
            <p className="lead mt-4 max-w-[560px]">
              {solution.longDescription}
              <HubLink spoke={spoke} />
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-8">
              <Link
                href="/services/security-solutions/quote"
                className="inline-flex items-center justify-center bg-brand-primary text-white rounded-btn text-[15px] font-semibold h-12 px-6 hover:bg-brand-hover transition-colors duration-200"
              >
                Get a Quote
              </Link>
              {/* Only link to sections that are actually on the page. */}
              {(products.length > 0 || isAccess) && (
                <a
                  href={products.length > 0 ? "#products" : "#pricing"}
                  className="inline-flex items-center justify-center border border-white/40 text-white rounded-btn text-[15px] font-semibold h-12 px-6 hover:border-white hover:bg-white/10 transition-colors duration-200"
                >
                  {products.length > 0 ? "View Products" : "See Prices"}
                </a>
              )}
            </div>
            {products.length > 0 && (
              <p className="mt-5 flex items-center gap-2.5 text-[14px] text-muted">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#5dcaa5]" />
                {products.length} {products.length === 1 ? "product" : "products"} available
              </p>
            )}
          </div>

          {/* Right col — solution hero image */}
          <div>
            {/* Product-cutout images sit on a white panel and are letterboxed
                rather than cropped; scene photos still fill the frame. */}
            <div
              className={`relative aspect-[16/10] w-full overflow-hidden rounded-img lg:aspect-[4/5] ${
                contain ? "bg-white on-light" : ""
              }`}
            >
              <ImageWithFallback
                src={solution.heroImage}
                alt={solution.heroImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 440px"
                className={`${
                  contain ? "object-contain p-8" : "object-cover"
                } object-center`}
                fallbackBg={solution.iconBg}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {isAccess && <AccessControlIntro />}

      {/* PRODUCTS GRID — hidden entirely when the solution has no products */}
      {products.length > 0 && (
      <section id="products" className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <PackagesGrid slug={solution.slug} />

          <SectionTitle
            title={`${solution.name} Products`}
            subtitle={`All prices per unit · Installation from ${formatAUD(
              installFee
            )} · GST additional`}
          />

          {/* Read from Postgres on the server (loadProducts above). */}
          <DbProductsGrid products={products} solutionId={solution.id} />

          <div className="bg-surface border border-line rounded-card p-5 text-center max-w-[600px] mx-auto mt-14 on-light">
            <p className="text-[14px] text-[#4a4a6a]">
              Prices shown per unit · Installation from {formatAUD(installFee)} ·
              GST added at checkout · Free site assessment available
            </p>
          </div>
        </div>
      </section>
      )}

      {isAccess && <AccessControlMore />}

      <RelatedServices
        spoke={spoke}
        ctaLabel={isAccess ? "Get a free access control quote" : undefined}
      />

      <QuoteCTABanner href="/services/security-solutions/quote" />
    </>
  )
}
