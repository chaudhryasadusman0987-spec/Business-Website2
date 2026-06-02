import type { Testimonial } from "@/types";

// TODO(dashboard): replace with API call when admin dashboard is live
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Sarah Mitchell",
    suburb: "Parramatta",
    state: "NSW",
    rating: 5,
    text:
      "The team installed our CCTV system the same week and walked us through the whole setup. Professional, tidy, and great value.",
    service: "CCTV Installation",
    date: "2026-03-12",
    image: "/images/t1.jpg",
  },
  {
    id: "t2",
    name: "James Nguyen",
    suburb: "Richmond",
    state: "VIC",
    rating: 5,
    text:
      "Rented an SUV for a fortnight up the coast. Spotless vehicle, easy pickup, and the free cancellation gave us real peace of mind.",
    service: "Car Rental",
    date: "2026-04-02",
    image: "/images/t2.jpg",
  },
  {
    id: "t3",
    name: "Priya Sharma",
    suburb: "Fortitude Valley",
    state: "QLD",
    rating: 5,
    text:
      "They built our new website and set up an AI booking assistant. Enquiries have doubled and the support has been outstanding.",
    service: "Web Development",
    date: "2026-04-21",
    image: "/images/t3.jpg",
  },
];
