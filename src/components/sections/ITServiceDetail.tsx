import type { ReactNode } from "react"
import Link from "next/link"
import { ChevronRight, Check } from "lucide-react"
import SectionTitle from "@/components/ui/SectionTitle"
import DynamicIcon from "@/components/ui/DynamicIcon"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import QuoteCTABanner from "@/components/sections/QuoteCTABanner"
import type { ITServiceItem } from "@/data/it-services"

interface Props {
  service: ITServiceItem
  headlineWhite: string
  headlinePurple: string
  packagesTitle: string
  floatingBadge: { title: string; sub: string }
  /** Optional section rendered after packages, before the process steps. */
  extra?: ReactNode
}

export default function ITServiceDetail({
  service,
  headlineWhite,
  headlinePurple,
  packagesTitle,
  floatingBadge,
  extra,
}: Props) {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#0d0d1a]">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,133,247,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.07) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div
          className="absolute z-0 w-[500px] h-[500px] rounded-full top-[-120px] right-[-60px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(127,133,247,0.2) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10 max-w-[1170px] mx-auto px-4 py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* LEFT */}
          <div className="flex-1">
            <nav className="flex items-center gap-2 text-[12px] text-[#666880] mb-4">
              <Link href="/" className="hover:text-[#7f85f7] transition-colors">
                Home
              </Link>
              <ChevronRight size={12} />
              <Link
                href="/services/it-services"
                className="hover:text-[#7f85f7] transition-colors"
              >
                IT &amp; AI Services
              </Link>
              <ChevronRight size={12} />
              <span className="text-[#9496a8]">{service.name}</span>
            </nav>

            <span className="inline-flex items-center gap-2 bg-[rgba(127,133,247,0.15)] border border-[rgba(127,133,247,0.3)] text-[#a5a8ff] text-[11px] rounded-full px-4 py-1.5">
              {service.name}
            </span>

            <h1 className="font-extrabold text-[40px] lg:text-[60px] leading-[1.1] mt-6">
              <span className="block text-white">{headlineWhite}</span>
              <span className="block text-[#7f85f7]">{headlinePurple}</span>
            </h1>

            <p className="text-[15px] text-[#9496a8] max-w-[420px] mt-4">
              {service.longDescription}
            </p>

            <Link
              href="/services/it-services/quote"
              className="inline-flex items-center justify-center bg-[#7f85f7] text-white rounded-[8px] h-[52px] px-8 font-semibold mt-8 hover:bg-[#6b71f0] transition-all"
            >
              Get a Free Quote
            </Link>
          </div>

          {/* RIGHT — image */}
          <div className="lg:w-[45%] w-full relative">
            <div className="relative w-full h-[420px] lg:h-[480px] rounded-[24px] overflow-hidden">
              <ImageWithFallback
                src={service.image}
                alt={service.imageAlt}
                fill
                className="object-cover object-center"
                fallbackBg={service.iconBg}
                priority
              />
            </div>
            <div className="absolute bottom-5 left-5 bg-black/55 backdrop-blur border border-white/15 rounded-[12px] px-4 py-3 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5dcaa5] animate-pulse" />
              <span>
                <span className="block text-white font-semibold text-[14px]">
                  {floatingBadge.title}
                </span>
                <span className="block text-[#5dcaa5] text-[11px]">
                  {floatingBadge.sub}
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="bg-[#fefefd] pt-[80px] pb-[60px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {service.features.map((f) => (
              <div key={f.title} className="text-center">
                <div className="flex justify-center text-brand-primary mb-4">
                  <DynamicIcon name={f.icon} size={40} />
                </div>
                <h3 className="font-bold text-[#1a1a2e]">{f.title}</h3>
                <p className="text-gray-500 text-[13px] mt-1">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES GRID ── */}
      <section className="bg-[#fefefd] pt-[80px] pb-[100px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <SectionTitle
            title={packagesTitle}
            subtitle="Fixed prices · No hidden costs"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
            {service.packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white border border-[#e8e8f0] rounded-[24px] p-8 relative hover:border-brand-primary hover:shadow-xl transition-all duration-300"
              >
                {pkg.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold px-4 py-1 rounded-full">
                    {pkg.badge}
                  </span>
                )}

                <h3 className="font-bold text-[22px] text-[#1a1a2e]">
                  {pkg.name}
                </h3>
                <p className="text-gray-500 text-[14px] mt-1">
                  {pkg.description}
                </p>

                <p className="text-[32px] font-extrabold text-brand-primary mt-6">
                  {pkg.startingFrom}
                </p>

                <div className="w-full h-px bg-[#e8e8f0] my-6" />

                <ul className="flex flex-col gap-3">
                  {pkg.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#e1f5ee] flex-shrink-0 mt-0.5 flex items-center justify-center">
                        <Check size={12} className="text-[#0f6e56]" />
                      </span>
                      <span className="text-[13px] text-[#1a1a2e] leading-snug">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/services/it-services/quote"
                  className="flex items-center justify-center w-full mt-8 bg-brand-primary text-white rounded-[10px] h-[52px] font-semibold hover:bg-[#6b71f0] transition-all"
                >
                  Get a Quote
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── optional extra section ── */}
      {extra}

      {/* ── PROCESS ── */}
      <section className="bg-brand-primary pt-[100px] pb-[100px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <h2 className="text-[45px] font-bold text-white uppercase leading-tight text-center">
            How We Work
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
            {service.process.map((p) => (
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

      {/* ── TECHNOLOGIES ── */}
      <section className="bg-[#fefefd] pt-[80px] pb-[80px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <SectionTitle title="Technologies We Use" />
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {service.technologies.map((tech) => (
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

      <QuoteCTABanner href="/contact" />
    </>
  )
}
