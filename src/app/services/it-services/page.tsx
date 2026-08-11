import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  FileCheck,
  Headphones,
  KeyRound,
  MapPin,
  MonitorPlay,
  Phone,
  ShieldCheck,
} from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"
import CountUp from "@/components/ui/CountUp"
import DynamicIcon from "@/components/ui/DynamicIcon"
import ImageWithFallback from "@/components/ui/ImageWithFallback"
import ITFaq from "@/components/sections/ITFaq"
import TestimonialsStrip from "@/components/sections/TestimonialsStrip"
import { itConsulting } from "@/data/it-services"
import { getITEstimates } from "@/lib/it-services-server"
import { IT_BRAND, SITE_PHONE } from "@/data/site"

// The estimate ranges come from the dashboard's saved overrides, so this page
// must not be baked at build time — otherwise admin edits never appear.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  // `absolute` because the root layout appends "| Pak Oz Solutions" to every
  // title — without it the tab would read "… | Pak Oz Technologies | Pak Oz
  // Solutions". The parent company still owns the footer and the About page.
  title: { absolute: `IT & AI Services Brisbane | ${IT_BRAND}` },
  description:
    "Web development, app development, AI automation and IT consulting for " +
    "Brisbane businesses. Estimated pricing shown up front. Real price " +
    "confirmed in a free 30-minute consultation.",
}

/* What we promise every client — commitments, not sales numbers. */
const PROMISES: { value: number; label: string; prefix?: string; suffix?: string }[] = [
  { value: 30, suffix: " min", label: "Free consultation" },
  { value: 24, suffix: " hr", label: "Reply to every brief" },
  { value: 100, suffix: "%", label: "You own the code" },
  { value: 0, prefix: "$", label: "Cost to get an estimate" },
]

const TRUST = [
  { Icon: MapPin, text: "Brisbane based, working Australia-wide" },
  { Icon: FileCheck, text: "Fixed scope agreed before we start" },
  { Icon: KeyRound, text: "Source code handed to you at the end" },
  { Icon: Phone, text: "You speak to the person building it" },
]

const INCLUDED = [
  {
    Icon: FileCheck,
    title: "A scope you can hold us to",
    body: "After the consultation you get one fixed price and a written list of exactly what is being built. If it's on the list, it's in the price.",
  },
  {
    Icon: MonitorPlay,
    title: "Working demos, not status reports",
    body: "You see the real thing at every milestone and tell us what to change while changing it is still cheap.",
  },
  {
    Icon: KeyRound,
    title: "Everything in your name",
    body: "Source code, domain, hosting and any accounts we set up belong to your business. You are never locked in to us.",
  },
  {
    Icon: Headphones,
    title: "Support after launch",
    body: "Every project ships with a support window included, and we're on the end of the phone after that — no ticket queue.",
  },
]

const PROCESS = [
  {
    step: "01",
    title: "Tell us what you need",
    body: "Fill in the brief — what the business does, what you want built, roughly what you'd like to spend. Ten minutes, no account to create.",
  },
  {
    step: "02",
    title: "We send an estimate",
    body: "Within 24 hours you get an honest range for work like yours, and the questions we'd need answered to tighten it up.",
  },
  {
    step: "03",
    title: "Free 30-minute call",
    body: "We go through the detail together. Sometimes we talk you out of half the scope. Nothing to sign, nothing to pay.",
  },
  {
    step: "04",
    title: "Fixed price, then we build",
    body: "One number, one scope, agreed dates. You see working software as it's built, and you own the lot at the end.",
  },
]

