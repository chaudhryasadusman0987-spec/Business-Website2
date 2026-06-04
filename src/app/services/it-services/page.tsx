import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check, Bot } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import DynamicIcon from "@/components/ui/DynamicIcon"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import TestimonialsStrip from "@/components/sections/TestimonialsStrip"
import {
  itServiceItems,
  itConsulting,
  itProcess,
  itTechnologies,
} from "@/data/it-services"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `IT & AI Services | ${SITE_FULL}`,
  description:
    "Web development, mobile apps, AI automation and IT consulting for " +
    "Australian businesses. Fixed prices. Free consultation.",
}

const aiBenefits = [
  "AI chat agents collecting leads 24/7",
  "Automated email and document processing",
  "Connect your CRM and business tools",
  "Custom AI trained on your business data",
]

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
                href="/#services"
                className="inline-flex items-center justify-center border border-white/20 text-white rounded-[8px] h-[52px] px-8 hover:bg-white/5 transition-all"
              >
                Explore Services
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 flex-wrap">
              <span className="text-[13px] text-[#9496a8]">50+ Projects</span>
              <span className="w-px h-5 bg-white/20" />
              <span className="text-[13px] text-[#9496a8]">100% Aus Team</span>
              <span className="w-px h-5 bg-white/20" />
              <span className="text-[13px] text-[#9496a8]">Free Consult</span>
            </div>
          </div>

          {/* RIGHT — mini-cards */}
          <div className="w-full lg:w-[420px] bg-[rgba(127,133,247,0.08)] border border-[rgba(127,133,247,0.15)] rounded-[24px] p-6 flex flex-col gap-3">
            {itServiceItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-[14px] p-4 flex items-center gap-4 hover:border-[rgba(127,133,247,0.4)] hover:bg-[rgba(127,133,247,0.08)] transition-all duration-300"
              >
                <span
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ background: item.iconBg }}
                >
                  <DynamicIcon name={item.icon} size={20} color={item.iconColor} />
                </span>
                <span className="flex-1">
                  <span className="block text-white font-semibold text-[14px]">
                    {item.name}
                  </span>
                  <span className="block text-[#666880] text-[11px] mt-0.5">
                    {item.tagline}
                  </span>
                </span>
                <ArrowRight size={14} className="ml-auto text-[#7f85f7]" />
              </Link>
            ))}

            {/* IT Consulting — 4th mini-card (no subpage) */}
            <Link
              href="/contact"
              className="bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-[14px] p-4 flex items-center gap-4 hover:border-[rgba(127,133,247,0.4)] hover:bg-[rgba(127,133,247,0.08)] transition-all duration-300"
            >
              <span
                className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: itConsulting.iconBg }}
              >
                <DynamicIcon
                  name={itConsulting.icon}
                  size={20}
                  color={itConsulting.iconColor}
                />
              </span>
              <span className="flex-1">
                <span className="block text-white font-semibold text-[14px]">
                  {itConsulting.name}
                </span>
                <span className="block text-[#666880] text-[11px] mt-0.5">
                  {itConsulting.tagline}
                </span>
              </span>
              <ArrowRight size={14} className="ml-auto text-[#7f85f7]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 2 — 3 SERVICE CARDS ── */}
      <section id="services" className="bg-[#fefefd] pt-[100px] pb-[80px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <SectionTitle
            title="Our Services"
            subtitle="Click any service to explore in detail"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-14">
            {itServiceItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group relative block bg-brand-card rounded-[40px] overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-[0_20px_60px_rgba(127,133,247,0.25)] hover:-translate-y-2"
              >
                {/* image strip */}
                <div className="h-[160px] relative overflow-hidden">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    fallbackBg={item.iconBg}
                  />
                  <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/40 transition duration-500" />
                  {item.badge && (
                    <span className="absolute top-3 left-3 bg-brand-primary text-white group-hover:bg-white group-hover:text-brand-primary rounded-full px-3 py-1 text-[10px] font-bold transition-colors duration-500">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* body */}
                <div className="p-8 text-center bg-brand-card group-hover:bg-brand-primary transition-colors duration-500">
                  <div
                    className="mx-auto mb-3 flex justify-center [color:var(--ic)] group-hover:text-white transition-colors duration-500"
                    style={{ "--ic": item.iconColor } as React.CSSProperties}
                  >
                    <DynamicIcon name={item.icon} size={36} />
                  </div>

                  <h3 className="font-bold text-[20px] text-[#1a1a2e] group-hover:text-white transition-colors duration-500">
                    {item.name}
                  </h3>
                  <p className="text-brand-primary text-[12px] mt-1 font-medium group-hover:text-white/80 transition-colors duration-500">
                    {item.tagline}
                  </p>
                  <p className="text-[13px] text-gray-500 mt-3 leading-relaxed line-clamp-2 group-hover:text-white/80 transition-colors duration-500">
                    {item.description}
                  </p>
                  <p className="font-bold text-[16px] text-[#1a1a2e] mt-4 group-hover:text-white transition-colors duration-500">
                    {item.startingFrom}
                  </p>

                  <span className="mt-3 inline-flex items-center gap-1 bg-white/60 group-hover:bg-white/20 rounded-full px-3 py-1 text-[11px] text-gray-600 group-hover:text-white transition-all duration-500">
                    {item.packages.length} packages available
                  </span>

                  <span className="flex items-center justify-center gap-1 mt-4 text-brand-primary group-hover:text-white transition-colors text-[13px] font-semibold">
                    Explore Service
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </div>

                <ArrowRight
                  size={18}
                  className="absolute bottom-5 right-5 text-gray-300 group-hover:text-white/60 transition-colors duration-500"
                />
              </Link>
            ))}
          </div>

          {/* IT Consulting — half-width card below grid */}
          <div className="bg-[#f0f4ff] border border-[#e0e0ff] rounded-[24px] p-8 flex flex-col lg:flex-row items-center gap-8 mt-8 max-w-[900px] mx-auto">
            <div
              className="p-4 rounded-[16px] flex-shrink-0"
              style={{ background: itConsulting.iconBg }}
            >
              <DynamicIcon
                name={itConsulting.icon}
                size={48}
                color={itConsulting.iconColor}
              />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h3 className="font-bold text-[20px] text-[#1a1a2e]">
                {itConsulting.name}
              </h3>
              <p className="text-[#7f85f7] text-[13px] mt-1 font-medium">
                {itConsulting.tagline}
              </p>
              <p className="text-[14px] text-gray-500 mt-2">
                {itConsulting.description}
              </p>
            </div>
            <div className="text-center">
              <p className="font-bold text-[18px] text-[#1565c0]">
                {itConsulting.startingFrom}
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-brand-primary text-white rounded-[8px] h-[44px] px-6 text-[14px] font-semibold mt-3 hover:bg-[#6b71f0] transition-all"
              >
                Get Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 — AI HIGHLIGHT ── */}
      <section className="relative overflow-hidden bg-[#0d0d1a] pt-[100px] pb-[100px]">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="relative z-10 max-w-[1170px] mx-auto px-4 flex flex-col lg:flex-row gap-16 items-center">
          {/* LEFT */}
          <div className="flex-1">
            <p className="text-[#7f85f7] text-[11px] font-semibold uppercase tracking-widest mb-4">
              AI Automation
            </p>
            <h2 className="font-extrabold text-[36px] lg:text-[48px] text-white leading-tight">
              Automate Your Business.{" "}
              <span className="text-[#7f85f7]">Save Hours Every Week.</span>
            </h2>
            <p className="text-[15px] text-[#9496a8] mt-4 max-w-[460px]">
              Stop spending time on repetitive tasks. Our AI agents handle
              customer enquiries, process documents and connect your tools — so
              you can focus on growing your business.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {aiBenefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#0f6e56]/20 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-[#5dcaa5]" />
                  </span>
                  <span className="text-[14px] text-[#9496a8]">{b}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/services/it-services/ai-automation"
                className="inline-flex items-center justify-center bg-[#7f85f7] text-white rounded-[8px] h-[52px] px-8 font-semibold hover:bg-[#6b71f0] transition-all"
              >
                Explore AI Automation
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center border border-white/20 text-white rounded-[8px] h-[52px] px-8 hover:bg-white/5 transition-all"
              >
                Get Free Consultation
              </Link>
            </div>
          </div>

          {/* RIGHT — demo chat */}
          <div className="lg:w-[420px] w-full bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-[20px] p-6">
            <div className="bg-[#2d2d2c] rounded-[10px] px-4 py-3 mb-4 flex items-center gap-3">
              <span className="bg-[#7f85f7] w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </span>
              <span className="text-white font-semibold text-[14px]">
                {SITE_FULL} Assistant
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-[#5dcaa5] text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#5dcaa5]" />
                Online
              </span>
            </div>

            <div className="bg-[rgba(255,255,255,0.08)] text-white/80 rounded-[12px] rounded-tl-none p-3 text-[12px] max-w-[85%] mb-3">
              Hi! I&apos;m your AI assistant. How can I help today?
            </div>
            <div className="bg-[#7f85f7] text-white rounded-[12px] rounded-tr-none p-3 text-[12px] max-w-[85%] ml-auto mb-3">
              What are your CCTV prices?
            </div>
            <div className="bg-[rgba(255,255,255,0.08)] text-white/80 rounded-[12px] rounded-tl-none p-3 text-[12px] max-w-[85%] mb-3">
              Our cameras start from $149. Would you like a free quote? I can
              take your details now.
            </div>

            <p className="text-[11px] text-[#666880] text-center mt-4">
              👇 Try the live AI chat — bottom right corner
            </p>
          </div>
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
