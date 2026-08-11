import type { Metadata } from "next"
import Link from "next/link"
import { itConsulting } from "@/data/it-services"
import { getITEstimates } from "@/lib/it-services-server"
import { SITE_PHONE } from "@/data/site"

// The estimate ranges come from the dashboard's saved overrides, so this page
// must not be baked at build time — otherwise admin edits never appear.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "IT & AI Services Brisbane",
  description:
    "Web development, app development, AI automation and IT consulting for " +
    "Brisbane businesses. Estimated pricing shown. Real price confirmed in a " +
    "free consultation.",
}

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Describe your project",
    desc: "Fill in our simple form. Tell us what you need, your timeline and budget range.",
    icon: "📝",
  },
  {
    step: "02",
    title: "Get an estimate",
    desc: "We review your brief and send you an estimated price range within 24 hours.",
    icon: "💰",
  },
  {
    step: "03",
    title: "Free consultation",
    desc: "30-minute call to discuss your project in detail. No obligation, no jargon.",
    icon: "📞",
  },
  {
    step: "04",
    title: "We get started",
    desc: "Real price agreed, contract signed, project kicks off with regular updates.",
    icon: "🚀",
  },
]

const HOW_WE_WORK: [string, string, string][] = [
  ["1", "You describe what you need", "#7f85f7"],
  ["2", "We give you an estimated range", "#7f85f7"],
  ["3", "Free 30-min consultation call", "#5dcaa5"],
  ["4", "Real price agreed together", "#5dcaa5"],
  ["5", "We build and deliver", "#5dcaa5"],
]

