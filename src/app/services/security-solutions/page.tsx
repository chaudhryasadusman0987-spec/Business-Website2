import type { Metadata } from "next"
import SectionTitle from "@/components/ui/SectionTitle"
import AnimateIn from "@/components/ui/AnimateIn"
import SecuritySolutionsHero from "@/components/sections/SecuritySolutionsHero"
import SolutionCard from "@/components/sections/SolutionCard"
import HowItWorks from "@/components/sections/HowItWorks"
import TestimonialsStrip from "@/components/sections/TestimonialsStrip"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { securitySolutions } from "@/data/security-solutions"
import { SECURITY_BRAND } from "@/data/site"

// Suburbs listed for local SEO — Brisbane southside focus plus wider regions.
const serviceSuburbs = [
  "Brisbane CBD", "Sunnybank", "Sunnybank Hills", "Runcorn", "Calamvale",
  "Parkinson", "Rochedale", "Eight Mile Plains", "Springwood", "Logan",
  "Loganholme", "Beenleigh", "Browns Plains", "Mount Gravatt", "Mansfield",
  "Wishart", "Stretton", "Carindale", "Macgregor", "Algester", "Acacia Ridge",
  "Coopers Plains", "Moorooka", "Salisbury", "Nathan", "Holland Park",
  "Tarragindi", "Yeronga", "Annerley", "Greenslopes", "Woolloongabba",
  "South Brisbane", "West End", "Highgate Hill", "Gold Coast", "Ipswich",
  "Redlands",
]

// `absolute` bypasses the root layout's `%s | Pak Oz Solutions` template so the
// security section carries the CCTV sub-brand in the tab title instead.
export const metadata: Metadata = {
  title: { absolute: `Security Solutions | ${SECURITY_BRAND}` },
  description:
    `${SECURITY_BRAND} — Professional CCTV and security camera installation ` +
    "in Brisbane & Southeast QLD. Free site assessment. Licensed installers. " +
    "Same-week service available.",
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
            {securitySolutions.map((solution, index) => (
              <AnimateIn
                key={solution.id}
                animation="fade-up"
                delay={(index % 3) * 150}
                className="flex"
              >
                <SolutionCard solution={solution} />
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* Areas We Service — suburb coverage for local SEO */}
      <section className="bg-[#fefefd] py-[60px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <h2 className="font-bold text-[24px] text-[#1a1a2e] text-center mb-8">
            Areas We Service
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {serviceSuburbs.map((suburb) => (
              <span
                key={suburb}
                className="bg-white border border-[#e8e8f0] rounded-full px-4 py-2 text-[13px] text-[#444] hover:border-[#7f85f7] hover:text-[#7f85f7] transition-all"
              >
                {suburb}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Leave us a Google review CTA */}
      <section className="bg-[#7f85f7] py-[60px] text-center">
        <div className="max-w-[1170px] mx-auto px-4">
          <h2 className="text-white font-bold text-[28px]">
            Happy with our service?
          </h2>
          <p className="text-white/80 text-[15px] mt-3 mb-8 max-w-[560px] mx-auto">
            Leave us a Google review and help other Brisbane families find
            quality security installation.
          </p>
          {/* Owner: replace with your real Google review link */}
          <a
            href="https://g.page/r/[your-google-place-id]/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-white text-[#7f85f7] font-bold rounded-[8px] h-[52px] px-8 hover:bg-white/90 transition-all"
          >
            ⭐ Leave a Google Review
          </a>
        </div>
      </section>

      <QuoteCTABanner href="/services/security-solutions/quote" />
      <TestimonialsStrip />
    </>
  )
}
