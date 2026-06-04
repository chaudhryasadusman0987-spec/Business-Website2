// TODO(dashboard): replace with API call when admin is live

export interface Vehicle {
  id: string
  name: string
  example: string         // e.g. "MG3, Kia Rio or similar"
  icon: string            // emoji for display
  dailyRate: number
  weeklyRate: number
  bond: number            // security bond amount
  passengers: number
  features: string[]
  badge?: string          // e.g. "Most Popular"
  image: string           // path to vehicle image (e.g. /images/vehicles/economy.jpg)
  imageAlt: string        // SEO alt text for the vehicle image
  inStock: boolean
}

export interface CarRentalExtra {
  id: string
  name: string
  icon: string
  ratePerDay: number
  capAmount?: number      // max charge if capped
  description: string
  brisbaneNote?: string   // Brisbane-specific note
}

export interface LocationSurcharge {
  id: string
  name: string
  icon: string
  surcharge: number
  description: string
}

export const vehicles: Vehicle[] = [
  {
    id: "economy",
    name: "Economy",
    example: "MG3, Kia Rio or similar",
    icon: "🚗",
    dailyRate: 55,
    weeklyRate: 330,
    bond: 500,
    passengers: 5,
    features: ["Auto transmission", "Bluetooth", "USB charging", "Fuel efficient"],
    image: "/images/vehicles/economy.jpg",
    imageAlt: "Economy car rental Brisbane — MG3 or Kia Rio",
    inStock: true
  },
  {
    id: "compact-suv",
    name: "Compact SUV",
    example: "Kia Sportage or similar",
    icon: "🚙",
    dailyRate: 75,
    weeklyRate: 450,
    bond: 750,
    passengers: 5,
    features: ["Auto transmission", "Apple CarPlay", "Reverse camera", "Android Auto"],
    badge: "Most Popular",
    image: "/images/vehicles/compact-suv.jpg",
    imageAlt: "Compact SUV rental Brisbane — Kia Sportage",
    inStock: true
  },
  {
    id: "midsize",
    name: "Mid-size Sedan",
    example: "Toyota Camry or similar",
    icon: "🚘",
    dailyRate: 85,
    weeklyRate: 510,
    bond: 750,
    passengers: 5,
    features: ["Comfortable ride", "Large boot", "Apple CarPlay", "Cruise control"],
    image: "/images/vehicles/midsize.jpg",
    imageAlt: "Mid-size sedan rental Brisbane — Toyota Camry",
    inStock: true
  },
  {
    id: "large-suv",
    name: "Large SUV 7-Seat",
    example: "Kia Carnival or similar",
    icon: "🚐",
    dailyRate: 120,
    weeklyRate: 720,
    bond: 1000,
    passengers: 7,
    features: ["7 seats", "Large luggage space", "Entertainment system", "Ideal for families"],
    image: "/images/vehicles/large-suv.jpg",
    imageAlt: "7-seat large SUV rental Brisbane — Kia Carnival",
    inStock: true
  },
  {
    id: "van",
    name: "Van / Minibus",
    example: "Toyota HiAce or similar",
    icon: "🚌",
    dailyRate: 140,
    weeklyRate: 840,
    bond: 1000,
    passengers: 12,
    features: ["12 seats", "Large cargo space", "Ideal for groups", "Air conditioning"],
    image: "/images/vehicles/van.jpg",
    imageAlt: "Van minibus rental Brisbane — Toyota HiAce",
    inStock: true
  },
  {
    id: "luxury",
    name: "Luxury",
    example: "BMW 5 Series or Audi A6",
    icon: "🏎️",
    dailyRate: 250,
    weeklyRate: 1400,
    bond: 2000,
    passengers: 5,
    features: ["Premium interior", "Prestige brand", "Full tech suite", "Corporate use"],
    image: "/images/vehicles/luxury.jpg",
    imageAlt: "Luxury car rental Brisbane — BMW or Audi",
    inStock: true
  },
]

export const carExtras: CarRentalExtra[] = [
  {
    id: "linkt",
    name: "Linkt Toll Pass",
    icon: "🛣️",
    ratePerDay: 5.50,
    description: "Covers all Brisbane toll roads",
    brisbaneNote: "Covers Gateway Motorway, Logan Motorway, Airport Link, Clem7 Tunnel, Go Between Bridge"
  },
  {
    id: "cdw",
    name: "Super CDW Insurance",
    icon: "🛡️",
    ratePerDay: 28,
    description: "Reduces damage excess to $0. Strongly recommended."
  },
  {
    id: "childseat",
    name: "Child Seat (under 7)",
    icon: "👶",
    ratePerDay: 15,
    capAmount: 60,
    description: "QLD law requires child seat for children under 7 years"
  },
  {
    id: "booster",
    name: "Booster Seat (7–10 yrs)",
    icon: "🪑",
    ratePerDay: 10,
    capAmount: 40,
    description: "Recommended for children aged 7 to 10 years"
  },
  {
    id: "adddriver",
    name: "Additional Driver",
    icon: "👤",
    ratePerDay: 15,
    capAmount: 75,
    description: "Additional driver must be present at pick-up with valid licence"
  },
  {
    id: "gps",
    name: "GPS Navigation",
    icon: "🗺️",
    ratePerDay: 12,
    capAmount: 50,
    description: "Pre-loaded Queensland and Australia maps"
  },
]

export const locationSurcharges: LocationSurcharge[] = [
  {
    id: "cbd",
    name: "Brisbane CBD",
    icon: "🏙️",
    surcharge: 0,
    description: "No surcharge"
  },
  {
    id: "airport",
    name: "Brisbane Airport",
    icon: "✈️",
    surcharge: 25,
    description: "+$25 airport surcharge"
  },
  {
    id: "gold-coast",
    name: "Gold Coast Delivery",
    icon: "🌊",
    surcharge: 50,
    description: "+$50 delivery fee"
  },
  {
    id: "sunshine-coast",
    name: "Sunshine Coast Delivery",
    icon: "☀️",
    surcharge: 50,
    description: "+$50 delivery fee"
  },
]

export const youngDriverSurcharge = 25   // per day, age 21–24
export const oneWayFee            = 75   // different return location
export const gstRate              = 0.10
export const minRentalAge         = 21
