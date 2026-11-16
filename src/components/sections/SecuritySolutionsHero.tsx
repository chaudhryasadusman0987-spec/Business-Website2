import { CalendarCheck, Phone } from "lucide-react"
import Button from "@/components/ui/Button"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import {
  SITE_PHONE_HREF,
  SITE_PHONE_LOCAL,
  SECURITY_BRAND,
} from "@/data/site"

// Scene photo for the hub hero — deliberately not the Surveillance card's
// product cut-out, so the same picture doesn't appear twice on the page.
const HERO_IMAGE = "/images/solutions/surveillance.jpg"

// Dark hero for the Security Solutions landing page — same layout as the
// homepage hero. The trust bar sits under it (SecurityTrustBar).
export default function SecuritySolutionsHero() {
  return (
    <section className="on-dark relative overflow-hidden bg-brand-hero">
      <div className="container-page py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16">
          {/* LEFT */}
          <div>
            <p className="eyebrow">{SECURITY_BRAND}</p>

            <h1 className="mt-4 text-white">
              CCTV &amp; Security Installation in{" "}
              <span className="text-brand-primary">Brisbane &amp; Southeast QLD</span>
            </h1>

            <p className="lead mt-4 max-w-[560px]">
              Security cameras, alarms, access control and video intercoms for
              homes and businesses. Every job starts with a free site
              assessment and an itemised quote.
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

            <p className="mt-6 flex items-start gap-2 text-[14px] text-muted">
              <CalendarCheck size={16} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-[#5dcaa5]" />
              Same-week installation for standard home installs in Brisbane,
              subject to availability.
            </p>
          </div>

          {/* RIGHT — hero image: 16/10 on mobile, 4/5 on desktop */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-img lg:aspect-[4/5]">
            <ImageWithFallback
              src={HERO_IMAGE}
              alt="Outdoor CCTV bullet camera mounted on a building wall"
              fill
              sizes="(max-width: 1024px) 100vw, 440px"
              className="object-cover object-center"
              fallbackBg="#1e2140"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
