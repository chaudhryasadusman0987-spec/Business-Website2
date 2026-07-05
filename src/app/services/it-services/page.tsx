import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, MessageCircle } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import TestimonialsStrip from "@/components/sections/TestimonialsStrip"
import { itProcess, itTechnologies } from "@/data/it-services"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `IT & AI Services | ${SITE_FULL}`,
  description:
    "Web development, mobile apps, AI automation and IT consulting for " +
    "Australian businesses. Fixed prices. Free consultation.",
}

interface ServiceRow {
  eyebrow: string
  title: string
  paragraph: string
  facts: string[]
  price: string
  priceNote?: string
  linkHref: string
  linkText: string
  image: string
  imageAlt: string
  reverse: boolean
}

const serviceRows: ServiceRow[] = [
  {
    eyebrow: "Web Development",
    title: "A website that actually brings in customers.",
    paragraph:
      "We build websites that load fast, rank well on Google and turn visitors into leads. Not templates — proper custom builds that represent your business the right way.",
    facts: [
      "Mobile-first, SEO-ready from day one",
      "You can edit the content yourself",
      "Fixed price — no hourly surprises",
    ],
    price: "From $2,500",
    linkHref: "/services/it-services/web-development",
    linkText: "See packages",
    image: "/images/it-services/web-development.jpg",
    imageAlt: "Web development Brisbane",
    reverse: false,
  },
  {
    eyebrow: "App Development",
    title: "iOS and Android — done properly, not cheaply.",
    paragraph:
      "We build apps that get real downloads and real reviews. From the design to the App Store submission, we handle the whole thing and keep you in the loop throughout.",
    facts: [
      "iOS + Android from one build",
      "We handle App Store submission",
      "Regular demos so you see progress",
    ],
    price: "From $8,000",
    linkHref: "/services/it-services/app-development",
    linkText: "See packages",
    image: "/images/it-services/app-development.jpg",
    imageAlt: "Mobile app development Brisbane",
    reverse: true,
  },
  {
    eyebrow: "AI Automation",
    title: "Stop doing the same tasks manually every day.",
    paragraph:
      "We build AI tools that actually save your staff time — not demos that look impressive but don't do anything. Chat agents, document processing, workflow automation. Real tools for real businesses.",
    facts: [
      "AI chat agent collecting leads 24/7",
      "Connects to your existing tools",
      "Trained on your business — not generic",
    ],
    price: "From $1,500",
    priceNote: "The live AI chat in the corner of this website was built by us.",
    linkHref: "/services/it-services/ai-automation",
    linkText: "See packages",
    image: "/images/it-services/ai-automation.jpg",
    imageAlt: "AI automation business Australia",
    reverse: false,
  },
]

const consultingRow: ServiceRow = {
  eyebrow: "IT Consulting",
  title: "Not sure what technology your business actually needs?",
  paragraph:
    "Most businesses waste money on technology that doesn't solve the right problem. We spend a few hours with you, map out what you have, what you need, and give you a plain English roadmap — no jargon, no upselling.",
  facts: [
    "Technology audit from $150/hr",
    "Plain English — no jargon",
    "Practical advice, not a sales pitch",
  ],
  price: "From $150/hr",
  linkHref: "/contact",
  linkText: "Book a session",
  image: "/images/it-services/it-consulting.jpg",
  imageAlt: "IT consulting Brisbane business",
  reverse: true,
}

