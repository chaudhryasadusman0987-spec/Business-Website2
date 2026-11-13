import Link from "next/link"
import { deliveredProjects } from "@/data/portfolio"

const PORTFOLIO_HREF = "/services/it-services#our-work"
// The track holds two identical halves and slides by one half, so the loop is
// seamless. Each half repeats the list enough to be wider than any screen.
const REPEAT = 4

// "Our work" — a slow, endless row of the client sites we've built. Each name
// links to the portfolio on the IT page. Pauses on hover and keyboard focus;
// with reduced motion it is a plain, static row.
export default function WorkStrip() {
  if (deliveredProjects.length === 0) return null

  const half = (copy: number) =>
    Array.from({ length: REPEAT }).flatMap((_, r) =>
      deliveredProjects.map((p) => {
        // Only the very first set is exposed to keyboards and screen readers.
        const real = copy === 0 && r === 0
        return (
          <li key={`${copy}-${r}-${p.slug}`} aria-hidden={real ? undefined : true} className="flex-shrink-0">
            <Link
              href={PORTFOLIO_HREF}
              tabIndex={real ? undefined : -1}
              className="flex h-12 items-center whitespace-nowrap px-8 font-heading text-[1.125rem] font-semibold text-muted transition-colors duration-200 hover:text-ink"
            >
              {p.name}
            </Link>
          </li>
        )
      }),
    )

  return (
    <section aria-labelledby="work-strip-title" className="on-light border-y border-line bg-surface py-10">
      <div className="container-page mb-5 text-center">
        <h2 id="work-strip-title" className="eyebrow font-body">
          Our work
        </h2>
      </div>
      <div className="work-marquee overflow-hidden">
        <ul className="work-marquee-track flex w-max">
          {half(0)}
          {half(1)}
        </ul>
      </div>
    </section>
  )
}
