// Car rental reference data.
//
// The FLEET itself no longer lives here — it is stored in Postgres and managed
// from the dashboard's Car Rental tab (see src/lib/vehicles.ts + src/lib/db.ts),
// so the owner can add cars, photos and weekly rates without a code change.
// `seedVehicles` below is only the first-run seed: /api/db/setup inserts these
// rows once, then the database is the source of truth and edits here are
// ignored. Everything else in this file is static reference data.

import type { RentalVehicle } from "@/lib/vehicles"

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
//  PAK OZ RENTALS — first-run fleet seed (weekly hire, 4 week min)
//
//  These are the 16 cars that were on the yard when the fleet moved to the
//  database. /api/db/setup inserts them with ON CONFLICT DO NOTHING, so the
//  seed runs once and never overwrites a dashboard edit. To add car 17, use
//  the dashboard — do NOT add it here.
//
//  Photo filenames key off the original vehicle number (v1…v16); weekly rates
//  and bonds seed at 0 and are filled in from the dashboard.
// ============================================================

export const seedVehicles: RentalVehicle[] = [
  {
    id: "v1", sortOrder: 1,
    name: "2013 Toyota Prius Hatchback",
    year: 2013, make: "Toyota",
    model: "Prius", type: "Hatchback",
    rego: "346WSI",
    variant: "ZVW30R Hatchback",
    fuelType: "Petrol / Electric Hybrid",
    engine: "1.8L 4 Cylinder",
    transmission: "CVT Auto",
    seats: 5,
    colours: ["Silver", "White", "Black", "Grey", "Blue"],
    image: "/images/vehicles/v1-main.jpg",
    images: [
      "/images/vehicles/v1-front.jpg",
      "/images/vehicles/v1-interior.jpg",
      "/images/vehicles/v1-rear.jpg",
    ],
    imageAlt: "2013 Toyota Prius Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v2", sortOrder: 2,
    name: "2016 Ford Kuga",
    year: 2016, make: "Ford",
    model: "Kuga", type: "SUV",
    rego: "260QK8",
    variant: "TF Titanium AWD SUV",
    fuelType: "Petrol",
    engine: "1.5L 4 Cylinder Turbo",
    transmission: "6 Speed Auto",
    seats: 5,
    colours: ["Grey", "Silver", "White", "Black", "Blue"],
    image: "/images/vehicles/v2-main.jpg",
    images: [
      "/images/vehicles/v2-front.jpg",
      "/images/vehicles/v2-interior.jpg",
      "/images/vehicles/v2-rear.jpg",
    ],
    imageAlt: "2016 Ford Kuga SUV",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v3", sortOrder: 3,
    name: "2008 Suzuki Swift Hatchback",
    year: 2008, make: "Suzuki",
    model: "Swift", type: "Hatchback",
    rego: "290QT9",
    variant: "RS415 Hatchback",
    fuelType: "Petrol",
    engine: "1.5L 4 Cylinder",
    transmission: "5 Speed Manual",
    seats: 5,
    colours: ["White", "Silver", "Red", "Blue", "Black"],
    image: "/images/vehicles/v3-main.jpg",
    images: [
      "/images/vehicles/v3-front.jpg",
      "/images/vehicles/v3-interior.jpg",
      "/images/vehicles/v3-rear.jpg",
    ],
    imageAlt: "2008 Suzuki Swift Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v4", sortOrder: 4,
    name: "2010 Honda Jazz Hatchback",
    year: 2010, make: "Honda",
    model: "Jazz", type: "Hatchback",
    rego: "003QR8",
    variant: "GE VTi Hatchback",
    fuelType: "Petrol",
    engine: "1.3L 4 Cylinder",
    transmission: "5 Speed Auto",
    seats: 5,
    colours: ["Silver", "White", "Red", "Blue", "Grey"],
    image: "/images/vehicles/v4-main.jpg",
    images: [
      "/images/vehicles/v4-front.jpg",
      "/images/vehicles/v4-interior.jpg",
      "/images/vehicles/v4-rear.jpg",
    ],
    imageAlt: "2010 Honda Jazz Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v5", sortOrder: 5,
    name: "2004 Toyota Prius Hatchback",
    year: 2004, make: "Toyota",
    model: "Prius", type: "Hatchback",
    rego: "093OR8",
    variant: "NHW20R Hatchback",
    fuelType: "Petrol / Electric Hybrid",
    engine: "1.5L 4 Cylinder",
    transmission: "CVT Auto",
    seats: 5,
    colours: ["White", "Silver", "Gold", "Grey", "Green"],
    image: "/images/vehicles/v5-main.jpg",
    images: [
      "/images/vehicles/v5-front.jpg",
      "/images/vehicles/v5-interior.jpg",
      "/images/vehicles/v5-rear.jpg",
    ],
    imageAlt: "2004 Toyota Prius Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v6", sortOrder: 6,
    name: "2013 Nissan Pulsar",
    year: 2013, make: "Nissan",
    model: "Pulsar", type: "Sedan",
    rego: "735ZQW",
    variant: "C12 ST Sedan",
    fuelType: "Petrol",
    engine: "1.8L 4 Cylinder",
    transmission: "6 Speed Auto",
    seats: 5,
    colours: ["Red", "White", "Silver", "Black", "Blue"],
    image: "/images/vehicles/v6-main.jpg",
    images: [
      "/images/vehicles/v6-front.jpg",
      "/images/vehicles/v6-interior.jpg",
      "/images/vehicles/v6-rear.jpg",
    ],
    imageAlt: "2013 Nissan Pulsar Sedan",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v7", sortOrder: 7,
    name: "2007 Toyota Yaris Hatchback",
    year: 2007, make: "Toyota",
    model: "Yaris", type: "Hatchback",
    rego: "626NN6",
    variant: "NCP90R Hatchback",
    fuelType: "Petrol",
    engine: "1.3L 4 Cylinder",
    transmission: "4 Speed Auto",
    seats: 5,
    colours: ["Blue", "White", "Silver", "Red", "Black"],
    image: "/images/vehicles/v7-main.jpg",
    images: [
      "/images/vehicles/v7-front.jpg",
      "/images/vehicles/v7-interior.jpg",
      "/images/vehicles/v7-rear.jpg",
    ],
    imageAlt: "2007 Toyota Yaris Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v8", sortOrder: 8,
    name: "2007 Toyota Prius",
    year: 2007, make: "Toyota",
    model: "Prius", type: "Hybrid",
    rego: "976QP2",
    variant: "NHW20R Hatchback",
    fuelType: "Petrol / Electric Hybrid",
    engine: "1.5L 4 Cylinder",
    transmission: "CVT Auto",
    seats: 5,
    colours: ["Gold", "Silver", "White", "Black", "Grey"],
    image: "/images/vehicles/v8-main.jpg",
    images: [
      "/images/vehicles/v8-front.jpg",
      "/images/vehicles/v8-interior.jpg",
      "/images/vehicles/v8-rear.jpg",
    ],
    imageAlt: "2007 Toyota Prius Hybrid",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v9", sortOrder: 9,
    name: "2016 Toyota Camry Hybrid",
    year: 2016, make: "Toyota",
    model: "Camry", type: "Hybrid Sedan",
    rego: "046QH5",
    variant: "AVV50R Atara SL Sedan",
    fuelType: "Petrol / Electric Hybrid",
    engine: "2.5L 4 Cylinder",
    transmission: "CVT Auto",
    seats: 5,
    colours: ["Black", "White", "Silver", "Grey", "Blue"],
    image: "/images/vehicles/v9-main.jpg",
    images: [
      "/images/vehicles/v9-front.jpg",
      "/images/vehicles/v9-interior.jpg",
      "/images/vehicles/v9-rear.jpg",
    ],
    imageAlt: "2016 Toyota Camry Hybrid",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v10", sortOrder: 10,
    name: "2013 Toyota Camry Sedan",
    year: 2013, make: "Toyota",
    model: "Camry", type: "Sedan",
    rego: "997QG5",
    variant: "ASV50R Atara S Sedan",
    fuelType: "Petrol",
    engine: "2.5L 4 Cylinder",
    transmission: "6 Speed Auto",
    seats: 5,
    colours: ["Dark Grey", "Silver", "White", "Black", "Bronze"],
    image: "/images/vehicles/v10-main.jpg",
    images: [
      "/images/vehicles/v10-front.jpg",
      "/images/vehicles/v10-interior.jpg",
      "/images/vehicles/v10-rear.jpg",
    ],
    imageAlt: "2013 Toyota Camry Sedan",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v11", sortOrder: 11,
    name: "2016 Toyota Camry Hybrid",
    year: 2016, make: "Toyota",
    model: "Camry", type: "Hybrid Sedan",
    rego: "450PO8",
    variant: "AVV50R Atara R Sedan",
    fuelType: "Petrol / Electric Hybrid",
    engine: "2.5L 4 Cylinder",
    transmission: "CVT Auto",
    seats: 5,
    colours: ["Pearl White", "Silver", "Black", "Grey", "Blue"],
    image: "/images/vehicles/v11-main.jpg",
    images: [
      "/images/vehicles/v11-front.jpg",
      "/images/vehicles/v11-interior.jpg",
      "/images/vehicles/v11-rear.jpg",
    ],
    imageAlt: "2016 Toyota Camry Hybrid",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v12", sortOrder: 12,
    name: "2007 Toyota Yaris Hatchback",
    year: 2007, make: "Toyota",
    model: "Yaris", type: "Hatchback",
    rego: "483EH5",
    variant: "NCP90R Hatchback",
    fuelType: "Petrol",
    engine: "1.3L 4 Cylinder",
    transmission: "4 Speed Auto",
    seats: 5,
    colours: ["Orange", "White", "Silver", "Red", "Blue"],
    image: "/images/vehicles/v12-main.jpg",
    images: [
      "/images/vehicles/v12-front.jpg",
      "/images/vehicles/v12-interior.jpg",
      "/images/vehicles/v12-rear.jpg",
    ],
    imageAlt: "2007 Toyota Yaris Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v13", sortOrder: 13,
    name: "2007 Honda Jazz Hatchback",
    year: 2007, make: "Honda",
    model: "Jazz", type: "Hatchback",
    rego: "004QR8",
    variant: "GD VTi Hatchback",
    fuelType: "Petrol",
    engine: "1.3L 4 Cylinder",
    transmission: "CVT Auto",
    seats: 5,
    colours: ["Green", "Silver", "White", "Blue", "Red"],
    image: "/images/vehicles/v13-main.jpg",
    images: [
      "/images/vehicles/v13-front.jpg",
      "/images/vehicles/v13-interior.jpg",
      "/images/vehicles/v13-rear.jpg",
    ],
    imageAlt: "2007 Honda Jazz Hatchback",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v14", sortOrder: 14,
    name: "2015 Toyota Camry Hybrid",
    year: 2015, make: "Toyota",
    model: "Camry", type: "Hybrid Sedan",
    rego: "070LM3",
    variant: "AVV50R Atara SL Sedan",
    fuelType: "Petrol / Electric Hybrid",
    engine: "2.5L 4 Cylinder",
    transmission: "CVT Auto",
    seats: 5,
    colours: ["Bronze", "White", "Silver", "Black", "Grey"],
    image: "/images/vehicles/v14-main.jpg",
    images: [
      "/images/vehicles/v14-front.jpg",
      "/images/vehicles/v14-interior.jpg",
      "/images/vehicles/v14-rear.jpg",
    ],
    imageAlt: "2015 Toyota Camry Hybrid",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v15", sortOrder: 15,
    name: "2008 Hyundai Getz",
    year: 2008, make: "Hyundai",
    model: "Getz", type: "Hatchback",
    rego: "343QF8",
    variant: "TB MY08 Hatchback",
    fuelType: "Petrol",
    engine: "1.4L 4 Cylinder",
    transmission: "4 Speed Auto",
    seats: 5,
    colours: ["Purple", "White", "Silver", "Red", "Blue"],
    image: "/images/vehicles/v15-main.jpg",
    images: [
      "/images/vehicles/v15-front.jpg",
      "/images/vehicles/v15-interior.jpg",
      "/images/vehicles/v15-rear.jpg",
    ],
    imageAlt: "2008 Hyundai Getz",
    weeklyRate: 0, bond: 0, available: true
  },
  {
    id: "v16", sortOrder: 16,
    name: "2017 Toyota HiLux",
    year: 2017, make: "Toyota",
    model: "HiLux", type: "Ute",
    rego: "816QU8",
    variant: "GUN126R Workmate Dual Cab Utility",
    fuelType: "Petrol",
    engine: "4 Cylinders 2.7 Litre",
    transmission: "6 Speed Auto",
    seats: 5,
    colours: ["Gunmetal Grey", "White", "Silver", "Black", "Red"],
    image: "/images/vehicles/v16-main.jpg",
    images: [
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
