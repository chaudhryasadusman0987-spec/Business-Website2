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
  /** Factory variant / trim code, e.g. "AVV50R Atara SL Sedan". */
  variant: string
  /** "Petrol", "Diesel", "Petrol / Electric Hybrid"… */
  fuelType: string
  /** Engine description, e.g. "2.5L 4 Cylinder". */
  engine: string
  /** "CVT Auto", "6 Speed Auto", "5 Speed Manual"… */
  transmission: string
  seats: number
  /** Colours this car can be supplied in. Drawn as swatches — see colourHex. */
  colours: string[]
  createdAt?: string
}

/** Dropdown options for the dashboard's specification fields. */
export const FUEL_TYPES = [
  "Petrol",
  "Diesel",
  "Petrol / Electric Hybrid",
  "Plug-in Hybrid",
  "Electric",
  "LPG",
]

export const TRANSMISSIONS = [
  "CVT Auto",
  "4 Speed Auto",
  "5 Speed Auto",
  "6 Speed Auto",
  "7 Speed Auto",
  "8 Speed Auto",
  "5 Speed Manual",
  "6 Speed Manual",
]

export const SEAT_OPTIONS = [2, 4, 5, 7, 8]

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
    variant: "",
    fuelType: "Petrol",
    engine: "",
    transmission: "",
    seats: 5,
    colours: [],
  }
}

/**
 * Colours are typed into one comma-separated box in the dashboard — an admin
 * adding a car should not have to manage a list widget. Blanks are dropped and
 * duplicates collapse, so "White, , white" saves as one entry.
 */
export function parseColours(input: string): string[] {
  const out: string[] = []
  for (const part of input.split(",")) {
    const s = part.trim()
    if (s && !out.some((c) => c.toLowerCase() === s.toLowerCase())) out.push(s)
  }
  return out
}

/** The stored list rendered back into that same box. */
export function formatColours(colours: string[]): string {
  return colours.join(", ")
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
