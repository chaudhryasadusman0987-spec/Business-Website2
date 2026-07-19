import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, Users, Zap, Heart, ChevronRight } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import { SITE_FULL } from "@/data/site"

export const metadata: Metadata = {
  title: `About Us | ${SITE_FULL}`,
  description:
    `Learn about ${SITE_FULL} — Australian-owned multi-service business. ` +
    "Security, mobility and technology solutions.",
}

const dotGrid = {
  backgroundImage:
    "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
  backgroundSize: "36px 36px",
}
const purpleGlow = {
  background:
    "radial-gradient(circle, rgba(127,133,247,0.2) 0%, transparent 65%)",
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
      <section className="relative overflow-hidden bg-[#0d0d1a] py-24 text-center">
        <div className="absolute inset-0 z-0 pointer-events-none" style={dotGrid} />
        <div
          className="absolute z-0 w-[500px] h-[500px] rounded-full top-[-120px] right-[-60px] pointer-events-none"
          style={purpleGlow}
        />
        <div className="relative z-10 max-w-[1170px] mx-auto px-4">
          <nav className="flex items-center justify-center gap-2 text-[12px] text-[#666880] mb-6">
            <Link href="/" className="hover:text-[#7f85f7] transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#9496a8]">About</span>
          </nav>
          <h1 className="text-white font-extrabold text-[40px] lg:text-[56px] leading-[1.1]">
            About Us
          </h1>
          <p className="text-[#9496a8] text-[16px] mt-4">
            Australian-owned. Expert team.
          </p>
        </div>
      </section>

      {/* ── 2. STORY ── */}
      <section className="bg-[#fefefd] pt-[100px] pb-[80px]">
        <div className="max-w-[1170px] mx-auto px-4 flex flex-col lg:flex-row gap-16 items-center">
          <div className="relative w-full h-[400px] lg:w-[45%] rounded-[24px] overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=1600&q=80"
              alt="Our team collaborating in the office"
              fill
              className="object-cover object-center"
              fallbackBg="#f0f0ff"
              placeholderText="Team photo coming soon"
              priority
            />
          </div>
          <div className="flex-1">
            <p className="text-[#7f85f7] text-[11px] font-semibold uppercase tracking-widest mb-4">
              Our Story
            </p>
            <h2 className="font-bold text-[32px] text-[#1a1a2e] leading-tight">
              One company for all your technology and service needs.
            </h2>
            <p className="mt-4 text-[15px] text-[#666666] leading-relaxed">
              We started with one goal — make quality technology and
              professional services accessible to every Australian business.
              From CCTV installation to AI automation, we deliver with the same
              commitment to quality every time.
            </p>
            <p className="mt-4 text-[15px] text-[#666666] leading-relaxed">
              Based in Brisbane, we service clients across Australia. Licensed,
              insured and committed to quality on every job.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. VALUES ── */}
      <section className="bg-[#7f85f7] pt-[80px] pb-[80px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <h2 className="text-white text-[45px] font-bold uppercase text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v) => (
              <div key={v.title} className="bg-white/15 rounded-[20px] p-8 text-center">
                <v.Icon size={40} className="text-white mx-auto mb-4" />
                <h3 className="text-white font-bold text-[18px]">{v.title}</h3>
                <p className="text-white text-[14px] mt-3 leading-relaxed">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. TEAM ── */}
      <section className="bg-[#fefefd] pt-[100px] pb-[100px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <SectionTitle title="Our Team" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-14">
            {team.map((m) => (
              <div
                key={m.initials}
                className="bg-white border border-[#e8e8f0] rounded-[24px] p-8 text-center"
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-[#7f85f7] flex items-center justify-center text-white font-bold text-[24px]">
                  {m.initials}
                </div>
                <h3 className="font-bold text-[18px] text-[#1a1a2e]">{m.name}</h3>
                <p className="text-[#7f85f7] font-medium text-[13px] mt-1">
                  {m.role}
                </p>
                <p className="text-[13px] text-[#666666] mt-3 leading-relaxed">
                  {m.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <QuoteCTABanner />
    </>
  )
}
