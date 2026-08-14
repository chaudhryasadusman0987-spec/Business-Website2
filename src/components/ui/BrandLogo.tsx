import Link from "next/link"
import { SITE_NAME, SITE_SUFFIX } from "@/data/site"

/**
 * The brand lockup: the ibex mark on a white chip, beside a typeset wordmark.
 * One component for every placement so the navbar, page heroes and the footer
 * all read as the same mark.
 *
 * Why not the full artwork — pak-oz-logo-trimmed.png is a *stacked* square
 * lockup (mark over "PAK OZ" over "SOLUTIONS" over the tagline). It only holds
 * up when it is rendered large. Squeezed into the 65px navbar it came out ~47px
 * wide, putting the tagline at roughly 4px tall: an illegible smudge inside a
 * full-height white box. So every placement uses the mark on its own
 * (pak-oz-mark.png, cut by scripts/make-logo-mark.js) with the words as text.
 *
 * The white chip is doing real work, not decoration. The horns are #9A4AE8
 * violet, too close to the #7f85f7 navbar to read against it, and the wordmark
 * in the artwork is dark navy, which disappears on the dark heroes and footer.
 * Knocking the mark out to white instead would flatten the horns into the head,
 * because the muzzle and neck line-work are transparent cutouts rather than
 * painted white.
 *
 * The wordmark being real text is also the fallback: if the image ever fails to
 * load the company name is still there, so no onError handler is needed — which
 * matters because this renders from server components, where event handlers are
 * a build error.
 */

/** Full literal class strings — Tailwind scans source statically, so these
 *  cannot be assembled from fragments at runtime. */
const SIZES = {
  /** Navbar and the mobile slide-out panel header. */
  nav: {
    row: "gap-[11px]",
    chip: "h-[46px] w-[44px] rounded-[13px] shadow-[0_2px_10px_rgba(26,26,46,0.18)]",
    mark: "h-10",
    name: "text-[18px]",
    sub: "mt-[3px] text-[9.5px]",
  },
  /** Footer. */
  sm: {
    row: "gap-[13px]",
    chip: "h-[56px] w-[54px] rounded-[16px] shadow-[0_3px_14px_rgba(0,0,0,0.28)]",
    mark: "h-12",
    name: "text-[22px]",
    sub: "mt-1 text-[11px]",
  },
  /** Page heroes. */
  md: {
    row: "gap-[18px]",
    chip: "h-[76px] w-[72px] rounded-[20px] shadow-[0_4px_18px_rgba(0,0,0,0.28)]",
    mark: "h-16",
    name: "text-[30px]",
    sub: "mt-1.5 text-[14px]",
  },
} as const

export default function BrandLogo({
  size = "md",
  href,
  onClick,
  className = "",
}: {
  size?: keyof typeof SIZES
  /** Renders the lockup as a link. Omit for the decorative hero/footer badge. */
  href?: string
  /** Used by the mobile panel to close itself on navigate. */
  onClick?: () => void
  className?: string
}) {
  const s = SIZES[size]

  const inner = (
    <>
      <span
        className={`grid shrink-0 place-items-center bg-white ${s.chip} ${
          href ? "transition-transform duration-200 group-hover:-translate-y-px" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/pak-oz-mark.png"
          alt=""
          aria-hidden="true"
          className={`${s.mark} w-auto object-contain`}
        />
      </span>

      <span className="flex flex-col leading-none">
        <span className={`font-extrabold uppercase tracking-[-0.01em] text-white ${s.name}`}>
          {SITE_NAME}
        </span>
        <span className={`font-semibold uppercase tracking-[0.225em] text-white/70 ${s.sub}`}>
          {SITE_SUFFIX}
        </span>
      </span>
    </>
  )

  const row = `inline-flex items-center ${s.row} ${className}`

  // Not aria-hidden even though the mark is: the wordmark is real text, and in
  // the footer it is the only place the company name appears in that column.
  // `uppercase` is styling only, so it still reads as "Pak Oz Solutions".
  if (!href) return <span className={row}>{inner}</span>

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={`${SITE_NAME} ${SITE_SUFFIX} — home`}
      className={`group ${row}`}
    >
      {inner}
    </Link>
  )
}
