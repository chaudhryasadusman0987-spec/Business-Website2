import type { Service } from "@/types";

// TODO(dashboard): replace with API call when admin dashboard is live
export const services: Service[] = [
  {
    id: "web-development",
    name: "Web Development",
    description:
      "Fast, modern websites built for performance, SEO and your brand.",
    href: "/services/it-services/web-development",
    iconName: "Globe",
    comingSoon: false,
    image:
      "https://images.unsplash.com/photo-1744555270794-6d378b9e7cd3?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Professional web development Australia",
  },
  {
    id: "app-development",
    name: "App Development",
    description:
      "iOS and Android apps designed and built end to end for your business.",
    href: "/services/it-services/app-development",
    iconName: "Smartphone",
    comingSoon: false,
    image: "/images/it-services/app-code.jpg",
    imageAlt: "Application source code on a screen",
  },
  {
    id: "ai-automation",
    name: "AI Automation",
    description:
      "AI agents and automations that save time, cut costs and scale with you.",
    href: "/services/it-services/ai-automation",
    iconName: "Bot",
    comingSoon: false,
    image:
      "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "AI automation and chatbot development Australia",
  },
  {
    id: "cctv-installation",
    name: "Security Solutions",
    description:
      "CCTV, alarms, access control and intercoms, fully installed.",
    href: "/services/security-solutions",
    iconName: "Shield",
    comingSoon: false,
    image: "/images/solutions/surveillance1.jpg",
    imageAlt: "Professional CCTV surveillance camera installation",
  },
  {
    id: "car-rental",
    name: "Car Rental",
    description:
      "Well-maintained cars by the week. 4-week minimum, then week-to-week.",
    href: "/services/car-rental",
    iconName: "Car",
    comingSoon: false,
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Luxury rental car available in Brisbane",
  },
  {
    id: "it-consulting",
    name: "IT Consulting",
    description:
      "Practical technology advice and support to keep your business running.",
    href: "/services/it-services",
    iconName: "Monitor",
    comingSoon: false,
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "IT consulting team advising an Australian business",
  },
];
