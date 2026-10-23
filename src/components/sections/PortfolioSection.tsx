import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, ExternalLink, MapPin } from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"
import { portfolio } from "@/data/portfolio"

interface Props {
  /** Show only the first N projects. */
  limit?: number
  /** Compact cards drop the "what we built" list — used for the preview. */
  compact?: boolean
  /** Adds a "See all our work" link next to the CTA. */
  viewAllHref?: string
}

export default function PortfolioSection({ limit, compact = false, viewAllHref }: Props) {
  const projects = limit ? portfolio.slice(0, limit) : portfolio

  return (
    <section id="our-work" className="scroll-mt-24 bg-[#f4f4ff] py-[90px]">
      <div className="mx-auto max-w-[1170px] px-4">
        <AnimateIn animation="fade-up">
          <div className="mx-auto max-w-[560px] text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7f85f7]">
              Our Work
            </p>
            <h2 className="mt-3 text-[34px] font-bold leading-tight text-[#1a1a2e]">
              Sites we&apos;ve built and launched
            </h2>
            <p className="mt-4 text-[15px] leading-[1.8] text-[#666]">
              Real businesses, live today. Click through and judge for yourself.
            </p>
          </div>
        </AnimateIn>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {projects.map((p, i) => (
            <AnimateIn key={p.slug} animation="fade-up" delay={(i % 2) * 150} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#e8e8f0] bg-white shadow-[0_10px_40px_rgba(26,26,46,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(127,133,247,0.18)]">
                <div className="relative aspect-[16/10] overflow-hidden border-b border-[#eeeeff] bg-[#f8f8ff]">
                  <Image
                    src={p.image}
                    alt={p.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 570px, 100vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="flex flex-1 flex-col p-7">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="rounded-full bg-[rgba(127,133,247,0.12)] px-3 py-1 text-[11px] font-semibold text-[#534ab7]">
                      {p.industry}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12px] text-[#888]">
                      <MapPin size={12} />
                      {p.location}
                    </span>
                  </div>

                  <h3 className="mt-4 text-[20px] font-bold text-[#1a1a2e]">{p.name}</h3>
                  <p className="mt-2 text-[14px] leading-[1.75] text-[#666]">{p.description}</p>

                  {!compact && (
                    <div className="mt-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1a1a2e]">
                        What we built
                      </p>
                      <ul className="mt-3 flex flex-col gap-2">
                        {p.built.map((b) => (
                          <li key={b} className="flex items-start gap-2.5 text-[13px] text-[#555]">
                            <span className="mt-[2px] flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center rounded-full bg-[rgba(127,133,247,0.15)]">
                              <Check size={10} className="text-[#7f85f7]" strokeWidth={3} />
                            </span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-auto pt-7">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit the ${p.name} website (opens in a new tab)`}
                      className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#1a1a2e] text-[14px] font-semibold text-white transition-all duration-300 hover:bg-[#7f85f7] sm:w-auto sm:px-7"
                    >
                      Visit Site
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </article>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn animation="fade-up" className="mt-14">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-[18px] font-semibold text-[#1a1a2e]">Want a site like these?</p>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/quote"
                className="group inline-flex h-[54px] items-center justify-center gap-2 rounded-[10px] bg-[#7f85f7] px-8 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(127,133,247,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#6b71f0]"
              >
                Get a free consultation
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              {viewAllHref && (
                <Link
                  href={viewAllHref}
                  className="inline-flex h-[54px] items-center justify-center rounded-[10px] border border-[#d8daff] px-8 text-[15px] font-semibold text-[#1a1a2e] transition-all duration-300 hover:border-[#7f85f7] hover:bg-white"
                >
                  See all our work
                </Link>
              )}
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
