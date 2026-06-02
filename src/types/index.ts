export interface Service {
  id: string;
  name: string;
  description: string;
  href: string;
  iconName: string;
  comingSoon: boolean;
}

export interface CCTVProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  description: string;
  dailyRate: number;
  weeklyRate: number;
  passengers: number;
  features: string[];
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

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  timestamp: string;
  page: string;
  source: "ai_chat" | "quote_form" | "contact_form";
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface NavLink {
  label: string;
  href: string;
}
