import type { Metadata } from "next"
import AllDbProductsGrid from "@/components/sections/AllDbProductsGrid"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { installFee } from "@/data/security-solutions"
import { formatAUD } from "@/lib/formatters"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `All Security Products | ${SITE_FULL}`,
  description:
    "Browse every security product we supply and install across Australia — " +
    "cameras, alarms, access control, smoke alarms, intercoms and more.",
}

export default function AllProductsPage() {
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
          <h1 className="text-[40px] lg:text-[52px] font-extrabold text-white leading-[1.1]">
            All Security Products
          </h1>
          <p className="text-[15px] text-[#9496a8] mt-4 max-w-[600px]">
            Every product across all of our security solutions, grouped by
            category. Prices per unit · Installation from {formatAUD(installFee)}{" "}
            · GST additional.
          </p>
        </div>
      </section>

      {/* PRODUCTS BY SOLUTION (served from Postgres — see /api/products) */}
      <section className="bg-[#fefefd] pt-[80px] pb-[120px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <AllDbProductsGrid />
        </div>
      </section>

      <QuoteCTABanner href="/services/security-solutions/quote" />
    </>
  )
}
