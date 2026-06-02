import type { Service } from "@/types";

// TODO(dashboard): replace with API call when admin dashboard is live
export const services: Service[] = [
  {
    id: "cctv-installation",
    name: "CCTV Installation",
    description:
      "Professional security camera systems installed across Australia. Free site assessment and licensed installers.",
    href: "/services/cctv-installation",
    iconName: "Camera",
    comingSoon: false,
  },
  {
    id: "car-rental",
    name: "Car Rental",
    description:
      "Flexible, well-maintained vehicles for every need. Daily and weekly rates with free cancellation.",
    href: "/services/car-rental",
    iconName: "Car",
    comingSoon: false,
  },
  {
    id: "web-development",
    name: "Web Development",
    description:
      "Fast, modern websites that convert. Built for performance, SEO, and your brand.",
    href: "/services/it-services/web-development",
    iconName: "Globe",
    comingSoon: false,
  },
  {
    id: "app-development",
    name: "App Development",
    description:
      "Native and cross-platform mobile apps designed and built end-to-end for your business.",
    href: "/services/it-services/app-development",
    iconName: "Smartphone",
    comingSoon: false,
  },
  {
    id: "ai-automation",
    name: "AI Automation",
    description:
      "Custom AI agents and automations that save time, cut costs, and scale your operations.",
    href: "/services/it-services/ai-automation",
    iconName: "Bot",
    comingSoon: false,
  },
  {
    id: "it-consulting",
    name: "IT Consulting",
    description:
      "Strategic technology advice, infrastructure, and support to keep your business running.",
    href: "/services/it-services",
    iconName: "Headset",
    comingSoon: false,
  },
];
