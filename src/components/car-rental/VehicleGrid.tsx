"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import VehicleModal from "@/components/car-rental/VehicleModal"
import {
  isBookable,
  vehicleAlt,
  vehicleSpecLine,
  type RentalVehicle,
} from "@/lib/vehicles"
import { getColourHex } from "@/lib/colourHex"

// The fleet lives in the database and is managed from the dashboard's Car
// Rental tab, so this fetches rather than importing a static list — a car added
// in the dashboard appears here on the next page load, with no redeploy.
//
// The listing asks for ?light=1 (no photo galleries): dashboard uploads are
// stored inline as data URLs, and pulling every car's full gallery just to
// render thumbnails would grow the payload with every vehicle added. The one
// car the visitor opens is then fetched in full by the modal.

// Which vehicle is open, and which step of the modal it opened on: clicking the
// card browses the photos, "Get on Rent" skips straight to the application.
interface OpenState {
  vehicle: RentalVehicle
  view: "details" | "apply" | "offer"
}

/**
 * Scroll-in animation for a card, except above-the-fold cards: AnimateIn keeps
 * its content at opacity 0 until hydration, which would hold back the LCP
 * photo that the server already rendered.
 */
function CardReveal({
  eager,
  delay,
  children,
}: {
  eager: boolean
  delay: number
  children: React.ReactNode
}) {
  if (eager) return <div className="flex">{children}</div>
  return (
    <AnimateIn animation="fade-up" delay={delay} className="flex">
      {children}
    </AnimateIn>
  )
}

