import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import SecurityProductsGrid from "@/components/sections/SecurityProductsGrid"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import { securitySolutions, installFee } from "@/data/security-solutions"
import { formatAUD } from "@/lib/formatters"
import { SITE_FULL } from "@/data/site"

export function generateStaticParams() {
  return securitySolutions.map((s) => ({ slug: s.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const solution = securitySolutions.find((s) => s.slug === params.slug)
  if (!solution) return {}
  return {
    title: `${solution.name} | ${SITE_FULL}`,
    description: solution.description,
  }
}

export default function SolutionDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const solution = securitySolutions.find((s) => s.slug === params.slug)
  if (!solution) notFound()

  return (
    <>
      {/* HERO STRIP */}
      <section className="bg-[#0d0d1a] py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="relative z-10 max-w-[1170px] mx-auto px-4 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left col — text */}
          <div className="flex-1">
            <nav className="text-[12px] text-[#666880] mb-4 flex items-center gap-2">
              <Link href="/" className="hover:text-[#7f85f7] transition-colors">
                Home
              </Link>
              <ChevronRight size={12} />
              <Link
                href="/services/security-solutions"
                className="hover:text-[#7f85f7] transition-colors"
              >
                Security Solutions
              </Link>
              <ChevronRight size={12} />
              <span className="text-[#9496a8]">{solution.name}</span>
            </nav>

            <h1 className="text-[40px] lg:text-[52px] font-extrabold text-white leading-[1.1]">
              {solution.name}
            </h1>
            <p className="text-[#7f85f7] text-[18px] font-medium mt-2">
              {solution.tagline}
            </p>
            <p className="text-[15px] text-[#9496a8] mt-4 max-w-[600px]">
              {solution.longDescription}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/services/security-solutions/quote"
                className="inline-flex items-center justify-center bg-[#7f85f7] text-white rounded-[5px] text-[15px] font-medium h-[52px] px-8 hover:opacity-90 transition-all duration-300"
              >
                Get a Quote
              </Link>
              <a
                href="#products"
                className="inline-flex items-center justify-center border border-[rgba(255,255,255,0.2)] text-white rounded-[5px] text-[15px] font-medium h-[52px] px-8 hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300"
              >
                View Products
              </a>
            </div>
          </div>

          {/* Right col — solution hero image */}
          <div className="lg:w-[45%] w-full">
            <div className="relative w-full h-[400px] lg:h-[480px] rounded-[24px] overflow-hidden">
              <ImageWithFallback
                src={solution.heroImage}
                alt={solution.heroImageAlt}
                fill
                className="object-cover object-center"
                fallbackBg={solution.iconBg}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              {/* Solution name overlay at bottom */}
              <div className="absolute bottom-5 left-5">
                <div className="inline-flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2">
                  <span className="w-2 h-2 rounded-full bg-[#5dcaa5] animate-pulse" />
                  <span className="text-white text-[12px] font-medium">
                    {solution.products.length} products available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section id="products" className="bg-[#fefefd] pt-[80px] pb-[120px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <SectionTitle
            title={`${solution.name} Products`}
            subtitle={`All prices per unit · Installation from ${formatAUD(
              installFee
            )} · GST additional`}
          />

          <SecurityProductsGrid
            solutionId={solution.id}
            initial={solution.products}
          />

          <div className="bg-[#f0f0ff] border border-[#e0e0ff] rounded-[16px] p-5 text-center max-w-[600px] mx-auto mt-14">
            <p className="text-[14px] text-[#4a4a6a]">
              Prices shown per unit · Installation from {formatAUD(installFee)} ·
              GST added at checkout · Free site assessment available
            </p>
          </div>
        </div>
      </section>

      <QuoteCTABanner href="/services/security-solutions/quote" />
    </>
  )
}
