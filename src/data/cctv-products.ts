import type { CCTVProduct } from "@/types";

// TODO(dashboard): replace with API call when admin dashboard is live
export const cctvProducts: CCTVProduct[] = [
  {
    id: "cctv",
    name: "CCTV Camera",
    description: "HD security camera with night vision and remote viewing.",
    price: 299,
    category: "Surveillance",
    inStock: true,
  },
  {
    id: "alarm",
    name: "Alarm System",
    description: "Monitored intruder alarm with sensors and siren.",
    price: 799,
    category: "Alarms",
    inStock: true,
  },
  {
    id: "access",
    name: "Access Control",
    description: "Keypad and card-based entry control for doors and gates.",
    price: 499,
    category: "Access",
    inStock: true,
  },
  {
    id: "intercom",
    name: "Intercom",
    description: "Video intercom for secure visitor verification.",
    price: 349,
    category: "Access",
    inStock: true,
  },
  {
    id: "perimeter",
    name: "Perimeter Detection",
    description: "Outdoor beam and motion detection for property boundaries.",
    price: 599,
    category: "Surveillance",
    inStock: true,
  },
  {
    id: "smoke",
    name: "Smoke Alarm",
    description: "Connected smoke and fire detection with instant alerts.",
    price: 149,
    category: "Safety",
    inStock: true,
  },
];

// TODO(dashboard): replace with API call when admin dashboard is live
export const installFee = 150;
export const gstRate = 0.10;
