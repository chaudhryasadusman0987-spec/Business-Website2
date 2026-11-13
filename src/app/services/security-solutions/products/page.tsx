import type { Metadata } from "next"
import AllDbProductsGrid from "@/components/sections/AllDbProductsGrid"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { installFee } from "@/data/security-solutions"
import { formatAUD } from "@/lib/formatters"
import { Breadcrumbs, HubLink, RelatedServices } from "@/components/seo/InternalLinks"
import { getSpoke, serviceCrumbs } from "@/data/internal-links"

const spoke = getSpoke("products")

export const metadata: Metadata = {
  alternates: { canonical: "/services/security-solutions/products" },
  title: "All Security Products",
  description:
    "Browse every security product we supply and install across Australia — " +
    "cameras, alarms, access control, smoke alarms, intercoms and more.",
}

export default function AllProductsPage() {
  return (
    <>
      {/* HERO STRIP */}
      <section className="bg-brand-hero relative overflow-hidden on-dark py-16 lg:py-24">
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            crumbs={serviceCrumbs("security", { name: "All Products", href: "/services/security-solutions/products" })}
          />
          <h1 className="text-white">
            All Security Products
          </h1>
          <p className="text-[15px] text-muted mt-4 max-w-[600px]">
            Every product across all of our security solutions, grouped by
            category. Prices per unit · Installation from {formatAUD(installFee)}{" "}
            · GST additional.
            <HubLink spoke={spoke} />
          </p>
        </div>
      </section>

      {/* PRODUCTS BY SOLUTION (served from Postgres — see /api/products) */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <AllDbProductsGrid />
        </div>
      </section>

      <RelatedServices spoke={spoke} />

      <QuoteCTABanner href="/services/security-solutions/quote" />
    </>
  )
}
