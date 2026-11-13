import { Phone, ShieldCheck } from "lucide-react"
import Button from "@/components/ui/Button"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import { securitySolutions } from "@/data/security-solutions"
import {
  SITE_SECURITY_LICENCE,
  SITE_PHONE_HREF,
  SITE_PHONE_LOCAL,
  SECURITY_BRAND,
  SECURITY_TAGLINE,
} from "@/data/site"

// Dark hero for the Security Solutions landing page — same layout as the
// homepage hero.
export default function SecuritySolutionsHero() {
  const heroSolution = securitySolutions.find((s) => s.id === "surveillance")
  const heroImage = heroSolution?.heroImage ?? ""
  const contain = heroSolution?.heroImageFit !== "cover"

  // "Pak Oz CCTV" → lead "Pak Oz" (white), accent "CCTV" (purple).
  const brandWords = SECURITY_BRAND.split(" ")
  const brandLead = brandWords.slice(0, -1).join(" ")
  const brandAccent = brandWords[brandWords.length - 1]

  return (
    <section className="on-dark relative overflow-hidden bg-brand-hero">
      <div className="container-page py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16">
          {/* LEFT */}
          <div>
            <p className="eyebrow">Security Solutions · Brisbane &amp; Southeast QLD</p>

            {/* The security section runs under the CCTV sub-brand, so the brand
                itself is the headline here. Split off SECURITY_BRAND so the
                last word takes the accent colour without hardcoding "CCTV". */}
            <h1 className="mt-4">
              <span className="text-white">{brandLead}</span>{" "}
              <span className="text-brand-primary">{brandAccent}</span>
            </h1>

            <p className="mt-4 max-w-[560px] font-heading text-[1.25rem] font-semibold leading-snug text-white lg:text-[1.5rem]">
              {SECURITY_TAGLINE}
            </p>

            <p className="lead mt-4 max-w-[560px]">
              Surveillance, deterrence, access control, intercoms and more —
              professionally installed across Brisbane &amp; Southeast QLD.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/services/security-solutions/quote" variant="primary" tone="dark">
                Get a Free Quote
              </Button>
              <Button href={SITE_PHONE_HREF} variant="secondary" tone="dark">
                <Phone size={16} aria-hidden="true" />
                Call {SITE_PHONE_LOCAL}
              </Button>
              <Button href="#solutions" variant="ghost" tone="dark">
                View Solutions
              </Button>
            </div>

            {/* Trust strip — reassurance signals below the CTAs */}
            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
              {[
                SITE_SECURITY_LICENCE,
                "Free Site Assessment",
                "Same-Week Installation",
                `${securitySolutions.length} Security Solutions`,
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-[14px] text-muted">
                  <ShieldCheck size={16} aria-hidden="true" className="text-[#5dcaa5]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — hero image: 16/10 on mobile, 4/5 on desktop */}
          <div
            className={`relative aspect-[16/10] w-full overflow-hidden rounded-img lg:aspect-[4/5] ${
              contain ? "bg-white" : ""
            }`}
          >
            <ImageWithFallback
              src={heroImage}
              alt="Professional security solutions Australia"
              fill
              sizes="(max-width: 1024px) 100vw, 440px"
              className={`${contain ? "object-contain p-8" : "object-cover"} object-center`}
              fallbackBg="#1e2140"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
