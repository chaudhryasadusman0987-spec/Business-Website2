// Shared rental-vehicle model for the Postgres-backed fleet. SAFE for both
// client and server (no node imports) — only types and pure helpers live here.
//
// The fleet powers the public car rental pages (/services/car-rental and
// /services/car-rental/vehicles) and the dashboard "Car Rental" tab. Reads go
// through /api/vehicles, writes through /api/dashboard/update (type: "vehicle"),
// both of which use the server-only db.ts. Adding a car is therefore a dashboard
// action — no code change and no redeploy.

export interface RentalVehicle {
  id: string
  /** Headline shown on the card, e.g. "2016 Toyota Camry Hybrid". */
  name: string
  year: number
  make: string
  model: string
  /** Body style — "Hatchback", "SUV", "Ute"… */
  type: string
  rego: string
  /** Main photo on the listing card. An https URL or an inline data URL. */
  image: string
  /** Extra gallery photos for the detail modal. */
  images: string[]
  imageAlt: string
  /** Weekly hire price in AUD. 0 means "not published" — see hasWeeklyRate. */
  weeklyRate: number
  /** Security bond in AUD, refunded at the end. 0 hides the row. */
  bond: number
  available: boolean
  /** Manual display order, lowest first. Ties break on createdAt. */
  sortOrder: number
  createdAt?: string
}

/** Shape the add/edit forms collect — `id` is assigned server-side on create. */
export type VehicleInput = Omit<RentalVehicle, "id" | "createdAt">

export function blankVehicleInput(): VehicleInput {
  return {
    name: "",
    year: new Date().getFullYear(),
    make: "",
    model: "",
    type: "",
    rego: "",
    image: "",
    images: [],
    imageAlt: "",
    weeklyRate: 0,
    bond: 0,
    available: true,
    sortOrder: 0,
  }
}

/**
 * Photos for the gallery: the main image first, then the extras, with blanks
 * and duplicates dropped. The admin usually re-picks the main photo as the
 * first gallery shot, so de-duplicating stops it appearing twice.
 */
export function galleryImages(v: RentalVehicle): string[] {
  const out: string[] = []
  for (const src of [v.image, ...v.images]) {
    const s = src?.trim()
    if (s && !out.includes(s)) out.push(s)
  }
  return out
}

/**
 * True when a weekly rate is set. Rates start at 0 for a newly added car, and
 * showing "$0/week" would read as free — so the pages fall back to "Ask us"
 * until the admin fills it in.
 */
export function hasWeeklyRate(v: RentalVehicle): boolean {
  return v.weeklyRate > 0
}

/** Alt text that is never empty — falls back to the vehicle name. */
export function vehicleAlt(v: RentalVehicle): string {
  return v.imageAlt.trim() || v.name
}
