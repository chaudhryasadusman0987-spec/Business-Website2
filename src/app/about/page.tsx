import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, Users, Zap, Heart, ChevronRight } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import AnimateIn from "@/components/ui/AnimateIn"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import BrandLogo from "@/components/ui/BrandLogo"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "About Us",
  description:
    `Learn about ${SITE_FULL} — Australian-owned multi-service business. ` +
    "Security, mobility and technology solutions.",
}

const values = [
  {
    Icon: ShieldCheck,
    title: "Quality First",
    text: "We never cut corners. Every job is done right the first time.",
  },
  {
    Icon: Users,
    title: "Customer Focused",
    text: "Your success is our success. We are not done until you are happy.",
  },
  {
    Icon: Zap,
    title: "Fast & Reliable",
    text: "Same-week installs, 2-hour quote confirmations. We respect your time.",
  },
  {
    Icon: Heart,
    title: "Australian Owned",
    text: "Proudly Australian. We invest back into local communities and businesses.",
  },
]

const team = [
  {
    initials: "EA",
    name: "Ehtsham",
    role: "Owner & Director",
    bio: "Based in Brisbane. Leads sales, operations, client relationships and all key business decisions for Pak Oz Solutions.",
  },
  {
    initials: "TI",
    name: "Tayyab Iftikhar",
    role: "Director & Operations",
    bio: "Based in Brisbane. Manages on-ground support, client installations and day-to-day business operations.",
  },
  {
    initials: "AM",
    name: "Asad",
    role: "IT & Digital",
    bio: "IT graduate handling website development, technology, digital systems and automation.",
  },
]

export default function AboutPage() {
  return (
    <>
      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden bg-brand-hero text-center on-dark py-16 lg:py-24">
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center gap-2 text-[12px] text-muted mb-6">
            <Link href="/" className="inline-block py-1 hover:text-accent transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-muted">About</span>
          </nav>
          <div className="flex justify-center mb-8">
            <BrandLogo />
          </div>
          <h1 className="text-white">
            About Us
          </h1>
          <p className="lead mx-auto mt-4">Australian-owned. Expert team.</p>
        </div>
      </section>

      {/* ── 2. STORY ── */}
      <section className="bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-16 items-center">
          <div className="relative w-full aspect-[4/3] lg:w-[45%] rounded-img overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=1600&q=80"
              alt="Our team collaborating in the office"
              fill
              sizes="(max-width: 1024px) 100vw, 540px"
              className="object-cover object-center"
              fallbackBg="#f0f0ff"
              placeholderText="Team photo coming soon"
              priority
            />
          </div>
          <div className="flex-1">
            <p className="eyebrow mb-3">Our Story</p>
            <h2 className="text-[#1a1a2e]">
              One company for all your technology and service needs.
            </h2>
            <p className="mt-4 text-[15px] text-muted leading-relaxed">
              We started with one goal — make quality technology and
              professional services accessible to every Australian business.
              From CCTV installation to AI automation, we deliver with the same
              commitment to quality every time.
            </p>
            <p className="mt-4 text-[15px] text-muted leading-relaxed">
              Based in Brisbane, we service clients across Brisbane and Southeast
              QLD. Licensed,
              insured and committed to quality on every job. Don&apos;t take
              our word for it —{" "}
              <Link
                href="/testimonials"
                className="text-accent font-medium underline decoration-current/30 underline-offset-2 hover:text-accent"
              >
                read our customer reviews
              </Link>
              , or{" "}
              <Link href="/contact" className="text-accent font-medium underline decoration-current/30 underline-offset-2 hover:text-accent">
                get in touch with the team
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. VALUES ── */}
      <section className="bg-surface on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="What we stand for" title="Our Values" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {values.map((v, index) => (
              <AnimateIn key={v.title} animation="fade-up" delay={(index % 4) * 100}>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-tint text-brand-primary">
                  <v.Icon size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-ink">{v.title}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-muted">{v.text}</p>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. TEAM ── */}
      <section id="team" className="scroll-mt-24 bg-white on-light py-14 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Our Team" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-14">
            {team.map((m, index) => (
              <AnimateIn key={m.initials} animation="scale" delay={index * 200}>
              <div
                className="bg-white border border-line rounded-card p-8 text-center h-full on-light"
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-brand-primary flex items-center justify-center text-white font-bold text-[24px]">
                  {m.initials}
                </div>
                <h3 className="font-bold text-[18px] text-[#1a1a2e]">{m.name}</h3>
                <p className="text-accent font-medium text-[13px] mt-1">
                  {m.role}
                </p>
                <p className="text-[13px] text-muted mt-3 leading-relaxed">
                  {m.bio}
                </p>
              </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <QuoteCTABanner />
    </>
  )
}
