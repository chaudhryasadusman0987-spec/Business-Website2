import { SITE_FULL } from "@/data/site"

/**
 * The full colour logo on a white card — used by the footer and the page heroes
 * (about, blog, contact).
 *
 * All four of those surfaces are dark: the footer is #252525 and the heroes are
 * #0f0f18. The colour artwork is near-black animals and a dark navy wordmark,
 * so it cannot sit on them directly — hence the white card behind it. The
 * navbar is a different case and uses the light artwork with no card, because
 * #7f85f7 is a mid-tone the white animal bodies read against.
 *
 * Renders pak-oz-logo-color.webp, built by scripts/make-logo-color.js. The
 * supplied pak-oz-logo.png is fully opaque with a flat grey background painted
 * in, which would show as a grey rectangle inside the white card, so the script
 * keys that background out and trims the result.
 *
 * No onError fallback: this renders from server components, where event
 * handlers are a build error. The alt text carries the company name if the
 * image ever fails to load.
 */
const SIZES = {
  /** Footer. */
  sm: { card: "rounded-[14px] px-[18px] py-[14px]", img: "h-[52px]" },
  /** Page heroes. */
  md: { card: "rounded-[18px] px-6 py-[18px]", img: "h-[64px] lg:h-[72px]" },
} as const

export default function BrandLogo({
  size = "md",
  className = "",
}: {
  size?: keyof typeof SIZES
  className?: string
}) {
  const s = SIZES[size]

  return (
    <span
      className={`inline-flex items-center bg-white shadow-[0_4px_18px_rgba(0,0,0,0.22)] ${s.card} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/pak-oz-logo-color.webp"
        alt={SITE_FULL}
        className={`${s.img} w-auto object-contain`}
      />
    </span>
  )
}
