export interface Service {
  id: string;
  name: string;
  description: string;
  href: string;
  iconName: string;
  comingSoon: boolean;
  // Hero image of the service's landing page, shown on the home services grid.
  // Optional: services without a dedicated hero (e.g. IT Consulting) omit it.
  image?: string;
  imageAlt?: string;
}

export interface CCTVProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

// NOTE: the canonical Vehicle (with bond/example/icon) lives in
// src/data/car-rental.ts. This mirror is kept in sync for any generic consumers.
export interface Vehicle {
  id: string;
  name: string;
  example: string;
  icon: string;
  dailyRate: number;
  weeklyRate: number;
  bond: number;
  passengers: number;
  features: string[];
  badge?: string;
  image?: string;
  inStock: boolean;
}

export interface ITService {
  id: string;
  name: string;
  description: string;
  features: string[];
  startingFrom: string;
  iconName: string;
}

export interface Testimonial {
  id: string;
  name: string;
  suburb: string;
  state: string;
  rating: number;
  text: string;
  service: string;
  date: string;
  image: string;
}

export type LeadStatus = "New" | "Contacted" | "Quoted" | "Won" | "Lost";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  // Canonical timestamp field — matches the seed data and what the dashboard
  // reads/sorts on. (Older records may carry `timestamp` instead.)
  date: string;
  status: LeadStatus;
  source: "ai_chat" | "quote_form" | "contact_form";
  company?: string;
  page?: string; // optional: origin page the lead came from
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SecurityProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  inStock: boolean;
  image: string; // path like "/images/products/hd-bullet-cam.jpg"
  badge?: string; // optional badge like "Best Seller" "New" "Popular"
}

export interface SecuritySolution {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  longDescription: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  heroImage: string; // path like "/images/solutions/surveillance.jpg"
  heroImageAlt: string; // descriptive alt text for SEO
  products: SecurityProduct[];
}