export default async function ITServicesPage() {
  const services = await getITEstimates()
  const telHref = `tel:${SITE_PHONE.replace(/\s/g, "")}`

  return (
    <main>
      {/* ── HERO ── */}
      <section className="bg-[#0d0d1a] min-h-[65vh] relative overflow-hidden flex items-center">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7f85f7, transparent 70%)" }}
        />

        <div className="max-w-[1170px] mx-auto px-4 py-20 w-full flex flex-col lg:flex-row items-center gap-12 relative">
          {/* Left */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 bg-[rgba(127,133,247,0.1)] border-[rgba(127,133,247,0.3)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7f85f7] animate-pulse" />
              <span className="text-[#a5a8ff] text-[11px] font-semibold">
                IT &amp; AI Services · Brisbane &amp; Remote
              </span>
            </div>

            <h1 className="text-[40px] lg:text-[56px] font-extrabold leading-tight mb-4">
              <span className="text-white">Technology That</span>
              <br />
              <span className="text-[#7f85f7]">Grows Your Business.</span>
            </h1>

            <p className="text-[#9496a8] text-[16px] max-w-[480px] leading-relaxed mb-8">
              Web development, mobile apps, AI automation and IT consulting.
              Estimated pricing shown — real price confirmed in your free
              consultation.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="#services"
                className="bg-[#7f85f7] text-white rounded-[8px] h-[52px] px-8 font-bold text-[15px] flex items-center hover:bg-[#6b71f0] transition-all"
              >
                View Services
              </Link>
              <Link
                href="/services/it-services/quote"
                className="border border-white/20 text-white rounded-[8px] h-[52px] px-8 font-semibold text-[15px] flex items-center hover:bg-white/5 transition-all"
              >
                Get a Free Quote
              </Link>
            </div>
          </div>

          {/* Right — how we work */}
          <div className="w-full lg:w-[380px] bg-[rgba(127,133,247,0.08)] border border-[rgba(127,133,247,0.15)] rounded-[20px] p-6">
            <p className="text-white font-bold text-[15px] mb-4">How we work</p>
            {HOW_WE_WORK.map(([num, text, colour]) => (
              <div key={num} className="flex items-center gap-3 mb-3 last:mb-0">
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold text-white"
                  style={{ background: colour }}
                >
                  {num}
                </div>
                <p className="text-[#9496a8] text-[13px]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING DISCLAIMER ── */}
      <section className="bg-[#fff8e1] border-b border-[#f0c040]">
        <div className="max-w-[1170px] mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-[20px] flex-shrink-0">⚠️</span>
          <p className="text-[13px] text-[#7d5a00]">
            <strong>Estimated pricing only.</strong> Prices shown are a guide to
            help you understand the general cost range. Your actual price is
            confirmed after a free consultation based on your specific
            requirements. No obligation.
          </p>
        </div>
      </section>

      {/* ── 3 SERVICES ── */}
      <section id="services" className="bg-[#fefefd] pt-[80px] pb-[60px]">
        <div className="max-w-[1170px] mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#7f85f7] mb-3">
              Our Services
            </p>
            <h2 className="font-bold text-[36px] text-[#1a1a2e] leading-tight">
              What we build for you
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-[#e8e8f0] rounded-[20px] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Card header */}
                <div className="bg-[#f8f8ff] p-6 border-b border-[#eeeeff]">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[40px]">{service.icon}</span>
                    {service.badge && (
                      <span className="bg-[#7f85f7] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        {service.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[20px] text-[#1a1a2e]">
                    {service.name}
                  </h3>
                  <p className="text-[#7f85f7] text-[13px] font-medium mt-1">
                    {service.tagline}
                  </p>
                </div>

                {/* Card body */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-[14px] text-[#555] leading-relaxed mb-5">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-5 flex-1">
                    {service.features.map((f) => (
                      <div key={f} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#eeedfe] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#7f85f7]" />
                        </div>
                        <span className="text-[13px] text-[#444]">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-[12px] text-[#9496a8] mb-4">
                    <span>⏱️</span>
                    <span>
                      Typical timeline:
                      <strong className="text-[#1a1a2e] ml-1">{service.timeline}</strong>
                    </span>
                  </div>

                  {/* Estimated price */}
                  <div className="bg-[#f8f8ff] border border-[#eeeeff] rounded-[12px] p-4 mb-5">
                    <p className="text-[10px] font-bold text-[#9496a8] uppercase tracking-wider mb-1">
                      Estimated price range
                    </p>
                    <p className="font-extrabold text-[22px] text-[#7f85f7]">
                      {service.estimatedDisplay}
                    </p>
                    <p className="text-[10px] text-[#9496a8] mt-1">
                      Guide only · Confirmed in consultation
                    </p>
                  </div>

                  <Link
                    href={`/services/it-services/quote?service=${service.id}`}
                    className="w-full bg-[#1a1a2e] text-white rounded-[10px] h-[46px] flex items-center justify-center font-semibold text-[14px] hover:bg-[#7f85f7] transition-all duration-300"
                  >
                    Describe My Project →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IT CONSULTING (4th) ── */}
      <section className="bg-[#0d0d1a] py-[80px]">
        <div className="max-w-[900px] mx-auto px-4 text-center">
          <span className="text-[48px] mb-4 block">{itConsulting.icon}</span>

          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#7f85f7] mb-3">
            {itConsulting.name}
          </p>

          <h2 className="font-bold text-[32px] lg:text-[40px] text-white leading-tight mb-4">
            Not sure what technology
            <br />
            your business needs?
          </h2>

          <p className="text-[#9496a8] text-[16px] max-w-[560px] mx-auto mb-8 leading-relaxed">
            {itConsulting.description}
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {itConsulting.features.map((f) => (
              <span
                key={f}
                className="bg-[rgba(127,133,247,0.1)] border border-[rgba(127,133,247,0.25)] text-[#a5a8ff] text-[13px] px-4 py-2 rounded-full"
              >
                ✓ {f}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/services/it-services/quote?service=it-consulting"
              className="bg-[#7f85f7] text-white rounded-[10px] h-[54px] px-10 font-bold text-[16px] flex items-center justify-center hover:bg-[#6b71f0] transition-all"
            >
              📅 {itConsulting.callToAction}
            </Link>
            <a
              href={telHref}
              className="border border-white/20 text-white rounded-[10px] h-[54px] px-10 font-semibold text-[15px] flex items-center justify-center hover:bg-white/5 transition-all"
            >
              Call {SITE_PHONE}
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#fefefd] py-[80px]">
        <div className="max-w-[900px] mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#7f85f7] mb-3">
              Simple Process
            </p>
            <h2 className="font-bold text-[32px] text-[#1a1a2e]">How it works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-[32px] mb-3">{item.icon}</div>
                <p className="text-[11px] font-bold text-[#7f85f7] uppercase tracking-wider mb-2">
                  Step {item.step}
                </p>
                <h3 className="font-bold text-[16px] text-[#1a1a2e] mb-2">
                  {item.title}
                </h3>
                <p className="text-[13px] text-[#666] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
