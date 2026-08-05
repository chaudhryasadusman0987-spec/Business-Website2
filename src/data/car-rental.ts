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

// ============================================================
//  PAK OZ RENTALS — long-term fleet (weekly hire, 4 week min)
//  Separate from the daily-rate `vehicles` catalog above: these
//  are the 16 real cars on the yard, listed by rego.
// ============================================================

export interface RentalVehicle {
  id: string
  number: number
  name: string
  year: number
  make: string
  model: string
  type: string
  rego: string
  // Main image shown on listing card
  image: string
  // Additional images shown in detail modal
  // Owner adds these filenames after
  // uploading to public/images/vehicles/
  images: string[]
  imageAlt: string
  weeklyRate: number
  bond: number
  available: boolean
}

export const rentalVehicles: RentalVehicle[] = [
  {
    id: "v1", number: 1,
    name: "2013 Toyota Prius Hatchback",
    year: 2013, make: "Toyota",
    model: "Prius", type: "Hatchback",
    rego: "346WSI",
    image: "/images/vehicles/v1-main.jpg",
    images: [
      "/images/vehicles/v1-main.jpg",
      "/images/vehicles/v1-front.jpg",
      "/images/vehicles/v1-interior.jpg",
      "/images/vehicles/v1-rear.jpg",
    ],
    imageAlt: "2013 Toyota Prius Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v2", number: 2,
    name: "2016 Ford Kuga",
    year: 2016, make: "Ford",
    model: "Kuga", type: "SUV",
    rego: "260QK8",
    image: "/images/vehicles/v2-main.jpg",
    images: [
      "/images/vehicles/v2-main.jpg",
      "/images/vehicles/v2-front.jpg",
      "/images/vehicles/v2-interior.jpg",
      "/images/vehicles/v2-rear.jpg",
    ],
    imageAlt: "2016 Ford Kuga SUV",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v3", number: 3,
    name: "2008 Suzuki Swift Hatchback",
    year: 2008, make: "Suzuki",
    model: "Swift", type: "Hatchback",
    rego: "290QT9",
    image: "/images/vehicles/v3-main.jpg",
    images: [
      "/images/vehicles/v3-main.jpg",
      "/images/vehicles/v3-front.jpg",
      "/images/vehicles/v3-interior.jpg",
      "/images/vehicles/v3-rear.jpg",
    ],
    imageAlt: "2008 Suzuki Swift Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v4", number: 4,
    name: "2010 Honda Jazz Hatchback",
    year: 2010, make: "Honda",
    model: "Jazz", type: "Hatchback",
    rego: "003QR8",
    image: "/images/vehicles/v4-main.jpg",
    images: [
      "/images/vehicles/v4-main.jpg",
      "/images/vehicles/v4-front.jpg",
      "/images/vehicles/v4-interior.jpg",
      "/images/vehicles/v4-rear.jpg",
    ],
    imageAlt: "2010 Honda Jazz Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v5", number: 5,
    name: "2004 Toyota Prius Hatchback",
    year: 2004, make: "Toyota",
    model: "Prius", type: "Hatchback",
    rego: "093OR8",
    image: "/images/vehicles/v5-main.jpg",
    images: [
      "/images/vehicles/v5-main.jpg",
      "/images/vehicles/v5-front.jpg",
      "/images/vehicles/v5-interior.jpg",
      "/images/vehicles/v5-rear.jpg",
    ],
    imageAlt: "2004 Toyota Prius Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v6", number: 6,
    name: "2013 Nissan Pulsar",
    year: 2013, make: "Nissan",
    model: "Pulsar", type: "Sedan",
    rego: "735ZQW",
    image: "/images/vehicles/v6-main.jpg",
    images: [
      "/images/vehicles/v6-main.jpg",
      "/images/vehicles/v6-front.jpg",
      "/images/vehicles/v6-interior.jpg",
      "/images/vehicles/v6-rear.jpg",
    ],
    imageAlt: "2013 Nissan Pulsar Sedan",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v7", number: 7,
    name: "2007 Toyota Yaris Hatchback",
    year: 2007, make: "Toyota",
    model: "Yaris", type: "Hatchback",
    rego: "626NN6",
    image: "/images/vehicles/v7-main.jpg",
    images: [
      "/images/vehicles/v7-main.jpg",
      "/images/vehicles/v7-front.jpg",
      "/images/vehicles/v7-interior.jpg",
      "/images/vehicles/v7-rear.jpg",
    ],
    imageAlt: "2007 Toyota Yaris Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v8", number: 8,
    name: "2007 Toyota Prius",
    year: 2007, make: "Toyota",
    model: "Prius", type: "Hybrid",
    rego: "976QP2",
    image: "/images/vehicles/v8-main.jpg",
    images: [
      "/images/vehicles/v8-main.jpg",
      "/images/vehicles/v8-front.jpg",
      "/images/vehicles/v8-interior.jpg",
      "/images/vehicles/v8-rear.jpg",
    ],
    imageAlt: "2007 Toyota Prius Hybrid",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v9", number: 9,
    name: "2016 Toyota Camry Hybrid",
    year: 2016, make: "Toyota",
    model: "Camry", type: "Hybrid Sedan",
    rego: "046QH5",
    image: "/images/vehicles/v9-main.jpg",
    images: [
      "/images/vehicles/v9-main.jpg",
      "/images/vehicles/v9-front.jpg",
      "/images/vehicles/v9-interior.jpg",
      "/images/vehicles/v9-rear.jpg",
    ],
    imageAlt: "2016 Toyota Camry Hybrid",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v10", number: 10,
    name: "2013 Toyota Camry Sedan",
    year: 2013, make: "Toyota",
    model: "Camry", type: "Sedan",
    rego: "997QG5",
    image: "/images/vehicles/v10-main.jpg",
    images: [
      "/images/vehicles/v10-main.jpg",
      "/images/vehicles/v10-front.jpg",
      "/images/vehicles/v10-interior.jpg",
      "/images/vehicles/v10-rear.jpg",
    ],
    imageAlt: "2013 Toyota Camry Sedan",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v11", number: 11,
    name: "2016 Toyota Camry Hybrid",
    year: 2016, make: "Toyota",
    model: "Camry", type: "Hybrid Sedan",
    rego: "450PO8",
    image: "/images/vehicles/v11-main.jpg",
    images: [
      "/images/vehicles/v11-main.jpg",
      "/images/vehicles/v11-front.jpg",
      "/images/vehicles/v11-interior.jpg",
      "/images/vehicles/v11-rear.jpg",
    ],
    imageAlt: "2016 Toyota Camry Hybrid",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v12", number: 12,
    name: "2007 Toyota Yaris Hatchback",
    year: 2007, make: "Toyota",
    model: "Yaris", type: "Hatchback",
    rego: "483EH5",
    image: "/images/vehicles/v12-main.jpg",
    images: [
      "/images/vehicles/v12-main.jpg",
      "/images/vehicles/v12-front.jpg",
      "/images/vehicles/v12-interior.jpg",
      "/images/vehicles/v12-rear.jpg",
    ],
    imageAlt: "2007 Toyota Yaris Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v13", number: 13,
    name: "2007 Honda Jazz Hatchback",
    year: 2007, make: "Honda",
    model: "Jazz", type: "Hatchback",
    rego: "004QR8",
    image: "/images/vehicles/v13-main.jpg",
    images: [
      "/images/vehicles/v13-main.jpg",
      "/images/vehicles/v13-front.jpg",
      "/images/vehicles/v13-interior.jpg",
      "/images/vehicles/v13-rear.jpg",
    ],
    imageAlt: "2007 Honda Jazz Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v14", number: 14,
    name: "2015 Toyota Camry Hybrid",
    year: 2015, make: "Toyota",
    model: "Camry", type: "Hybrid Sedan",
    rego: "070LM3",
    image: "/images/vehicles/v14-main.jpg",
    images: [
      "/images/vehicles/v14-main.jpg",
      "/images/vehicles/v14-front.jpg",
      "/images/vehicles/v14-interior.jpg",
      "/images/vehicles/v14-rear.jpg",
    ],
    imageAlt: "2015 Toyota Camry Hybrid",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v15", number: 15,
    name: "2008 Hyundai Getz",
    year: 2008, make: "Hyundai",
    model: "Getz", type: "Hatchback",
    rego: "343QF8",
    image: "/images/vehicles/v15-main.jpg",
    images: [
      "/images/vehicles/v15-main.jpg",
      "/images/vehicles/v15-front.jpg",
      "/images/vehicles/v15-interior.jpg",
      "/images/vehicles/v15-rear.jpg",
    ],
    imageAlt: "2008 Hyundai Getz",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v16", number: 16,
    name: "2017 Toyota HiLux",
    year: 2017, make: "Toyota",
    model: "HiLux", type: "Ute",
    rego: "816QU8",
    image: "/images/vehicles/v16-main.jpg",
    images: [
      "/images/vehicles/v16-main.jpg",
      "/images/vehicles/v16-front.jpg",
      "/images/vehicles/v16-interior.jpg",
      "/images/vehicles/v16-rear.jpg",
    ],
    imageAlt: "2017 Toyota HiLux Ute",
    weeklyRate: 0, bond: 0, available: true
  },
]

export const rentalTerms = {
  paymentCycle: "Weekly in advance",
  minimumRental: "4 weeks minimum",
  securityBond: "Refunded at end of rental",
  insuranceExcess: "$1,300 AUD",
  roadAssistance: "Included",
  maintenanceService: "Included",
}
