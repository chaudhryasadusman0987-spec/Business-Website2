import type { Vehicle } from "@/types";

// TODO(dashboard): replace with API call when admin dashboard is live
export const vehicles: Vehicle[] = [
  {
    id: "economy",
    name: "Economy",
    description: "Compact, fuel-efficient car ideal for city driving and commuting.",
    dailyRate: 65,
    weeklyRate: 380,
    passengers: 5,
    features: ["Automatic", "Bluetooth", "Air conditioning", "Fuel efficient"],
  },
  {
    id: "suv",
    name: "SUV",
    description: "Spacious all-rounder with extra room for family and luggage.",
    dailyRate: 95,
    weeklyRate: 560,
    passengers: 5,
    features: ["Automatic", "Reversing camera", "Roof rails", "Large boot"],
  },
  {
    id: "van",
    name: "Van",
    description: "Practical cargo and passenger van for moving and group travel.",
    dailyRate: 110,
    weeklyRate: 650,
    passengers: 8,
    features: ["Automatic", "Large cargo space", "Reversing sensors", "Seats up to 8"],
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Premium vehicle with high-end comfort for business and special occasions.",
    dailyRate: 180,
    weeklyRate: 1050,
    passengers: 5,
    features: ["Leather seats", "Premium audio", "Sat nav", "Sunroof"],
  },
];