function ServiceEditorialRow({ row }: { row: ServiceRow }) {
  return (
    <div
      className={`flex flex-col ${
        row.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
      } items-center gap-12`}
    >
      {/* Photo */}
      <div className="w-full lg:w-[45%] h-[320px] rounded-[20px] overflow-hidden relative flex-shrink-0 shadow-lg">
        <Image src={row.image} alt={row.imageAlt} fill className="object-cover" />
      </div>

      {/* Text */}
      <div className="flex-1">
        <Link
          href={row.linkHref}
          className="inline-block text-[13px] font-bold uppercase tracking-widest text-[#7f85f7] mb-3 hover:text-[#6b71f0] transition-colors"
        >
          {row.eyebrow}
        </Link>
        <h3 className="font-bold text-[28px] text-[#1a1a2e] leading-tight">
          {row.title}
        </h3>
        <p className="text-[15px] text-[#555] leading-[1.8] mt-4">
          {row.paragraph}
        </p>

        <div className="flex flex-col gap-3 mt-6">
          {row.facts.map((fact) => (
            <div key={fact} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[#eeedfe] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check size={11} className="text-[#7f85f7]" />
              </div>
              <span className="text-[14px] text-[#444]">{fact}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6 mt-6">
          <span className="text-[24px] font-bold text-[#7f85f7]">{row.price}</span>
          <Link
            href={row.linkHref}
            className="inline-flex items-center gap-2 bg-[#7f85f7] text-white text-[14px] font-semibold rounded-[8px] px-5 h-[44px] hover:bg-[#6b71f0] transition-colors"
          >
            {row.linkText}
            <ArrowRight size={16} />
          </Link>
        </div>

        {row.priceNote && (
          <p className="mt-5 inline-flex items-center gap-2 bg-[#eeedfe] text-[#534ab7] text-[13px] font-semibold rounded-full px-4 py-2">
            <MessageCircle size={15} className="text-[#7f85f7]" />
            {row.priceNote}
          </p>
        )}
      </div>
    </div>
  )
}

export default function ITServicesPage() {
  return (
    <>
      {/* ── SECTION 1 — DARK HERO ── */}
      <section className="relative overflow-hidden bg-[#0d0d1a] min-h-[70vh]">
        {/* dot grid */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        {/* purple glow top-right */}
        <div
          className="absolute z-0 w-[500px] h-[500px] rounded-full top-[-120px] right-[-60px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(127,133,247,0.2) 0%, transparent 65%)",
          }}
        />
        {/* teal glow bottom-left */}
        <div
          className="absolute z-0 w-[300px] h-[300px] rounded-full bottom-[-60px] left-[-40px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(93,202,165,0.12) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10 max-w-[1170px] mx-auto px-4 py-24 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
          {/* LEFT */}
          <div className="flex-1">
            <span className="inline-flex items-center gap-2 bg-[rgba(127,133,247,0.15)] border border-[rgba(127,133,247,0.3)] text-[#a5a8ff] text-[11px] rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#7f85f7] animate-pulse" />
              IT &amp; AI Services · Australia-wide
            </span>

            <h1 className="font-extrabold text-[40px] lg:text-[60px] leading-[1.1] mt-6">
              <span className="block text-white">Technology That</span>
              <span className="block text-[#7f85f7]">Grows Your Business.</span>
            </h1>

            <p className="text-[15px] text-[#9496a8] mt-4 max-w-[440px]">
              Web development, mobile apps, AI automation and IT consulting —
              all from one Australian team. Fixed prices. Free 30-minute
              consultation.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/services/it-services/quote"
                className="inline-flex items-center justify-center bg-[#7f85f7] text-white rounded-[8px] h-[52px] px-8 font-semibold hover:bg-[#6b71f0] transition-all"
              >
                Free Consultation
              </Link>
              <Link
                href="#services"
                className="inline-flex items-center justify-center border border-white/20 text-white rounded-[8px] h-[52px] px-8 hover:bg-white/5 transition-all"
              >
                Explore Services
              </Link>
            </div>
          </div>

          {/* RIGHT — hero photo */}
          <div className="w-full lg:w-[45%] flex-shrink-0">
            <div className="relative w-full h-[420px] lg:h-[500px] rounded-[24px] overflow-hidden shadow-2xl">
              <Image
                src="/images/it-services/hero.jpg"
                alt="IT and AI services professional development team"
                fill
                className="object-cover object-center"
                priority
              />
              {/* Dark overlay bottom for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2 — EDITORIAL SERVICE ROWS ── */}
      <section id="services" className="bg-[#fefefd] pt-[100px] pb-[100px]">
        <div className="max-w-[1170px] mx-auto px-4 flex flex-col gap-20">
          {serviceRows.map((row) => (
            <ServiceEditorialRow key={row.eyebrow} row={row} />
          ))}
        </div>
      </section>

      {/* IT Consulting — different background editorial row */}
      <section className="bg-[#f4f4ff] pt-[80px] pb-[80px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <ServiceEditorialRow row={consultingRow} />
        </div>
      </section>

      {/* ── SECTION 4 — PROCESS STEPS ── */}
      <section className="bg-brand-primary pt-[100px] pb-[100px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <h2 className="text-[45px] font-bold text-white uppercase leading-tight text-center">
            How We Work
          </h2>
          <p className="text-white/80 mt-4 text-center">
            Simple and transparent — from idea to live
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
            {itProcess.map((p) => (
              <div key={p.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 text-white font-bold text-[22px] mx-auto mb-4 flex items-center justify-center">
                  {p.step}
                </div>
                <h3 className="text-white font-bold text-[16px]">{p.title}</h3>
                <p className="text-white/75 text-[13px] mt-2 leading-relaxed max-w-[200px] mx-auto">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5 — TECHNOLOGIES ── */}
      <section className="bg-[#fefefd] pt-[80px] pb-[80px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <SectionTitle title="Technologies We Use" />
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {itTechnologies.map((tech) => (
              <span
                key={tech}
                className="bg-white border border-[#e8e8f0] rounded-[10px] px-5 py-2.5 text-[13px] font-semibold text-[#1a1a2e] shadow-sm hover:border-brand-primary hover:text-brand-primary hover:shadow-md transition-all duration-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 6 — CTA + TESTIMONIALS ── */}
      <QuoteCTABanner
        href="/contact"
        title="Get a Free IT Consultation"
        subtitle="30 minutes · No obligation · Australia-wide"
      />
      <TestimonialsStrip />
    </>
  )
}
