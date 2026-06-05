"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Check } from "lucide-react"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { testimonials, stats } from "@/data/testimonials"

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

  const filtered =
    filter === "All"
      ? testimonials
      : testimonials.filter((t) => t.service === filter)

  return (
    <main>
      {/* ── SECTION 1 — DARK HERO ───────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0d0d1a] py-24 text-center">
        {/* dot grid */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* purple glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
          style={{ background: "#7f85f7" }}
        />

        <div className="relative mx-auto max-w-[1170px] px-4">
          {/* breadcrumb */}
          <div className="mb-6 flex items-center justify-center gap-2 text-[12px] text-[#666880]">
            <Link href="/" className="hover:text-[#7f85f7]">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#9496a8]">Testimonials</span>
          </div>

          <div className="mb-4 text-[32px] tracking-[4px] text-[#f5a623]">
            ★★★★★
          </div>

          <h1 className="text-[40px] font-extrabold text-white lg:text-[56px]">
            What Our Customers Say
          </h1>

          <p className="mt-4 text-[16px] text-[#9496a8]">
            Real reviews from real customers across Brisbane and Australia
          </p>

          {/* stats row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-8 lg:gap-16">
                <div>
                  <div className="text-[36px] font-extrabold text-[#7f85f7] lg:text-[44px]">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[13px] text-[#9496a8]">
                    {s.label}
                  </div>
                </div>
                {i < stats.length - 1 && (
                  <div className="hidden h-12 w-px bg-white/10 lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2 — FILTER TABS ─────────────────────────── */}
      <section className="bg-[#fefefd] pt-[60px]">
        <div className="mx-auto max-w-[1170px] px-4">
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {FILTERS.map((f) => {
              const active = filter === f
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`cursor-pointer rounded-full border px-5 py-2 text-[13px] font-medium transition-all duration-200 ${
                    active
                      ? "border-[#7f85f7] bg-[#7f85f7] text-white"
                      : "border-[#e8e8f0] bg-white text-[#666666] hover:border-[#7f85f7] hover:text-[#7f85f7]"
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
      <section className="bg-[#fefefd] pb-[120px]">
        <div className="mx-auto max-w-[1170px] px-4">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-[15px] text-[#9496a8]">
              No reviews yet for this service.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col rounded-[24px] border border-[#e8e8f0] bg-white p-7 transition-all duration-300 hover:border-[#7f85f7] hover:shadow-[0_8px_30px_rgba(127,133,247,0.12)]"
                >
                  {/* top row — service badge + stars */}
                  <div className="mb-5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f7f7] px-3 py-1.5 text-[11px] font-semibold text-[#1a1a2e]">
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
                    <span className="pointer-events-none absolute -left-2 -top-4 select-none font-serif text-[80px] leading-none text-[#7f85f7]/20">
                      &ldquo;
                    </span>
                    <p className="relative text-[14px] leading-[1.75] text-[#444]">
                      {t.text}
                    </p>
                  </div>

                  {/* bottom row — photo + info */}
                  <div className="mt-auto flex items-center gap-3 border-t border-[#f0f0f8] pt-5">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#e8e8f0]">
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
                      <p className="mt-0.5 text-[12px] text-[#9496a8]">
                        {t.suburb}, {t.state}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#b0b0b8]">
                        {t.date}
                      </p>
                    </div>

                    {t.verified && (
                      <span className="ml-auto inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-[#e1f5ee] px-2 py-1 text-[10px] font-semibold text-[#0f6e56]">
                        <Check size={10} />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 4 — LEAVE A REVIEW CTA ──────────────────── */}
      <section className="bg-[#7f85f7] py-[80px] text-center">
        <div className="mx-auto max-w-[1170px] px-4">
          <h2 className="text-[45px] font-bold uppercase text-white">
            Loved Our Service?
          </h2>
          <p className="mb-8 mt-4 text-[16px] text-white/80">
            Your review helps other Australians find quality service.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className="inline-flex h-[52px] items-center rounded-[8px] bg-white px-8 text-[15px] font-bold text-[#7f85f7] hover:bg-white/90"
            >
              ⭐ Leave a Google Review
            </a>
            <Link
              href="/contact"
              className="inline-flex h-[52px] items-center rounded-[8px] border-2 border-white px-8 text-[15px] font-semibold text-white hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 5 — QUOTE CTA BANNER ────────────────────── */}
      <QuoteCTABanner href="/contact" />
    </main>
  )
}
