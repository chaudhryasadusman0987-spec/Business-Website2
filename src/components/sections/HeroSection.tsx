import Image from "next/image"
import { Phone } from "lucide-react"
import Button from "@/components/ui/Button"
import HeroStatus from "@/components/sections/HeroStatus"
import {
  SITE_ADDRESS,
  SITE_FULL,
  SITE_PHONE_HREF,
  SITE_PHONE_LOCAL,
  SITE_TAGLINE,
} from "@/data/site"

// Homepage hero. Not wrapped in AnimateIn: that holds content at opacity 0
// until hydration, which delays the largest paint.
export default function HeroSection() {
  return (
    <section className="on-dark relative overflow-hidden bg-brand-hero">
      {/* The one decorative gradient left on the site — a very soft purple
          wash behind the copy. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 80% at 15% 0%, rgba(127,133,247,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="container-page relative py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16">
          {/* LEFT — copy */}
          <div>
            <p className="eyebrow">{SITE_ADDRESS}</p>
            <h1 className="mt-4 text-white">{SITE_FULL}</h1>
            <p className="mt-3 font-heading text-[1.25rem] font-semibold text-brand-primary lg:text-[1.5rem]">
              {SITE_TAGLINE}
            </p>
            <p className="lead mt-5 max-w-[560px]">
              Brisbane CCTV and security installation, long-term car rental and
              IT &amp; AI services under one roof. Licensed and insured.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/quote" variant="primary" tone="dark">
                Get a Free Quote
              </Button>
              <Button href={SITE_PHONE_HREF} variant="secondary" tone="dark">
                <Phone size={16} aria-hidden="true" />
                Call {SITE_PHONE_LOCAL}
              </Button>
            </div>
            <HeroStatus />
          </div>

          {/* RIGHT — hero image: 16/10 on mobile, 4/5 on desktop */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-img lg:aspect-[4/5]">
            <Image
              src="/images/hero.jpg"
              alt="Brisbane Australia skyline — professional services"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 440px"
              className="hero-zoom object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
