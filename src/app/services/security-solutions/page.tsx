import type { Metadata } from "next"
import SectionTitle from "@/components/ui/SectionTitle"
import SecuritySolutionsHero from "@/components/sections/SecuritySolutionsHero"
import SolutionCard from "@/components/sections/SolutionCard"
import HowItWorks from "@/components/sections/HowItWorks"
import TestimonialsStrip from "@/components/sections/TestimonialsStrip"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { securitySolutions } from "@/data/security-solutions"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `Security Solutions | ${SITE_FULL}`,
  description:
    "Complete security solutions across Australia. CCTV, alarms, access " +
    "control, intercoms and more. Free site assessment. Licensed installers.",
}

export default function SecuritySolutionsPage() {
  return (
    <>
      <SecuritySolutionsHero />

      {/* Solutions grid */}
      <section id="solutions" className="bg-[#fefefd] pt-[100px] pb-[80px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <SectionTitle
            title="Our Solutions"
            subtitle="Click any solution to explore products and pricing"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {securitySolutions.map((solution) => (
              <SolutionCard key={solution.id} solution={solution} />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <QuoteCTABanner href="/services/security-solutions/quote" />
      <TestimonialsStrip />
    </>
  )
}
