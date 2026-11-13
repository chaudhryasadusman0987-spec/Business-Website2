import type { Metadata } from "next"
import HeroSection from "@/components/sections/HeroSection"
import StatsStrip from "@/components/sections/StatsStrip"
import WorkStrip from "@/components/sections/WorkStrip"
import ServicesGrid from "@/components/sections/ServicesGrid"
import AboutStrip from "@/components/sections/AboutStrip"
import WhyChooseUs from "@/components/sections/WhyChooseUs"
import TestimonialsStrip from "@/components/sections/TestimonialsStrip"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: {
    absolute: `${SITE_FULL} | CCTV & Security, Car Rental, IT Services Brisbane`,
  },
  description:
    "Brisbane CCTV and security installation, long-term car rental and IT & AI services under one roof. Licensed and insured. Get a free quote today.",
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsStrip />
      <ServicesGrid />
      <AboutStrip />
      <WhyChooseUs />
      <WorkStrip />
      <TestimonialsStrip />
      <QuoteCTABanner />
    </>
  )
}
