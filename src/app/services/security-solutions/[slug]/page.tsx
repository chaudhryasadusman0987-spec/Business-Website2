import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import SecurityProductCard from "@/components/sections/SecurityProductCard"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
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
        <div className="relative z-10 max-w-[1170px] mx-auto px-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
            {solution.products.map((product) => (
              <SecurityProductCard
                key={product.id}
                product={product}
                solution={solution}
              />
            ))}
          </div>

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
