import { SITE_FULL } from "@/data/site"

/**
 * The company logo on a white pill — the same treatment as the navbar.
 *
 * Everything renders the real full-colour artwork. The logo is dark navy plus
 * the brand purple, so on any dark surface it needs a light backing rather
 * than a `brightness-0 invert` knockout, which threw away the brand colours.
 *
 * Uses pak-oz-logo-trimmed.png: the original pak-oz-logo.png pads its 500x500
 * canvas with ~45% transparent margin, so a given height rendered the mark at
 * roughly half that size.
 *
 * No `onError` handler here — this is used from server components, where event
 * handlers are a build error, and the asset ships with the repo.
 */
export default function BrandLogo({
  size = "md",
  className = "",
}: {
  /** `md` for page heroes, `sm` for the footer. */
  size?: "sm" | "md"
  className?: string
}) {
  const pill =
    size === "sm"
      ? "rounded-[14px] px-5 py-3"
      : "rounded-[16px] px-5 py-3"
  const img = size === "sm" ? "h-[60px]" : "h-[56px] lg:h-[64px]"

  return (
    <span
      className={`bg-white ${pill} inline-flex items-center shadow-sm ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/pak-oz-logo-trimmed.png"
        alt={SITE_FULL}
        className={`${img} w-auto object-contain`}
      />
    </span>
  )
}