export default function VehicleGrid({
  title = "The fleet",
  intro = "Every car below is on the yard right now. Open one for the photos and the specs, or go straight to the application.",
  initialVehicles,
  priorityImages = 0,
}: {
  title?: string
  intro?: string
  /**
   * The public fleet, read on the server. When given, the cards are in the
   * first HTML (crawlable, no fetch waterfall before the photos can load) and
   * the client fetch is skipped. Null/undefined falls back to fetching.
   */
  initialVehicles?: RentalVehicle[] | null
  /** How many leading card photos to load eagerly (above the fold). */
  priorityImages?: number
}) {
  const [vehicles, setVehicles] = useState<RentalVehicle[]>(initialVehicles ?? [])
  const [loading, setLoading] = useState(!initialVehicles)
  const [open, setOpen] = useState<OpenState | null>(null)

  useEffect(() => {
    if (initialVehicles) return
    let cancelled = false
    fetch("/api/vehicles?light=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setVehicles(Array.isArray(data.vehicles) ? data.vehicles : [])
      })
      .catch(() => {
        /* leave the list empty — the empty state explains it */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [initialVehicles])

  // Open immediately with the light record so the modal paints at once, then
  // swap in the full one (galleries included) when it lands.
  const openVehicle = useCallback(
    (vehicle: RentalVehicle, view: "details" | "apply" | "offer") => {
      setOpen({ vehicle, view })
      fetch(`/api/vehicles?id=${encodeURIComponent(vehicle.id)}`, {
        cache: "no-store",
      })
        .then((r) => r.json())
        .then((data) => {
          const full = data.vehicle as RentalVehicle | null
          if (!full) return
          setOpen((cur) =>
            cur && cur.vehicle.id === full.id ? { ...cur, vehicle: full } : cur,
          )
        })
        .catch(() => {
          /* keep the light record — the main photo still shows */
        })
    },
    [],
  )

  return (
    <section id="vehicles" className="bg-[#f5f5f8] scroll-mt-20 py-14 lg:py-20">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimateIn animation="fade-up">
          <div className="text-center max-w-[560px] mx-auto mb-12">
            <h2 className="text-[#1a1a2e]">
              {title}
            </h2>
            <p className="text-muted text-[15px] mt-3">{intro}</p>
          </div>
        </AnimateIn>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-card border border-line overflow-hidden animate-pulse on-light"
              >
                <div className="h-[160px] bg-[#eeeef6]" />
                <div className="p-4">
                  <div className="h-3 w-3/4 bg-[#eeeef6] rounded" />
                  <div className="h-2.5 w-1/2 bg-[#f2f2f8] rounded mt-2.5" />
                  <div className="h-[40px] bg-[#f2f2f8] rounded-[8px] mt-6" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <p className="text-center text-muted text-[15px] py-10">
            Our fleet listing is being updated right now — give us a call and
            we&apos;ll tell you exactly what&apos;s available.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {vehicles.map((vehicle, i) => {
              // Coming-soon cars are listed but cannot be opened, priced or
              // booked — the card points at the contact page instead.
              const bookable = isBookable(vehicle)
              return (
              // Stagger across each row of four, then restart — the whole grid
              // reveals in waves instead of one long queue.
              <CardReveal
                key={vehicle.id}
                eager={i < priorityImages}
                delay={(i % 4) * 100}
              >
                <div
                  {...(bookable
                    ? {
                        role: "button",
                        tabIndex: 0,
                        onClick: () => openVehicle(vehicle, "details"),
                        onKeyDown: (e: React.KeyboardEvent) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            openVehicle(vehicle, "details")
                          }
                        },
                        "aria-label": `${vehicle.name} — view details`,
                      }
                    : {})}
                  className={`group w-full flex flex-col bg-white rounded-card overflow-hidden border border-line transition-all duration-300 ${
                    bookable
                      ? "cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 hover:border-[#d6d8f5]"
                      : ""
                  } on-light`}
                >
                  <div className="h-[160px] relative bg-surface overflow-hidden on-light">
                    <ImageWithFallback
                      src={vehicle.image}
                      alt={vehicleAlt(vehicle)}
                      fill
                      className="object-cover transition-transform duration-200"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 280px"
                      priority={i < priorityImages}
                      fallbackIcon="Car"
                      fallbackBg="#f0f0ff"
                      placeholderText="Photo coming soon"
                    />
                    {!bookable && (
                      <span className="absolute top-3 left-3 bg-brand-navy text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow on-dark">
                        Coming soon
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[14px] text-[#1a1a2e] leading-snug">
                      {vehicle.name}
                    </h3>
                    {vehicle.rego && (
                      <p className="text-[11px] text-muted mt-0.5">
                        Rego: {vehicle.rego}
                      </p>
                    )}
                    <p className="text-[11px] text-muted mt-1">
                      {vehicleSpecLine(vehicle)}
                    </p>

                    {/* Colour options at a glance — the modal names them. */}
                    {vehicle.colours.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {vehicle.colours.slice(0, 5).map((colour) => (
                          <span
                            key={colour}
                            title={colour}
                            className="w-4 h-4 rounded-full border border-[#e0e0e0] flex-shrink-0"
                            style={{ background: getColourHex(colour) }}
                          />
                        ))}
                        {vehicle.colours.length > 5 && (
                          <span className="text-[10px] text-muted self-center">
                            +{vehicle.colours.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Weekly rate is the headline number — it is what the
                        owner sets in the dashboard. 0 means "not published". */}
                    {bookable && (
                    <div className="mt-3">
                      {vehicle.weeklyRate > 0 ? (
                        <p className="text-[#1a1a2e]">
                          <span className="font-bold text-[20px] text-accent">
                            ${vehicle.weeklyRate.toLocaleString("en-AU")}
                          </span>
                          <span className="text-[12px] text-muted ml-1">
                            per week
                          </span>
                        </p>
                      ) : (
                        <p className="text-[13px] font-semibold text-muted">
                          Ask us for the weekly rate
                        </p>
                      )}
                      {/* Deliberately a real button, not a small text link — the
                          negotiation option needs to be impossible to miss. */}
                      {vehicle.weeklyRate > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openVehicle(vehicle, "offer")
                          }}
                          className="flex items-center gap-1.5 mt-2 text-[12px] font-semibold text-accent hover:text-[#6b71f0] transition-colors"
                        >
                          <span className="text-[14px]">💬</span>
                          Make an offer
                        </button>
                      )}
                    </div>
                    )}

                    {bookable ? (
                    <div className="mt-auto pt-4 border-t border-line flex flex-col gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openVehicle(vehicle, "apply")
                        }}
                        className="w-full bg-brand-primary text-white rounded-[8px] h-[40px] font-bold text-[12px] uppercase tracking-wider hover:bg-brand-hover transition-colors"
                      >
                        Get on Rent
                      </button>
                      <span className="text-[12px] text-accent font-semibold flex items-center justify-center gap-1.5">
                        View details
                        <ArrowRight
                          size={13}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                    ) : (
                    <div className="mt-auto pt-4 border-t border-line flex flex-col gap-2.5">
                      <button
                        type="button"
                        disabled
                        className="w-full bg-line text-muted rounded-[8px] h-[40px] font-bold text-[12px] uppercase tracking-wider cursor-not-allowed"
                      >
                        Get on Rent
                      </button>
                      <Link
                        href="/contact"
                        className="text-[12px] text-accent font-semibold flex items-center justify-center gap-1.5 hover:text-[#6b71f0]"
                      >
                        Register interest
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                    )}
                  </div>
                </div>
              </CardReveal>
              )
            })}
          </div>
        )}
      </div>

      {open && (
        <VehicleModal
          vehicle={open.vehicle}
          initialView={open.view === "offer" ? "details" : open.view}
          openToOffer={open.view === "offer"}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  )
}
