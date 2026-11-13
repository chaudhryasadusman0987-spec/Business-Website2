"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, Check } from "lucide-react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import AnimateIn from "@/components/ui/AnimateIn"
import CountUp from "@/components/ui/CountUp"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { testimonials, stats, type Testimonial } from "@/data/testimonials"
import { SITE_GOOGLE_REVIEW_URL } from "@/data/site"

// Google Business Profile review link. Set NEXT_PUBLIC_GOOGLE_PLACE_ID once your
// profile is live and this button takes customers straight to the review form.
const PLACE_ID = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID
const GOOGLE_REVIEW_URL = PLACE_ID
  ? `https://search.google.com/local/writereview?placeid=${PLACE_ID}`
  : SITE_GOOGLE_REVIEW_URL

const FILTERS = [
  "All",
  "Security Solutions",
  "Car Rental",
  "Web Development",
  "App Development",
  "AI Automation",
  "IT Consulting",
]

export default function TestimonialsPage() {
  const [filter, setFilter] = useState("All")
  const [googleReviews, setGoogleReviews] = useState<Testimonial[]>([])

  // Pull live Google reviews (empty until the Places API env vars are set).
  useEffect(() => {
    fetch("/api/google-reviews")
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((d) => setGoogleReviews(d.reviews ?? []))
      .catch(() => setGoogleReviews([]))
  }, [])

  // Real Google reviews first, then the curated manual testimonials.
  const allTestimonials = [...googleReviews, ...testimonials]

  const filtered =
    filter === "All"
      ? allTestimonials
      : allTestimonials.filter((t) => t.service === filter)

  return (
    <main>
      {/* ── SECTION 1 — DARK HERO ───────────────────────────── */}
      <section className="relative overflow-hidden bg-brand-hero text-center on-dark py-16 lg:py-24">

        <div className="relative mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          {/* breadcrumb */}
          <div className="mb-6 flex items-center justify-center gap-2 text-[12px] text-muted">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-muted">Testimonials</span>
          </div>

          <div className="mb-4 text-[32px] tracking-[4px] text-[#f5a623]">
            ★★★★★
          </div>

          <h1 className="text-white">
            What Our Customers Say
          </h1>

          <p className="mt-4 text-[16px] text-muted">
            Real reviews from real customers across Brisbane and Australia
          </p>

          {/* stats row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {stats.map((s, i) => {
              // Values like "100%" or "5★" count up; non-numeric ones ("QLD")
              // render as plain text.
              const numeric = /^(\d+)(.*)$/.exec(s.value)
              return (
              <div key={s.label} className="flex items-center gap-8 lg:gap-16">
                <AnimateIn animation="scale" delay={i * 80}>
                  <div className="text-[36px] font-bold text-accent lg:text-[44px]">
                    {numeric ? (
                      <CountUp end={Number(numeric[1])} suffix={numeric[2]} />
                    ) : (
                      s.value
                    )}
                  </div>
                  <div className="mt-1 text-[13px] text-muted">
                    {s.label}
                  </div>
                </AnimateIn>
                {i < stats.length - 1 && (
                  <div className="hidden h-12 w-px bg-white/10 lg:block" />
                )}
              </div>
              )
            })}
          </div>
        </div>
      </section>

      {allTestimonials.length === 0 ? (
        /* ── EMPTY STATE — REVIEWS COMING SOON ──────────────── */
        <section className="bg-white on-light py-14 lg:py-20">
          <div className="max-w-[600px] mx-auto px-4 text-center">
            <div className="text-[48px] text-[#e0e0e8] mb-6">★</div>
            <h2 className="font-bold text-[24px] text-[#1a1a2e]">
              Reviews Coming Soon
            </h2>
            <p className="text-[15px] text-muted mt-3 leading-relaxed">
              We are a new business and building our reputation one happy
              customer at a time. Check back soon or leave us a review after
              your experience.
            </p>
            <a
              href="mailto:info@pakozsolutions.com.au"
              className="inline-block mt-8 bg-brand-primary text-white rounded-btn h-12 px-8 leading-[52px] font-semibold text-[15px] hover:bg-brand-hover transition-all"
            >
              Contact Us
            </a>
          </div>
        </section>
      ) : (
        <>
      {/* ── SECTION 2 — FILTER TABS ─────────────────────────── */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {FILTERS.map((f) => {
              const active = filter === f
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`cursor-pointer rounded-full border px-5 py-2 text-[13px] font-medium transition-all duration-200 ${
                    active
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-line bg-white text-muted hover:border-brand-primary hover:text-accent on-light"
                  }`}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — TESTIMONIALS GRID ───────────────────── */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-[15px] text-muted">
              No reviews yet for this service.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t, index) => (
                <AnimateIn
                  key={t.id}
                  animation="fade-up"
                  delay={(index % 3) * 80}
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
                      {t.date && (
                        <p className="mt-0.5 text-[11px] text-[#b0b0b8]">
                          {t.date}
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
          )}
        </div>
      </section>
        </>
      )}

      {/* ── SECTION 4 — LEAVE A REVIEW CTA ──────────────────── */}
      <section className="bg-brand-navy on-dark text-center py-14 lg:py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-8">
          <h2 className="text-white">
            Loved Our Service?
          </h2>
          <p className="lead mx-auto mb-8 mt-4">
            Your review helps other Australians find quality service.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-btn bg-brand-primary px-6 text-[15px] font-semibold text-white hover:bg-brand-hover"
            >
              {PLACE_ID ? "⭐ Leave a Google Review" : "⭐ Find Us on Google"}
            </a>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-btn border border-white/40 px-6 text-[15px] font-semibold text-white hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
          {/* Only needed while the button points at a search page rather than
              the direct review form. */}
          {!PLACE_ID && (
            <p className="mt-3 text-center text-[13px] text-muted">
              Search for us on Google and click &quot;Write a review&quot;
            </p>
          )}
        </div>
      </section>

      {/* ── SECTION 5 — QUOTE CTA BANNER ────────────────────── */}
      <QuoteCTABanner href="/contact" />
    </main>
  )
}
