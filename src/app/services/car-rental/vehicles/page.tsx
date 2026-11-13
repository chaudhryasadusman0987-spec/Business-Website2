import type { Metadata } from "next"
import Link from "next/link"
import VehicleGrid from "@/components/car-rental/VehicleGrid"
import JsonLd, { breadcrumbJsonLd } from "@/components/seo/JsonLd"
import { HubLink, RelatedServices } from "@/components/seo/InternalLinks"
import { getSpoke, serviceCrumbs } from "@/data/internal-links"
import { RENTAL_BRAND } from "@/data/site"
import { getPublicFleet } from "@/lib/fleet-summary"

const spoke = getSpoke("fleet")

// Same database-backed fleet as /services/car-rental, on its own page with the
// full-fleet framing. There is one source of truth for vehicles now — the
// dashboard's Car Rental tab — so this page never drifts from the main one.
//
// The fleet is read on the server (photo data excluded) and rendered into the
// first HTML, so the first car photo, which is this page's LCP on mobile,
// starts loading straight away instead of after a client-side fetch.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  alternates: { canonical: "/services/car-rental/vehicles" },
  // Not "long-term car rental": that keyword belongs to /long-term.
  title: { absolute: `Rental Car Fleet Brisbane: Weekly Rates | ${RENTAL_BRAND}` },
  description:
    "The full Pak Oz Rentals fleet in Brisbane — weekly hire with a four-week " +
    "minimum. Roadside assistance, servicing and maintenance included.",
}

export default async function VehiclesPage() {
  const fleet = await getPublicFleet()
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          serviceCrumbs("car-rental", { name: "Vehicles", href: "/services/car-rental/vehicles" })
        )}
      />
      {/* HERO STRIP — dark */}
      <section className="relative overflow-hidden bg-brand-hero text-center on-dark py-16 lg:py-24">
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-[13px] text-muted mb-5">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/services/car-rental"
              className="hover:text-white transition-colors"
            >
              Car Rental
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">Vehicles</span>
          </nav>

          <h1 className="text-white">
            Our Vehicle Fleet
          </h1>
          <p className="text-[15px] text-muted mt-4 max-w-[480px] mx-auto leading-relaxed">
            Weekly hire, four-week minimum. Roadside assistance and servicing
            are included on every car.
            <HubLink spoke={spoke} />
          </p>
        </div>
      </section>

      {/* FLEET GRID — the same DB-backed list the main page shows */}
      <VehicleGrid
        title="Every car on the yard"
        intro="Open a car for its photos, specs and weekly rate, or go straight to the application."
        initialVehicles={fleet}
        priorityImages={2}
      />

      {/* BOND INFO BOX — continues the grid's background so the strip reads as
          part of the same section */}
      <section className="bg-[#f5f5f8] py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#e6f1fb] border border-[#90caf9] rounded-card p-6 max-w-[700px] mx-auto text-center text-[14px] text-[#185fa5] leading-relaxed">
            💳 The security bond is refunded at the end of the rental. Weekly
            rent is paid in advance and we confirm everything with you by phone
            before the first payment. Questions about a car?{" "}
            <Link href="/contact" className="font-semibold underline underline-offset-2 hover:text-[#0d4a80]">
              Send us a message
            </Link>
            .
          </div>
        </div>
      </section>

      <RelatedServices spoke={spoke} />
    </>
  )
}
