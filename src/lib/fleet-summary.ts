// Server-only fleet numbers for the car rental landing pages: the live weekly
// price range and the cars that suit rideshare. Reads the same Postgres fleet
// the dashboard manages, so a rate change there shows on the next page load.

import { cache } from "react"
import { getVehiclesLight } from "@/lib/db"
import { hasWeeklyRate, isBookable, isListed, toPublicVehicle, type RentalVehicle } from "@/lib/vehicles"

export interface FleetSummary {
  /** Lowest and highest published weekly rate across bookable cars (AUD). */
  minWeekly: number
  maxWeekly: number
  /** Bookable cars with a published rate. */
  bookable: number
  /** Bookable sedans, hatchbacks and SUVs with 5+ seats, cheapest first. */
  rideshare: RentalVehicle[]
}

// Body styles that can carry four passengers in comfort. Utes and vans are
// left out: Uber and DiDi generally won't accept them for standard trips.
const RIDESHARE_BODY = /sedan|hatch|hybrid|suv|wagon/i

export function suitsRideshare(v: RentalVehicle): boolean {
  return RIDESHARE_BODY.test(v.type) && v.seats >= 5
}

/**
 * Null when the database is unreachable or no car has a rate yet. Wrapped in
 * React cache so generateMetadata and the page share one query per request.
 */
export const getFleetSummary = cache(async (): Promise<FleetSummary | null> => {
  let all: RentalVehicle[]
  try {
    all = await getVehiclesLight()
  } catch {
    return null
  }
  const priced = all.filter((v) => isBookable(v) && hasWeeklyRate(v))
  if (priced.length === 0) return null
  const rates = priced.map((v) => v.weeklyRate)
  return {
    minWeekly: Math.min(...rates),
    maxWeekly: Math.max(...rates),
    bookable: priced.length,
    rideshare: priced
      .filter(suitsRideshare)
      .sort((a, b) => a.weeklyRate - b.weeklyRate || b.year - a.year)
      .map(toPublicVehicle),
  }
})

/** "$180–$300" */
export function weeklyRange(s: Pick<FleetSummary, "minWeekly" | "maxWeekly">): string {
  const f = (n: number) => `$${n.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`
  return s.minWeekly === s.maxWeekly ? f(s.minWeekly) : `${f(s.minWeekly)}–${f(s.maxWeekly)}`
}

/**
 * The public fleet for server-rendering VehicleGrid: listed cars, rego
 * blanked, no gallery, main photo as a cacheable URL. Null when the database
 * is unreachable, so the grid falls back to fetching on the client.
 */
export const getPublicFleet = cache(async (): Promise<RentalVehicle[] | null> => {
  try {
    return (await getVehiclesLight()).filter(isListed).map(toPublicVehicle)
  } catch {
    return null
  }
})
