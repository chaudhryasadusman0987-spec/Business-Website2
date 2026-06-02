import type { Metadata } from "next"
import HeroSection from "@/components/sections/HeroSection"
import ServicesGrid from "@/components/sections/ServicesGrid"
import AboutStrip from "@/components/sections/AboutStrip"
import WhyChooseUs from "@/components/sections/WhyChooseUs"
import TestimonialsStrip from "@/components/sections/TestimonialsStrip"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { SITE_FULL, SITE_TAGLINE } from "@/data/site"

export const metadata: Metadata = {
  title: { absolute: SITE_FULL },
  description: SITE_TAGLINE,
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesGrid />
      <AboutStrip />
      <WhyChooseUs />
      <TestimonialsStrip />
      <QuoteCTABanner />
    </>
  )
}
