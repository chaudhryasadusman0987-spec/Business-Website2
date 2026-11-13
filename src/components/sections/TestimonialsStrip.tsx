"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import AnimateIn from "@/components/ui/AnimateIn"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import { testimonials, type Testimonial } from "@/data/testimonials"

// Home-page teaser. Shows only the first few reviews and links to the full
// list on /testimonials. Reviews come from the SAME source as that page —
// live Google Business Profile reviews first, then any manual testimonials —
// so every new review shows up here automatically. The whole section stays
// hidden until at least one review exists.
export default function TestimonialsStrip() {
  const [googleReviews, setGoogleReviews] = useState<Testimonial[]>([])

  // Pull live Google reviews (empty until the Places API env vars are set).
  useEffect(() => {
    fetch("/api/google-reviews")
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((d) => setGoogleReviews(d.reviews ?? []))
      .catch(() => setGoogleReviews([]))
  }, [])

  // Real Google reviews first, then the curated manual testimonials.
  // Home page shows only the first 3; /testimonials shows them all.
  const featured = [...googleReviews, ...testimonials].slice(0, 3)

  if (featured.length === 0) return null

  return (
    <section className="bg-white on-light py-14 lg:py-20">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="What Our Clients Say"
          subtitle="Real feedback from homes and businesses we've helped across Brisbane and Southeast QLD."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {featured.map((t, index) => (
            <AnimateIn
              key={t.id}
              animation="fade-up"
              delay={index * 100}
              className="flex"
            >
            <div
              className="flex w-full flex-col rounded-card border border-line bg-white p-7 transition-all duration-300 hover:border-brand-primary hover:shadow-card-hover on-light"
            >
              {/* top row — service badge + stars */}
              <div className="mb-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[11px] font-semibold text-[#1a1a2e] on-light">
                  <span>{t.serviceIcon}</span>
                  {t.service}
                </span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-[15px] ${
                        i < t.rating ? "text-[#f5a623]" : "text-[#e0e0e8]"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* quote text */}
              <div className="relative mb-6 flex-1 pl-2">
                <span className="pointer-events-none absolute -left-2 -top-4 select-none font-serif text-[80px] leading-none text-accent/20">
                  &ldquo;
                </span>
                <p className="relative text-[14px] leading-[1.75] text-muted">
                  {t.text}
                </p>
              </div>

              {/* bottom row — photo + info */}
              <div className="mt-auto flex items-center gap-3 border-t border-line pt-5">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-line">
                  <ImageWithFallback
                    src={t.image}
                    alt={t.name}
                    fill
                    className="object-cover object-top"
                    fallbackBg="#eeedfe"
                    fallbackInitial
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#1a1a2e]">
                    {t.name}
                  </p>
                  {(t.suburb || t.state) && (
                    <p className="mt-0.5 text-[12px] text-muted">
                      {[t.suburb, t.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>

                {t.verified && (
                  <span className="ml-auto inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-[#e1f5ee] px-2 py-1 text-[10px] font-semibold text-[#0f6e56]">
                    <Check size={10} />
                    Verified
                  </span>
                )}
              </div>
            </div>
            </AnimateIn>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/testimonials"
            className="inline-flex items-center justify-center gap-1 text-[14px] font-semibold text-accent hover:underline"
          >
            See All Reviews
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
