/**
 * Client sites shown in the "Our Work" section (IT & AI Services page) and the
 * 4-card preview on the Web Development page.
 *
 * To add a project: append an entry here, then add its URL + filename to
 * scripts/capture-portfolio.ts and run `npm run capture:portfolio` to grab the
 * screenshot into /public/images/portfolio/.
 */

export interface PortfolioProject {
  slug: string
  name: string
  url: string
  industry: string
  location: string
  description: string
  built: string[]
  image: string
  imageAlt: string
}

export const portfolio: PortfolioProject[] = [
  {
    slug: "pak-oz-sports",
    name: "Pak OZ Sports Co",
    url: "https://www.pakozsports.com/",
    industry: "Manufacturing & Export",
    location: "Sialkot, Pakistan & Brisbane",
    description: "Product catalogue website for a sportswear manufacturer and exporter.",
    built: [
      "40+ product categories",
      "Custom quote request form",
      "9-step order process page",
      "WhatsApp enquiry integration",
      "SEO and social sharing setup",
    ],
    image: "/images/portfolio/pak-oz-sports.webp",
    imageAlt: "Homepage of the Pak OZ Sports Co website showing its sportswear product catalogue",
  },
  {
    slug: "pak-oz-solutions",
    name: "Pak Oz Solutions",
    url: "https://www.pakozsolutions.com.au/",
    industry: "Security, Car Rental & IT",
    location: "Brisbane, QLD",
    description: "Multi-service business platform with online quoting and rental bookings.",
    built: [
      "CCTV product catalogue and quote wizard",
      "Car rental applications with Stripe weekly payments",
      "E-signed lease agreements",
      "Admin dashboard",
      "AI ad generator",
    ],
    image: "/images/portfolio/pak-oz-solutions.webp",
    imageAlt: "Homepage of the Pak Oz Solutions website showing its security, car rental and IT services",
  },
  {
    slug: "a3-associates",
    name: "A3 Associates",
    url: "https://www.a3associate.com/",
    industry: "Energy & Petroleum Trading",
    location: "Islamabad, Pakistan",
    description: "Corporate B2B website for a fuel supply and petroleum trading company.",
    built: [
      "Product portfolio pages",
      "Industries served section",
      "Custom “Industrial Vitality” design system",
      "Enquiry and sales contact forms",
    ],
    image: "/images/portfolio/a3-associates.webp",
    imageAlt: "Homepage of the A3 Associates website for fuel supply and petroleum trading",
  },
  {
    slug: "accident-solutions",
    name: "Accident Solutions Australia",
    url: "https://accidentsolutionsaustralia.com.au",
    industry: "Accident Management",
    location: "Queensland",
    description: "Lead-generation website for an accident claims, towing and repair service.",
    built: [
      "Online claim form",
      "Services pages",
      "Blog",
      "Testimonials",
      "24/7 contact calls to action",
    ],
    image: "/images/portfolio/accident-solutions.webp",
    imageAlt: "Homepage of the Accident Solutions Australia website for accident claims, towing and repairs",
  },
]