export default async function ITServicesPage() {
  const services = await getITEstimates()
  const telHref = `tel:${SITE_PHONE.replace(/\s/g, "")}`
  const lowest = Math.min(...services.map((s) => s.estimatedFrom))

  return (
    <main>
      {/* ───────────────────── HERO ───────────────────── */}
      <section className="relative overflow-hidden bg-[#0d0d1a]">
        {/* grid + glows */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(127,133,247,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(127,133,247,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 -top-32 z-0 h-[520px] w-[520px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(127,133,247,0.22) 0%, transparent 65%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-20 z-0 h-[380px] w-[380px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(93,202,165,0.14) 0%, transparent 65%)",
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-[1170px] flex-col items-center gap-14 px-4 py-20 lg:flex-row lg:py-28">
          {/* copy */}
          <div className="flex-1">
            <AnimateIn animation="fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(127,133,247,0.3)] bg-[rgba(127,133,247,0.12)] px-4 py-1.5 text-[11px] font-semibold text-[#a5a8ff]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7f85f7]" />
                {IT_BRAND} · Brisbane &amp; Remote
              </span>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={100}>
              <h1 className="mt-6 text-[40px] font-extrabold leading-[1.08] text-white lg:text-[58px]">
                Technology that pays
                <br />
                for itself.
              </h1>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={200}>
              <p className="mt-5 max-w-[500px] text-[16px] leading-[1.8] text-[#9496a8]">
                Websites, mobile apps and AI automation for Australian
                businesses — built by the people you actually talk to. Tell us
                what you need and we&apos;ll come back with an honest estimate
                inside 24 hours.
              </p>
            </AnimateIn>

            <AnimateIn animation="fade-up" delay={300}>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  href="/services/it-services/quote"
                  className="group inline-flex h-[54px] items-center gap-2 rounded-[10px] bg-[#7f85f7] px-8 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(127,133,247,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#6b71f0] hover:shadow-[0_14px_40px_rgba(127,133,247,0.45)]"
                >
                  Start my project brief
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
                <a
                  href={telHref}
                  className="inline-flex h-[54px] items-center gap-2 rounded-[10px] border border-white/20 px-8 text-[15px] font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5"
                >
                  <Phone size={16} />
                  {SITE_PHONE}
                </a>
              </div>
            </AnimateIn>

            {/* commitments */}
            <AnimateIn animation="fade-up" delay={400}>
              <div className="mt-12 grid max-w-[520px] grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-4">
                {PROMISES.map((p) => (
                  <div key={p.label}>
                    <p className="text-[26px] font-extrabold leading-none text-white">
                      <CountUp end={p.value} prefix={p.prefix} suffix={p.suffix} />
                    </p>
                    <p className="mt-2 text-[11px] leading-snug text-[#9496a8]">{p.label}</p>
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>

          {/* photo */}
          <AnimateIn animation="slide-left" delay={200} className="w-full lg:w-[46%]">
            <div className="relative">
              <div className="relative h-[380px] w-full overflow-hidden rounded-[24px] shadow-2xl lg:h-[500px]">
                <ImageWithFallback
                  src="/images/it-services/hero.jpg"
                  alt="Development team building software for Australian businesses"
                  fill
                  className="object-cover object-center"
                  fallbackIcon="Camera"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-transparent to-transparent" />
              </div>

              {/* floating price card */}
              <div className="absolute -bottom-6 -left-4 hidden rounded-[16px] border border-white/10 bg-[#14142a]/95 px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur sm:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9496a8]">
                  Projects start from
                </p>
                <p className="mt-1 text-[24px] font-extrabold leading-none text-white">
                  ${lowest.toLocaleString("en-AU")}
                </p>
                <p className="mt-1.5 text-[11px] text-[#5dcaa5]">
                  Estimate only · confirmed on the call
                </p>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─────────────── TRUST STRIP ─────────────── */}
      <section className="border-b border-[#eeeeff] bg-white">
        <div className="mx-auto grid max-w-[1170px] grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ Icon, text }, i) => (
            <AnimateIn key={text} animation="fade-up" delay={i * 100}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#eeedfe]">
                  <Icon size={16} className="text-[#7f85f7]" />
                </span>
                <span className="text-[13px] font-medium leading-snug text-[#444]">{text}</span>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* ─────────────── SERVICES ─────────────── */}
      <section id="services" className="bg-[#fefefd] pb-[90px] pt-[90px]">
        <div className="mx-auto max-w-[1170px] px-4">
          <AnimateIn animation="fade-up">
            <div className="mx-auto max-w-[620px] text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7f85f7]">
                What we build
              </p>
              <h2 className="mt-3 text-[34px] font-bold leading-tight text-[#1a1a2e] lg:text-[40px]">
                Three things, done properly
              </h2>
              <p className="mt-4 text-[15px] leading-[1.8] text-[#666]">
                We&apos;d rather be excellent at a few things than average at
                everything. Here&apos;s what we take on, and what it usually
                costs.
              </p>
            </div>
          </AnimateIn>

          {/* estimate explainer */}
          <AnimateIn animation="fade-up" delay={100}>
            <div className="mx-auto mt-10 flex max-w-[760px] items-start gap-3 rounded-[14px] border border-[#f0c040] bg-[#fff8e1] px-5 py-4">
              <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#f0c040]/25">
                <Clock size={14} className="text-[#7d5a00]" />
              </span>
              <p className="text-[13px] leading-[1.7] text-[#7d5a00]">
                <strong>The prices below are estimates, not quotes.</strong>{" "}
                They&apos;re published so you know the ballpark before you pick
                up the phone. Your real price is agreed after a free
                consultation, in writing, and it doesn&apos;t move unless the
                scope does.
              </p>
            </div>
          </AnimateIn>

          <div className="mt-12 grid grid-cols-1 gap-7 lg:grid-cols-3">
            {services.map((service, i) => (
              <AnimateIn
                key={service.id}
                animation="fade-up"
                delay={(i % 3) * 150}
                className="flex"
              >
                <article className="group flex w-full flex-col overflow-hidden rounded-[22px] border border-[#e8e8f0] bg-white transition-all duration-500 hover:-translate-y-2 hover:border-[#c9ccfb] hover:shadow-[0_24px_60px_rgba(127,133,247,0.18)]">
                  {/* photo — doubles as the way into the service's own page */}
                  <Link
                    href={service.detailHref}
                    aria-label={`${service.name} — packages and detail`}
                    className="relative block h-[210px] overflow-hidden"
                  >
                    <ImageWithFallback
                      src={service.image}
                      alt={service.imageAlt}
                      fill
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                      fallbackIcon="Camera"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/85 via-[#0d0d1a]/25 to-transparent" />

                    {service.badge && (
                      <span className="absolute right-4 top-4 rounded-full bg-[#7f85f7] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
                        {service.badge}
                      </span>
                    )}

                    {/* icon chip + title sit on the photo */}
                    <div className="absolute inset-x-5 bottom-4 flex items-center gap-3">
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px] border border-white/20 bg-white/15 backdrop-blur transition-colors duration-500 group-hover:bg-[#7f85f7]">
                        <DynamicIcon name={service.iconName} size={20} className="text-white" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-[19px] font-bold leading-tight text-white">
                          {service.name}
                        </h3>
                        <p className="mt-0.5 truncate text-[12px] text-white/70">
                          {service.timeline}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* body */}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-[13px] font-semibold text-[#7f85f7]">{service.tagline}</p>
                    <p className="mt-3 text-[14px] leading-[1.75] text-[#555]">
                      {service.description}
                    </p>

                    <div className="mt-5 flex flex-1 flex-col gap-2.5">
                      {service.features.map((f) => (
                        <div key={f} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-[17px] w-[17px] flex-shrink-0 items-center justify-center rounded-full bg-[#eeedfe]">
                            <Check size={10} className="text-[#7f85f7]" strokeWidth={3} />
                          </span>
                          <span className="text-[13px] leading-snug text-[#444]">{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* estimate */}
                    <div className="mt-6 rounded-[14px] border border-[#eeeeff] bg-[#f8f8ff] p-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9496a8]">
                          Estimated range
                        </p>
                        <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#9496a8]">
                          Guide only
                        </span>
                      </div>
                      <p className="mt-1.5 text-[23px] font-extrabold leading-none text-[#7f85f7]">
                        {service.estimatedDisplay}
                      </p>
                      <p className="mt-2 text-[11px] leading-snug text-[#9496a8]">
                        Your price is confirmed in the free consultation.
                      </p>
                    </div>

                    <div className="mt-5 flex flex-col gap-2.5">
                      <Link
                        href={`/services/it-services/quote?service=${service.id}`}
                        className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#1a1a2e] text-[14px] font-semibold text-white transition-all duration-300 hover:bg-[#7f85f7]"
                      >
                        Describe my project
                        <ArrowRight
                          size={15}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </Link>
                      {/* The service's own page: packages, process, tech stack.
                          Without this the detail pages were only reachable from
                          the home page. */}
                      <Link
                        href={service.detailHref}
                        className="inline-flex h-[44px] w-full items-center justify-center gap-1.5 rounded-[12px] border border-[#e8e8f0] text-[13px] font-semibold text-[#1a1a2e] transition-all duration-300 hover:border-[#7f85f7] hover:bg-[#f8f8ff] hover:text-[#534ab7]"
                      >
                        See packages &amp; full detail
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── WHAT'S INCLUDED ─────────────── */}
      <section className="bg-[#f4f4ff] py-[90px]">
        <div className="mx-auto max-w-[1170px] px-4">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">
            <AnimateIn animation="slide-right" className="lg:w-[36%]">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7f85f7]">
                Every project
              </p>
              <h2 className="mt-3 text-[32px] font-bold leading-tight text-[#1a1a2e]">
                What you get, whatever we build
              </h2>
              <p className="mt-4 text-[15px] leading-[1.8] text-[#666]">
                The parts of a software project that go wrong are rarely
                technical. These four are how we keep it boring.
              </p>
              <Link
                href="/services/it-services/quote?service=it-consulting"
                className="mt-7 inline-flex items-center gap-2 text-[14px] font-semibold text-[#7f85f7] transition-colors hover:text-[#534ab7]"
              >
                Book the free consultation
                <ArrowRight size={15} />
              </Link>
            </AnimateIn>

            <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2">
              {INCLUDED.map((item, i) => (
                <AnimateIn key={item.title} animation="fade-up" delay={(i % 2) * 100}>
                  <div className="h-full rounded-[18px] border border-white bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(127,133,247,0.14)]">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#eeedfe]">
                      <item.Icon size={19} className="text-[#7f85f7]" />
                    </span>
                    <h3 className="mt-4 text-[16px] font-bold text-[#1a1a2e]">{item.title}</h3>
                    <p className="mt-2 text-[13px] leading-[1.75] text-[#666]">{item.body}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── PROCESS ─────────────── */}
      <section className="bg-[#fefefd] py-[90px]">
        <div className="mx-auto max-w-[1170px] px-4">
          <AnimateIn animation="fade-up">
            <div className="mx-auto max-w-[560px] text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7f85f7]">
                How it works
              </p>
              <h2 className="mt-3 text-[34px] font-bold leading-tight text-[#1a1a2e]">
                From first message to launch
              </h2>
              <p className="mt-4 text-[15px] leading-[1.8] text-[#666]">
                Four steps. You can stop after any of them and it hasn&apos;t
                cost you anything.
              </p>
            </div>
          </AnimateIn>

          <div className="relative mt-14">
            {/* connector line behind the steps */}
            <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-gradient-to-r from-transparent via-[#d8daff] to-transparent lg:block" />

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {PROCESS.map((p, i) => (
                <AnimateIn key={p.step} animation="fade-up" delay={i * 150}>
                  <div className="group relative text-center lg:text-left">
                    <span className="relative z-10 mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-[#e0e2ff] bg-white text-[15px] font-extrabold text-[#7f85f7] transition-all duration-500 group-hover:border-[#7f85f7] group-hover:bg-[#7f85f7] group-hover:text-white lg:mx-0">
                      {p.step}
                    </span>
                    <h3 className="mt-5 text-[17px] font-bold text-[#1a1a2e]">{p.title}</h3>
                    <p className="mt-2.5 text-[13px] leading-[1.8] text-[#666]">{p.body}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── IT CONSULTING ─────────────── */}
      <section className="relative overflow-hidden bg-[#0d0d1a] py-[90px]">
        <div
          className="pointer-events-none absolute -left-32 top-1/2 h-[460px] w-[460px] -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(127,133,247,0.18) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10 mx-auto flex max-w-[1170px] flex-col items-center gap-14 px-4 lg:flex-row">
          <AnimateIn animation="slide-right" className="w-full lg:w-[45%]">
            <div className="relative h-[320px] w-full overflow-hidden rounded-[24px] shadow-2xl lg:h-[400px]">
              <ImageWithFallback
                src={itConsulting.image}
                alt={itConsulting.imageAlt}
                fill
                className="object-cover"
                fallbackIcon="Camera"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0d0d1a]/70 to-transparent" />
            </div>
          </AnimateIn>

          <AnimateIn animation="slide-left" delay={100} className="flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(127,133,247,0.3)] bg-[rgba(127,133,247,0.12)] px-4 py-1.5 text-[11px] font-semibold text-[#a5a8ff]">
              <DynamicIcon name={itConsulting.iconName} size={13} />
              {itConsulting.name}
            </span>

            <h2 className="mt-6 text-[30px] font-bold leading-tight text-white lg:text-[38px]">
              Not sure what your business
              <br className="hidden lg:block" /> actually needs?
            </h2>

            <p className="mt-4 max-w-[520px] text-[15px] leading-[1.85] text-[#9496a8]">
              Most businesses waste money on technology that solves the wrong
              problem. Give us half an hour and we&apos;ll tell you what
              we&apos;d do in your position — including when the answer is to do
              nothing yet.
            </p>

            <div className="mt-7 flex flex-col gap-3">
              {itConsulting.features.map((f, i) => (
                <AnimateIn key={f} animation="fade-up" delay={i * 100}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(93,202,165,0.15)]">
                      <Check size={11} className="text-[#5dcaa5]" strokeWidth={3} />
                    </span>
                    <span className="text-[14px] text-[#c9cbd8]">{f}</span>
                  </div>
                </AnimateIn>
              ))}
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/services/it-services/quote?service=it-consulting"
                className="group inline-flex h-[54px] items-center justify-center gap-2 rounded-[10px] bg-[#7f85f7] px-8 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(127,133,247,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#6b71f0]"
              >
                {itConsulting.callToAction}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <a
                href={telHref}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-[10px] border border-white/20 px-8 text-[15px] font-semibold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/5"
              >
                <Phone size={16} />
                {SITE_PHONE}
              </a>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* ─────────────── FAQ ─────────────── */}
      <section className="bg-[#fefefd] py-[90px]">
        <div className="mx-auto max-w-[820px] px-4">
          <AnimateIn animation="fade-up">
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7f85f7]">
                Before you ask
              </p>
              <h2 className="mt-3 text-[34px] font-bold leading-tight text-[#1a1a2e]">
                The questions we get every week
              </h2>
            </div>
          </AnimateIn>

          <AnimateIn animation="fade-up" delay={100} className="mt-10">
            <ITFaq />
          </AnimateIn>
        </div>
      </section>

      {/* Social proof sits directly before the ask. Renders nothing until the
          business has at least one review, so the page never shows an empty
          shell. */}
      <TestimonialsStrip />

      {/* ─────────────── CLOSING CTA ─────────────── */}
      <section className="bg-[#f4f4ff] py-[80px]">
        <div className="mx-auto max-w-[1170px] px-4">
          <AnimateIn animation="scale">
            <div className="relative overflow-hidden rounded-[28px] bg-[#1a1a2e] px-8 py-14 text-center shadow-[0_30px_80px_rgba(26,26,46,0.25)] sm:px-14">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-[320px] w-[320px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(127,133,247,0.35) 0%, transparent 65%)",
                }}
              />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-semibold text-[#a5a8ff]">
                  <ShieldCheck size={13} />
                  No obligation · No sales pitch
                </span>
                <h2 className="mx-auto mt-6 max-w-[640px] text-[30px] font-bold leading-tight text-white lg:text-[38px]">
                  Tell us what you want built. We&apos;ll tell you what it takes.
                </h2>
                <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-[1.8] text-[#9496a8]">
                  Ten minutes on the brief, an estimate back within 24 hours,
                  then a free call to work out the real number together.
                </p>
                <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                  <Link
                    href="/services/it-services/quote"
                    className="group inline-flex h-[56px] items-center justify-center gap-2 rounded-[12px] bg-[#7f85f7] px-10 text-[16px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#6b71f0]"
                  >
                    Start my project brief
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                  <a
                    href={telHref}
                    className="inline-flex h-[56px] items-center justify-center gap-2 rounded-[12px] border border-white/25 px-10 text-[15px] font-semibold text-white transition-all duration-300 hover:bg-white/5"
                  >
                    <Phone size={16} />
                    Call {SITE_PHONE}
                  </a>
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>
    </main>
  )
}
