export interface Testimonial {
  id: string
  name: string
  suburb: string
  state: string
  rating: number
  text: string
  service: string
  serviceIcon: string
  serviceColor: string
  date: string
  image: string
  verified: boolean
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Michael Chen",
    suburb: "Paddington", state: "QLD",
    rating: 5,
    text: "Absolutely professional from start to finish. The team installed 6 cameras across my restaurant in one day. The NVR system is crystal clear and I can check footage from my phone anywhere.",
    service: "Security Solutions",
    serviceIcon: "🛡️", serviceColor: "#f57c00",
    date: "March 2025",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    verified: true
  },
  {
    id: "t2",
    name: "Sandra Williams",
    suburb: "Ascot", state: "QLD",
    rating: 5,
    text: "Had cameras installed at our family home after a break-in nearby. The team was on time, tidy and explained everything clearly. Our 4 cameras were up in 3 hours. Peace of mind is priceless.",
    service: "Security Solutions",
    serviceIcon: "🛡️", serviceColor: "#f57c00",
    date: "January 2025",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    verified: true
  },
  {
    id: "t3",
    name: "David Park",
    suburb: "Fortitude Valley", state: "QLD",
    rating: 5,
    text: "We needed access control for our office building — 3 floors, 12 doors. The quote was fair, the installation was clean and the system works flawlessly.",
    service: "Security Solutions",
    serviceIcon: "🛡️", serviceColor: "#f57c00",
    date: "February 2025",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    verified: true
  },
  {
    id: "t4",
    name: "Chloe Mitchell",
    suburb: "Parramatta", state: "NSW",
    rating: 5,
    text: "The smoke alarm system meets all Queensland standards. The technician was knowledgeable and checked every alarm was interconnected properly. Great service, great price.",
    service: "Security Solutions",
    serviceIcon: "🛡️", serviceColor: "#f57c00",
    date: "April 2025",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    verified: true
  },
  {
    id: "t5",
    name: "James O'Brien",
    suburb: "New Farm", state: "QLD",
    rating: 5,
    text: "Rented a 7-seat SUV for a family road trip to the Gold Coast. The car was spotless, the pick-up was smooth and the team explained the toll pass and bond clearly upfront. No surprises.",
    service: "Car Rental",
    serviceIcon: "🚗", serviceColor: "#4caf50",
    date: "December 2024",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    verified: true
  },
  {
    id: "t6",
    name: "Emily Thompson",
    suburb: "South Brisbane", state: "QLD",
    rating: 5,
    text: "I needed a van for a weekend market. The booking was easy, the van was clean and the bond was released back to my account within 5 days of return. Really happy.",
    service: "Car Rental",
    serviceIcon: "🚗", serviceColor: "#4caf50",
    date: "November 2024",
    image: "https://randomuser.me/api/portraits/women/30.jpg",
    verified: true
  },
  {
    id: "t7",
    name: "Robert Nguyen",
    suburb: "Chermside", state: "QLD",
    rating: 4,
    text: "Used the compact SUV for a week while my car was being serviced. Great value at $75 a day and the Linkt toll pass saved me so much hassle on the Gateway Motorway.",
    service: "Car Rental",
    serviceIcon: "🚗", serviceColor: "#4caf50",
    date: "October 2024",
    image: "https://randomuser.me/api/portraits/men/76.jpg",
    verified: true
  },
  {
    id: "t8",
    name: "Lisa Hoffmann",
    suburb: "Milton", state: "QLD",
    rating: 5,
    text: "They built our e-commerce store from scratch. Delivered on time and the site is incredibly fast. Our online sales doubled in the first month after launch.",
    service: "Web Development",
    serviceIcon: "🌐", serviceColor: "#1565c0",
    date: "February 2025",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
    verified: true
  },
  {
    id: "t9",
    name: "Tom Blackwell",
    suburb: "Toowong", state: "QLD",
    rating: 5,
    text: "We needed an AI chat agent for our property management website. It answers tenant enquiries 24/7 and has already saved our staff 10+ hours per week. Exactly what we described.",
    service: "AI Automation",
    serviceIcon: "🤖", serviceColor: "#0f6e56",
    date: "March 2025",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
    verified: true
  },
  {
    id: "t10",
    name: "Angela Foster",
    suburb: "Woolloongabba", state: "QLD",
    rating: 5,
    text: "Our iOS and Android app was delivered in 10 weeks — on time and on budget. Over 2,000 downloads in the first month and the design is exactly what we wanted.",
    service: "App Development",
    serviceIcon: "📱", serviceColor: "#6200ea",
    date: "January 2025",
    image: "https://randomuser.me/api/portraits/women/57.jpg",
    verified: true
  },
  {
    id: "t11",
    name: "Mark Sullivan",
    suburb: "Spring Hill", state: "QLD",
    rating: 5,
    text: "Had a half-day IT consulting session to map out our technology roadmap. The advice was practical, honest and exactly what a small business like ours needed.",
    service: "IT Consulting",
    serviceIcon: "💡", serviceColor: "#f57c00",
    date: "April 2025",
    image: "https://randomuser.me/api/portraits/men/85.jpg",
    verified: true
  },
  {
    id: "t12",
    name: "Christine Wu",
    suburb: "Kangaroo Point", state: "QLD",
    rating: 5,
    text: "The workflow automation connects our CRM, email and calendar automatically. Tasks that used to take 2 hours a day now happen in the background. Best investment we have made.",
    service: "AI Automation",
    serviceIcon: "🤖", serviceColor: "#0f6e56",
    date: "May 2025",
    image: "https://randomuser.me/api/portraits/women/79.jpg",
    verified: true
  }
]

export const stats = [
  { value: "2,400+", label: "Happy Customers" },
  { value: "4.9/5",  label: "Average Rating"  },
  { value: "500+",   label: "Projects Completed" },
  { value: "100%",   label: "Would Recommend"  }
]
